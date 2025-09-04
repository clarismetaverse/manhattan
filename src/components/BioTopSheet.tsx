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
  idols?: { name: string; img: string }[];
};

export default function BioTopSheet({
  open,
  onClose,
  name,
  avatar,
  statement: _statement,
  bio = "Add your bio here…",
  goals = ["Build festival collab squads", "Grow beauty look library", "Partner with 3 agencies"],
  futureProjects = ["JFW BTS series", "Maison Savage launch collab", "Bali wellness x beauty format"],
  idols = []
}: BioTopSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    html.classList.add("overflow-hidden");
    return () => {
      window.removeEventListener("keydown", onKey);
      html.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`${name}'s bio`} className="fixed inset-0 z-50 flex items-end">
      <button aria-label="Close bio" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full h-screen bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-80">
        <div
          className="relative h-56 bg-center bg-cover bg-fixed"
          style={{ backgroundImage: `url(${avatar})` }}
          aria-label={name}
        >
          <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white shadow" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6">
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
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Idols & Celebrities</h3>
            {idols.length ? (
              <div className="grid grid-cols-3 gap-4">
                {idols.map((idol, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <img
                      src={idol.img}
                      alt={idol.name}
                      loading="lazy"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <p className="mt-2 text-xs text-gray-700">{idol.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Add your idols to show who inspires your looks</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

