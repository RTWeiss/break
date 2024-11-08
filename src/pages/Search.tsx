import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Users, Package, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import Tweet from '../components/Tweet';

type SearchResult = {
  type: 'user' | 'post' | 'item';
  data: any;
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'items'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchTerm = `%${query}%`;
      let searchResults: SearchResult[] = [];

      if (activeTab === 'all' || activeTab === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
          .limit(activeTab === 'all' ? 3 : 10);

        if (users) {
          searchResults.push(
            ...users.map((user) => ({
              type: 'user',
              data: user,
            }))
          );
        }
      }

      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: posts } = await supabase
          .from('tweets')
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .textSearch('content', query)
          .limit(activeTab === 'all' ? 3 : 10);

        if (posts) {
          searchResults.push(
            ...posts.map((post) => ({
              type: 'post',
              data: post,
            }))
          );
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserResult = (user: any) => (
    <Link
      to={`/profile/${user.id}`}
      className="flex items-center space-x-3 p-4 hover:bg-gray-900/50 transition"
    >
      <img
        src={user.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${user.username}`}
        alt={user.username}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h3 className="font-bold">{user.full_name || user.username}</h3>
        <p className="text-gray-500">@{user.username}</p>
        {user.bio && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  );

  const renderPostResult = (post: any) => (
    <Tweet
      tweet={{
        id: post.id,
        content: post.content,
        image: post.image_url,
        createdAt: post.created_at,
        user: {
          name: post.profiles.full_name || post.profiles.username,
          username: post.profiles.username,
          avatar: post.profiles.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${post.profiles.username}`,
        },
        likes: 0,
        replies: 0,
        retweets: 0,
      }}
    />
  );

  const tabs = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'items', label: 'Items', icon: Package },
  ];

  return (
    <div className="max-w-full">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Break"
              className="w-full bg-gray-900 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
          <div className="flex mt-3 border-b border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'text-purple-500 border-b-2 border-purple-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="divide-y divide-gray-800">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : results.length > 0 ? (
          results.map((result, index) => (
            <div key={index}>
              {result.type === 'user' && renderUserResult(result.data)}
              {result.type === 'post' && renderPostResult(result.data)}
            </div>
          ))
        ) : query ? (
          <div className="p-4 text-center text-gray-500">
            No results found for "{query}"
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Try searching for people, posts, or items
          </div>
        )}
      </div>
    </div>
  );
}