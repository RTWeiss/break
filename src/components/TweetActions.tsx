import React from 'react';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { useTweetsStore } from '../store/tweetsStore';
import toast from 'react-hot-toast';

interface TweetActionsProps {
  tweetId: string;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  likedByUser: boolean;
  retweetedByUser: boolean;
  onCommentClick: () => void;
}

export const TweetActions: React.FC<TweetActionsProps> = ({
  tweetId,
  likesCount,
  repliesCount,
  retweetsCount,
  likedByUser,
  retweetedByUser,
  onCommentClick,
}) => {
  const { likeTweet, unlikeTweet, retweet, unretweet } = useTweetsStore();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (likedByUser) {
        await unlikeTweet(tweetId);
      } else {
        await likeTweet(tweetId);
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (retweetedByUser) {
        await unretweet(tweetId);
      } else {
        await retweet(tweetId);
      }
    } catch (error) {
      toast.error('Failed to repost');
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick();
  };

  return (
    <div className="flex justify-between mt-4 text-gray-500">
      <button 
        className="flex items-center space-x-2 hover:text-blue-500"
        onClick={handleComment}
      >
        <MessageCircle size={20} />
        <span>{repliesCount || 0}</span>
      </button>
      <button 
        className={`flex items-center space-x-2 hover:text-green-500 ${
          retweetedByUser ? 'text-green-500' : ''
        }`}
        onClick={handleRetweet}
      >
        <Repeat2 size={20} />
        <span>{retweetsCount || 0}</span>
      </button>
      <button 
        className={`flex items-center space-x-2 hover:text-red-500 ${
          likedByUser ? 'text-red-500' : ''
        }`}
        onClick={handleLike}
      >
        <Heart size={20} />
        <span>{likesCount || 0}</span>
      </button>
      <button 
        className="flex items-center space-x-2 hover:text-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          navigator.share({
            title: 'Share Post',
            url: `${window.location.origin}/tweet/${tweetId}`
          }).catch(console.error);
        }}
      >
        <Share size={20} />
      </button>
    </div>
  );
};