import React, { useEffect, useState } from 'react';
import Header from './Header';
import UGCView from './UGCView';
import PROView from './PROView';
import BioTopSheet from '@/components/BioTopSheet';
import './GradientSweep.css';
import type { Profile, Mode, RingState } from './types';

const mockFetch = async (): Promise<Profile> => {
  return {
    id: 1,
    name: 'Ava Doe',
    IG_account: 'https://instagram.com/ava',
    xp: 1200,
    TikTok: true,
    Claris: 0,
    InstagramApprovation: true,
    Tiktokapprovation: true,
    TiktokRejection: false,
    InstagramRejection: false,
    bio: 'Beauty content creator',
    promocode: 'AVA2025',
    City: 'Bali',
    countryCode: 'ID',
    Tiktok_account: 'https://tiktok.com/@ava',
    Profile_pic: {
      access: '',
      path: '',
      name: '',
      type: '',
      size: 0,
      mime: '',
      meta: { width: 0, height: 0 },
      url: 'https://placehold.co/200x200',
    },
    back: {
      access: '',
      path: '',
      name: '',
      type: '',
      size: 0,
      mime: '',
      meta: { width: 0, height: 0 },
      url: 'https://placehold.co/600x200',
    },
  };
};

const DualModeLayout: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<Mode>('UGC');
  const [ringState, setRingState] = useState<RingState>('idle');
  const [bioOpen, setBioOpen] = useState(false);

  useEffect(() => {
    mockFetch().then(setProfile);
  }, []);

  if (!profile) return null;

  return (
    <div className={mode === 'PRO' ? 'bg-black' : 'bg-white'}>
      <Header
        profile={profile}
        mode={mode}
        setMode={setMode}
        ringState={ringState}
        setRingState={setRingState}
        onBioOpen={() => setBioOpen(true)}
      />
      {mode === 'UGC' ? <UGCView profile={profile} /> : <PROView profile={profile} />}
      <BioTopSheet
        open={bioOpen}
        onClose={() => setBioOpen(false)}
        name={profile.name}
        avatar={profile.Profile_pic?.url || ''}
        statement={profile.bio || 'Helping brands shine with authentic TikToks ✨'}
        bio={profile.bio}
        goals={["Collaborate with 5 skincare brands", "Launch a weekly GRWM series", "Reach 50K followers"]}
        futureProjects={["Behind-the-scenes collab vlog", "Maison Savage launch collab", "Bali wellness x beauty format"]}
        idols={[]}
      />
    </div>
  );
};

export default DualModeLayout;
