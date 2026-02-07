import type { CreatorLite } from "@/services/creatorSearch";
import CreatorCard from "@/components/creators/CreatorCard";

type CreatorCarouselProps = {
  title: string;
  creators: CreatorLite[];
  showSparkle?: boolean;
};

export default function CreatorCarousel({ title, creators, showSparkle }: CreatorCarouselProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        <span className="text-xs text-neutral-400">Swipe</span>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} showSparkle={showSparkle} />
        ))}
      </div>
    </section>
  );
}
