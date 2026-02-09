import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Gift, Instagram, Lock, Music2, Share2, Star, Ticket, X } from "lucide-react";
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

type CreatorProfile = CreatorLite & { bio?: string };

type CreatorProfileSheetProps = {
  creator: CreatorProfile | null;
  open: boolean;
  locked?: boolean;
  variant?: "default" | "vic";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClose: () => void;
};

const roleBadges = (creator: CreatorLite | null) => {
  if (creator?.Tiktok_account) return ["Influencer"];
  if (creator?.IG_account) return ["Creator"];
  return ["Pro Model"];
};

export default function CreatorProfileSheet({
  creator,
  open,
  locked,
  variant = "default",
  isFavorite = false,
  onToggleFavorite,
  onClose,
}: CreatorProfileSheetProps) {
  const instagramUrl = buildSocialLink("instagram", creator?.IG_account);
  const tiktokUrl = buildSocialLink("tiktok", creator?.Tiktok_account);
  const hasTikTok = Boolean(creator?.Tiktok_account);
  const platformLabel = hasTikTok ? "TikTok creator" : "Instagram creator";
  const roles = roleBadges(creator);
  const isVic = variant === "vic";
  const handleToggleFavorite = onToggleFavorite ?? (() => {});
  const heroImage = creator?.Profile_pic?.url;
  const displayRole = roles[0] ?? "Creator";
  const bioText =
    creator?.bio ||
    "A premium profile curated for cinematic storytelling, exclusive experiences, and refined collaborations.";
  const interests = ["Travel", "Fine dining", "Art", "Wellness", "Music", "Fashion"];
  const galleryImages = Array.from({ length: 6 }, (_, index) => ({
    id: `gallery-${index}`,
    src: heroImage,
  }));
  const closeFriendsImages = Array.from({ length: 3 }, (_, index) => ({
    id: `close-friend-${index}`,
    src: heroImage,
  }));

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
            className={
              isVic
                ? "relative z-10 flex h-[100dvh] w-full flex-col bg-white shadow-2xl sm:max-w-md sm:rounded-t-3xl"
                : "relative z-10 w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-6 shadow-2xl"
            }
            variants={sheet}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            {isVic ? (
              <>
                <div className="relative h-[60vh] w-full shrink-0 overflow-hidden">
                  {heroImage ? (
                    <motion.img
                      src={heroImage}
                      alt={creator?.name || "Creator"}
                      className="h-full w-full object-cover"
                      initial={{ scale: 1.03 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ) : (
                    <motion.div
                      className="h-full w-full bg-gradient-to-br from-neutral-200 via-neutral-100 to-white"
                      initial={{ scale: 1.03 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      aria-pressed={isFavorite}
                      aria-label={isFavorite ? "Remove favourite" : "Add favourite"}
                      className="rounded-full bg-white/90 p-2 text-neutral-900 shadow-md transition hover:scale-105 active:scale-95"
                    >
                      <Star className={isFavorite ? "h-4 w-4 fill-neutral-900" : "h-4 w-4"} />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-white/90 p-2 text-neutral-900 shadow-md transition hover:scale-105 active:scale-95"
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-3xl font-semibold text-white">
                      {creator?.name || "Creator profile"}
                    </p>
                    <span className="mt-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                      {displayRole}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
                  <p className="text-sm leading-relaxed text-neutral-600">{bioText}</p>

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
                      onClick={() => window.alert("Gift coming soon")}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Gift className="h-4 w-4" />
                        Gift
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700"
                      onClick={() => window.alert("Invite coming soon")}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Invite
                      </span>
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-neutral-900">Interests</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-neutral-900">Gallery</h3>
                      <span className="text-xs text-neutral-400">6 shots</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {galleryImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative h-24 w-full overflow-hidden rounded-2xl bg-neutral-100"
                        >
                          {image.src ? (
                            <img src={image.src} alt="Creator gallery" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-50" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-neutral-900">Close Friends Gallery</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {closeFriendsImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative h-24 w-full overflow-hidden rounded-2xl bg-neutral-200"
                        >
                          {image.src ? (
                            <img
                              src={image.src}
                              alt="Close friends"
                              className="h-full w-full object-cover blur-sm"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-50" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white">
                              <Lock className="h-3 w-3" />
                              Close Friends
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-neutral-900">Socials</h3>
                    <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3 blur-[1px]">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Music2 className="h-4 w-4" />
                          TikTok
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-neutral-500">
                        <Lock className="h-3 w-3" />
                        Locked for Close Friends
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-6 w-full rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700"
                    onClick={() => window.alert("Saved to list")}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Save to list
                    </span>
                  </button>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-600"
                    onClick={() => window.alert("Share profile")}
                  >
                    <Share2 className="h-4 w-4" />
                    Share profile
                  </button>
                </div>
              </>
            ) : (
              <>
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
                    UGC-first creator focused on lifestyle campaigns, venue launches, and authentic short form videos.
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
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
