import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCurrentUser } from '@/api/xano';

interface XanoUser {
  id: number;
  name?: string;
  email?: string;
  Tiktok_account?: string;
  IG_account?: string;
}

export default function UgcTiktokerProfile() {
  const [user, setUser] = useState<XanoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(err => {
        if (err.message.includes('401') || err.message.includes('No auth token')) {
          navigate('/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p>Loading profile…</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user data.</p>;

  return (
    <>
      <Helmet>
        <title>UGC Creator Profile - {user.name || 'Paradise Pulse'}</title>
        <meta name="description" content="UGC creator profile showcasing collaborations and content creation." />
        <meta name="keywords" content="ugc creator, tiktoker, content creator, collaborations" />
        <link rel="canonical" href={`${window.location.origin}/ugc-tiktoker-profile`} />
        <meta property="og:title" content={`UGC Creator Profile - ${user.name || 'Paradise Pulse'}`} />
        <meta property="og:description" content="UGC creator profile showcasing collaborations and content creation." />
        <meta property="og:url" content={`${window.location.origin}/ugc-tiktoker-profile`} />
        <meta property="og:type" content="profile" />
      </Helmet>
      
      <div className="p-4">
        <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
      {user.email && <p>Email: {user.email}</p>}
      {user.Tiktok_account && (
        <p>
          TikTok: <a href={user.Tiktok_account}>{user.Tiktok_account}</a>
        </p>
      )}
      {user.IG_account && (
        <p>
          Instagram: <a href={user.IG_account}>{user.IG_account}</a>
        </p>
      )}
      </div>
    </>
  );
}
