"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import VenueCard from "@/features/venues/VenueCard";
import VenueDetail from "@/features/venues/VenueDetail";
import type { Venue } from "@/features/venues/VenueTypes";

const venues: Venue[] = [
  {
    id: "hygge",
    name: "Hygge Cafe",
    city: "Bali, Indonesia",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop",
    brief:
      "Scandinavian vibes in the heart of Seminyak. Everything is organized to feel warm and light.",
    offers: [
      {
        id: "story3",
        title: "3 × Story",
        plates: 1,
        drinks: 2,
        mission:
          "Publish 3 Stories showcasing ambience, hero dishes, and yourself. Tag @venue + #clarisapp with one hidden @claris.app mention after posting.",
      },
      {
        id: "reel",
        title: "Reel",
        plates: 3,
        drinks: 2,
        mission:
          "Post 1 Reel blending ambience and signature dishes. Keep transitions smooth, add trending audio, and tag the venue + #clarisapp.",
      },
    ],
  },
  {
    id: "aura",
    name: "Aura Lounge",
    city: "Lisbon, Portugal",
    image:
      "https://images.unsplash.com/photo-1529255490-3e84c5dcad7a?q=80&w=1600&auto=format&fit=crop",
    brief:
      "Sunset cocktails overlooking Alfama rooftops. Warm brass, blush velvets, and a live vinyl set every weekend.",
    offers: [
      {
        id: "story",
        title: "Story Set",
        plates: 2,
        drinks: 3,
        mission:
          "Capture golden-hour drinks and the lounge energy. Include a personal voiceover and tag @aura.lounge + #clarisapp.",
      },
      {
        id: "carousel",
        title: "Photo Carousel",
        plates: 3,
        drinks: 3,
        mission:
          "Deliver 6 bright edits highlighting cocktails, DJ booth, and your look. Mention the new terrace opening in captions.",
      },
    ],
  },
  {
    id: "solaris",
    name: "Solaris by the Sea",
    city: "Amalfi Coast, Italy",
    image:
      "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
    brief:
      "Terracotta terraces, citrus groves, and candlelit dinners cascading down to the sea.",
    offers: [
      {
        id: "reel-duo",
        title: "Reel + Story",
        plates: 4,
        drinks: 2,
        mission:
          "Film a dreamy reel from arrival to dessert with voiceover. Add a follow-up story tagging @solaris.amalfi + #clarisapp.",
      },
      {
        id: "tiktok",
        title: "TikTok Feature",
        plates: 3,
        drinks: 2,
        mission:
          "Create a POV TikTok covering the tasting menu with emphasis on textures, waves, and sunset lighting.",
      },
    ],
  },
];

export default function VenuePage() {
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(1100px 650px at 65% -10%, #FFF9F0 0%, #F7F1E6 38%, #E9DEC9 68%, #E5D6C2 100%)",
      }}
    >
      <LayoutGroup>
        <div className="mx-auto flex min-h-screen max-w-sm flex-col px-4 pb-32 pt-16 font-[SF Pro Display,Inter,sans-serif] text-stone-900">
          <header className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Influencer Flow</p>
            <h1 className="text-3xl font-semibold text-stone-900">
              Choose your next luminous venue
            </h1>
            <p className="text-sm text-stone-600">
              Tap a card to glide into the full brief with offers made for your storytelling style.
            </p>
          </header>

          <div className="mt-10 flex flex-1 flex-col space-y-6">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onOpen={setActiveVenue} />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {activeVenue && (
            <VenueDetail
              venue={activeVenue}
              onClose={() => setActiveVenue(null)}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
