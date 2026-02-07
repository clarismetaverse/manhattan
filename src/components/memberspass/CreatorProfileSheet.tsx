import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Lock, Music2, X } from "lucide-react";
import type { CreatorLite } from "@/services/creatorSearch";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheet = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

function buildSocialLink(platform: "instagram" | "tiktok", handle?: string) {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  const clean = handle.replace("@", "");
  if (platform === "instagram") {
    return `https://instagram.com/${clean}`;
  }
  return `https://tiktok.com/@${clean}`;
}

type CreatorProfileSheetProps = {
  creator: CreatorLite | null;
  open: boolean;
  locked?: boolean;
  onClose: () => void;
};

export default function CreatorProfileSheet({
  creator,
  open,
  locked,
  onClose,
}: CreatorProfileSheetProps) {
  const instagramUrl = buildSocialLink("instagram", creator?.IG_account);
  const tiktokUrl = buildSocialLink("tiktok", creator?.Tiktok_account);
  const hasTikTok = Boolean(creator?.Tiktok_account);
  const platformLabel = hasTikTok ? "TikTok creator" : "Instagram creator";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40"
            variants={backdrop}
            onClick={onClose}
            aria-label="Close creator profile"
          />
          <motion.div
            className="relative z-10 w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl"
            variants={sheet}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Creator profile</p>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {creator?.name || "Creator profile"}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-neutral-200 p-2 text-neutral-500 hover:text-neutral-800"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
              {creator?.Profile_pic?.url ? (
                <img
                  src={creator.Profile_pic.url}
                  alt={creator?.name || "Creator"}
                  className="h-20 w-20 rounded-3xl object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-50" />
              )}
              <div>
                <p className="text-base font-semibold text-neutral-900">
                  {creator?.name || "Unnamed creator"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                  <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium">UGC-ready</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium">UGC first</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F4] px-2 py-1 font-medium text-[#FF5A7A]">
                    {hasTikTok ? <Music2 className="h-3 w-3" /> : <Instagram className="h-3 w-3" />}
                    {platformLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-900">About / highlights</h3>
              <p className="mt-2 text-sm text-neutral-500">
                UGC-first creator focused on lifestyle campaigns, venue launches, and authentic short
                form videos.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {instagramUrl && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => window.open(instagramUrl, "_blank")}
                >
                  <Instagram className="h-4 w-4" />
                  Open Instagram
                </button>
              )}
              {tiktokUrl && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => window.open(tiktokUrl, "_blank")}
                >
                  <Music2 className="h-4 w-4" />
                  Open TikTok
                </button>
              )}
            </div>

            {locked && (
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  <Lock className="h-3 w-3" />
                  Premium list
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  This creator is in the premium list. Unlock to access full details and invites.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Unlock
                </button>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                onClick={() => console.log("Invite creator", creator)}
              >
                Invite
              </button>
              <button
                type="button"
                className="flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700"
                onClick={() => console.log("Request collaboration", creator)}
              >
                Request collaboration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
