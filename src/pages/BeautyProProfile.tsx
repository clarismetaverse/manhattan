import React, { useState } from "react";
import BioTopSheet from "@/components/BioTopSheet";

export default function BeautyProProfile() {
  const [bioOpen, setBioOpen] = useState(false);

  const profile = {
    name: "Aria Chen",
    avatar: "https://placehold.co/120x120?text=A",
    statement: "Signature glam + editorial looks",
    bio: "Beauty pro specializing in editorial and bridal looks. Based in Los Angeles.",
  } as const;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            loading="lazy"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full border-4 border-white shadow"
          />
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p
              className="text-sm text-gray-700 cursor-pointer"
              onClick={() => setBioOpen(true)}
            >
              “{profile.statement}”
            </p>
          </div>
        </div>
      </div>
      <BioTopSheet
        open={bioOpen}
        onClose={() => setBioOpen(false)}
        name={profile.name}
        avatar={profile.avatar}
        statement={profile.statement || "Signature glam + editorial looks"}
        bio={profile.bio}
        goals={["Expand bridal clientele", "Host a masterclass series", "Collaborate with 3 global brands"]}
        futureProjects={["NYFW backstage team", "Clean beauty tutorial series", "Pop-up glam studio"]}
      />
    </div>
  );
}

