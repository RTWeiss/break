import React, { useState } from 'react';
import { MessageCircle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ListingActionsProps {
  listing: {
    id: string;
    seller_id: string;
    price: number;
    title: string;
  };
}

export default function ListingActions({ listing }: ListingActionsProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState(listing.price.toString());
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleMessage = () => {
    if (!user) {
      toast.error('Please sign in to message the seller');
      return;
    }
    navigate(`/messages?seller=${listing.seller_id}&listing=${listing.id}`);
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to make an offer');
      return;
    }

    try {
      const amount = parseFloat(offerAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const { error } = await supabase
        .from('offers')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          amount,
          message: message.trim(),
        });

      if (error) throw error;

      toast.success('Offer sent successfully!');
      setShowOfferModal(false);
      setOfferAmount(listing.price.toString());
      setMessage('');
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error('Failed to send offer');
    }
  };

  return (
    <div className="flex space-x-4">
      <button
        onClick={handleMessage}
        className="flex items-center space-x-2 px-4 py-2 rounded-full border border-purple-500 text-purple-500 hover:bg-purple-500/10 transition"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Message Seller</span>
      </button>
      <button
        onClick={() => setShowOfferModal(true)}
        className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition"
      >
        <DollarSign className="w-5 h-5" />
        <span>Make Offer</span>
      </button>

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Make an Offer</h3>
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Your Offer
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a message to your offer..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                >
                  Send Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}