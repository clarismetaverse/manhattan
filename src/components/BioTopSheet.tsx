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

}: BioTopSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

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

