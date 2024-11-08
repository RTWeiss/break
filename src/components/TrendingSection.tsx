import React, { useEffect, useState } from 'react';
import { usePostsStore } from '../store/postsStore';

export default function TrendingSection() {
  const { fetchTrending } = usePostsStore();
  const [trending, setTrending] = useState<{ tag: string; category: string; count: number }[]>([]);

  useEffect(() => {
    const loadTrending = async () => {
      const data = await fetchTrending();
      setTrending(data);
    };
    loadTrending();
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <h2 className="text-xl font-bold mb-4">Trending Collections</h2>
      <div className="space-y-4">
        {trending.map((item) => (
          <div key={item.tag} className="hover:bg-gray-800 p-3 rounded-lg cursor-pointer">
            <p className="text-sm text-gray-400">Popular in {item.category}</p>
            <p className="font-bold">#{item.tag}</p>
            <p className="text-sm text-gray-400">
              {(item.count / 1000).toFixed(1)}K Posts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}