import VenueList from "@/features/venues/VenueList";
import type { Venue } from "@/features/venues/VenueTypes";

const demo: Venue[] = [
  {
    id: "izzi",
    name: "Hygge Cafe",
    city: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop",
    brief: "Scandinavian vibes in the heart of Seminyak. Everything is organized to feel warm and light.",
    offers: [
      { id: "story3", title: "3 × Story", plates: 1, drinks: 2, mission: "Publish 3 Stories featuring ambience, food, and yourself. Tag @venue and add hidden @claris.app after posting." },
      { id: "reel", title: "Reel", plates: 3, drinks: 2, mission: "Post 1 Reel with yourself, ambience and dishes. Use trending audio; tag @venue and #clarisapp." },
    ],
  },
  // add more venues...
];

export default function Page() {
  return <VenueList venues={demo} />;
}
