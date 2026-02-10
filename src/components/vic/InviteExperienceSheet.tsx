import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Gift,
  MoonStar,
  Ship,
  Sparkles,
  Ticket,
  Utensils,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CreatorLite } from "@/services/creatorSearch";

type InviteExperienceSheetProps = {
  open: boolean;
  onClose: () => void;
  creator: CreatorLite | null;
};

type ExperienceItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  tags?: string[];
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

type BookableItem = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  tags: string[];
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheet = {
  hidden: { y: "12%", opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: "12%", opacity: 0 },
};

const upcomingExperiences: ExperienceItem[] = [
  {
    id: "upcoming-cannes",
    title: "Cannes",
    subtitle: "Limited spots",
  },
  {
    id: "upcoming-f1",
    title: "F1",
    subtitle: "VIP access",
  },
  {
    id: "upcoming-festival",
    title: "Festival",
    subtitle: "Community favorite",
  },
];

const budgetOptions = ["€", "€€", "€€€"];

const tripsEndpoint = "https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/motherboard/trips";

const activityItems: ActivityItem[] = [
  {
    id: "dinner",
    title: "Dinner reservation",
    description: "Secure a cinematic table with curated tasting and seamless arrivals.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beach-club",
    title: "Beach club",
    description: "Private beds, soundtrack curation, and concierge-managed beach moments.",
    imageUrl: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "yacht",
    title: "Yacht day",
    description: "Golden hour routes, champagne service, and custom stopovers.",
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "nightlife",
    title: "VIP nightlife",
    description: "After-dark itinerary with bottle service and expedited entry.",
    imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "wellness",
    title: "Wellness / spa",
    description: "Recovery sessions, private suites, and personalized rituals.",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "photoshoot",
    title: "Photoshoot / content day",
    description: "Direction, look planning, and locations aligned with your event mood.",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
];

const bookableItems: BookableItem[] = [
  {
    id: "book-restaurant-1",
    name: "Luma Rooftop",
    category: "Restaurant",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
    tags: ["VIP", "Sea view", "Late night"],
  },
  {
    id: "book-beach-1",
    name: "Azure House",
    category: "Beach Club",
    imageUrl: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=700&q=80",
    tags: ["Front row", "Sunset", "Bottle service"],
  },
  {
    id: "book-yacht-1",
    name: "Velvet Horizon",
    category: "Yacht",
    imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=700&q=80",
    tags: ["Captain included", "Full day", "Premium deck"],
  },
];

const formatTripDate = (value?: string) => {
  if (!value) {
    return "TBD";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "TBD";
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function InviteExperienceSheet({ open, onClose, creator }: InviteExperienceSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ExperienceItem | null>(null);
  const [proposalText, setProposalText] = useState("");
  const [budget, setBudget] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [upcomingItems, setUpcomingItems] = useState<ExperienceItem[]>(upcomingExperiences);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [tripType, setTripType] = useState<"single" | "girls">("single");
  const [tripMode, setTripMode] = useState<"1:1" | "Group trip">("1:1");
  const [flightAreas, setFlightAreas] = useState<string[]>([]);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [activityRequest, setActivityRequest] = useState("");
  const [isStickyHeader, setIsStickyHeader] = useState(false);
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [bookingDate, setBookingDate] = useState("Tonight");
  const [bookingConcierge, setBookingConcierge] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const creatorName = creator?.name || "Creator";

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      setUpcomingLoading(true);
      try {
        const response = await fetch(tripsEndpoint);
        if (!response.ok) {
          throw new Error("Failed to load trips");
        }
        const trips = (await response.json()) as Array<{
          Name?: string;
          Destination?: string;
          Starting_Day?: string;
          Return?: string;
          Tripcover?: { url?: string | null } | null;
        }>;
        const mapped = trips.map((trip, index) => {
          const title = trip.Name ?? "Upcoming trip";
          const start = formatTripDate(trip.Starting_Day);
          const end = formatTripDate(trip.Return);
          const subtitle = trip.Destination
            ? `${trip.Destination} • ${start} → ${end}`
            : `${start} → ${end}`;
          return {
            id: `trip-${trip.Name ?? "trip"}-${trip.Starting_Day ?? index}`,
            title,
            subtitle,
            imageUrl: trip.Tripcover?.url ?? undefined,
            tags: trip.Destination ? ["Trip", trip.Destination] : ["Trip"],
          } satisfies ExperienceItem;
        });
        if (isMounted) {
          setUpcomingItems(mapped.length ? mapped : upcomingExperiences);
        }
      } catch (_error) {
        if (isMounted) {
          setUpcomingItems(upcomingExperiences);
        }
      } finally {
        if (isMounted) {
          setUpcomingLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const handleScroll = () => {
      if (!selectedTrip) {
        setIsStickyHeader(false);
        return;
      }
      setIsStickyHeader(node.scrollTop > 260);
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  }, [selectedTrip]);

  const canSubmitProposal = proposalText.trim().length > 10;
  const canInvite = Boolean(selectedTrip) || proposalText.trim().length > 10;

  const selectedExperience = useMemo(
    () => upcomingItems.find((item) => item.id === selectedId) ?? null,
    [selectedId, upcomingItems]
  );

  const handleInvite = () => {
    const summary = selectedTrip
      ? `Selected event: ${selectedTrip.title}`
      : selectedExperience
        ? `Selected experience: ${selectedExperience.title}`
        : `Proposal: ${proposalText.trim()}`;
    window.alert(`Invite ${creatorName}\n${summary}`);
  };

  const handleSubmitProposal = () => {
    if (!canSubmitProposal) {
      return;
    }
    const summaryLines = [
      `Proposal: ${proposalText.trim()}`,
      budget ? `Budget: ${budget}` : "Budget: TBD",
    ];
    window.alert(`Proposal submitted\n${summaryLines.join("\n")}`);
    setProposalOpen(false);
  };

  const handleFlightAreaToggle = (area: string) => {
    setFlightAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close invite experience"
          />
          <motion.div
            ref={scrollRef}
            className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto overscroll-y-contain rounded-t-[28px] bg-white shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            variants={sheet}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <AnimatePresence>
              {selectedTrip && isStickyHeader && (
                <motion.div
                  className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3">
                    {creator?.Profile_pic?.url ? (
                      <img
                        src={creator.Profile_pic.url}
                        alt={creatorName}
                        className="h-8 w-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-neutral-200" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{creatorName}</p>
                      <p className="text-xs text-neutral-500">{selectedTrip.title}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-white/90 p-2 text-neutral-700 shadow-sm"
                    onClick={() => setSelectedTrip(null)}
                    aria-label="Close event view"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedTrip ? (
                <motion.div
                  key="event-view"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="px-5 pb-24"
                >
                  <section className="relative -mx-5 mb-6 overflow-hidden text-white">
                    <motion.div layoutId={`trip-cover-${selectedTrip.id}`} className="relative h-[330px] w-full">
                      {selectedTrip.imageUrl ? (
                        <img
                          src={selectedTrip.imageUrl}
                          alt={selectedTrip.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/60" />
                    </motion.div>
                    <button
                      type="button"
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-neutral-800 shadow-md"
                      onClick={() => setSelectedTrip(null)}
                      aria-label="Back to event list"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-3xl font-semibold">{selectedTrip.title}</p>
                      {selectedTrip.subtitle && <p className="mt-1 text-xs text-white/80">{selectedTrip.subtitle}</p>}
                    </div>
                  </section>

                  <section className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                    <div>
                      <p className="text-lg font-semibold text-neutral-900">
                        Plan activities for your trip with {creatorName}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Build the experience together. Ask concierge to curate details.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Mode</p>
                      <div className="inline-flex rounded-full bg-neutral-100 p-1">
                        {(["1:1", "Group trip"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setTripMode(mode)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              tripMode === mode ? "bg-neutral-900 text-white" : "text-neutral-600"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Dates</p>
                      <p className="text-sm font-semibold text-neutral-800">{selectedTrip.subtitle || "Start → Return"}</p>
                      <button
                        type="button"
                        onClick={() => window.alert("Date adjustment flow coming soon.")}
                        className="flex items-center gap-2 text-xs font-semibold text-[#FF5A7A]"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Adjust dates
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Flights covered from</p>
                      <div className="flex flex-wrap gap-2">
                        {["EU", "UK", "US", "ME"].map((area) => {
                          const active = flightAreas.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => handleFlightAreaToggle(area)}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                active
                                  ? "border-[#FF5A7A]/60 bg-[#FFF1F4] text-[#FF5A7A]"
                                  : "border-neutral-200 text-neutral-600"
                              }`}
                            >
                              {area}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section className="mt-6 space-y-3 rounded-3xl bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
                    {activityItems.map((activity) => {
                      const isOpen = expandedActivityId === activity.id;
                      return (
                        <div key={activity.id} className="rounded-2xl border border-neutral-200/90 bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedActivityId(isOpen ? null : activity.id);
                              setSelectedId(activity.id);
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                          >
                            <span className="flex items-center gap-3 text-sm font-semibold text-neutral-900">
                              <span className="rounded-xl bg-[#FFF1F4] p-2 text-[#FF5A7A]">
                                {activity.id === "dinner" && <Utensils className="h-4 w-4" />}
                                {activity.id === "beach-club" && <Waves className="h-4 w-4" />}
                                {activity.id === "yacht" && <Ship className="h-4 w-4" />}
                                {activity.id === "nightlife" && <MoonStar className="h-4 w-4" />}
                                {activity.id !== "dinner" && activity.id !== "beach-club" && activity.id !== "yacht" && activity.id !== "nightlife" && <Sparkles className="h-4 w-4" />}
                              </span>
                              {activity.title}
                            </span>
                            <ChevronRight className={`h-4 w-4 text-neutral-500 transition ${isOpen ? "rotate-90" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-3 border-t border-neutral-200 px-4 pb-4 pt-3">
                                  <img
                                    src={activity.imageUrl}
                                    alt={activity.title}
                                    className="h-28 w-full rounded-2xl object-cover"
                                  />
                                  <p className="text-xs text-neutral-600">{activity.description}</p>
                                  <textarea
                                    rows={3}
                                    value={activityRequest}
                                    onChange={(event) => setActivityRequest(event.target.value)}
                                    placeholder="Request concierge details..."
                                    className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 focus:border-[#FF5A7A]/60 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      window.alert(`Request sent for ${activity.title}\n${activityRequest || "No extra details."}`)
                                    }
                                    className="w-full rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
                                  >
                                    Send request to concierge
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </section>

                  <section className="mt-6 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Bookable for this event</p>
                      <p className="text-xs text-neutral-500">Dorsia-style reservations, curated for this trip.</p>
                    </div>
                    {bookableItems.map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm"
                      >
                        <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.category}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingItem(item)}
                          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
                        >
                          Book
                        </button>
                      </article>
                    ))}
                  </section>

                  <button
                    type="button"
                    onClick={() => setProposalOpen(true)}
                    className="mt-6 flex w-full items-center justify-between rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-left shadow-sm"
                  >
                    <span>
                      <p className="text-sm font-semibold text-neutral-900">Propose custom plan</p>
                      <p className="text-xs text-neutral-500">Share the moment you want to create together.</p>
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-8 px-5 pb-24 pt-6"
                >
                  <section className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">Invite {creatorName}</p>
                        <p className="text-xs text-neutral-500">Choose an upcoming event</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-neutral-100 p-2 text-neutral-700"
                        onClick={onClose}
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {upcomingLoading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={`upcoming-skeleton-${index}`}
                              className="h-60 w-full animate-pulse rounded-3xl bg-neutral-200/80"
                            />
                          ))
                        : upcomingItems.map((item) => {
                            const isSelected = selectedId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedId(item.id);
                                  setSelectedTrip(item);
                                }}
                                className={`relative w-full overflow-hidden rounded-3xl bg-neutral-900 text-left text-white shadow-lg transition active:scale-[0.99] ${
                                  isSelected ? "ring-2 ring-[#FF5A7A]/40" : ""
                                }`}
                              >
                                <motion.div layoutId={`trip-cover-${item.id}`} className="absolute inset-0">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-neutral-900" />
                                  )}
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/60 via-neutral-900/30 to-black/70" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                <div className="relative flex h-60 flex-col justify-end p-5">
                                  <p className="text-xl font-semibold">{item.title}</p>
                                  {item.subtitle && <p className="text-xs text-white/70">{item.subtitle}</p>}
                                </div>
                              </button>
                            );
                          })}
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => setProposalOpen(true)}
                    className="flex w-full items-center justify-between rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-left shadow-sm"
                  >
                    <span>
                      <p className="text-sm font-semibold text-neutral-900">Propose your own experience</p>
                      <p className="text-xs text-neutral-500">Share the moment you want to create together.</p>
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="sticky bottom-0 z-20 -mx-0 mt-2 border-t border-neutral-200 bg-white/95 px-5 pb-4 pt-4 backdrop-blur">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Gift className="h-4 w-4" />
                    Gift
                  </span>
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white transition ${
                    canInvite ? "bg-neutral-900" : "bg-neutral-300"
                  }`}
                  disabled={!canInvite}
                  onClick={handleInvite}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Ticket className="h-4 w-4" />
                    {selectedTrip ? "Create trip request" : "Invite"}
                  </span>
                </button>
              </div>
              <button type="button" className="mt-3 w-full text-xs font-semibold text-neutral-500">
                Share profile
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {bookingItem && (
              <motion.div
                className="fixed inset-0 z-[80] flex items-center justify-center px-5"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  variants={backdrop}
                  onClick={() => setBookingItem(null)}
                  aria-label="Close booking modal"
                />
                <motion.div
                  variants={sheet}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-neutral-900">Book {bookingItem.name}</p>
                      <p className="text-xs text-neutral-500">{bookingItem.category}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-neutral-100 p-2 text-neutral-600"
                      onClick={() => setBookingItem(null)}
                      aria-label="Close booking modal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-neutral-200 p-3">
                      <p className="text-xs font-semibold text-neutral-500">Date</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["Tonight", "Tomorrow", "This weekend"].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setBookingDate(value)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              bookingDate === value
                                ? "border-[#FF5A7A]/60 bg-[#FFF1F4] text-[#FF5A7A]"
                                : "border-neutral-200 text-neutral-600"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 p-3">
                      <p className="text-xs font-semibold text-neutral-500">Party size</p>
                      <div className="mt-2 inline-flex rounded-full bg-neutral-100 p-1">
                        {[
                          { id: "single", label: "Single dating" },
                          { id: "girls", label: "Multiple girls trip" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setTripType(option.id as "single" | "girls")}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              tripType === option.id ? "bg-neutral-900 text-white" : "text-neutral-600"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingConcierge((prev) => !prev)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
                        bookingConcierge
                          ? "border-[#FF5A7A]/50 bg-[#FFF1F4] text-[#FF5A7A]"
                          : "border-neutral-200 text-neutral-600"
                      }`}
                    >
                      Concierge options
                      <span className="text-xs font-semibold">{bookingConcierge ? "On" : "Off"}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.alert(
                        `Booking sent for ${bookingItem.name}\nDate: ${bookingDate}\nParty: ${tripType}\nConcierge: ${bookingConcierge ? "Yes" : "No"}`
                      );
                      setBookingItem(null);
                    }}
                    className="mt-4 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Submit booking
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {proposalOpen && (
              <motion.div
                className="fixed inset-0 z-[70] flex items-center justify-center px-5"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  variants={backdrop}
                  onClick={() => setProposalOpen(false)}
                  aria-label="Close proposal modal"
                />
                <motion.div
                  variants={sheet}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-neutral-900">Propose your own experience</p>
                      <p className="text-xs text-neutral-500">Share the moment you want to create together.</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-neutral-100 p-2 text-neutral-600"
                      onClick={() => setProposalOpen(false)}
                      aria-label="Close proposal modal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={proposalText}
                    onChange={(event) => setProposalText(event.target.value)}
                    placeholder="Describe your idea…"
                    className="mt-4 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-[#FF5A7A]/60 focus:outline-none"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {budgetOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setBudget(option)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          budget === option
                            ? "border-[#FF5A7A]/50 bg-[#FFF1F4] text-[#FF5A7A]"
                            : "border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      Add optional date
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                  </button>
                  <button
                    type="button"
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      canSubmitProposal ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                    disabled={!canSubmitProposal}
                    onClick={handleSubmitProposal}
                  >
                    Submit proposal
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
