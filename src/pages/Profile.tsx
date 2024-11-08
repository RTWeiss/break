import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import ProfileForm from '../components/ProfileForm';
import type { Profile } from '../types';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Create profile if it doesn't exist and it's the current user
          if (user?.id === id) {
            const newProfile = {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              created_at: new Date().toISOString(),
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();

            if (createError) throw createError;
            setProfile(createdProfile);
            return;
          }
          throw new Error('Profile not found');
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(error.message);
      if (error.message === 'Profile not found') {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(updates: Partial<Profile>) {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="absolute -bottom-16 left-4">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avatars/svg?seed=${profile.username}`}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-black object-cover"
            />
          </div>
        </div>

        <div className="mt-20">
          {editing ? (
            <ProfileForm
              profile={profile}
              onSubmit={handleProfileUpdate}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{profile.full_name || '@' + profile.username}</h2>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                {user?.id === id && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-transparent border border-purple-500 text-purple-500 px-4 py-2 rounded-full hover:bg-purple-500/10 transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              {profile.bio && (
                <p className="mt-4 text-gray-300">{profile.bio}</p>
              )}
              <div className="mt-4 flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Joined {formatDistanceToNow(new Date(profile.created_at))} ago</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}