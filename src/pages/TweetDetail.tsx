import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Tweet from '../components/Tweet';
import Reply from '../components/Reply';
import ReplyForm from '../components/ReplyForm';

export default function TweetDetail() {
  const { id } = useParams();
  const [tweet, setTweet] = useState(null);
  const [replies, setReplies] = useState([]);

  const fetchTweet = async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select(`
          *,
          profiles:user_id(*),
          likes(count),
          replies(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTweet(data);
    } catch (error) {
      console.error('Error fetching tweet:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          profiles:user_id(*),
          reply_likes(count)
        `)
        .eq('tweet_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTweet();
      fetchReplies();
    }
  }, [id]);

  const handleReplyPosted = () => {
    fetchReplies();
  };

  if (!tweet) return <div className="p-4">Loading...</div>;

  return (
    <div>
      <Tweet tweet={tweet} />
      <div className="border-t border-gray-200">
        <ReplyForm tweetId={id} onReplyPosted={handleReplyPosted} />
        {replies.map((reply) => (
          <Reply
            key={reply.id}
            reply={reply}
            tweetId={id}
            onReplyPosted={handleReplyPosted}
          />
        ))}
      </div>
    </div>
  );
}