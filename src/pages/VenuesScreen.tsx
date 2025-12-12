
<div className="relative">
  <motion.img
    key={activeImage}
    src={activeImage}
    alt={venue.name}
    className="h-[280px] w-full object-cover rounded-b-[28px]"
    initial={{ opacity: 0.4, scale: 1.02 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
  />

  {/* Back */}
  <button
    onClick={onClose}
    className="absolute left-4 top-4 h-9 w-9 rounded-full bg-white/80 backdrop-blur shadow ring-1 ring-white/70"
  >
    ←
  </button>
</div>

{/* NOTCH: thumbnails + title (title moved UNDER thumbnails) */}
<div className="relative -mt-10 px-4">
  <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4">

    {/* Thumbnails strip */}
    <div className="flex gap-2 overflow-x-auto pb-1">
      {(venue.gallery || []).map((img, i) => {
        const isActive = img === activeImage;
        return (
          <button
            key={i}
            onClick={() => setActiveImage(img)}
            className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl transition
              ${isActive ? "ring-2 ring-[#FF5A7A]" : "opacity-85 hover:opacity-100"}
            `}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        );
      })}
    </div>

    {/* Title UNDER thumbnails */}
    <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-stone-900">
      {venue.name}
    </h1>
  </div>
</div>

{/* ABOUT CARD */}
<motion.section
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  className="mx-4 mt-4 rounded-2xl bg-white/65 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_8px_24px_rgba(0,0,0,.08)] p-4"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-sm text-stone-700">
      <MapPin className="h-4 w-4" />
      {venue.city}
    </div>

    <button className="inline-flex items-center gap-2 text-sm text-stone-700">
      <Instagram className="h-4 w-4" /> Visit
    </button>
  </div>

  <div className="mt-3">
    <div className="flex items-center justify-between">
      <h3 className="text-stone-900 font-semibold">About</h3>
      <button
        onClick={() => setBriefOpen((v) => !v)}
        className="text-sm text-stone-600 underline"
      >
        {briefOpen ? "Hide brief" : "Creator brief"}
      </button>
    </div>

    <p className="mt-1 text-[13px] leading-6 text-stone-700">{venue.brief}</p>

    <AnimatePresence initial={false}>
      {briefOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 rounded-xl bg-white/70 backdrop-blur-md ring-1 ring-white/50 p-3 text-sm text-stone-700"
        >
          Keep it tasteful and upbeat. Tag @venue and #clarisapp. Focus on ambience,
          signature dishes, and your personality.
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</motion.section>

{/* NEW: BRAND GUIDELINES CARD (under About) */}
<motion.section
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, delay: 0.05 }}
  className="mx-4 mt-3 rounded-2xl bg-white/60 backdrop-blur-xl ring-1 ring-white/60 shadow-[0_8px_24px_rgba(0,0,0,.06)] p-4"
>
  <div className="flex items-center justify-between">
    <h3 className="text-stone-900 font-semibold">Brand guidelines</h3>
    <button className="text-sm text-stone-600 underline">
      View
    </button>
  </div>

  <p className="mt-1 text-[13px] leading-6 text-stone-700">
    What to capture, tone &amp; framing. Quick rules to match the venue’s aesthetic.
  </p>

  <div className="mt-3 flex flex-wrap gap-2">
    <span className="rounded-full bg-stone-100/80 px-3 py-1 text-[11px] text-stone-600 ring-1 ring-stone-200/40">
      Natural light
    </span>
    <span className="rounded-full bg-stone-100/80 px-3 py-1 text-[11px] text-stone-600 ring-1 ring-stone-200/40">
      Clean table shots
    </span>
    <span className="rounded-full bg-stone-100/80 px-3 py-1 text-[11px] text-stone-600 ring-1 ring-stone-200/40">
      Warm tones
    </span>
    <span className="rounded-full bg-stone-100/80 px-3 py-1 text-[11px] text-stone-600 ring-1 ring-stone-200/40">
      Avoid harsh flash
    </span>
  </div>
</motion.section>
