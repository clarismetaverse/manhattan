import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Users, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'explore', label: 'Explore', icon: Compass, path: '/' },
  { id: 'showcase', label: 'Showcase', icon: Users, path: '/ugc-tiktoker-profile' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/bookings' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navigation if user is not logged in
  if (!user) {
    return null;
  }
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => item.path === currentPath);
    return activeItem?.id || 'explore';
  };

  const activeTab = getActiveTab();

  const handleNavigation = (item: NavItem) => {
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`relative flex flex-col items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 group ${
                  isActive ? '' : 'hover:bg-white/5'
                }`}
              >
                {/* Additional glow around entire button area */}
                {isActive && (
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150 -z-10"></div>
                )}

                {/* Icon container with glow effect */}
                <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'
                  }`} />
                  
                  {/* CRITICAL: This is the glow effect - NOT a background */}
                  {isActive && (
                    <div className="absolute inset-0 w-5 h-5 bg-red-500/30 rounded-full blur-md animate-pulse -z-10"></div>
                  )}
                </div>

                {/* Label text - red when active */}
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;