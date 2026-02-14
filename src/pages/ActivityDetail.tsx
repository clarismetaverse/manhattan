import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Search, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTrips, type InviteLite, type InviteStatus, type TripActivity } from "@/services/activities";

const easeOut = { duration: 0.3, ease: "easeOut" as const };

type EditableActivityFields = Pick<TripActivity, "title" | "dateLabel" | "locationLabel" | "notes">;

const sectionOrder: Array<{ key: InviteStatus; label: string; collapsedByDefault?: boolean }> = [
  { key: "accepted", label: "Accepted models" },
  { key: "invited", label: "Invited models" },
  { key: "rejected", label: "Rejected models", collapsedByDefault: true },
];

function SectionPreview({ people }: { people: InviteLite[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {people.slice(0, 6).map((invite) => (
        <img
          key={invite.id}
          src={invite.creator.avatarUrl}
          alt={invite.creator.name}
          className="h-8 w-8 rounded-full border border-white object-cover"
        />
      ))}
    </div>
  );
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const { activityId } = useParams();

  const [activity, setActivity] = useState<TripActivity | null>(null);
  const [editing, setEditing] = useState(false);
  const [viewingStatus, setViewingStatus] = useState<InviteStatus | null>(null);
  const [search, setSearch] = useState("");
  const [showRejected, setShowRejected] = useState(false);
  const [editForm, setEditForm] = useState<EditableActivityFields>({
    title: "",
    dateLabel: "",
    locationLabel: "",
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      const trips = await fetchTrips();
      const selected = trips.find((trip) => trip.id === activityId) ?? null;
      setActivity(selected);
      if (selected) {
        setEditForm({
          title: selected.title,
          dateLabel: selected.dateLabel,
          locationLabel: selected.locationLabel,
          notes: selected.notes,
        });
      }
    };

    void load();
  }, [activityId]);

  const groupedInvites = useMemo(() => {
    if (!activity) return { accepted: [], invited: [], rejected: [] } as Record<InviteStatus, InviteLite[]>;

    return {
      accepted: activity.invites.filter((invite) => invite.status === "accepted"),
      invited: activity.invites.filter((invite) => invite.status === "invited"),
      rejected: activity.invites.filter((invite) => invite.status === "rejected"),
    };
  }, [activity]);

  const activeList = viewingStatus ? groupedInvites[viewingStatus] : [];
  const filteredList = activeList.filter((invite) => {
    const q = search.toLowerCase();
    return invite.creator.name.toLowerCase().includes(q) || invite.creator.ig.toLowerCase().includes(q);
  });

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-6 text-sm text-neutral-500">Activity not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F] pb-12">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-[#FAFAFA]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">{activity.title}</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-5 px-4 pt-5">
        <motion.section initial={{ opacity: 0, y: 8, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={easeOut} className="overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_14px_38px_rgba(0,0,0,0.14)]">
          <img src={activity.coverUrl} alt={activity.title} className="h-52 w-full object-cover" />
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ ...easeOut, delay: 0.05 }} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Details</h2>
            <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700">Edit</button>
          </div>
          <div className="space-y-2 text-sm text-neutral-700">
            <p><span className="font-medium text-neutral-900">Name:</span> {activity.title}</p>
            <p><span className="font-medium text-neutral-900">Date / time:</span> {activity.dateLabel}</p>
            <p><span className="font-medium text-neutral-900">City / venue:</span> {activity.locationLabel}</p>
            <p><span className="font-medium text-neutral-900">Notes:</span> {activity.notes}</p>
          </div>
        </motion.section>

        <section className="space-y-3">
          {sectionOrder.map((section) => {
            const items = groupedInvites[section.key];
            const collapsed = section.collapsedByDefault && !showRejected;
            return (
              <motion.article
                key={section.key}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...easeOut, delay: 0.08 }}
                className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{section.label}</h3>
                    <p className="text-xs text-neutral-500">{items.length} total</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.key === "rejected" && (
                      <button type="button" onClick={() => setShowRejected((prev) => !prev)} className="text-xs font-medium text-neutral-500">
                        {collapsed ? "Expand" : "Collapse"}
                      </button>
                    )}
                    <button type="button" onClick={() => { setViewingStatus(section.key); setSearch(""); }} className="text-xs font-semibold text-neutral-700">
                      View all
                    </button>
                  </div>
                </div>
                {!collapsed && <div className="mt-3"><SectionPreview people={items} /></div>}
              </motion.article>
            );
          })}
        </section>
      </main>

      <AnimatePresence>
        {editing && (
          <>
            <motion.button type="button" onClick={() => setEditing(false)} className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.section initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 16, filter: "blur(8px)" }} transition={easeOut} className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md rounded-t-3xl border border-neutral-200 bg-white px-4 pb-6 pt-4">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
              <h3 className="text-base font-semibold text-neutral-900">Edit details</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["title", "Name"],
                  ["dateLabel", "Date / time"],
                  ["locationLabel", "City / venue"],
                ].map(([field, label]) => (
                  <label className="block" key={field}>
                    <span className="mb-1 block text-xs font-medium text-neutral-600">{label}</span>
                    <input
                      value={editForm[field as keyof EditableActivityFields]}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, [field]: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-600">Notes</span>
                  <textarea
                    value={editForm.notes}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivity((prev) => (prev ? { ...prev, ...editForm } : prev));
                  setEditing(false);
                }}
                className="mt-4 w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Save
              </button>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingStatus && (
          <>
            <motion.button type="button" onClick={() => setViewingStatus(null)} className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.section initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(8px)" }} transition={easeOut} className="fixed inset-6 z-40 mx-auto flex max-w-md flex-col rounded-3xl border border-neutral-200 bg-white p-4 shadow-[0_20px_44px_rgba(0,0,0,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">{viewingStatus[0].toUpperCase() + viewingStatus.slice(1)} models</h3>
                <button type="button" onClick={() => setViewingStatus(null)} className="rounded-full border border-neutral-200 p-1.5 text-neutral-600"><X className="h-4 w-4" /></button>
              </div>
              <label className="mb-3 flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or IG" className="w-full text-sm focus:outline-none" />
              </label>
              <div className="space-y-2 overflow-y-auto pr-1">
                {filteredList.map((invite) => (
                  <div key={invite.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-2.5">
                    <img src={invite.creator.avatarUrl} alt={invite.creator.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{invite.creator.name}</p>
                      <p className="text-xs text-neutral-500">{invite.creator.ig}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      invite.status === "accepted"
                        ? "bg-emerald-50 text-emerald-700"
                        : invite.status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {invite.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
