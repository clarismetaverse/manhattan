import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronRight, Gift, Sparkles, Ticket, X } from "lucide-react";
import { useMemo, useState } from "react";
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

const recommendedExperiences: ExperienceItem[] = [
  {
    id: "rec-tropical",
    title: "Tropical trip",
    subtitle: "Slow mornings, coastal visuals, poolside shoots.",
    tags: ["Relaxed", "Wellness"],
  },
  {
    id: "rec-urban",
    title: "Urban sightseeing",
    subtitle: "Golden-hour landmarks + street style moments.",
    tags: ["Cultural", "City"],
  },
  {
    id: "rec-dinner",
    title: "Dinner experience",
    subtitle: "Chef’s table, ambient lighting, cinematic plating.",
    tags: ["Gourmet", "Romantic"],
  },
];

const allExperiences: ExperienceItem[] = [
  { id: "all-tropical", title: "Tropical trip", tags: ["Relaxed"] },
  { id: "all-international", title: "International event", tags: ["VIP"] },
  { id: "all-urban", title: "Urban sightseeing", tags: ["Cultural"] },
  { id: "all-festival", title: "Festival", tags: ["Music"] },
  { id: "all-cannes", title: "Cannes", tags: ["Cinema"] },
  { id: "all-f1", title: "F1", tags: ["Thrill"] },
];

const budgetOptions = ["€", "€€", "€€€"];

export default function InviteExperienceSheet({ open, onClose, creator }: InviteExperienceSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState("");
  const [budget, setBudget] = useState<string | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);

  const creatorName = creator?.name || "Creator";
  const selectedExperience = useMemo(
    () =>
      [upcomingExperiences, recommendedExperiences, allExperiences]
        .flat()
        .find((item) => item.id === selectedId),
    [selectedId]
  );

  const canInvite = Boolean(selectedId) || proposalText.trim().length > 10;
  const canSubmitProposal = proposalText.trim().length > 10;

  const handleInvite = () => {
    const summary = selectedExperience
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
            className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            variants={sheet}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-b from-neutral-50 to-white px-5 pb-5 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {creator?.Profile_pic?.url ? (
                    <img
                      src={creator.Profile_pic.url}
                      alt={creatorName}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-neutral-200" />
                  )}
                  <div>
                    <p className="text-lg font-semibold text-neutral-900">Invite {creatorName}</p>
                    <p className="text-sm text-neutral-500">Choose an experience</p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 shadow-sm">
                      Pro Model
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-white/90 p-2 text-neutral-700 shadow-sm"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-8 px-5 pb-24">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Upcoming</p>
                  <p className="text-xs text-neutral-500">Community highlights this month</p>
                </div>
                <div className="space-y-4">
                  {upcomingExperiences.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`relative w-full overflow-hidden rounded-3xl bg-neutral-900 text-left text-white shadow-lg transition active:scale-[0.99] ${
                          isSelected ? "ring-2 ring-[#FF5A7A]/40" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="relative flex h-56 flex-col justify-end p-5">
                          {isSelected && (
                            <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-900">
                              Selected
                            </span>
                          )}
                          <p className="text-xl font-semibold">{item.title}</p>
                          {item.subtitle && <p className="text-xs text-white/70">{item.subtitle}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Best for you & her</p>
                </div>
                <div className="space-y-3">
                  {recommendedExperiences.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full rounded-3xl border bg-white p-5 text-left shadow-md transition active:scale-[0.99] ${
                          isSelected
                            ? "border-[#FF5A7A]/50 ring-2 ring-[#FF5A7A]/40"
                            : "border-neutral-200/80"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F4] text-[#FF5A7A]">
                            <Sparkles className="h-5 w-5" />
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                              {isSelected && (
                                <span className="rounded-full bg-[#FFF1F4] px-2 py-0.5 text-[10px] font-semibold text-[#FF5A7A]">
                                  Selected
                                </span>
                              )}
                            </div>
                            {item.subtitle && <p className="mt-1 text-xs text-neutral-500">{item.subtitle}</p>}
                            {item.tags && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => window.alert("Concierge request flow coming soon.")}
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-800 shadow-sm transition active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-neutral-700" />
                    Ask concierge for curation
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
              </section>

              <section className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Browse experiences</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {allExperiences.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`rounded-2xl border bg-white p-3 text-left text-sm font-semibold text-neutral-800 shadow-sm transition active:scale-[0.99] ${
                          isSelected
                            ? "border-[#FF5A7A]/50 ring-2 ring-[#FF5A7A]/40"
                            : "border-neutral-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span>{item.title}</span>
                          {isSelected && (
                            <span className="rounded-full bg-[#FFF1F4] px-2 py-0.5 text-[10px] font-semibold text-[#FF5A7A]">
                              Selected
                            </span>
                          )}
                        </div>
                        {item.tags && (
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
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => window.alert("Community browse coming soon.")}
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-800 shadow-md transition active:scale-[0.99]"
                >
                  Browse more activities from the community
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                </button>
              </section>

              <section className="space-y-4">
                <button
                  type="button"
                  onClick={() => setProposalOpen(true)}
                  className="flex w-full items-center justify-between rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-left shadow-sm transition active:scale-[0.99]"
                >
                  <span>
                    <p className="text-sm font-semibold text-neutral-900">Propose your own experience</p>
                    <p className="text-xs text-neutral-500">Share the moment you want to create together.</p>
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
              </section>

              <div className="sticky bottom-0 z-10 -mx-5 mt-6 border-t border-neutral-200 bg-white/95 px-5 pb-4 pt-4 backdrop-blur">
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
                      Invite
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full text-xs font-semibold text-neutral-500"
                >
                  Share profile
                </button>
              </div>
            </div>
          </motion.div>
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
                      canSubmitProposal
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-500"
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
