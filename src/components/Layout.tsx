import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Mail, User, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import TrendingSection from './TrendingSection';

export default function Layout() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Marketplace', href: '/marketplace', icon: Package },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Profile', href: `/profile/${user?.id}`, icon: User },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto flex relative">
        {/* Sidebar */}
        <aside className="w-20 xl:w-64 fixed h-screen border-r border-gray-800 z-20 bg-black">
          <div className="flex flex-col h-full p-2 xl:p-4">
            <Link to="/" className="mb-4 flex justify-center xl:justify-start">
              <div className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-purple-500" />
                <span className="hidden xl:inline text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                  Break
                </span>
              </div>
            </Link>
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-full hover:bg-gray-900 transition ${
                      location.pathname === item.href ? 'font-bold' : ''
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-3 px-4 py-3 rounded-full hover:bg-gray-900 transition w-full text-left"
              >
                <LogOut className="w-6 h-6" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </nav>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 px-4 xl:px-8 font-bold hover:opacity-90 transition">
              <span className="hidden xl:inline">List Item</span>
              <Package className="w-6 h-6 xl:hidden" />
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-20 xl:ml-64 min-h-screen border-r border-gray-800">
          <div className="max-w-2xl">
            <Outlet />
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="fixed w-80 h-screen p-4 overflow-y-auto">
            <TrendingSection />
          </div>
        </aside>
      </div>
    </div>
  );
}