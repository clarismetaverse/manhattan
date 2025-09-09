import React from "react";
import { Share2, BadgeCheck, Pin, Instagram, Music2, Briefcase, Users, X, Target, Rocket, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio, PortfolioItem, fetchUserTurbo, UserTurbo, XanoError } from "@/services/xano";

export default function UgcTiktokerProfilePinned() {
  // --- Fetch profile (already wired) ---
  const { data: me } = useQuery<UserTurbo>({
    queryKey: ["user_turbo"],
    queryFn: fetchUserTurbo,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const profile = {
    name: "Nina Rivera",
    handle: "@nina.rvr",
    avatar: me?.Profile_pic?.url ?? "https://placehold.co/600x400?text=Cover",
    role: "UGC Creator",
    location: me?.City ? `${me.City}${me.countryCode ? ", " + me.countryCode : ""}` : "Bali",
    claim: me?.bio && me.bio.trim().length ? me.bio : "Helping brands shine with authentic TikToks ✨",
    bio: me?.bio ?? "UGC creator focused on beauty, lifestyle and travel content. Based in Bali, open for collabs worldwide.",
  };

  // --- Fetch portfolio list ---
  const { data: portfolio, isLoading: pfLoading, isError: pfError, error: pfErr, refetch: refetchPortfolio } =
    useQuery<PortfolioItem[]>({
      queryKey: ["portfolio"],
      queryFn: fetchPortfolio,
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => {
        const m = (err as Error)?.message?.toLowerCase?.() || "";
        if (m.includes("unauthorized") || m.includes("rate limit")) return false;
        return count < 2;
      },
    });

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="relative">
          <img src={profile.avatar} alt={profile.name} className="w-full h-40 object-cover" />
          <div className="absolute top-3 right-3 flex items-center gap-1 text-white bg-black/50 px-2 py-1 rounded">
            <BadgeCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs">Verified</span>
          </div>
          <Pin className="absolute bottom-3 right-3 w-5 h-5 text-white" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{profile.name}</h2>
              <div className="text-sm text-gray-500">{profile.handle}</div>
            </div>
            <div className="flex gap-2">
              <a href="#" className="text-gray-500 hover:text-black"><Instagram className="w-5 h-5"/></a>
              <a href="#" className="text-gray-500 hover:text-black"><Music2 className="w-5 h-5"/></a>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{profile.claim}</p>
        </div>
      </div>

      {/* Editorial/Marketing Projects (live from API) */}
      <div className="mt-6">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Editorial / Marketing Projects</div>
        {pfLoading && (
          <div className="grid gap-4">
            {[1,2].map(i=>(
              <div key={i} className="rounded-2xl bg-white shadow overflow-hidden">
                <div className="w-full h-40 sm:h-56 bg-gray-200 animate-pulse" />
                <div className="p-3 h-16 bg-gray-50" />
              </div>
            ))}
          </div>
        )}
        {pfError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
            Couldn’t load portfolio. {(pfErr as Error)?.message}
            <button onClick={()=>refetchPortfolio()} className="ml-2 underline">Retry</button>
          </div>
        )}
        {!pfLoading && !pfError && (
          <div className="grid gap-4">
            {(portfolio?.length ? portfolio : []).map((p) => {
              const cover =
                p.Cover?.url || p.Hero?.url || p.Work_Body?.[0]?.url || "https://placehold.co/800x500?text=No+Cover";
              const brands = (p.Brand || []).map(b => b.LogoBrand?.url).filter(Boolean) as string[];
              const brandName = (p.Brand && p.Brand[0]?.BrandName) || "Untitled Project";
              const title = `${brandName}${p.Deliverables ? " — " + p.Deliverables : ""}`;
              const team = p.Team || [];
              const preview = team.slice(0,3);
              const extra = Math.max(0, team.length - preview.length);
              return (
                <div key={p.id} className="relative rounded-2xl overflow-hidden shadow bg-white">
                  <div className="relative">
                    <img src={cover} alt={title} className="w-full h-40 sm:h-56 object-cover" />
                    {!!brands.length && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        {brands.slice(0,3).map((b,i)=>(
                          <img key={i} src={b} alt="brand" className="w-16 h-16 rounded-md border-4 border-white shadow object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-sm relative z-10 bg-white/80 backdrop-blur-sm">
                    <div className="font-semibold text-base">{title}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500"/>
                      <div className="flex -space-x-2">
                        {preview.map((m,i)=>(
                          <img key={i}
                               src={m.Profile_pic?.url || "https://placehold.co/48x48?text=PRO"}
                               alt={m.NickName || "pro"}
                               title={m.NickName || "pro"}
                               className="w-7 h-7 rounded-full border object-cover" />
                        ))}
                        {extra > 0 && (
                          <div className="w-7 h-7 rounded-full border bg-gray-100 text-[10px] flex items-center justify-center">+{extra}</div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{team.length} collaborators</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {!portfolio?.length && (
              <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                No projects yet. Add your first editorial/marketing project from the studio.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

