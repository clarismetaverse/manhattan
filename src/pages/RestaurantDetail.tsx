import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Instagram,
  Smartphone,
  Clock,
  Phone,
  Users,
  Utensils,
  Beer,
  Home,
  UserPlus,
  Camera,
  Image as ImageIcon,
  Calendar,
  Info,
  ArrowLeft,
  Star,
  Ticket,
  Coffee,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import { DateTimeModal } from "@/components/booking/DateTimeModal";
import CheckInSlider from "@/components/CheckInSlider";

interface ActionsTurbo {
  Plates?: number;
  Drinks?: number;
  Gym?: string | number;
  Beauty?: string | number;
  Accomodation?: number;
  Extra_People?: number;
  Action_Name?: string;
  Social?: string;
  Descrizione?: string;
  Type?: string;
  Action_icon?: {
    url?: string;
  };
  photos?: number;
  stories?: number;
  Days_deadline?: number;
  deadline?: string;

  // extra flexible metrics
  Coffee?: number;
  Chocolate?: number;
  Sugar?: number;
}

interface Service {
  id: number;
  Name: string;
  value?: number;
  available?: boolean;
  deal_left?: number;
  Deal_limit?: number;
  _actions_turbo?: ActionsTurbo;
}

interface RestaurantData {
  id: number;
  Name: string;
  Address: string;
  CoverImage?: {
    url: string;
  };
  Stars?: number;
  Cuisine?: string;
  PhoneNumber?: string;
  InstagramHandle?: string;
  Gallery?: Array<{
    url: string;
  }>;
  services?: Service[];
  Description?: string;
  OpeningHours?: string;
  Amenities?: string[];
}

type CollabMetricItem = {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
};

const buildMetricItems = (service: Service): CollabMetricItem[] => {
  const a = service._actions_turbo;
  const items: CollabMetricItem[] = [];
  if (!a) return items;

  if (a.Plates) {
    items.push({ id: "plates", label: "PLATES", value: a.Plates, icon: Utensils });
  }
  if (a.Drinks) {
    items.push({ id: "drinks", label: "DRINKS", value: a.Drinks, icon: Beer });
  }
  if (a.Gym) {
    items.push({
      id: "gym",
      label: "GYM",
      value: Number(a.Gym),
      icon: Users,
    });
  }
  if (a.Beauty) {
    items.push({
      id: "beauty",
      label: "BEAUTY",
      value: Number(a.Beauty),
      icon: Home,
    });
  }
  if (a.Coffee) {
    items.push({
      id: "coffee",
      label: "COFFEE",
      value: a.Coffee,
      icon: Coffee,
    });
  }
  if (a.Chocolate) {
    items.push({
      id: "chocolate",
      label: "CHOCOLATE",
      value: a.Chocolate,
      icon: Square,
    });
  }
  if (a.Sugar) {
    items.push({
      id: "sugar",
      label: "SUGAR",
      value: a.Sugar,
      icon: Square,
    });
  }
  if (a.Extra_People) {
    items.push({
      id: "extra_people",
      label: "EXTRA PEOPLE",
      value: a.Extra_People,
      icon: Users,
    });
  }
  if (a.Accomodation) {
    items.push({
      id: "accomodation",
      label: "NIGHTS",
      value: a.Accomodation,
      icon: Home,
    });
  }

  return items;
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Booking states
  const [selectedCollab, setSelectedCollab] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Gallery carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  const { data: restaurantData, isLoading, isError } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const response = await fetch(
        "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_restaurant_and_service_double",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurant_id: parseInt(id || "0"),
            category_id: 0,
            user_id: 375,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Restaurant not found");
      }

      return response.json();
    },
    enabled: !!id,
  });

  // Gallery navigation
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentImageIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleDotClick = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Services scroll handler
  const scrollToCard = (index: number) => {
    setActiveTab(index);
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Extract restaurant data from API response (with safety checks)
  const restaurant = restaurantData?.services?.[0] || {};
  const gallery = restaurant.GalleryRestaurant || [];
  const services = restaurantData?.services || [];

  // Debug services data
  useEffect(() => {
    if (services && services.length > 0) {
      console.log("All services:", services);
      services.forEach((service, index) => {
        console.log(`Service ${index}:`, service._actions_turbo);
      });
    }
  }, [services]);

  // Auto-selection
  useEffect(() => {
    if (services && services.length > 0 && !selectedCollab) {
      setSelectedCollab(services[0]); // AUTO-SELECT FIRST
    }
  }, [services, selectedCollab]);

  // Dynamic button text
  const getBookingButtonText = () => {
    if (!selectedCollab) return "Choose collaboration";
    if (!selectedDate || !selectedTime) return "Select date & time";
    return "Reserve Now";
  };

  // Booking ready logic
  const isBookingReady = selectedCollab && selectedDate && selectedTime;

  // Booking handlers
  const handleDateTimeSelect = () => {
    if (selectedCollab) {
      setIsDateTimeModalOpen(true);
    }
  };

  const handleDateTimeConfirm = (date: Date, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTime(timeSlot);
    setIsDateTimeModalOpen(false);
  };

  const handleBooking = () => {
    if (isBookingReady) {
      console.log("Booking:", {
        selectedCollab,
        selectedDate,
        selectedTime,
        restaurantId: id,
      });
      toast({
        title: "Booking Confirmed!",
        description: `Your collaboration is booked for ${selectedDate!.toDateString()} at ${selectedTime}`,
      });
    }
  };

  // Premium card selection with expansion
  const handleCardClick = (service: Service) => {
    const wasSelected = selectedCollab?.id === service.id;

    setSelectedCollab(service);

    if (!wasSelected) {
      setExpandedCard(service.id);
    } else {
      setExpandedCard(expandedCard === service.id ? null : service.id);
    }
  };

  // Number animation helpers
  const animateNumber = (selector: string, fromValue: number, toValue: number) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const duration = 300;
      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = Math.round(
          fromValue + (toValue - fromValue) * progress
        );
        element.textContent = currentValue.toString();

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    });
  };

  const animateNumberChange = (
    element: HTMLElement,
    fromValue: number,
    toValue: number,
    totalValue?: number
  ) => {
    if (fromValue === toValue) return;

    const duration = 300;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(
        fromValue + (toValue - fromValue) * easedProgress
      );

      if (totalValue) {
        element.textContent = `${currentValue}/${totalValue}`;
      } else {
        element.textContent = currentValue.toString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  // Animate all card values to new service data
  const animateCardValues = (newService: Service) => {
    const progressFill = document.querySelector(
      ".progress-fill"
    ) as HTMLElement | null;
    if (progressFill && newService.deal_left && newService.Deal_limit) {
      const newWidth =
        ((newService.Deal_limit - newService.deal_left) / newService.Deal_limit) *
        100;
      progressFill.style.width = `${newWidth}%`;
    }

    const remainingElement = document.querySelector(
      ".remaining-count"
    ) as HTMLElement | null;
    if (remainingElement && newService.deal_left && newService.Deal_limit) {
      const currentText = remainingElement.textContent || "0/0";
      const currentValue = parseInt(currentText.split("/")[0]) || 0;
      const newValue = newService.deal_left * 20;
      const totalValue = newService.Deal_limit * 20;

      animateNumberChange(remainingElement, currentValue, newValue, totalValue);
    }

    const platesValue = document.querySelector(
      '[data-metric="plates"] .metric-value'
    ) as HTMLElement | null;
    const drinksValue = document.querySelector(
      '[data-metric="drinks"] .metric-value'
    ) as HTMLElement | null;
    const gymValue = document.querySelector(
      '[data-metric="gym"] .metric-value'
    ) as HTMLElement | null;
    const beautyValue = document.querySelector(
      '[data-metric="beauty"] .metric-value'
    ) as HTMLElement | null;

    if (platesValue) {
      const currentValue = parseInt(platesValue.textContent || "0");
      const newValue = newService._actions_turbo?.Plates || 0;
      if (currentValue !== newValue) {
        animateNumberChange(platesValue, currentValue, newValue);
      }
    }

    if (drinksValue) {
      const currentValue = parseInt(drinksValue.textContent || "0");
      const newValue = newService._actions_turbo?.Drinks || 0;
      if (currentValue !== newValue) {
        animateNumberChange(drinksValue, currentValue, newValue);
      }
    }

    if (gymValue) {
      const currentValue = parseInt(gymValue.textContent || "0");
      const newValue = parseInt(newService._actions_turbo?.Gym as string) || 0;
      if (currentValue !== newValue) {
        animateNumberChange(gymValue, currentValue, newValue);
      }
    }

    if (beautyValue) {
      const currentValue = parseInt(beautyValue.textContent || "0");
      const newValue = parseInt(newService._actions_turbo?.Beauty as string) || 0;
      if (currentValue !== newValue) {
        animateNumberChange(beautyValue, currentValue, newValue);
      }
    }

    const typeLabel = document.querySelector(".type-label") as HTMLElement | null;
    if (typeLabel) {
      typeLabel.style.opacity = "0.5";
      setTimeout(() => {
        typeLabel.textContent =
          newService._actions_turbo?.Action_Name || "Neural Review Protocol";
        typeLabel.style.opacity = "1";
      }, 150);
    }
  };

  // Smooth tab switching
  const switchToTab = (index: number) => {
    if (index < 0 || index >= services.length) return;

    const targetService = services[index];
    setActiveTab(index);
    animateCardValues(targetService);
    setSelectedCollab(targetService);
    setExpandedCard(targetService.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-64 mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !restaurantData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{restaurant.Name || "Restaurant"} - Restaurant Details</title>
        <meta
          name="description"
          content={`Discover ${
            restaurant.Name || "this restaurant"
          } - ${
            restaurant.Description || "A unique dining experience"
          }`}
        />
        <meta
          property="og:title"
          content={`${restaurant.Name || "Restaurant"} - Restaurant Details`}
        />
        <meta
          property="og:description"
          content={restaurant.Description || "A unique dining experience"}
        />
        {restaurant.Cover && (
          <meta property="og:image" content={restaurant.Cover.url} />
        )}
      </Helmet>

      {/* Header */}
      <div className="absolute top-6 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="p-2 bg黑/20 backdrop-blur-sm hover:bg-black/30 text-white border-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Full Width Gallery Section */}
      {gallery.length > 0 && (
        <div className="w-full mb-4">
          <div className="relative w-full overflow-hidden">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex">
                {gallery.map((image: any, index: number) => (
                  <div key={index} className="embla__slide flex-shrink-0 w-full">
                    <img
                      src={image.url}
                      alt={`${restaurant.Name} gallery ${index + 1}`}
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="flex justify-center py-3">
              <div className="flex space-x-2">
                {gallery.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-primary"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 pb-32">
        {/* Restaurant Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{restaurant.Name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>Bali, Indonesia</span>
              </div>
            </div>
          </div>

          {restaurant.Description && (
            <div className="text-muted-foreground mb-4 relative">
              <p className={`${isDescriptionExpanded ? "relative" : ""}`}>
                {isDescriptionExpanded
                  ? restaurant.Description
                  : `${restaurant.Description.substring(
                      0,
                      120
                    )}${
                      restaurant.Description.length > 120 ? "..." : ""
                    }`}
              </p>
              {restaurant.Description.length > 120 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-primary text-sm font-medium hover:text-primary/80 transition-colors mt-2 relative z-10"
                >
                  {isDescriptionExpanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" />
        </div>

        {/* Social + Creator Preview Section */}
        <div className="social-creator-section -mt-4">
          <div className="social-links-container">
            {(restaurant.Maps_Link ||
              restaurant.GoogleMapsUrl ||
              restaurant.Address) && (
              <a
                href={
                  restaurant.Maps_Link ||
                  restaurant.GoogleMapsUrl ||
                  `https://maps.google.com/search/${encodeURIComponent(
                    restaurant.Address || restaurant.Name
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <MapPin className="w-4 h-4" />
              </a>
            )}
            {(restaurant.Instagram || restaurant.InstagramHandle) && (
              <a
                href={
                  restaurant.Instagram ||
                  `https://instagram.com/${restaurant.InstagramHandle?.replace(
                    "@",
                    ""
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {restaurant.TikTok && (
              <a
                href={restaurant.TikTok}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <Smartphone className="w-4 h-4" />
              </a>
            )}
          </div>

          <div
            className="creator-preview-btn"
            onClick={() => console.log("Open creator gallery")}
          >
            <div className="creator-preview-content">
              <div className="creator-avatar-stack">
                <div className="creator-avatar pulse" />
                <div className="creator-avatar" />
                <div className="creator-avatar" />
              </div>
              <div className="creator-text">
                <div className="creator-title">Featured Content</div>
              </div>
              <div className="creator-arrow">→</div>
            </div>
          </div>
        </div>

        {/* Services Section - Premium Cards */}
        <div className="mb-8">
          <div className="section-header mb-8">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Collaborations
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No protocols available at this time.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="premium-tabs">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {services.map((service, index) => (
                    <button
                      key={service.id}
                      onClick={() => switchToTab(index)}
                      className={`premium-tab flex-1 min-w-fit whitespace-nowrap ${
                        activeTab === index ? "active" : ""
                      }`}
                    >
                      {service._actions_turbo?.Action_Name ||
                        `Protocol ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single premium card with new layout */}
              <div className="w-full">
                {selectedCollab &&
                  (() => {
                    const items = buildMetricItems(selectedCollab);
                    const estimatedValue =
                      typeof selectedCollab.value === "number"
                        ? `${selectedCollab.value.toLocaleString("id-ID")} IDR`
                        : "350K IDR";

                    const dealsLeft = selectedCollab.deal_left ?? 0;
                    const dealLimit = selectedCollab.Deal_limit ?? 0;
                    const progressPercent =
                      dealsLeft && dealLimit
                        ? ((dealLimit - dealsLeft) / dealLimit) * 100
                        : 75;
                    const remainingText =
                      dealsLeft && dealLimit
                        ? `${dealsLeft * 20}/${dealLimit * 20}`
                        : "300/400";

                    return (
                      <div
                        className={`business-premium-card selected ${
                          expandedCard === selectedCollab.id ? "expanded" : ""
                        }`}
                        onClick={() => handleCardClick(selectedCollab)}
                      >
                        {/* Progress Header */}
                        <div className="offer-header">
                          <div className="progress-container">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="remaining-count">
                              {remainingText}
                            </span>
                          </div>
                        </div>

                        {/* Main card body */}
                        <div className="offer-content mt-4">
                          <div className="rounded-3xl bg-white/90 p-4 text-stone-900">
                            {/* Title + label + status */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="type-indicator">
                                <span className="type-label text-sm font-semibold text-stone-900">
                                  {selectedCollab._actions_turbo?.Action_Name ||
                                    "3 × Story"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] text-stone-600">
                                  Stories Content
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A7A]/10 px-2 py-1 text-[11px] font-medium text-[#FF5A7A]">
                                  {(selectedCollab.deal_left ??
                                    3) + " left"}
                                </span>
                              </div>
                            </div>

                            {/* Metrics grid */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              {items.map((item) => {
                                const metricDataKey =
                                  ["plates", "drinks", "gym", "beauty"].includes(
                                    item.id
                                  )
                                    ? item.id
                                    : undefined;

                                return (
                                  <div
                                    key={item.id}
                                    className="metric flex items-center gap-2"
                                    {...(metricDataKey
                                      ? { "data-metric": metricDataKey }
                                      : {})}
                                  >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE5EA]">
                                      <item.icon className="h-4 w-4 text-[#FF5A7A]" />
                                    </div>
                                    <div>
                                      <div className="text-[11px] tracking-wide text-stone-500">
                                        {item.label}
                                      </div>
                                      <div className="metric-value text-lg font-semibold text-stone-900">
                                        {item.value}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Expanded mission, instructions & value */}
                            {expandedCard === selectedCollab.id && (
                              <>
                                <p className="mt-4 text-sm text-stone-600">
                                  {selectedCollab._actions_turbo?.Descrizione ||
                                    restaurant.Description ||
                                    "Premium collaboration experience with exclusive benefits and rewards."}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <button className="text-sm underline text-stone-700 flex items-center gap-1">
                                    Content Instructions
                                    <Info className="h-4 w-4 text-[#FF5A7A]" />
                                  </button>
                                  <div className="text-right">
                                    <div className="text-xs text-stone-500">
                                      Estimated value
                                    </div>
                                    <div className="text-lg font-semibold text-stone-900">
                                      {estimatedValue}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="h-20 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
        <div className="bg-black/95 backdrop-blur-2xl border-t border-white/10 px-6 pb-8 pt-4">
          {selectedCollab && (
            <div className="mb-4">
              <div className="flex items-center gap-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {selectedCollab._actions_turbo?.Action_Name}
                  </span>
                  {selectedDate && selectedTime && (
                    <>
                      <span className="text-sm text-gray-300">•</span>
                      <button
                        onClick={handleDateTimeSelect}
                        className="text-sm hover:text-red-400 transition-colors cursor-pointer"
                      >
                        {selectedDate.toLocaleDateString()} at {selectedTime}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={isBookingReady ? handleBooking : handleDateTimeSelect}
              disabled={!selectedCollab}
              className={`flex-1 px-6 py-4 text-base font-semibold rounded-full transition-all duration-300 ${
                selectedCollab
                  ? "text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] transform hover:scale-105"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 opacity-60 hover:opacity-70"
              }`}
              style={
                selectedCollab ? { background: "var(--gradient-red)" } : undefined
              }
            >
              {getBookingButtonText()}
            </button>
          </div>
        </div>
      </div>

      <DateTimeModal
        isOpen={isDateTimeModalOpen}
        onClose={() => setIsDateTimeModalOpen(false)}
        onSelectDateTime={handleDateTimeConfirm}
        restaurantId={parseInt(id || "0")}
        offerId={selectedCollab?.id || 0}
      />
    </div>
  );
};

export default RestaurantDetail;
