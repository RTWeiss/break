import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, DollarSign } from 'lucide-react';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    image_url: string;
    seller_id: string;
    seller: {
      full_name: string;
      avatar_url: string;
    };
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMakeOffer = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      // Create the offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          status: 'pending',
          amount: listing.price
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Create notification for the seller
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: listing.seller_id,
          type: 'offer',
          title: 'New Offer Received',
          description: `${user.user_metadata.full_name} made an offer on your listing: ${listing.title}`,
          data: {
            offer_id: offer.id,
            listing_id: listing.id,
            buyer_id: user.id,
            amount: listing.price
          }
        });

      if (notificationError) throw notificationError;

      // Create a new message thread
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: listing.seller_id,
          content: `Hi! I'm interested in your listing: ${listing.title}`,
          listing_id: listing.id
        });

      if (messageError) throw messageError;

      navigate('/messages');
    } catch (error) {
      console.error('Error making offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessage = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Create notification for the seller
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: listing.seller_id,
          type: 'message',
          title: 'New Message',
          description: `${user.user_metadata.full_name} sent you a message about: ${listing.title}`,
          data: {
            listing_id: listing.id,
            sender_id: user.id
          }
        });

      if (notificationError) throw notificationError;

      // Create a new message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: listing.seller_id,
          content: `Hi! I'm interested in your listing: ${listing.title}`,
          listing_id: listing.id
        });

      if (messageError) throw messageError;

      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={listing.image_url} 
        alt={listing.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
        <p className="text-gray-600 mb-2">{listing.description}</p>
        <p className="text-green-600 font-semibold mb-2">${listing.price}</p>
        <p className="text-sm text-gray-500 mb-4">Condition: {listing.condition}</p>
        
        <div className="flex items-center mb-4">
          <img
            src={listing.seller.avatar_url || `https://ui-avatars.com/api/?name=${listing.seller.full_name}&background=random`}
            alt={listing.seller.full_name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">{listing.seller.full_name}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleMakeOffer}
            disabled={isSubmitting || user?.id === listing.seller_id}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <DollarSign size={18} />
            Make Offer
          </button>
          <button
            onClick={handleMessage}
            disabled={isSubmitting || user?.id === listing.seller_id}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}