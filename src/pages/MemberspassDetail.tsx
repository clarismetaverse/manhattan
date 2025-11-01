import React, { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Info,
  Shirt,
  Shield,
  Sparkles,
  DoorOpen,
  X,
} from "lucide-react";
import directGuestIcon from "@/assets/direct-guest-icon.png";
import generalRequestIcon from "@/assets/general-request-icon.png";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// --- DATA -------------------------------------------------------------------
const CLUBS = {
  cipriani: {
    title: "Cipriani",
    city: "Milano",
    count: 91,
    image:
      "https://images.unsplash.com/photo-1579551055097-5f8b0b6b1d4f?q=80&w=1800&auto=format&fit=crop",
    description:
      "Milano's most exclusive gathering. Members appreciate refined conversations and classic elegance.",
    guestPolicy: "Members may bring one guest. Prior notification required.",
    dressCode: "Formal attire required. Jackets mandatory after 7pm.",
    about:
      "Since 1931, Cipriani has been the heart of Milano's social elite. Our members represent the pinnacle of business, arts, and culture. The club maintains its legacy through carefully curated experiences and unwavering standards of excellence.",
    amenities: [
      { 
        name: "Private dining rooms", 
        description: "Intimate spaces for exclusive gatherings and business dinners",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Business center", 
        description: "State-of-the-art facilities for meetings and presentations",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Wine cellar", 
        description: "Curated collection of rare vintages from around the world",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Rooftop terrace", 
        description: "Panoramic city views in an elegant outdoor setting",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Member events", 
        description: "Exclusive social gatherings and cultural experiences",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"
      },
    ],
    rulesOfConduct: [
      "Respect privacy and discretion at all times",
      "Mobile devices on silent in common areas",
      "Photography requires prior approval",
      "Business discussions welcome in designated areas",
      "Punctuality is expected for all reservations",
    ],
  },
  sanctuary: {
    title: "The Sanctuary",
    city: "Milano",
    count: 72,
    image:
      "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1800&auto=format&fit=crop",
    description:
      "A modern haven for creatives and innovators. Members value authentic connections and boundary-pushing ideas.",
    guestPolicy: "Two guests permitted per visit. Guest registration online.",
    dressCode: "Smart casual. No sportswear or beach attire.",
    about:
      "The Sanctuary opened in 2018 as Milano's answer to the modern member. We celebrate innovation, creativity, and the power of diverse perspectives. Our space is designed for serendipitous encounters and meaningful collaboration.",
    amenities: [
      { 
        name: "Co-working spaces", 
        description: "Flexible workspaces designed for collaboration and focus",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Art gallery", 
        description: "Rotating exhibitions featuring emerging and established artists",
        image: "https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Recording studio", 
        description: "Professional audio equipment for music and podcast production",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Wellness lounge", 
        description: "Meditation and relaxation space for mental clarity",
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Monthly showcases", 
        description: "Platform for members to present their creative projects",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
      },
    ],
    rulesOfConduct: [
      "Embrace diverse perspectives and ideas",
      "Keep communal spaces tidy and welcoming",
      "Respect working members with minimal noise",
      "Share opportunities and connections freely",
      "Support fellow members' creative endeavors",
    ],
  },
  parigi: {
    title: "Palazzo Parigi",
    city: "Milano",
    count: 61,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1800&auto=format&fit=crop",
    description:
      "Where old world charm meets contemporary luxury. Members seek timeless sophistication and intimate gatherings.",
    guestPolicy: "Members only on Fridays. One guest other days.",
    dressCode: "Business formal. Evening gowns and suits preferred.",
    about:
      "Palazzo Parigi embodies the grandeur of Milano's golden age. Housed in a restored 19th century palazzo, every corner tells a story. Our members are custodians of tradition while embracing the future of luxury.",
    amenities: [
      { 
        name: "Grand ballroom", 
        description: "Opulent space for galas and sophisticated celebrations",
        image: "https://images.unsplash.com/photo-1519167758481-83f29da8585c?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Private library", 
        description: "Historic collection in a tranquil reading environment",
        image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Cigar lounge", 
        description: "Premium selection in a refined smoking room",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Spa facilities", 
        description: "Luxury treatments and wellness therapies",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
      },
      { 
        name: "Chef's table", 
        description: "Intimate culinary experiences with our master chef",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop"
      },
    ],
    rulesOfConduct: [
      "Maintain elegance in behavior and presentation",
      "No photography in private member areas",
      "Phones must be silenced throughout the venue",
      "Smoking permitted only in designated lounges",
      "Treat staff and fellow members with courtesy",
    ],
  },
};

// --- PAGE -------------------------------------------------------------------
export default function MemberspassDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const club = clubId ? (CLUBS as any)[clubId] : null;

  const aboutRef = useRef<HTMLDivElement | null>(null);
  const amenitiesRef = useRef<HTMLDivElement | null>(null);

  const [showRequest, setShowRequest] = useState(false);
  const [showMembersPicker, setShowMembersPicker] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState(0);

  const aboutMembers = useMemo(() => {
    // Short, people-centric blurb aligned with the rationale.
    return (
      "Expect founders, creatives, models, art patrons and private equity partners. " +
      "Conversations span design, hospitality, culture and venture — always discreet, never loud."
    );
  }, []);

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
    <div className="min-h-screen w-full bg-[#0A0B0C] text-[#E9ECEB] antialiased relative">
      {/* Top ambient reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(520px_120px_at_50%_0%,rgba(255,255,255,0.10),rgba(255,255,255,0)_70%)]" />

      <main className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 pb-32">
        {/* Back */}
        <button
          onClick={() => navigate("/memberspass")}
          className="mb-6 flex items-center gap-2 text-[13px] text-[#B8BDBC]/90 hover:text-[#E9ECEB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* HERO — cinematic full color with darker bottom shadows */}
        <div className="relative overflow-hidden rounded-[22px] border border-white/5 bg-[#0E0F10]/40 mb-8 h-[300px] sm:h-[380px]">
          <div
            className="absolute inset-0 bg-cover bg-center [filter:saturate(112%)_contrast(106%)_brightness(84%)]"
            style={{ backgroundImage: `url(${club.image})` }}
          />
          {/* cinematic vignettes + dark foot for legibility */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(0,0,0,0.15),rgba(0,0,0,0.55))]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          {/* Top right stats chip */}
          <div className="absolute top-5 right-5 rounded-[12px] bg-black/45 backdrop-blur-[2px] px-3 py-2 text-xs ring-1 ring-white/10 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 opacity-80" />
            <span className="opacity-80">tonight</span>
            <span className="mx-1 h-1 w-1 rounded-full bg-white/50" />
            <span className="font-medium tracking-tight">{club.count}</span>
          </div>

          {/* Title + description */}
          <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-8 pb-7">
            <h1 className="text-[36px] sm:text-[44px] leading-[1.05] font-light tracking-[-0.015em] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.65)]">
              {club.title}
            </h1>
            <p className="mt-2 text-[14px] sm:text-[15px] font-light leading-relaxed text-white/85 max-w-[560px]">
              {club.description}
            </p>

            {/* In-picture, wrapped chips: ABOUT / AMENITIES */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setShowAbout(true)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] tracking-[0.08em] uppercase text-white/90 hover:bg-white/15"
              >
                About
              </button>
              <button
                onClick={() => setShowAmenities(true)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[12px] tracking-[0.08em] uppercase text-white/90 hover:bg-white/15"
              >
                Amenities
              </button>
            </div>
          </div>
        </div>

        {/* ABOUT MEMBERS — people > place */}
        <section className="mb-6" id="about-members">
          <h2 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/55 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> About Members
          </h2>
          <p className="text-[15px] font-light leading-relaxed text-[#E9ECEB]/90">
            {aboutMembers}
          </p>
        </section>

        {/* GUEST POLICY / DRESS CODE */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="rounded-[16px] border border-white/5 bg-[#0E0F10]/40 p-6">
            <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/55 mb-3">
              <Shield className="w-3.5 h-3.5" /> Guest Policy
            </h3>
            <p className="text-[14px] font-light leading-relaxed text-[#E9ECEB]/90">{club.guestPolicy}</p>
          </div>
          <div className="rounded-[16px] border border-white/5 bg-[#0E0F10]/40 p-6">
            <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/55 mb-3">
              <Shirt className="w-3.5 h-3.5" /> Dress Code
            </h3>
            <p className="text-[14px] font-light leading-relaxed text-[#E9ECEB]/90">{club.dressCode}</p>
          </div>
        </div>


        {/* RULES OF CONDUCT + ADDITIONAL RULES */}
        <section className="rounded-[20px] border border-white/5 bg-[#0E0F10]/40 p-6 sm:p-8 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.08em] text-white/55 mb-4">Rules of Conduct</h2>
          <ul className="space-y-2 mb-4">
            {club.rulesOfConduct.map((rule: string, i: number) => (
              <li key={i} className="text-[14px] font-light text-[#E9ECEB]/90 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-white/40" /> {rule}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/85">
            <p className="mb-1">
              <strong className="font-medium">Additional Rules</strong>
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Do not meet any member for the first time outside the membersclub. Violations may result in a ban.</li>
              <li>Chat activates only after acceptance.</li>
            </ul>
          </div>
        </section>

        {/* REQUEST ACCESS (opens modal) */}
        <div className="mt-8 flex gap-3">
          <Button
            className="flex-1 h-12 rounded-[12px] bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[14px] font-light tracking-wide"
            onClick={() => setShowRequest(true)}
          >
            Request Access
          </Button>
          <Button
            className="h-12 rounded-[12px] bg-transparent text-white border border-white/20 hover:bg-white/10 text-[14px] font-light"
            onClick={() => aboutRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            See Members
          </Button>
        </div>
      </main>

      {/* ===== Request Access (CENTERED, GLASS) ===== */}
      {showRequest && (
        <Modal onClose={() => setShowRequest(false)}>
          <div className="mx-auto w-full max-w-[520px] rounded-3xl border border-white/10 
                          bg-white/[0.06] backdrop-blur-2xl 
                          shadow-[0_30px_90px_rgba(0,0,0,0.55)] p-5 sm:p-6">
            <header className="text-center mb-5">
              <h3 className="text-[18px] font-light tracking-[-0.01em]">Request Members Guest Access</h3>
              <p className="mt-1 text-sm text-white/70">Choose how you'd like to proceed.</p>
            </header>

            <div className="space-y-3">
              {/* 1) GENERAL REQUEST — first & bigger */}
              <button
                onClick={() => {
                  setShowRequest(false);
                  // TODO: trigger general request API
                  alert("General request sent. Any member may support your access.");
                }}
                className="group w-full rounded-2xl border border-white/14 bg-white/[0.08]
                           hover:bg-white/[0.12] transition px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Ripple / Signal icon (ivory) */}
                  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className="shrink-0">
                    <circle cx="32" cy="42" r="6" fill="white"/>
                    <path d="M16 42c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M8 42c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".85"/>
                  </svg>
                  <div>
                    <div className="text-[15px] font-medium tracking-tight">General Request</div>
                    <div className="text-[13px] text-white/75">Any member can support your request</div>
                  </div>
                </div>
              </button>

              {/* 2) DIRECT GUEST — gold label & icon */}
              <button
                onClick={() => {
                  setShowRequest(false);
                  setShowMembersPicker(true);
                }}
                className="group w-full rounded-2xl border border-white/14 bg-white/[0.06]
                           hover:bg-white/[0.10] transition px-5 py-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Intersecting circles (gold) */}
                  <svg width="26" height="26" viewBox="0 0 64 64" fill="none" className="shrink-0">
                    <defs>
                      <linearGradient id="mp-gold" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D9CBA3"/>
                        <stop offset="100%" stopColor="#BFAF86"/>
                      </linearGradient>
                    </defs>
                    <circle cx="26" cy="32" r="12" stroke="url(#mp-gold)" strokeWidth="3"/>
                    <circle cx="38" cy="32" r="12" stroke="url(#mp-gold)" strokeWidth="3"/>
                  </svg>
                  <div>
                    <div className="text-[15px] font-medium tracking-tight text-[#D9CBA3]">
                      Direct Guest (DG)
                    </div>
                    <div className="text-[13px] text-white/75">Ask a specific member to be your host</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showMembersPicker && (
        <Modal onClose={() => setShowMembersPicker(false)}>
          <div className="space-y-5">
            <header className="text-center">
              <h3 className="text-[18px] font-light tracking-[-0.01em]">Choose a Member</h3>
              <p className="mt-1 text-sm text-white/70">
                Send a Direct Guest request to a door member.
              </p>
            </header>

            <ul className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
              {["@danielv (Guardian)", "@michaelr (Guardian)", "@emilyp (Guardian)", "@celine (Discreet)", "@andrew (Discreet)", "@marco (Locked)"]
                .map((m, i) => (
                  <li
                    key={i}
                    className={
                      "flex items-center justify-between rounded-2xl border px-4 py-3 " +
                      (m.includes("Locked")
                        ? "border-white/10 bg-white/[0.03] text-white/40"
                        : "border-white/10 bg-white/[0.05] text-white/90")
                    }
                  >
                    <span className="text-sm">{m}</span>
                    <Button
                      disabled={m.includes("Locked")}
                      className="h-9 rounded-[10px] bg-white/10 text-white border border-white/20 hover:bg-white/20 text-[12px] font-light"
                      onClick={() => {
                        setShowMembersPicker(false);
                        alert(`Request sent to ${m.split(" ")[0]}`);
                      }}
                    >
                      Send
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        </Modal>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowAbout(false)} />
          
          <div className="relative z-10 w-full sm:w-[680px] mx-4 rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
            <button 
              onClick={() => setShowAbout(false)} 
              className="absolute right-5 top-5 z-20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative h-[70vh] sm:h-[500px]">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${club.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/75" />
              
              <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
                <div className="flex items-center gap-2 text-white/70 mb-4">
                  <Info className="w-5 h-5" />
                  <span className="text-[11px] uppercase tracking-[0.08em]">About</span>
                </div>
                <h3 className="text-[32px] sm:text-[38px] font-light tracking-tight text-white mb-6">
                  {club.title}
                </h3>
                <div className="w-16 h-[1px] bg-white/30 mb-6" />
                <p className="text-[15px] sm:text-[16px] font-light leading-relaxed text-white/95 max-w-[560px]">
                  {club.about}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAmenities && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <button 
            onClick={() => setShowAmenities(false)} 
            className="absolute right-6 top-6 z-10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-8 py-12">
            <Carousel 
              className="w-full max-w-2xl"
              opts={{ loop: true }}
              setApi={(api) => {
                api?.on("select", () => {
                  setCurrentAmenity(api.selectedScrollSnap());
                });
              }}
            >
              <CarouselContent>
                {club.amenities.map((amenity: any, i: number) => (
                  <CarouselItem key={i}>
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div 
                        className="w-full aspect-[3/4] max-h-[65vh] rounded-[24px] overflow-hidden border border-white/10 bg-cover bg-center shadow-2xl"
                        style={{ backgroundImage: `url(${amenity.image})` }}
                      >
                        <div className="w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <h3 className="text-[28px] sm:text-[32px] font-light tracking-tight text-white mb-3">
                            {amenity.name}
                          </h3>
                          <p className="text-[15px] sm:text-[16px] font-light leading-relaxed text-white/90 max-w-md">
                            {amenity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 sm:left-8 h-12 w-12 bg-white/10 border-white/20 hover:bg-white/20" />
              <CarouselNext className="right-4 sm:right-8 h-12 w-12 bg-white/10 border-white/20 hover:bg-white/20" />
            </Carousel>
            
            {/* Navigation dots */}
            <div className="flex items-center gap-2 mt-8">
              {club.amenities.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentAmenity(i);
                    // Would need carousel API to scroll to index
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === currentAmenity 
                      ? "w-8 bg-white" 
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Minimal cinematic Modal (centered, glass backdrop) =====
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* dimmed glass backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(5,6,7,0.6)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-full px-4">{children}</div>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-6 top-6 text-white/80 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
