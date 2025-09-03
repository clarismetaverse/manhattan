import React, { useState } from "react";
import { Share2, BadgeCheck, Pin, Instagram, Music2, Briefcase, Users } from "lucide-react";

/**
 * UGC TikToker Profile — Pinned Trends + Editorial Projects (Revised)
 * - Pinned Collabs = TikTok trends curated
 * - Editorial/Marketing Projects = complete works (brands squared prominent icons, professionals row below)
 * - Tweaks: bigger brand icons, Project1 overlay TL, Project3 banner variant
 */
export default function UGCTiktokerProfilePinned() {
  const [openPinned, setOpenPinned] = useState<string | null>(null);

  const profile = {
    name: "Nina Rivera",
    handle: "@nina.rvr",
    avatar: "https://placehold.co/120x120?text=N",
    role: "UGC Creator",
    location: "Canggu, Bali",
    claim: "Helping brands shine with authentic TikToks ✨",
    bio: "UGC creator focused on beauty, lifestyle and travel content. Based in Bali, open for collabs worldwide.",
    claris: {
      collabs: 45,
      starred: 12,
      featured: 3,
    },
    socials: {
      tiktok: "https://www.tiktok.com/@nina.rvr",
      instagram: "https://www.instagram.com/nina.rvr",
    }
  } as const;

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="rounded-2xl shadow-xl shadow-gray-500/10 bg-white overflow-hidden">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-fuchsia-200 to-pink-300" />
        <div className="flex items-center p-4 -mt-14 sm:-mt-16">
          <img src={profile.avatar} alt={profile.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow"/>
          <div className="ml-3 sm:ml-4 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 truncate">
              {profile.name}
              <span className="px-2 py-0.5 text-[10px] sm:text-[11px] rounded bg-gray-200 text-gray-700 inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3"/> UGC</span>
            </h1>
            <div className="text-gray-600 text-sm">
              <p className="truncate">{profile.role}</p>
              <p className="truncate">{profile.location}</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <p className="text-sm font-medium text-gray-800">“{profile.claim}”</p>
          <p className="text-xs text-gray-600 mt-1">{profile.bio}</p>
        </div>
        {/* Claris stats */}
        <div className="px-4 pb-4 text-xs sm:text-sm text-gray-700 flex gap-4 border-t pt-3">
          <div>{profile.claris.collabs} Collabs</div>
          <div>{profile.claris.starred} Starred</div>
          <div>{profile.claris.featured} Featured</div>
        </div>
        {/* Socials */}
        <div className="px-4 pb-4 flex gap-3 border-t pt-3">
          <a href={profile.socials.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black"><Music2 className="w-4 h-4"/> TikTok</a>
          <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-700 hover:text-black"><Instagram className="w-4 h-4"/> Instagram</a>
        </div>
      </div>

      {/* Pinned Collabs (TikTok Trends) */}
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Pin className="w-3 h-3"/> Pinned Collabs</div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pinned.map(t => (
            <div key={t.id} className="min-w-[160px] rounded-xl overflow-hidden shadow-lg shadow-gray-500/15 bg-white cursor-pointer" onClick={() => setOpenPinned(t.id)}>
              <img src={t.cover} alt={t.title} className="w-full h-56 object-cover"/>
              <div className="p-2 text-sm">
                <div className="font-semibold truncate">{t.code} — {t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial/Marketing Projects */}
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Editorial / Marketing Projects</div>
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-500/20 bg-white">
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
              <div className="p-3 text-sm relative z-10 bg-white/80 backdrop-blur-sm">
                <div className="font-semibold text-base">{p.title}</div>
                {/* Professionals row */}
                <div className="mt-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500"/>
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
        <button className="bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center mx-auto">
          <Share2 className="w-5 h-5 mr-2"/> Share Profile
        </button>
      </div>

      {/* Pinned Details Modal */}
      {openPinned && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl shadow-gray-500/30 p-4 relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setOpenPinned(null)}>✕</button>
            {pinned.filter(p=>p.id===openPinned).map(p => (
              <div key={p.id}>
                <img src={p.cover} alt={p.title} className="w-full h-64 object-cover rounded-xl"/>
                <h3 className="text-lg font-bold mt-3">{p.code} — {p.title}</h3>
                <div className="text-sm text-gray-600 mt-1">{p.about}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

