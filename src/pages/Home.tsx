import React, { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import Tweet from '../components/Tweet';
import CreateTweet from '../components/CreateTweet';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [tweets, setTweets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuthStore();

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          profiles:user_id (*),
          likes (id, user_id),
          replies (id),
          retweets (id, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTweets(data || []);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tweets_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tweets'
        },
        () => {
          fetchTweets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Home</h1>
        </div>
      </header>

      <CreateTweet onTweetCreated={fetchTweets} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          <ErrorBoundary>
            {tweets.map((tweet) => (
              <Tweet key={tweet.id} tweet={tweet} />
            ))}
            {tweets.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No posts yet. Be the first to post!
              </div>
            )}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default Home;