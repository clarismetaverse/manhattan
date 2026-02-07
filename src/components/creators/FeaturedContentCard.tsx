import { Sparkles } from "lucide-react";

type FeaturedContentCardProps = {
  title: string;
  imageUrl: string;
  creators: Array<{ name: string; avatar?: string }>;
};

export default function FeaturedContentCard({
  title,
  imageUrl,
  creators,
}: FeaturedContentCardProps) {
  return (
    <div className="w-80 shrink-0 snap-start rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative overflow-hidden rounded-2xl">
        <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-neutral-800">
          <Sparkles className="h-3 w-3" />
          Featured
        </span>
      </div>
      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        {creators.map((creator) => (
          <div key={creator.name} className="flex items-center gap-2">
            {creator.avatar ? (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-neutral-200" />
            )}
            <span className="text-xs text-neutral-600">{creator.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
