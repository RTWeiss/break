import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase.types';

type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface MessagesState {
  conversations: Map<string, Message[]>;
  loading: boolean;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  subscribeToMessages: (userId: string) => () => void;
  profiles: Map<string, Profile>;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: new Map(),
  profiles: new Map(),
  loading: false,

  sendMessage: async (receiverId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      });

    if (error) throw error;
  },

  fetchMessages: async (userId: string) => {
    try {
      set({ loading: true });

      // First, fetch all relevant profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', [userId]);

      if (profilesError) throw profilesError;

      const profiles = new Map<string, Profile>();
      profilesData?.forEach(profile => {
        profiles.set(profile.id, profile);
      });

      // Then fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Group messages by conversation
      const conversations = new Map<string, Message[]>();
      
      messages?.forEach((message) => {
        const otherId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        
        // Fetch other user's profile if we don't have it
        if (!profiles.has(otherId)) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                profiles.set(otherId, profile);
                set({ profiles: new Map(profiles) });
              }
            });
        }

        const existing = conversations.get(otherId) || [];
        conversations.set(otherId, [...existing, message]);
      });

      set({ conversations, profiles, loading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },

  subscribeToMessages: (userId: string) => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId},receiver_id=eq.${userId}`,
        },
        async () => {
          await get().fetchMessages(userId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));