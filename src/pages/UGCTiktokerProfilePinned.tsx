import React, { useEffect, useState } from 'react';
import Header from '@/components/profile/Header';
import UGCView from '@/components/profile/UGCView';
import PROView from '@/components/profile/PROView';
import { CardShellWithInsetTab, insetTabPresets } from '@/components/profile/CardShellWithInsetTab';
import { Share2, Instagram, Music2 } from 'lucide-react';
import { fetchUserProfile, type UserProfileResponse } from '@/services/couponApi';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  const tabWidth = isMobile ? 180 : 220;
  const tabDepth = isMobile ? 52 : 56;
  const tabRoundness = 0.8;

  const coverImage =
    (isPro ? profile.back?.url : profile.UGC_cover?.url) ??
    profile.Pro_Profile?.url ??
    profile.Profile_pic?.url ??
    undefined;

  const overlayClass = isPro ? 'bg-black/50' : 'bg-black/35';
  const borderMuted = isPro ? 'border-white/15' : 'border-white/20';
  const secondaryText = isPro ? 'text-gray-300' : 'text-gray-100';
  const linkClass = isPro ? 'text-gray-300 hover:text-white' : 'text-gray-100 hover:text-white';
  const cardBackground = isPro
    ? 'from-[#141418] via-[#111114] to-[#0f0f12]'
    : 'from-[#f6edff] via-[#fde8ff] to-[#ffe5f4]';

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
        <CardShellWithInsetTab
          tabPosition={insetTabPresets.left.tabPosition}
          tabWidth={tabWidth}
          tabDepth={tabDepth}
          tabRoundness={tabRoundness}
          className="rounded-2xl shadow-xl transition-colors duration-700"
          innerClassName="h-64 sm:h-72 md:h-80"
          backgroundClassName={cardBackground}
          tabSlot={
            isPro ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  // open hire flow/modal
                }}
                className="rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-2 font-semibold text-white shadow-inner hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                aria-label="Hire this creator"
              >
                Hire
              </button>
            ) : null
          }
        >
          <div className="relative h-full w-full">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`${profile.name} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className={`absolute inset-0 ${overlayClass}`} />
            <div className="relative z-10 flex h-full flex-col px-4 py-5 text-white sm:px-6">
              <Header
                profile={profile}
                mode={mode}
                setMode={setMode}
                ringState={ringState}
                setRingState={setRingState}
                className="items-center"
              />
              <p className="mt-4 text-sm font-medium text-gray-100 sm:text-base">
                “{profile.bio || ''}”
              </p>
              <div
                className={`mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs sm:text-sm ${borderMuted} ${secondaryText}`}
              >
                {profile.promocode && (
                  <div>
                    Promo code: <span className="font-semibold text-white">{profile.promocode}</span>
                  </div>
                )}
                {typeof profile.xp === 'number' && (
                  <div>
                    <span className="font-semibold text-white">{profile.xp}</span> XP
                  </div>
                )}
              </div>
              <div
                className={`mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${borderMuted}`}
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-100">
                  {profile.Tiktok_account && (
                    <a
                      href={profile.Tiktok_account}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1 transition-colors ${linkClass}`}
                    >
                      <Music2 className="h-4 w-4" /> TikTok
                    </a>
                  )}
                  {profile.IG_account && (
                    <a
                      href={profile.IG_account}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1 transition-colors ${linkClass}`}
                    >
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                </div>
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
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white">PRO</span>
                    )}
                    {isPro && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white">UGC</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardShellWithInsetTab>

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

