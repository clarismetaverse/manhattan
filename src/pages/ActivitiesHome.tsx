import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type ActivityTemplate = {
  title: string;
  caption: string;
  city: string;
  tags: string[];
};

type ActivityFormState = {
  name: string;
  city: string;
  dateRange: string;
  tags: string[];
};

const availableTags = ["Fashion", "Nightlife", "Yachting", "Wellness", "Luxury", "Editorial"];

const templateCards: ActivityTemplate[] = [
  { title: "Cannes", caption: "Pre-filled details", city: "Cannes", tags: ["Fashion", "Luxury"] },
  {
    title: "Ibiza Opening",
    caption: "Pre-filled details",
    city: "Ibiza",
    tags: ["Nightlife", "Yachting"],
  },
  {
    title: "Paris Fashion Week",
    caption: "Pre-filled details",
    city: "Paris",
    tags: ["Fashion", "Editorial"],
  },
  {
    title: "Milan Design Week",
    caption: "Pre-filled details",
    city: "Milan",
    tags: ["Luxury", "Editorial"],
  },
];

const suggestedActivities: ActivityTemplate[] = [
  {
    title: "Sunset Terrace Showcase",
    caption: "Invite lifestyle creators for sunset content",
    city: "Cannes",
    tags: ["Luxury", "Nightlife"],
  },
  {
    title: "Runway Backstage Access",
    caption: "Models + creators with editorial vibes",
    city: "Paris",
    tags: ["Fashion", "Editorial"],
  },
  {
    title: "Design District Studio Tour",
    caption: "Short-format storytelling + event coverage",
    city: "Milan",
    tags: ["Wellness", "Luxury"],
  },
];

const sheetAnim = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 12, filter: "blur(4px)" },
  transition: { duration: 0.24, ease: "easeOut" },
};

export default function ActivitiesHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<ActivityFormState>({
    name: "",
    city: "",
    dateRange: "",
    tags: [],
  });

  const canContinue = useMemo(() => form.name.trim().length > 0 && form.city.trim().length > 0, [form]);
  const inviteRoute = useMemo(
    () =>
      location.pathname.startsWith("/memberspass/vic/activities")
        ? "/memberspass/vic/activities/invite"
        : "/activities/invite",
    [location.pathname]
  );

  const openWithTemplate = (template: ActivityTemplate | null) => {
    if (template) {
      setForm({
        name: template.title,
        city: template.city,
        dateRange: "",
        tags: template.tags,
      });
    } else {
      setForm({
        name: "",
        city: "",
        dateRange: "",
        tags: [],
      });
    }
    setSheetOpen(true);
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">Activities</h1>
          <div className="h-8 w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md space-y-6 px-4 pb-16 pt-6">
        <motion.section
          {...sheetAnim}
          className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        >
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Create an activity</h2>
            <p className="mt-2 text-sm text-neutral-500">Start inviting models in minutes</p>
          </div>
          <button
            type="button"
            onClick={() => openWithTemplate(null)}
            className="w-full rounded-full bg-gradient-to-r from-[#1F1F24] to-[#2F2F36] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition hover:opacity-95"
          >
            New activity
          </button>
          <p className="text-xs text-neutral-500">Choose a template or create your own</p>
        </motion.section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-neutral-900">Event templates</h2>
            <span className="text-xs text-neutral-400">Swipe</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {templateCards.map((template) => (
              <button
                key={template.title}
                type="button"
                onClick={() => openWithTemplate(template)}
                className="w-[72%] shrink-0 snap-start rounded-3xl border border-neutral-200 bg-white p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              >
                <p className="text-base font-semibold text-neutral-900">{template.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{template.caption}</p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => openWithTemplate(null)}
              className="w-[72%] shrink-0 snap-start rounded-3xl border border-dashed border-neutral-300 bg-white p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                <Plus className="h-4 w-4 text-neutral-700" />
              </div>
              <p className="text-base font-semibold text-neutral-900">Create custom</p>
              <p className="mt-1 text-xs text-neutral-500">Art Basel…</p>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="px-1">
            <h2 className="text-base font-semibold text-neutral-900">Suggested activities</h2>
            <p className="mt-1 text-xs text-neutral-500">Quick starts curated from popular events</p>
          </div>
          <div className="space-y-3">
            {suggestedActivities.map((activity) => (
              <article
                key={activity.title}
                className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{activity.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">{activity.caption}</p>
                    <p className="mt-2 text-xs text-neutral-500">{activity.city}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openWithTemplate(activity)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700"
                  >
                    Use this
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-30 bg-black/35"
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close create activity"
            />
            <motion.div
              {...sheetAnim}
              className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border border-neutral-200 bg-white px-4 pb-6 pt-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
              <h3 className="text-base font-semibold text-neutral-900">Create activity</h3>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Activity name"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">City / Location</span>
                  <input
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="City or venue"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Date range (optional)</span>
                  <input
                    value={form.dateRange}
                    onChange={(event) => setForm((prev) => ({ ...prev, dateRange: event.target.value }))}
                    placeholder="May 10 - May 13"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                </label>

                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-600">Vibe tags</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const selected = form.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            selected
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-200 bg-white text-neutral-600"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={() =>
                  navigate(inviteRoute, {
                    state: {
                      activityName: form.name.trim(),
                      city: form.city.trim(),
                      dateRange: form.dateRange.trim(),
                      tags: form.tags,
                    },
                  })
                }
                className="mt-5 w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
