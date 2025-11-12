import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import VenueCard from "./VenueCard";
import VenueDetail from "./VenueDetail";
import type { Venue } from "./VenueTypes";

export default function VenueList({ venues }: { venues: Venue[] }) {
  const [open, setOpen] = useState<Venue | null>(null);
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-sm px-3 py-4 space-y-4">
        <h1 className="text-2xl font-serif text-stone-800 mb-1">Dive into the guest experience</h1>
        {venues.map(v => (
          <VenueCard key={v.id} venue={v} onOpen={setOpen} />
        ))}
      </div>

      <AnimatePresence>{open && <VenueDetail venue={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}
