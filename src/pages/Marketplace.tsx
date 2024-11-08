import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import ListingActions from '../components/ListingActions';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  created_at: string;
  seller_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:seller_id (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <article key={listing.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Package className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {listing.profiles?.full_name?.[0]?.toUpperCase() || 'B'}
                </div>
                <span className="text-gray-300 text-sm">{listing.profiles?.full_name}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{listing.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{listing.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-white font-bold">${listing.price}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mb-4">
                <span className="inline-block bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                  {listing.condition.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <ListingActions listing={listing} />
            </div>
          </article>
        ))}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
          <p className="text-gray-400">Be the first to list an item in the marketplace!</p>
        </div>
      )}
    </div>
  );
}