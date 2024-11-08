import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ListPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function TweetBox() {
  const [content, setContent] = useState('');
  const [isMarketplace, setIsMarketplace] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('mint');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      if (isMarketplace) {
        const { error } = await supabase
          .from('listings')
          .insert({
            title: title,
            description: content,
            price: parseFloat(price),
            condition: condition,
            user_id: user?.id,
            status: 'active'
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tweets')
          .insert({
            content: content,
            user_id: user?.id,
          });

        if (error) throw error;
      }

      setContent('');
      setTitle('');
      setPrice('');
      setCondition('mint');
      setIsMarketplace(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 p-4">
      {isMarketplace && (
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Item title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required={isMarketplace}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required={isMarketplace}
          />
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required={isMarketplace}
          >
            <option value="mint">Mint</option>
            <option value="near_mint">Near Mint</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isMarketplace ? "Describe your item..." : "What's happening?"}
        className="w-full resize-none focus:outline-none text-xl placeholder-gray-600"
        rows={3}
      />
      <div className="flex justify-between items-center pt-4">
        <div className="flex space-x-2">
          <button type="button" className="text-primary-500 hover:bg-primary-50 p-2 rounded-full">
            <Camera className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsMarketplace(!isMarketplace)}
            className={`p-2 rounded-full ${
              isMarketplace 
                ? 'text-green-500 bg-green-50' 
                : 'text-primary-500 hover:bg-primary-50'
            }`}
          >
            <ListPlus className="w-5 h-5" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || loading || (isMarketplace && (!title || !price))}
          className="bg-primary-500 text-white px-4 py-2 rounded-full font-bold hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Posting...' : isMarketplace ? 'List Item' : 'Post'}
        </button>
      </div>
    </form>
  );
}