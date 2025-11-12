import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Venue } from "./VenueTypes";

export default function VenueCard({ venue, onOpen }: { venue: Venue; onOpen: (v: Venue) => void }) {
  return (
    <motion.button
      onClick={() => onOpen(venue)}
      className="w-full text-left"
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        layoutId={`card-${venue.id}`}
        className="relative overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,.08)]"
      >
        <img src={venue.image} alt={venue.name} className="h-48 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <div className="absolute left-4 bottom-4 right-4">
          <h3 className="text-white text-xl font-semibold drop-shadow-md">{venue.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-white/85 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{venue.city}</span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}
