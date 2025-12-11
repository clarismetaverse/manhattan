import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Instagram } from "lucide-react";
import DateTimeSheet, { Timeframe } from "./DateTimeSheet";
import type { Venue } from "./VenueTypes";
import { FeaturedCollabsStrip } from "@/features/venues/FeaturedCollabsStrip";

// Dummy data for now – later you can load from Xano
const demoFeaturedCollabs = [
  {
    id: "sofiatravels",
    creatorHandle: "@sofiatravels",
    contentType: "3 × Story",
    badge: "Top pick",
    imageUrl:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "jakeson",
    creatorHandle: "@jakeson",
    contentType: "Reel",
    badge: undefined,
    imageUrl:
      "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function VenueDetail({
  venue,
  onClose,
}: {
  venue: Venue;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<{
    iso: string;
    date: string;
    timeLabel: string;
    offerId: string;
    timeframeId?: string;
  } | null>(null);

  const offer = venue.offers[activeTab] ?? venue.offers[0];
  const enabled = !!selectedOfferId;
  const activeConfirmed =
    confirmedSlot && confirmedSlot.offerId === selectedOfferId ? confirmedSlot : null;

  const weeklyTimeframes = useMemo<Record<number, Timeframe[]>>(
    () => ({
      0: [],
      1: [
        { id: "mon-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "mon-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      2: [
        { id: "tue-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "tue-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      3: [
        { id: "wed-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "wed-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      4: [
        { id: "thu-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "thu-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 22, m: 0 }, stepMins: 30 },
      ],
      5: [
        { id: "fri-lunch", label: "Lunch", start: { h: 12, m: 0 }, end: { h: 15, m: 0 }, stepMins: 30 },
        { id: "fri-dinner", label: "Dinner", start: { h: 18, m: 0 }, end: { h: 23, m: 0 }, stepMins: 30 },
      ],
      6: [
        { id: "sat-brunch", label: "Brunch", start: { h: 11, m: 0 }, end: { h: 14, m: 0 }, stepMins: 30 },
        { id: "sat-dinner", label: "Dinner", start: { h: 17, m: 30 }, end: { h: 23, m: 0 }, stepMins: 30 },
      ],
    }),
    []
  );

  if (!offer) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        background:
          "radial-gradient(1200px 600px at 70% -10%, #fffaf4 0%, #f7f1e6 40%, #e9dec9 75%, #e5d6c2 100%)",
      }}
    >
      <div className="mx-auto max-w-sm pb-28">
        {/* Hero morph */}
        <div className="relative">
          <motion.div
            layoutId={`card-${venue.id}`}
            className="relative overflow-hidden"
            style={{ borderRadius: 24 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <img
              src={venue.image}
              alt={venue.name}
              className="h-64 w-full object-cover"
              style={{ borderRadius: 24 }}
            />
            <motion.div
              layoutId={`card-grad-${venue.id}`}
              className="absolute inset-0"
              style={{
                borderRadius: 24,
                background:
                  "linear-gradient(to top, rgba(0,0,0,.40), rgba(0,0,0,.10), rgba(0,0,0,0))",
              }}
            />
            <h1 className="absolute bottom-5 left-4 right-4 text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.5)]">
              {venue.name}
            </h1>
          </motion.div>

          {/* Back */}
          <button
            onClick={onClose}
            className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow ring-1 ring-white/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
