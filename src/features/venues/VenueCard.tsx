import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Venue } from "./VenueTypes";

const CARD_RADIUS = 24;

export default function VenueCard({ venue, onOpen }: { venue: Venue; onOpen: (v: Venue) => void }) {
  return (
    <motion.button
      onClick={() => onOpen(venue)}
      className="w-full text-left"
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        layoutId={`card-${venue.id}`}
        className="relative overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,.08)]"
        style={{ borderRadius: CARD_RADIUS }}
      >
        <img
          src={venue.image}
          alt={venue.name}
          className="h-64 w-full object-cover"
          style={{ borderRadius: CARD_RADIUS }}
        />
        <motion.div
          layoutId={`card-grad-${venue.id}`}
          className="absolute inset-0"
          style={{
            borderRadius: CARD_RADIUS,
            background: "linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.5) 100%)",
          }}
        />
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
