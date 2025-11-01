import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CLUBS = {
  cipriani: {
    title: "Cipriani",
    count: 91,
    image: "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop",
    description: "Milano's most exclusive gathering. Members appreciate refined conversations and classic elegance.",
    guestPolicy: "Members may bring one guest. Prior notification required.",
    dressCode: "Formal attire required. Jackets mandatory after 7pm.",
    about: "Since 1931, Cipriani has been the heart of Milano's social elite. Our members represent the pinnacle of business, arts, and culture. The club maintains its legacy through carefully curated experiences and unwavering standards of excellence.",
    amenities: ["Private dining rooms", "Business center", "Wine cellar", "Rooftop terrace", "Member events"],
  },
  sanctuary: {
    title: "The Sanctuary",
    count: 72,
    image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1800&auto=format&fit=crop",
    description: "A modern haven for creatives and innovators. Members value authentic connections and boundary-pushing ideas.",
    guestPolicy: "Two guests permitted per visit. Guest registration online.",
    dressCode: "Smart casual. No sportswear or beach attire.",
    about: "The Sanctuary opened in 2018 as Milano's answer to the modern member. We celebrate innovation, creativity, and the power of diverse perspectives. Our space is designed for serendipitous encounters and meaningful collaboration.",
    amenities: ["Co-working spaces", "Art gallery", "Recording studio", "Wellness lounge", "Monthly showcases"],
  },
  parigi: {
    title: "Palazzo Parigi",
    count: 61,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1800&auto=format&fit=crop",
    description: "Where old world charm meets contemporary luxury. Members seek timeless sophistication and intimate gatherings.",
    guestPolicy: "Members only on Fridays. One guest other days.",
    dressCode: "Business formal. Evening gowns and suits preferred.",
    about: "Palazzo Parigi embodies the grandeur of Milano's golden age. Housed in a restored 19th century palazzo, every corner tells a story. Our members are custodians of tradition while embracing the future of luxury.",
    amenities: ["Grand ballroom", "Private library", "Cigar lounge", "Spa facilities", "Chef's table"],
  },
};

export default function MemberspassDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const club = clubId ? CLUBS[clubId as keyof typeof CLUBS] : null;

  if (!club) {
    return (
      <div className="min-h-screen w-full bg-[#0A0B0C] text-[#E9ECEB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Club not found</h1>
          <Button onClick={() => navigate("/memberspass")} variant="outline">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0B0C] text-[#E9ECEB] antialiased">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(520px_120px_at_50%_0%,rgba(255,255,255,0.10),rgba(255,255,255,0)_70%)]" />

      <main className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 pb-24">
        <button
          onClick={() => navigate("/memberspass")}
          className="mb-6 flex items-center gap-2 text-[13px] text-[#B8BDBC]/90 hover:text-[#E9ECEB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero Image */}
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/5 bg-[#0E0F10]/40 mb-8 h-[280px] sm:h-[340px]">
          <div
            className="absolute inset-0 bg-cover bg-center [filter:grayscale(92%)_contrast(92%)_brightness(55%)]"
            style={{ backgroundImage: `url(${club.image})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.50)_0%,rgba(8,9,10,0.60)_60%,rgba(8,9,10,0.66)_100%)]" />
          
          <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-8 pb-8 sm:pb-10">
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex flex-col items-end gap-0.5">
              <div className="text-[9px] leading-none text-white/60 tracking-[0.07em] uppercase">
                tonight check ins
              </div>
              <div className="font-light text-[12px] leading-none text-white/90 tracking-[-0.01em] mr-2">
                {club.count}
              </div>
            </div>

            <h1 className="text-[36px] sm:text-[44px] leading-[1.05] font-light tracking-[-0.015em] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.65)]">
              {club.title}
            </h1>
            <p className="mt-3 text-[14px] sm:text-[15px] font-light leading-relaxed text-white/80 max-w-[520px]">
              {club.description}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-[16px] border border-white/5 bg-[#0E0F10]/40 p-6">
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/50 mb-3">Guest Policy</h3>
            <p className="text-[14px] font-light leading-relaxed text-[#E9ECEB]/90">
              {club.guestPolicy}
            </p>
          </div>

          <div className="rounded-[16px] border border-white/5 bg-[#0E0F10]/40 p-6">
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-white/50 mb-3">Dress Code</h3>
            <p className="text-[14px] font-light leading-relaxed text-[#E9ECEB]/90">
              {club.dressCode}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-[20px] border border-white/5 bg-[#0E0F10]/40 p-6 sm:p-8 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-white/50 mb-4">About</h2>
          <p className="text-[15px] font-light leading-relaxed text-[#E9ECEB]/90">
            {club.about}
          </p>
        </div>

        {/* Amenities */}
        <div className="rounded-[20px] border border-white/5 bg-[#0E0F10]/40 p-6 sm:p-8 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-white/50 mb-4">Amenities</h2>
          <ul className="space-y-2">
            {club.amenities.map((amenity, i) => (
              <li key={i} className="text-[14px] font-light text-[#E9ECEB]/90 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-white/40" />
                {amenity}
              </li>
            ))}
          </ul>
        </div>

        {/* See Members Button */}
        <Button 
          className="w-full h-12 rounded-[12px] bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[14px] font-light tracking-wide"
          onClick={() => {/* TODO: Implement members list */}}
        >
          See Members
        </Button>
      </main>
    </div>
  );
}
