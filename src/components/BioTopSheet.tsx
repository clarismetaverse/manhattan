"use client";
import React, { useEffect } from "react";
import { X, Target, Rocket, Sparkles } from "lucide-react";

type BioTopSheetProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  avatar: string;
  statement: string;
  bio?: string;
  goals?: string[];
  futureProjects?: string[];
};

export default function BioTopSheet({
  open,
  onClose,
  name,
  avatar,
  statement,
  bio = "Add your bio here…",
  goals = ["Build festival collab squads", "Grow beauty look library", "Partner with 3 agencies"],
  futureProjects = ["JFW BTS series", "Maison Savage launch collab", "Bali wellness x beauty format"]
}: BioTopSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bio-title" className="fixed inset-0 z-50">
      <button aria-label="Close bio" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-x-0 top-0 h-[75vh] md:h-[70vh] bg-white rounded-b-3xl shadow-2xl overflow-hidden">
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200">
          <img src={avatar} alt={name} loading="lazy" width={120} height={120}
               className="absolute left-4 bottom-4 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow" />
          <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white shadow" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute left-32 md:left-36 bottom-6 right-4">
            <h2 id="bio-title" className="text-lg md:text-xl font-semibold">{name}</h2>
            <p className="text-sm text-gray-700 line-clamp-2">{statement}</p>
          </div>
        </div>
        <div className="h-[calc(75vh-12rem)] md:h-[calc(70vh-14rem)] overflow-y-auto px-4 md:px-6 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Full Bio
            </h3>
            <p className="text-sm leading-6 text-gray-800">{bio}</p>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Goals
            </h3>
            <ul className="text-sm leading-6 text-gray-800 list-disc pl-5">
              {goals.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Future Projects
            </h3>
            <ul className="text-sm leading-6 text-gray-800 list-disc pl-5">
              {futureProjects.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

