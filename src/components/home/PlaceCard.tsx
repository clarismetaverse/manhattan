import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface Place {
  id: number;
  Name: string;
  Adress: string;
  Cover?: {
    url?: string;
    name?: string;
  } | null;
}

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard = ({ place }: PlaceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/restaurant/${place.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "overflow-hidden bg-secondary/40 border-border/60 hover:shadow-glow transition-shadow duration-300 hover-scale cursor-pointer"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {place.Cover?.url ? (
          <img
            src={place.Cover.url}
            alt={`${place.Name} cover image in tropical paradise`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" aria-hidden />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold tracking-tight">{place.Name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{place.Adress}</p>
      </div>
    </Card>
  );
};
