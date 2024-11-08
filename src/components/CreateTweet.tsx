import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Send, Tag, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CreateTweet() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarketplaceListing, setIsMarketplaceListing] = useState(false);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('mint');
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0],
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            email: user.email
          });

        if (profileError) throw profileError;
      }

      if (isMarketplaceListing) {
        // Create marketplace listing
        const { error: listingError } = await supabase
          .from('listings')
          .insert({
            title: content,
            description: content,
            price: parseFloat(price),
            condition,
            image_url: imageUrl,
            seller_id: user.id
          });

        if (listingError) throw listingError;

        toast.success('Listing created successfully!');
        navigate('/marketplace');
      } else {
        // Create regular tweet
        const { error: tweetError } = await supabase
          .from('tweets')
          .insert({
            content,
            user_id: user.id,
            image_url: imageUrl
          });

        if (tweetError) throw tweetError;

        toast.success('Tweet posted successfully!');
      }

      setContent('');
      setImageUrl('');
      setPrice('');
      setIsMarketplaceListing(false);
    } catch (error: any) {
      toast.error(`Error creating post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isMarketplaceListing ? "What are you selling?" : "What's happening?"}
        className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows={3}
      />

      {isMarketplaceListing && (
        <div className="mt-2 space-y-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="mint">Mint</option>
            <option value="near_mint">Near Mint</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <label className="cursor-pointer text-purple-500 hover:text-purple-600">
            <ImagePlus className="h-6 w-6" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setIsMarketplaceListing(!isMarketplaceListing)}
            className={`text-purple-500 hover:text-purple-600 ${isMarketplaceListing ? 'bg-purple-100 rounded-full p-1' : ''}`}
          >
            <Tag className="h-6 w-6" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>{isMarketplaceListing ? 'List Item' : 'Tweet'}</span>
        </button>
      </div>
    </form>
  );
}