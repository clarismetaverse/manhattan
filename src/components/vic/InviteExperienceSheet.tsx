import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronRight, Gift, MoonStar, Ship, Sparkles, Ticket, Utensils, Waves, X } from "lucide-react";
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
  location: string;
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
  { id: "upcoming-cannes", title: "Cannes", subtitle: "Limited spots" },
  { id: "upcoming-f1", title: "F1", subtitle: "VIP access" },
  { id: "upcoming-festival", title: "Festival", subtitle: "Community favorite" },
];

const budgetOptions = ["€", "€€", "€€€"];

const tripsEndpoint = "https://xbut-eryu-hhsg.f2.xano.io/api:bwh6Xc5O/motherboard/trips";

const activityItems: ActivityItem[] = [
  {
    id: "private-dinner",
    title: "Private dinner",
    description: "Signature table placement, arrival coordination, and a curated tasting path for an intimate evening.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "yacht-day",
    title: "Yacht day",
    description: "Departures timed to golden hour, premium onboard service, and custom swim or lunch stopovers.",
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beach-club",
    title: "Beach club",
    description: "Front-row loungers, soundtrack and bottle planning, and smooth concierge-managed flow.",
    imageUrl: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "shopping-styling",
    title: "Shopping & styling",
    description: "Personalized store routing with stylist picks, fitting slots, and private appointment handling.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "photoshoot",
    title: "Photoshoot / content day",
    description: "Moodboard-aligned locations, shot planning, and timeline support from glam to golden hour.",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "night-out",
    title: "Night out / club",
    description: "A seamless after-dark route with priority entry, table booking, and trusted host support.",
    imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=900&q=80",
  },
];

const bookableItems: BookableItem[] = [
  {
    id: "book-restaurant-1",
    name: "Luma Rooftop",
    category: "Restaurant",
    location: "Cannes Croisette",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
    tags: ["Restaurant", "Sea view"],
  },
  {
    id: "book-beach-1",
    name: "Azure House",
    category: "Beach club",
    location: "Pampelonne Beach",
    imageUrl: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=700&q=80",
    tags: ["Beach club", "Sunset"],
  },
  {
    id: "book-yacht-1",
    name: "Velvet Horizon",
    category: "Yacht",
    location: "Port Pierre Canto",
    imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=700&q=80",
    tags: ["Yacht", "Full day"],
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

const activityIcons = {
  "private-dinner": Utensils,
  "yacht-day": Ship,
  "beach-club": Waves,
  "shopping-styling": Sparkles,
  photoshoot: Calendar,
  "night-out": MoonStar,
} as const;

export default function InviteExperienceSheet({ open, onClose, creator }: InviteExperienceSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState("");
  const [budget, setBudget] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [upcomingItems, setUpcomingItems] = useState<ExperienceItem[]>(upcomingExperiences);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [activityRequests, setActivityRequests] = useState<Record<string, string>>({});
  const [isStickyHeader, setIsStickyHeader] = useState(false);
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
          const subtitle = trip.Destination ? `${trip.Destination} • ${start} → ${end}` : `${start} → ${end}`;
          return {
            id: `trip-${trip.Name ?? "trip"}-${trip.Starting_Day ?? index}`,
            title,
            subtitle,
            imageUrl: trip.Tripcover?.url ?? undefined,
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

  const activeTrip = useMemo(
    () => upcomingItems.find((item) => item.id === activeTripId) ?? null,
    [activeTripId, upcomingItems]
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const handleScroll = () => {
      if (!activeTripId) {
        setIsStickyHeader(false);
        return;
      }
      setIsStickyHeader(node.scrollTop > 280);
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  }, [activeTripId]);

  const canSubmitProposal = proposalText.trim().length > 10;
  const canInvite = Boolean(selectedId) || canSubmitProposal;

  const handleInvite = () => {
    const selectedTrip = upcomingItems.find((item) => item.id === selectedId);
    const summary = selectedTrip
      ? `Selected trip: ${selectedTrip.title}`
      : `Proposal: ${proposalText.trim() || "No proposal"}`;
    window.alert(`Invite ${creatorName}\n${summary}`);
  };

  const handleSubmitProposal = () => {
    if (!canSubmitProposal) {
      return;
    }
    const summaryLines = [`Proposal: ${proposalText.trim()}`, budget ? `Budget: ${budget}` : "Budget: TBD"];
    window.alert(`Proposal submitted\n${summaryLines.join("\n")}`);
    setProposalOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center" initial="hidden" animate="visible" exit="exit">
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
              {activeTrip && isStickyHeader && (
                <motion.div
                  className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/85 px-4 py-3 backdrop-blur"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <p className="text-sm font-semibold text-neutral-900">{activeTrip.title}</p>
                  <button
                    type="button"
                    className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm"
                    onClick={() => setActiveTripId(null)}
                  >
                    Back to trips
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {activeTrip ? (
                <motion.div
                  key="event-view"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6 px-5 pb-24 pt-4"
                >
                  <section>
                    <motion.div
                      layoutId={`trip-card-${activeTrip.id}`}
                      className="relative h-[360px] w-full overflow-hidden rounded-3xl text-white"
                    >
                      {activeTrip.imageUrl ? (
                        <img src={activeTrip.imageUrl} alt={activeTrip.title} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <button
                        type="button"
                        className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-800"
                        onClick={() => setActiveTripId(null)}
                      >
                        Back to trips
                      </button>
                      <div className="absolute bottom-5 left-5 right-5">
                        <p className="text-3xl font-semibold">{activeTrip.title}</p>
                        {activeTrip.subtitle && <p className="mt-1 text-sm text-white/75">{activeTrip.subtitle}</p>}
                      </div>
                    </motion.div>
                  </section>

                  <section className="space-y-4 rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    <div>
                      <p className="text-xl font-semibold text-neutral-900">Plan activities for your trip with {creatorName}</p>
                      <p className="mt-1 text-sm text-neutral-500">Select your ideal moments and let concierge curate every detail.</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-neutral-900">Select your activities plan</p>
                      {activityItems.map((activity) => {
                        const isOpen = expandedActivityId === activity.id;
                        const Icon = activityIcons[activity.id as keyof typeof activityIcons] || Sparkles;
                        return (
                          <div key={activity.id} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                            <button
                              type="button"
                              onClick={() => setExpandedActivityId((prev) => (prev === activity.id ? null : activity.id))}
                              className="flex w-full items-center justify-between px-4 py-4 text-left"
                            >
                              <span className="inline-flex items-center gap-3 text-sm font-semibold text-neutral-900">
                                <span className="rounded-xl bg-neutral-100 p-2 text-neutral-600">
                                  <Icon className="h-4 w-4" />
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
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-3 border-t border-neutral-200 px-4 pb-4 pt-3">
                                    <img src={activity.imageUrl} alt={activity.title} className="h-28 w-full rounded-2xl object-cover" />
                                    <p className="text-xs text-neutral-600">{activity.description}</p>
                                    <textarea
                                      rows={3}
                                      value={activityRequests[activity.id] ?? ""}
                                      onChange={(event) =>
                                        setActivityRequests((prev) => ({ ...prev, [activity.id]: event.target.value }))
                                      }
                                      placeholder="Request concierge details..."
                                      className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 text-xs text-neutral-700 focus:border-[#FF5A7A]/60 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => window.alert("Request sent")}
                                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
                                    >
                                      Send request
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Concierge picks (bookable)</p>
                      <p className="text-xs text-neutral-500">Restaurants, beach clubs & yachts available for this trip.</p>
                    </div>
                    {bookableItems.map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
                      >
                        <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-neutral-900">{item.name}</p>
                          <p className="text-xs text-neutral-500">{item.location}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
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
                          onClick={() => window.alert("Booking flow coming soon.")}
                          className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
                        >
                          Book
                        </button>
                      </article>
                    ))}
                  </section>

                  <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5 shadow-sm">
                    <p className="text-base font-semibold text-neutral-900">Create your proposal</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Select activities and ask the concierge to curate the perfect plan.
                    </p>
                    <button
                      type="button"
                      onClick={() => setProposalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Build proposal
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6 px-5 pb-24 pt-6"
                >
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-neutral-900">Upcoming trips</p>
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
                              className="min-h-[280px] w-full animate-pulse rounded-3xl bg-neutral-200/80"
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
                                  setActiveTripId(item.id);
                                }}
                                className={`relative min-h-[280px] w-full overflow-hidden rounded-3xl text-left text-white shadow-lg transition active:scale-[0.99] ${
                                  isSelected ? "ring-2 ring-[#FF5A7A]/50" : ""
                                }`}
                              >
                                <motion.div layoutId={`trip-card-${item.id}`} className="absolute inset-0">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />
                                  ) : (
                                    <div className="absolute inset-0 bg-neutral-900" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </motion.div>
                                <div className="relative flex h-full flex-col justify-end p-6">
                                  <div className="space-y-1">
                                    <p className="text-2xl font-semibold text-white">{item.title}</p>
                                    {item.subtitle && <p className="text-sm text-white/75">{item.subtitle}</p>}
                                  </div>
                                  {isSelected && (
                                    <span className="mt-4 inline-flex w-fit rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                    </div>
                  </section>
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
                    {activeTrip ? "Create trip request" : "Invite"}
                  </span>
                </button>
              </div>
              <button
                type="button"
                className={`mt-3 w-full text-xs font-semibold ${canInvite ? "text-neutral-700" : "text-neutral-400"}`}
                disabled={!canInvite}
              >
                Share profile
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {proposalOpen && (
              <motion.div className="fixed inset-0 z-[70] flex items-center justify-center px-5" initial="hidden" animate="visible" exit="exit">
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
                      <p className="text-base font-semibold text-neutral-900">Build your proposal</p>
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
