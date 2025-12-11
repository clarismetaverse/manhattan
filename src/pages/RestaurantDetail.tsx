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

  const animateNumberChange =
