import React, { useState, useEffect } from "react";
import BioTopSheet from "@/components/BioTopSheet";
import { Share2, BadgeCheck, Pin, Instagram, Music2, Briefcase, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, type UserProfileResponse } from "@/services/couponApi";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * UGC TikToker Profile — Pinned Trends + Editorial Projects (Revised)
 * - Pinned Collabs = TikTok trends curated
 * - Editorial/Marketing Projects = complete works (brands squared prominent icons, professionals row below)
 * - Tweaks: bigger brand icons, Project1 overlay TL, Project3 banner variant
 */
export default function UGCTiktokerProfilePinned() {
  const [openPinned, setOpenPinned] = useState<string | null>(null);
  const [bioOpen, setBioOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (error: unknown) {
        if (error instanceof Error && error.message?.includes('401')) {
          navigate('/login');
        }
      }
    };
    loadProfile();
  }, [navigate]);

  const pinned = [
    { id: "p1", code: "BTS", title: "Festival Prep", cover: "https://placehold.co/300x500?text=BTS", about: "Creators show their makeup & outfits before the festival." },
    { id: "p2", code: "GRWM", title: "Clean Girl Routine", cover: "https://placehold.co/300x500?text=GRWM", about: "Natural light, step captions, final reveal outside." },
    { id: "p3", code: "POV", title: "Club Entrance", cover: "https://placehold.co/300x500?text=POV", about: "POV shot of entering the party with transition." },
  ];

  const projects = [
    { id: "e1", title: "Glow Campaign — Sephora Bali", cover: "https://placehold.co/600x400?text=Proj1", brands: ["https://placehold.co/80x80?text=S"], pros: ["https://placehold.co/32x32?text=MUA","https://placehold.co/32x32?text=PH"], variant: "brand-overlay" },
    { id: "e2", title: "Editorial Shoot — Beach Club", cover: "https://placehold.co/600x400?text=Proj2", brands: ["https://placehold.co/80x80?text=F"], pros: ["https://placehold.co/32x32?text=ST","https://placehold.co/32x32?text=PH","https://placehold.co/32x32?text=MD"], variant: "brand-highlight" },
    { id: "e3", title: "Luxury Festival Collaboration", cover: "https://placehold.co/600x400?text=Proj3", brands: ["https://placehold.co/80x80?text=LUX"], pros: ["https://placehold.co/32x32?text=HMU","https://placehold.co/32x32?text=VID","https://placehold.co/32x32?text=DIR"], variant: "brand-banner" },
  ];

  if (!profile) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isPro ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${isPro ? 'shadow-purple-500/20 bg-gray-800' : 'shadow-gray-500/10 bg-white'}`}>
        <div 
          className={`h-28 sm:h-36 transition-colors duration-300 ${isPro ? 'bg-gradient-to-r from-purple-900 to-indigo-900' : 'bg-gradient-to-r from-fuchsia-200 to-pink-300'}`}
          style={{
            backgroundImage: profile.back?.url ? `url(${profile.back.url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="flex items-center p-4 -mt-14 sm:-mt-16">
          <div className="relative">
            <img 
              src={profile.Profile_pic?.url} 
              alt={profile.name} 
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow object-cover transition-all duration-300 ${
                isPro 
                  ? 'border-purple-400 shadow-lg shadow-purple-500/50' 
                  : 'border-white'
              }`}
            />
            {isPro && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-spin opacity-75 blur-sm"></div>
            )}
            {isPro && (
              <img 
                src={profile.Profile_pic?.url} 
                alt={profile.name} 
                className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-purple-400 shadow-lg shadow-purple-500/50 object-cover z-10"
              />
            )}
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h1 className={`text-lg sm:text-xl font-bold flex items-center gap-2 truncate ${isPro ? 'text-white' : 'text-black'}`}>
                {profile.name}
                <span className={`px-2 py-0.5 text-[10px] sm:text-[11px] rounded inline-flex items-center gap-1 ${isPro ? 'bg-purple-600 text-purple-100' : 'bg-gray-200 text-gray-700'}`}>
                  <BadgeCheck className="w-3 h-3"/> {isPro ? 'PRO' : 'UGC'}
                </span>
              </h1>
              <RadioGroup value={isPro ? "pro" : "normal"} onValueChange={(value) => setIsPro(value === "pro")} className="flex">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" className="w-4 h-4 rounded-none" />
                  <RadioGroupItem value="pro" id="pro" className="w-4 h-4 rounded-none" />
                </div>
              </RadioGroup>
            </div>
            <div className={`text-sm ${isPro ? 'text-gray-300' : 'text-gray-600'}`}>
              <p className="truncate">{profile.City}</p>
              <p className="truncate">{profile.countryCode}</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <p className={`text-sm font-medium cursor-pointer ${isPro ? 'text-gray-200' : 'text-gray-800'}`} onClick={() => setBioOpen(true)}>"{profile.bio || ""}"</p>
          <p className={`text-xs mt-1 ${isPro ? 'text-gray-400' : 'text-gray-600'}`}>{profile.bio}</p>
        </div>
        {/* Promo and XP */}
        <div className={`px-4 pb-4 text-xs sm:text-sm flex gap-4 border-t pt-3 ${isPro ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-200'}`}>
          {profile.promocode && <div>Promo code: {profile.promocode}</div>}
          {typeof profile.xp === 'number' && <div>{profile.xp} XP</div>}
        </div>
        {/* Socials */}
        <div className={`px-4 pb-4 flex gap-3 border-t pt-3 ${isPro ? 'border-gray-600' : 'border-gray-200'}`}>
          {profile.Tiktok_account && (
            <a href={profile.Tiktok_account} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-sm ${isPro ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}><Music2 className="w-4 h-4"/> TikTok</a>
          )}
          {profile.IG_account && (
            <a href={profile.IG_account} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-sm ${isPro ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}><Instagram className="w-4 h-4"/> Instagram</a>
          )}
        </div>
      </div>

      {/* Pinned Collabs (TikTok Trends) */}
      <div className="mt-6">
        <div className={`text-xs mb-2 flex items-center gap-1 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}><Pin className="w-3 h-3"/> Pinned Collabs</div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pinned.map(t => (
            <div key={t.id} className={`min-w-[160px] rounded-xl overflow-hidden shadow-lg cursor-pointer transition-colors duration-300 ${isPro ? 'shadow-purple-500/15 bg-gray-800' : 'shadow-gray-500/15 bg-white'}`} onClick={() => setOpenPinned(t.id)}>
              <img src={t.cover} alt={t.title} className="w-full h-56 object-cover"/>
              <div className="p-2 text-sm">
                <div className={`font-semibold truncate ${isPro ? 'text-white' : 'text-black'}`}>{t.code} — {t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial/Marketing Projects */}
      <div className="mt-6">
        <div className={`text-xs mb-2 flex items-center gap-1 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}><Briefcase className="w-3 h-3"/> Editorial / Marketing Projects</div>
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className={`relative rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${isPro ? 'shadow-purple-500/20 bg-gray-800' : 'shadow-gray-500/20 bg-white'}`}>
              <div className="relative">
                <img src={p.cover} alt={p.title} className="w-full h-40 sm:h-56 object-cover"/>
                {/* Variant: brand overlay top-left */}
                {p.variant === "brand-overlay" && (
                  <div className="absolute top-3 left-3">
                    {p.brands.map((b,i)=>(
                      <img key={`b-${i}`} src={b} alt="brand" className="w-20 h-20 rounded-md border-4 border-white shadow-xl ring-2 ring-black/5 object-cover"/>
                    ))}
                  </div>
                )}
                {/* Variant: highlight brand prominently top-right larger */}
                {p.variant === "brand-highlight" && (
                  <div className="absolute top-3 right-3">
                    {p.brands.map((b,i)=>(
                      <img key={`b-${i}`} src={b} alt="brand" className="w-20 h-20 rounded-md border-4 border-white shadow-xl object-cover"/>
                    ))}
                  </div>
                )}
                {/* Variant: bottom banner for pro polish */}
                {p.variant === "brand-banner" && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white p-2 flex items-center gap-2">
                    {p.brands.map((b,i)=> (
                      <img key={`b-bn-${i}`} src={b} alt="brand" className="w-12 h-12 rounded-md border object-cover"/>
                    ))}
                    <span className="text-xs uppercase tracking-wide">Official Collaboration • Case Study</span>
                  </div>
                )}
              </div>
              <div className={`p-3 text-sm relative z-10 backdrop-blur-sm transition-colors duration-300 ${isPro ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                <div className={`font-semibold text-base ${isPro ? 'text-white' : 'text-black'}`}>{p.title}</div>
                {/* Professionals row */}
                <div className="mt-2 flex items-center gap-2">
                  <Users className={`w-4 h-4 ${isPro ? 'text-gray-400' : 'text-gray-500'}`}/>
                  <div className="flex gap-2">
                    {p.pros.map((pro,i)=>(
                      <img key={`p-${i}`} src={pro} alt="pro" className="w-7 h-7 rounded-full border object-cover"/>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="mt-8 text-center">
        <button className={`px-6 py-3 rounded-xl shadow-lg flex items-center justify-center mx-auto transition-colors duration-300 ${isPro ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/25' : 'bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white shadow-pink-500/25'}`}>
          <Share2 className="w-5 h-5 mr-2"/> Share Profile
        </button>
      </div>

      {/* Pinned Details Modal */}
      {openPinned && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-4 relative transition-colors duration-300 ${isPro ? 'bg-gray-800 shadow-purple-500/30' : 'bg-white shadow-gray-500/30'}`}>
            <button className={`absolute top-3 right-3 hover:opacity-75 ${isPro ? 'text-gray-400' : 'text-gray-500'}`} onClick={() => setOpenPinned(null)}>✕</button>
            {pinned.filter(p=>p.id===openPinned).map(p => (
              <div key={p.id}>
                <img src={p.cover} alt={p.title} className="w-full h-64 object-cover rounded-xl"/>
                <h3 className={`text-lg font-bold mt-3 ${isPro ? 'text-white' : 'text-black'}`}>{p.code} — {p.title}</h3>
                <div className={`text-sm mt-1 ${isPro ? 'text-gray-300' : 'text-gray-600'}`}>{p.about}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
      <BioTopSheet
        open={bioOpen}
        onClose={() => setBioOpen(false)}
        name={profile.name}
        avatar={profile.Profile_pic?.url || ""}
        statement={profile.bio || "Helping brands shine with authentic TikToks ✨"}
        bio={profile.bio}
        goals={["Collaborate with 5 skincare brands", "Launch a weekly GRWM series", "Reach 50K followers"]}
        futureProjects={["Behind-the-scenes collab vlog", "Maison Savage launch collab", "Bali wellness x beauty format"]}
        idols={[]}
      />
  </div>
  );
}