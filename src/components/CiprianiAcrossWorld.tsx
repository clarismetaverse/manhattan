import { useMemo } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface LocationMember {
  id: string
  name: string
  avatarUrl?: string
}

export interface CiprianiLocation {
  id: string
  city: string
  country: string
  headline?: string
  description?: string
  coverImage: string
  currentMembers: number
  totalMembers: number
  members: LocationMember[]
}

export interface MembersCountBadgeProps {
  currentMembers: number
  totalMembers: number
  variant?: "pill" | "inline"
  className?: string
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function MembersCountBadge({
  currentMembers,
  totalMembers,
  variant = "pill",
  className
}: MembersCountBadgeProps) {
  const formattedCurrent = numberFormatter.format(currentMembers)
  const formattedTotal = numberFormatter.format(totalMembers)

  if (variant === "inline") {
    return (
      <span className={cn("text-xs font-medium text-muted-foreground", className)}>
        {formattedCurrent}
      </span>
    )
  }

  return (
    <Badge
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur",
        className
      )}
    >
      <span className="text-primary">{formattedCurrent}</span>
      <span className="text-muted-foreground">of {formattedTotal} members</span>
    </Badge>
  )
}

interface CiprianiAcrossWorldProps {
  locations: CiprianiLocation[]
  onSelect?: (id: string) => void
  className?: string
}

const MAX_VISIBLE_AVATARS = 3

function LocationAvatarGroup({ members }: { members: LocationMember[] }) {
  const displayedMembers = members.slice(0, MAX_VISIBLE_AVATARS)
  const remaining = members.length - displayedMembers.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayedMembers.map(member => {
          const initials = member.name
            .split(" ")
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()

          return (
            <Avatar key={member.id} className="size-9 border-2 border-background bg-muted">
              {member.avatarUrl ? (
                <AvatarImage src={member.avatarUrl} alt={member.name} />
              ) : (
                <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
              )}
            </Avatar>
          )
        })}
      </div>
      {remaining > 0 && (
        <span className="ml-3 text-xs font-medium text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  )
}

function LocationCard({
  location,
  onSelect
}: {
  location: CiprianiLocation
  onSelect?: (id: string) => void
}) {
  return (
    <Card className="group relative h-full overflow-hidden border-border/50 bg-secondary/60">
      <button
        type="button"
        onClick={() => onSelect && onSelect(location.id)}
        className="relative flex h-full w-full flex-col text-left"
      >
        <div className="relative h-60 w-full overflow-hidden">
          <img
            src={location.coverImage}
            alt={`${location.city}, ${location.country}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Cipriani Around the World</p>
              <h3 className="mt-2 text-2xl font-semibold text-foreground">
                {location.city}, {location.country}
              </h3>
              {location.headline && (
                <p className="mt-1 text-sm text-muted-foreground">{location.headline}</p>
              )}
            </div>
            <MembersCountBadge
              currentMembers={location.currentMembers}
              totalMembers={location.totalMembers}
              className="w-fit bg-background/90"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          {location.description && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{location.description}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <LocationAvatarGroup members={location.members} />
            <Button variant="secondary" size="sm">
              View Members
            </Button>
          </div>
        </div>
      </button>
    </Card>
  )
}

export function CiprianiAcrossWorld({
  locations,
  onSelect,
  className
}: CiprianiAcrossWorldProps) {
  const totals = useMemo(() => {
    const current = locations.reduce((acc, location) => acc + location.currentMembers, 0)
    const total = locations.reduce((acc, location) => acc + location.totalMembers, 0)
    return { current, total }
  }, [locations])

  if (locations.length === 0) {
    return null
  }

  return (
    <section className={cn("space-y-6", className)}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Cipriani Members Club</p>
          <h2 className="text-3xl font-semibold tracking-tight">Across The World</h2>
        </div>
        <MembersCountBadge
          currentMembers={totals.current}
          totalMembers={totals.total}
          variant="inline"
          className="sm:self-center"
        />
      </header>
      <Carousel className="relative" opts={{ align: "start" }}>
        <CarouselContent className="-ml-2 pb-2">
          {locations.map(location => (
            <CarouselItem key={location.id} className="pl-2 sm:basis-2/3 lg:basis-1/3">
              <LocationCard location={location} onSelect={onSelect} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 hidden sm:flex" />
        <CarouselNext className="-right-4 hidden sm:flex" />
      </Carousel>
    </section>
  )
}

export const DEFAULT_LOCATIONS: CiprianiLocation[] = [
  {
    id: "venice",
    city: "Venice",
    country: "Italy",
    headline: "The original members club on Giudecca Island",
    description:
      "Sip a Bellini in the city where it was born and join fellow travelers for lagoon-side sunsets and art openings.",
    coverImage:
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80",
    currentMembers: 278,
    totalMembers: 320,
    members: [
      {
        id: "venice-1",
        name: "Camilla R.",
        avatarUrl: "https://i.pravatar.cc/128?img=59"
      },
      {
        id: "venice-2",
        name: "Jorge L.",
        avatarUrl: "https://i.pravatar.cc/128?img=33"
      },
      {
        id: "venice-3",
        name: "Lina S.",
        avatarUrl: "https://i.pravatar.cc/128?img=47"
      },
      {
        id: "venice-4",
        name: "Erik P."
      }
    ]
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    headline: "Skyline views from Wall Street's favorite terrace",
    description:
      "Network with founders and financiers over a Negroni while enjoying unobstructed views of Lower Manhattan.",
    coverImage:
      "https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?auto=format&fit=crop&w=1600&q=80",
    currentMembers: 412,
    totalMembers: 500,
    members: [
      {
        id: "new-york-1",
        name: "Devon M.",
        avatarUrl: "https://i.pravatar.cc/128?img=15"
      },
      {
        id: "new-york-2",
        name: "Katarina P.",
        avatarUrl: "https://i.pravatar.cc/128?img=23"
      },
      {
        id: "new-york-3",
        name: "Ravi K.",
        avatarUrl: "https://i.pravatar.cc/128?img=5"
      },
      {
        id: "new-york-4",
        name: "Lauren T."
      }
    ]
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    headline: "Palm-side cabanas for golden hour gatherings",
    description:
      "Host clients or unwind with family at our Palm Jumeirah oasis complete with private beach access.",
    coverImage:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80",
    currentMembers: 198,
    totalMembers: 260,
    members: [
      {
        id: "dubai-1",
        name: "Hassan A.",
        avatarUrl: "https://i.pravatar.cc/128?img=64"
      },
      {
        id: "dubai-2",
        name: "Sofia R.",
        avatarUrl: "https://i.pravatar.cc/128?img=32"
      },
      {
        id: "dubai-3",
        name: "Noah C.",
        avatarUrl: "https://i.pravatar.cc/128?img=7"
      },
      {
        id: "dubai-4",
        name: "Yara H."
      }
    ]
  }
]
