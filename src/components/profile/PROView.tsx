import React from 'react';
import { Pin, Briefcase } from 'lucide-react';

export default function PROView() {
  return (
    <>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-gray-400">
          <Pin className="w-3 h-3" /> Pinned Collabs
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-36 rounded-xl bg-white shadow" />
          <div className="h-36 rounded-xl bg-white shadow" />
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs mb-2 flex items-center gap-1 text-gray-400">
          <Briefcase className="w-3 h-3" /> Editorial / Marketing Projects
        </div>
        <div className="grid gap-4">
          <div className="h-40 rounded-2xl bg-white shadow" />
        </div>
      </div>
    </>
  );
}

