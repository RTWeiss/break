import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useMessagesStore } from '../store/messagesStore';
import toast from 'react-hot-toast';

export default function Messages() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sellerId = searchParams.get('seller');
  const listingId = searchParams.get('listing');

  const { user } = useAuthStore();
  const { conversations, profiles, loading, fetchMessages, sendMessage, subscribeToMessages } = useMessagesStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(sellerId);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchMessages(user.id).catch((error) => {
        toast.error('Failed to load messages');
      });
      const unsubscribe = subscribeToMessages(user.id);
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    if (sellerId && listingId) {
      setNewMessage(`Hi! I'm interested in your listing: ${window.location.origin}/marketplace/${listingId}`);
    }
  }, [sellerId, listingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || !user) return;

    try {
      await sendMessage(selectedUserId, newMessage.trim());
      setNewMessage('');
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  // Get unique conversation partners
  const conversationPartners = Array.from(conversations.keys()).map(userId => ({
    id: userId,
    profile: profiles.get(userId)!,
    messages: conversations.get(userId)!,
    lastMessage: conversations.get(userId)!.slice(-1)[0],
  }));

  // Filter conversations based on search query
  const filteredConversations = conversationPartners.filter(partner => 
    partner.profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (partner.profile.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const selectedConversation = selectedUserId ? conversations.get(selectedUserId) : null;
  const selectedProfile = selectedUserId ? profiles.get(selectedUserId) : null;

  return (
    <div className="max-w-full h-[calc(100vh-64px)] flex">
      {/* Conversations List */}
      <div className="w-full lg:w-96 border-r border-gray-800 flex flex-col">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        </header>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Direct Messages"
              className="w-full bg-gray-900 text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map(({ id, profile, lastMessage }) => (
                <button
                  key={id}
                  onClick={() => setSelectedUserId(id)}
                  className={`w-full text-left p-3 hover:bg-gray-900 rounded-lg transition flex items-center space-x-3 ${
                    selectedUserId === id ? 'bg-gray-900' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {profile.full_name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-white font-semibold truncate">
                        {profile.full_name || profile.username}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {lastMessage && formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm truncate">
                      @{profile.username}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {lastMessage?.content}
                    </p>
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages found</p>
                  <p className="text-sm text-gray-600">
                    {searchQuery ? 'Try a different search term' : 'Start a conversation with other collectors'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden lg:flex flex-col flex-1">
        {selectedUserId && selectedProfile && selectedConversation ? (
          <>
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
              <div className="px-4 py-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {selectedProfile.full_name?.[0]?.toUpperCase() || 'B'}
                </div>
                <div>
                  <h2 className="font-bold">{selectedProfile.full_name || selectedProfile.username}</h2>
                  <p className="text-sm text-gray-500">@{selectedProfile.username}</p>
                </div>
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col space-y-4">
                {selectedConversation.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender_id === user?.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-900 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-purple-500 text-white px-6 rounded-full hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}