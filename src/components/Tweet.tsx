import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Repeat2, Share } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Reply from './Reply';

interface TweetProps {
  tweet: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      full_name: string;
      username: string;
      avatar_url: string;
    };
    likes: { user_id: string }[];
    replies: any[];
    retweets: { user_id: string }[];
  };
  showActions?: boolean;
  isReply?: boolean;
}

export default function Tweet({ tweet, showActions = true, isReply = false }: TweetProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(tweet.likes?.some(like => like.user_id === user?.id));
  const [likesCount, setLikesCount] = useState(tweet.likes?.length || 0);
  const [repliesCount, setRepliesCount] = useState(tweet.replies?.length || 0);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets?.length || 0);
  const [isRetweeted, setIsRetweeted] = useState(tweet.retweets?.some(retweet => retweet.user_id === user?.id));
  const [replyContent, setReplyContent] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, tweet_id: tweet.id });
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, tweet_id: tweet.id });
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like tweet');
    }
  };

  const handleRetweet = async () => {
    if (!user) return;

    try {
      if (isRetweeted) {
        await supabase
          .from('retweets')
          .delete()
          .match({ user_id: user.id, tweet_id: tweet.id });
        setRetweetsCount(prev => prev - 1);
      } else {
        await supabase
          .from('retweets')
          .insert({ user_id: user.id, tweet_id: tweet.id });
        setRetweetsCount(prev => prev + 1);
      }
      setIsRetweeted(!isRetweeted);
    } catch (error) {
      console.error('Error retweeting:', error);
      toast.error('Failed to retweet');
    }
  };

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('replies')
        .insert({
          content: replyContent,
          user_id: user.id,
          tweet_id: tweet.id
        })
        .select('*, profiles(*)');

      if (error) throw error;

      setRepliesCount(prev => prev + 1);
      setReplyContent('');
      setShowReplyInput(false);
      toast.success('Reply posted!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  return (
    <article className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {tweet.profiles.full_name?.[0]?.toUpperCase() || 'B'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <p className="font-medium text-white">{tweet.profiles.full_name}</p>
            <span className="text-gray-500">@{tweet.profiles.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
            </span>
          </div>
          <Link to={`/tweet/${tweet.id}`}>
            <p className="text-white mt-1">{tweet.content}</p>
          </Link>
          {showActions && (
            <div className="flex items-center justify-between mt-3 max-w-md">
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{repliesCount}</span>
              </button>
              <button
                onClick={handleRetweet}
                className={`flex items-center space-x-2 ${
                  isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
                <span>{retweetsCount}</span>
              </button>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>{likesCount}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                <Share className="w-5 h-5" />
              </button>
            </div>
          )}
          {showReplyInput && (
            <div className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Post your reply"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}