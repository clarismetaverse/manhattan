import React, { useEffect, useState } from 'react';
import Header from '@/components/profile/Header';
import UGCView from '@/components/profile/UGCView';
import PROView from '@/components/profile/PROView';
import { Share2, Instagram, Music2 } from 'lucide-react';
import { fetchUserProfile, type UserProfileResponse } from '@/services/couponApi';
import { useNavigate } from 'react-router-dom';

type Mode = 'UGC' | 'PRO';
type RingState = 'idle' | 'sweeping' | 'lit';

interface Profile {
  name: string;
  City?: string;
  countryCode?: string;
  bio?: string;
  promocode?: string;
  xp?: number;
  Profession?: string;
  back?: { url?: string } | null;
  Profile_pic?: { url?: string } | null;
  UGC_cover?: { url?: string } | null;
  Pro_Profile?: { url?: string } | null;
  IG_account?: string | null;
  Tiktok_account?: string | null;
}

async function mockFetch(): Promise<Profile> {
  return {
    name: 'Irina_Shakeva',
    City: 'Badung',
    countryCode: 'ID',
    bio: 'UX UI designer & SMM',
    promocode: '9K5C1',
    xp: 500,
    Profession: 'Photographer',
    back: { url: 'https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=1200&auto=format&fit=crop' },
    Profile_pic: { url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=600&auto=format&fit=crop' },
    UGC_cover: { url: 'https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=1200&auto=format&fit=crop' },
    Pro_Profile: { url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=600&auto=format&fit=crop' },
    IG_account: 'https://instagram.com/',
    Tiktok_account: 'https://tiktok.com/',
  };
}

export default function UGCTiktokerProfilePinned() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<Mode>('UGC');
  const [ringState, setRingState] = useState<RingState>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data: UserProfileResponse = await fetchUserProfile();
        setProfile(data as Profile);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('401')) {
          navigate('/login');
        } else if (import.meta.env.DEV) {
          const mock = await mockFetch();
          setProfile(mock);
        }
      }
    }
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (mode === 'PRO') {
      setRingState('sweeping');
      const t = setTimeout(() => setRingState('lit'), 1200);
      return () => clearTimeout(t);
    }
    setRingState('idle');
  }, [mode]);

  if (!profile) return null;

  const isPro = mode === 'PRO';

  const toggle = () => {
    const nextMode: Mode = isPro ? 'UGC' : 'PRO';
    setMode(nextMode);
    setRingState(nextMode === 'PRO' ? 'sweeping' : 'idle');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      data-testid="profile-page"
      className={`min-h-screen transition-colors duration-700 ${isPro ? 'bg-black' : 'bg-white'}`}
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div
          className={`rounded-t-2xl rounded-br-2xl overflow-hidden transition-colors duration-700 ${
            isPro 
              ? 'bg-zinc-800 shadow-[12px_12px_24px_rgba(0,0,0,0.8),-12px_-12px_24px_rgba(255,255,255,0.02)]' 
              : 'bg-gray-100 shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)]'
          }`}
        >
          <div
            className={`h-28 sm:h-36 ${
              isPro ? 'bg-gradient-to-r from-purple-900 to-pink-900' : 'bg-gradient-to-r from-fuchsia-200 to-pink-300'
            }`}
            style={{
              backgroundImage: isPro 
                ? (profile.back?.url ? `url(${profile.back.url})` : undefined)
                : (profile.UGC_cover?.url ? `url(${profile.UGC_cover.url})` : undefined),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Header
            profile={profile}
            mode={mode}
            setMode={setMode}
            ringState={ringState}
            setRingState={setRingState}
          />
          <div className="px-4 pb-3">
            <p className={`text-sm font-medium ${isPro ? 'text-gray-200' : 'text-gray-800'}`}>“{profile.bio || ''}”</p>
          </div>
          <div
            className={`px-4 pb-4 text-xs sm:text-sm flex items-center gap-4 border-t pt-3 ${
              isPro ? 'border-white/10' : 'border-gray-100'
            }`}
          >
            {profile.promocode && (
              <div className={isPro ? 'text-gray-300' : 'text-gray-700'}>Promo code: {profile.promocode}</div>
            )}
            {typeof profile.xp === 'number' && (
              <div className={isPro ? 'text-gray-300' : 'text-gray-700'}>{profile.xp} XP</div>
            )}
          </div>
          <div
            className={`px-4 pb-4 flex justify-between items-center gap-3 border-t pt-3 ${isPro ? 'border-white/10' : 'border-gray-100'}`}
          >
            <div className="flex gap-3">
              {profile.Tiktok_account && (
                <a
                  href={profile.Tiktok_account}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1 text-sm ${
                    isPro ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Music2 className="w-4 h-4" /> TikTok
                </a>
              )}
              {profile.IG_account && (
                <a
                  href={profile.IG_account}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1 text-sm ${
                    isPro ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="block sm:hidden">
              <div
                tabIndex={0}
                role="switch"
                aria-checked={isPro}
                onClick={toggle}
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
         </div>
         </div>

        {isPro && (
          <div className={`rounded-br-2xl overflow-hidden transition-colors duration-700 w-1/3 py-3 ${
            isPro 
              ? 'bg-zinc-800 shadow-[12px_12px_24px_rgba(0,0,0,0.8),-12px_-12px_24px_rgba(255,255,255,0.02)]'
              : 'bg-gray-100 shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)]'
          }`}>
            <div className="px-4 py-0.5 w-fit inline-block">
              <button className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gradient-to-r from-blue-900 to-purple-800 text-white hover:from-blue-950 hover:to-purple-900 hover:scale-105 shadow-[inset_3px_3px_6px_rgba(255,255,255,0.1),inset_-3px_-3px_6px_rgba(0,0,0,0.4),6px_6px_12px_rgba(0,0,0,0.6)] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.4),3px_3px_6px_rgba(0,0,0,0.7)]">
                Hire
              </button>
            </div>
          </div>
        )}

        {isPro ? <PROView /> : <UGCView />}

        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 inline-flex items-center justify-center">
            <Share2 className="w-5 h-5 mr-2" /> Share Profile
          </button>
        </div>
      </div>
    </div>
  );
}

