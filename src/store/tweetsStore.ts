import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
}

interface Tweet {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles?: Profile;
  likes_count: number;
  replies_count: number;
  retweets_count: number;
  liked_by_user: boolean;
  retweeted_by_user: boolean;
}

interface TweetsState {
  tweets: Tweet[];
  loading: boolean;
  createTweet: (content: string, imageUrl?: string) => Promise<void>;
  fetchTweets: () => Promise<void>;
  likeTweet: (tweetId: string) => Promise<void>;
  unlikeTweet: (tweetId: string) => Promise<void>;
  retweet: (tweetId: string) => Promise<void>;
  unretweet: (tweetId: string) => Promise<void>;
  replyToTweet: (tweetId: string, content: string) => Promise<void>;
}

export const useTweetsStore = create<TweetsState>((set, get) => ({
  tweets: [],
  loading: false,

  createTweet: async (content: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tweets')
        .insert({
          user_id: user.id,
          content,
          image_url: imageUrl,
        });

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error creating tweet:', error);
      throw error;
    }
  },

  fetchTweets: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();

      const { data: tweets, error } = await supabase
        .from('tweets')
        .select(`
          *,
          profiles:user_id (*),
          likes:likes(count),
          retweets:retweets(count),
          replies:replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's likes and retweets if authenticated
      let userLikes: string[] = [];
      let userRetweets: string[] = [];
      
      if (user) {
        const [{ data: likes }, { data: retweets }] = await Promise.all([
          supabase
            .from('likes')
            .select('tweet_id')
            .eq('user_id', user.id),
          supabase
            .from('retweets')
            .select('tweet_id')
            .eq('user_id', user.id)
        ]);

        userLikes = (likes || []).map(like => like.tweet_id);
        userRetweets = (retweets || []).map(retweet => retweet.tweet_id);
      }

      const formattedTweets = tweets?.map(tweet => ({
        ...tweet,
        likes_count: tweet.likes[0]?.count || 0,
        retweets_count: tweet.retweets[0]?.count || 0,
        replies_count: tweet.replies[0]?.count || 0,
        liked_by_user: userLikes.includes(tweet.id),
        retweeted_by_user: userRetweets.includes(tweet.id)
      })) || [];

      set({ tweets: formattedTweets, loading: false });
    } catch (error) {
      console.error('Error fetching tweets:', error);
      set({ loading: false, tweets: [] });
    }
  },

  likeTweet: async (tweetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          tweet_id: tweetId,
        });

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error liking tweet:', error);
      throw error;
    }
  },

  unlikeTweet: async (tweetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('tweet_id', tweetId);

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error unliking tweet:', error);
      throw error;
    }
  },

  retweet: async (tweetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('retweets')
        .insert({
          user_id: user.id,
          tweet_id: tweetId,
        });

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error retweeting:', error);
      throw error;
    }
  },

  unretweet: async (tweetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('retweets')
        .delete()
        .eq('user_id', user.id)
        .eq('tweet_id', tweetId);

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error unretweeting:', error);
      throw error;
    }
  },

  replyToTweet: async (tweetId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('replies')
        .insert({
          user_id: user.id,
          tweet_id: tweetId,
          content,
        });

      if (error) throw error;
      await get().fetchTweets();
    } catch (error) {
      console.error('Error replying to tweet:', error);
      throw error;
    }
  },
}));