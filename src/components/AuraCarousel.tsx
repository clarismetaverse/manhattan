import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface AuraCarouselProps {
  pics: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}

export const AuraCarousel: React.FC<AuraCarouselProps> = ({
  pics,
  index,
  setIndex,
  onClose,
}) => {
  const total = pics.length;

  if (!total) return null;

  const next = () => {
    if (total <= 1) return;
    setIndex((index + 1) % total);
  };

  const prev = () => {
    if (total <= 1) return;
    setIndex((index - 1 + total) % total);
  };

  const activeSrc = pics[index] ?? pics[0];

  return (
    <AnimatePresence>
      <motion.div
        key="aura-carousel"
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-label="Profile photo carousel"
      >
        <motion.img
          key={activeSrc}
          src={activeSrc}
          alt={`Profile image ${index + 1} of ${total}`}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.03, opacity: 0 }}
          transition={{ duration: 0.35 }}
        />

        {/* gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-white/90 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          aria-label="Close carousel"
        >
          <X size={28} />
        </button>

        {/* tap zones */}
        <button
          type="button"
          onClick={prev}
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer bg-transparent focus-visible:outline-none"
          aria-label="Show previous photo"
          disabled={total <= 1}
        >
          <span className="sr-only">Show previous photo</span>
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer bg-transparent focus-visible:outline-none"
          aria-label="Show next photo"
          disabled={total <= 1}
        >
          <span className="sr-only">Show next photo</span>
        </button>

        {/* progress lines */}
        <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center gap-1 px-10">
          {pics.map((pic, i) => {
            const isActive = i === index;
            const isPast = i < index;
            return (
              <div key={`${pic}-${i}`} className="flex-1 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-[3px] rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                  initial={{ scaleX: isPast ? 1 : 0 }}
                  animate={{ scaleX: isPast || isActive ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ originX: 0 }}
                />
              </div>
            );
          })}
        </div>

        {/*
          Optional enhancements:
          - Auto-play timer to advance slides. Hook into useEffect with setTimeout.
          - Caption support displayed near the bottom of the screen.
        */}
      </motion.div>
    </AnimatePresence>
  );
};

