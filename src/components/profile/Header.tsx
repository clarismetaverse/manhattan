import React from 'react';
import { BadgeCheck, Instagram, Music2 } from 'lucide-react';
import type { Profile, Mode, RingState } from './types';
import './GradientSweep.css';

interface HeaderProps {
  profile: Profile;
  mode: Mode;
  setMode: (m: Mode) => void;
  ringState: RingState;
  setRingState: (s: RingState) => void;
  onBioOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ profile, mode, setMode, ringState, setRingState, onBioOpen }) => {
  const handleToggle = () => {
    if (mode === 'UGC') {
      setMode('PRO');
      setRingState('sweeping');
      setTimeout(() => setRingState('lit'), 1200);
    } else {
      setMode('UGC');
      setRingState('idle');
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${mode === 'PRO' ? 'shadow-purple-500/20 bg-gray-800' : 'shadow-gray-500/10 bg-white'}`}>
        <div
          className={`h-28 sm:h-36 transition-colors duration-300 ${mode === 'PRO' ? 'bg-gradient-to-r from-purple-900 to-indigo-900' : 'bg-gradient-to-r from-fuchsia-200 to-pink-300'}`}
          style={{
            backgroundImage: profile.back?.url ? `url(${profile.back.url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="flex items-center p-4 -mt-14 sm:-mt-16">
          <div className={`sweep-ring ${ringState === 'sweeping' ? 'pro-animating' : ringState === 'lit' ? 'pro-complete' : ''}`}>
            <img
              src={profile.Profile_pic?.url}
              alt={profile.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
            />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 truncate ${mode === 'PRO' ? 'text-white' : 'text-black'}`}>
                {profile.name}
                <span className={`px-2 py-0.5 text-[10px] sm:text-[11px] rounded inline-flex items-center gap-1 ${mode === 'PRO' ? 'bg-purple-600 text-purple-100' : 'bg-gray-200 text-gray-700'}`}>
                  <BadgeCheck className="w-3 h-3" /> {mode === 'PRO' ? 'UGC' : 'PRO'}
                </span>
              </h1>
              <div
                role="switch"
                tabIndex={0}
                aria-checked={mode === 'PRO'}
                onClick={handleToggle}
                onKeyDown={handleKey}
                className={`toggle-track ${mode === 'PRO' ? 'active' : ''}`}
              >
                {mode === 'PRO' ? (
                  <span className="absolute left-1">UGC</span>
                ) : (
                  <span className="absolute right-1">PRO</span>
                )}
                <div className="toggle-thumb" />
              </div>
            </div>
            <div className={`text-sm ${mode === 'PRO' ? 'text-gray-300' : 'text-gray-600'}`}>
              <p className="truncate">{profile.City}</p>
              <p className="truncate">{profile.countryCode}</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <p
            className={`text-sm font-medium cursor-pointer ${mode === 'PRO' ? 'text-gray-200' : 'text-gray-800'}`}
            onClick={onBioOpen}
          >
            "{profile.bio || ''}"
          </p>
          <p className={`text-xs mt-1 ${mode === 'PRO' ? 'text-gray-400' : 'text-gray-600'}`}>{profile.bio}</p>
        </div>
        <div className={`px-4 pb-4 text-xs sm:text-sm flex gap-4 border-t pt-3 ${mode === 'PRO' ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-200'}`}>
          {profile.promocode && <div>Promo code: {profile.promocode}</div>}
          {typeof profile.xp === 'number' && <div>{profile.xp} XP</div>}
        </div>
        <div className={`px-4 pb-4 flex gap-3 border-t pt-3 ${mode === 'PRO' ? 'border-gray-600' : 'border-gray-200'}`}>
          {profile.Tiktok_account && (
            <a
              href={profile.Tiktok_account}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-sm ${mode === 'PRO' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
            >
              <Music2 className="w-4 h-4" /> TikTok
            </a>
          )}
          {profile.IG_account && (
            <a
              href={profile.IG_account}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-sm ${mode === 'PRO' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
