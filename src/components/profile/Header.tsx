import React from 'react';
import { BadgeCheck } from 'lucide-react';
import './GradientSweep.css';

type Mode = 'UGC' | 'PRO';
type RingState = 'idle' | 'sweeping' | 'lit';

interface Profile {
  name: string;
  City?: string;
  countryCode?: string;
  Profession?: string;
  Profile_pic?: { url?: string } | null;
  Pro_Profile?: { url?: string } | null;
}

interface HeaderProps {
  profile: Profile;
  mode: Mode;
  ringState: RingState;
  onToggle: () => void;
}

const ringClass = (rs: RingState) => {
  if (rs === 'sweeping') return 'sweep-ring pro-animating rounded-full';
  if (rs === 'lit') return 'sweep-ring pro-complete rounded-full';
  return 'sweep-ring bg-white rounded-full';
};

export default function Header({ profile, mode, ringState, onToggle }: HeaderProps) {
  const isPro = mode === 'PRO';

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="flex items-center p-4 -mt-14 sm:-mt-16">
      <div className={ringClass(ringState)} aria-label="profile-avatar-ring">
        <img
          src={isPro ? (profile.Pro_Profile?.url || '') : (profile.Profile_pic?.url || '')}
          alt={profile.name}
          className="w-28 h-28 sm:w-32 sm:h-32 aspect-square rounded-full border-4 border-white shadow object-cover object-center"
        />
      </div>
      <div className="ml-3 sm:ml-4 min-w-0">
        <h1 className={`text-lg sm:text-xl font-bold truncate ${isPro ? 'text-white' : 'text-black'}`}>
          {profile.name}
        </h1>
        <span
          className={`px-2 py-0.5 text-[10px] sm:text-[11px] rounded inline-flex items-center gap-1 w-fit ${
            isPro ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <BadgeCheck className="w-3 h-3" /> {isPro ? (profile.Profession || 'PRO') : 'UGC creator'}
        </span>
        <div className={`text-sm ${isPro ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="truncate">{profile.City}</p>
          <p className="truncate">{profile.countryCode}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:block hidden">
        <div
          tabIndex={0}
          role="switch"
          aria-checked={isPro}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className={`toggle-track ${isPro ? 'active' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
        >
          <div className="toggle-thumb" />
          {!isPro && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-[10px]">PRO</span>
          )}
          {isPro && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-[10px]">UGC</span>
          )}
        </div>
      </div>
    </div>
  );
}

