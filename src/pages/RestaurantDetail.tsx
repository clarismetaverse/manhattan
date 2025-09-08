import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Instagram, Smartphone, Clock, Phone, Users, Utensils, Beer, Home, UserPlus, Camera, Image as ImageIcon, Calendar, Info, ArrowLeft, Star, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';
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

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Booking states (following exact pattern)
  const [selectedCollab, setSelectedCollab] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Gallery carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center'
  });

  const { data: restaurantData, isLoading, isError } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const response = await fetch('https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_restaurant_and_service_double', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: parseInt(id || '0'),
          category_id: 0,
          user_id: 375
        }),
      });
      
      if (!response.ok) {
        throw new Error('Restaurant not found');
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

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
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
        behavior: 'smooth'
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
      console.log('All services:', services);
      services.forEach((service, index) => {
        console.log(`Service ${index}:`, service._actions_turbo);
      });
    }
  }, [services]);

  // Auto-selection (following exact pattern)
  useEffect(() => {
    if (services && services.length > 0 && !selectedCollab) {
      setSelectedCollab(services[0]); // AUTO-SELECT FIRST
    }
  }, [services]);

  // Dynamic button text (following exact pattern)
  const getBookingButtonText = () => {
    if (!selectedCollab) return 'Choose collaboration';
    if (!selectedDate || !selectedTime) return 'Select date & time';
    return 'Reserve Now';
  };

  // Booking ready logic (following exact pattern)
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
      // Phase 2: This will connect to booking API
      console.log('Booking:', { selectedCollab, selectedDate, selectedTime, restaurantId: id });
      toast({
        title: "Booking Confirmed!",
        description: `Your collaboration is booked for ${selectedDate.toDateString()} at ${selectedTime}`,
      });
    }
  };

  // Premium card selection with expansion - now with smooth value transitions
  const handleCardClick = (service: Service) => {
    const wasSelected = selectedCollab?.id === service.id;
    
    // Always set as selected collaboration
    setSelectedCollab(service);
    
    if (!wasSelected) {
      // Just selected - auto expand
      setExpandedCard(service.id);
    } else {
      // Toggle expansion on already selected card
      setExpandedCard(expandedCard === service.id ? null : service.id);
    }
  };

  // Smooth tab switching with value transitions instead of scrolling
  const switchToTab = (index: number) => {
    if (index < 0 || index >= services.length) return;
    
    const targetService = services[index];
    setActiveTab(index);
    
    // Animate values in the currently displayed card
    animateCardValues(targetService);
    
    // Update selected collaboration
    setSelectedCollab(targetService);
    setExpandedCard(targetService.id);
  };

  // Animate number values smoothly
  const animateNumber = (selector: string, fromValue: number, toValue: number) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const duration = 300;
      const startTime = performance.now();
      
      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.round(fromValue + (toValue - fromValue) * progress);
        element.textContent = currentValue.toString();
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    });
  };

  // Animate all card values to new service data
  const animateCardValues = (newService: Service) => {
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    if (progressFill && newService.deal_left && newService.Deal_limit) {
      const newWidth = ((newService.Deal_limit - newService.deal_left) / newService.Deal_limit) * 100;
      progressFill.style.width = `${newWidth}%`;
    }

    // Animate remaining count
    const remainingElement = document.querySelector('.remaining-count') as HTMLElement;
    if (remainingElement && newService.deal_left && newService.Deal_limit) {
      const currentText = remainingElement.textContent || '0/0';
      const currentValue = parseInt(currentText.split('/')[0]) || 0;
      const newValue = newService.deal_left * 20;
      const totalValue = newService.Deal_limit * 20;
      
      // Animate the number
      animateNumberChange(remainingElement, currentValue, newValue, totalValue);
    }

    // Animate individual metric values without re-rendering icons
    const platesValue = document.querySelector('[data-metric="plates"] .metric-value') as HTMLElement;
    const drinksValue = document.querySelector('[data-metric="drinks"] .metric-value') as HTMLElement;
    const gymValue = document.querySelector('[data-metric="gym"] .metric-value') as HTMLElement;
    const beautyValue = document.querySelector('[data-metric="beauty"] .metric-value') as HTMLElement;

    if (platesValue) {
      const currentValue = parseInt(platesValue.textContent || '0');
      const newValue = newService._actions_turbo?.Plates || 0;
      if (currentValue !== newValue) {
        animateNumberChange(platesValue, currentValue, newValue);
      }
    }

    if (drinksValue) {
      const currentValue = parseInt(drinksValue.textContent || '0');
      const newValue = newService._actions_turbo?.Drinks || 0;
      if (currentValue !== newValue) {
        animateNumberChange(drinksValue, currentValue, newValue);
      }
    }

    if (gymValue) {
      const currentValue = parseInt(gymValue.textContent || '0');
      const newValue = parseInt(newService._actions_turbo?.Gym as string) || 0;
      if (currentValue !== newValue) {
        animateNumberChange(gymValue, currentValue, newValue);
      }
    }

    if (beautyValue) {
      const currentValue = parseInt(beautyValue.textContent || '0');
      const newValue = parseInt(newService._actions_turbo?.Beauty as string) || 0;
      if (currentValue !== newValue) {
        animateNumberChange(beautyValue, currentValue, newValue);
      }
    }

    // Animate action name with fade
    const typeLabel = document.querySelector('.type-label') as HTMLElement;
    if (typeLabel) {
      typeLabel.style.opacity = '0.5';
      setTimeout(() => {
        typeLabel.textContent = newService._actions_turbo?.Action_Name || 'Neural Review Protocol';
        typeLabel.style.opacity = '1';
      }, 150);
    }
  };

  // Helper function to animate number changes smoothly
  const animateNumberChange = (element: HTMLElement, fromValue: number, toValue: number, totalValue?: number) => {
    if (fromValue === toValue) return; // Skip if value doesn't change
    
    const duration = 300;
    const startTime = performance.now();
    
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out
      
      const currentValue = Math.round(fromValue + (toValue - fromValue) * easedProgress);
      
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
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{restaurant.Name || 'Restaurant'} - Restaurant Details</title>
        <meta name="description" content={`Discover ${restaurant.Name || 'this restaurant'} - ${restaurant.Description || 'A unique dining experience'}`} />
        <meta property="og:title" content={`${restaurant.Name || 'Restaurant'} - Restaurant Details`} />
        <meta property="og:description" content={restaurant.Description || 'A unique dining experience'} />
        {restaurant.Cover && (
          <meta property="og:image" content={restaurant.Cover.url} />
        )}
      </Helmet>

      {/* Header */}
      <div className="absolute top-6 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="p-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white border-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Full Width Gallery Section - Instagram Style */}
      {gallery.length > 0 && (
        <div className="w-full mb-4">
          <div className="relative w-full overflow-hidden">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex">
                {gallery.map((image, index) => (
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
          
          {/* Instagram-style Dots Below Gallery */}
          {gallery.length > 1 && (
            <div className="flex justify-center py-3">
              <div className="flex space-x-2">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
              <p className={`${isDescriptionExpanded ? 'relative' : ''}`}>
                {isDescriptionExpanded ? (
                  <>
                    {restaurant.Description}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" style={{ top: '2.5em' }} />
                  </>
                ) : (
                  `${restaurant.Description.substring(0, 120)}${restaurant.Description.length > 120 ? '...' : ''}`
                )}
              </p>
              {restaurant.Description.length > 120 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-primary text-sm font-medium hover:text-primary/80 transition-colors mt-2 relative z-10"
                >
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          </div>
        </div>

        {/* Social + Creator Preview Section */}
        <div className="social-creator-section -mt-4">
          {/* Left Column: Social Links Container */}
          <div className="social-links-container">
            {(restaurant.Maps_Link || restaurant.GoogleMapsUrl || restaurant.Address) && (
              <a 
                href={restaurant.Maps_Link || restaurant.GoogleMapsUrl || `https://maps.google.com/search/${encodeURIComponent(restaurant.Address || restaurant.Name)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
              >
                <MapPin className="w-4 h-4" />
              </a>
            )}
            {(restaurant.Instagram || restaurant.InstagramHandle) && (
              <a 
                href={restaurant.Instagram || `https://instagram.com/${restaurant.InstagramHandle?.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {restaurant.TikTok && (
              <a href={restaurant.TikTok} target="_blank" rel="noopener noreferrer" className="social-icon">
                <Smartphone className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Right Column: Creator Preview Button */}
          <div className="creator-preview-btn" onClick={() => console.log('Open creator gallery')}>
            <div className="creator-preview-content">
              <div className="creator-avatar-stack">
                <div className="creator-avatar pulse"></div>
                <div className="creator-avatar"></div>
                <div className="creator-avatar"></div>
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
            <h2 className="text-2xl font-bold mb-3 text-white">Collaborations</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
          </div>
          
          {services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Utensils className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No protocols available at this time.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Premium Tab Navigation */}
              <div className="premium-tabs">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {services.map((service, index) => (
                    <button
                      key={service.id}
                      onClick={() => switchToTab(index)}
                      className={`premium-tab flex-1 min-w-fit whitespace-nowrap ${
                        activeTab === index ? 'active' : ''
                      }`}
                    >
                      {service._actions_turbo?.Action_Name || `Protocol ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Card with Transitioning Values */}
              <div className="w-full">
                {selectedCollab && (
                  <div 
                    className={`business-premium-card selected ${expandedCard === selectedCollab.id ? 'expanded' : ''}`}
                    onClick={() => handleCardClick(selectedCollab)}
                  >
                    {/* Progress Header with Points */}
                    <div className="offer-header">
                      <div className="progress-container">
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: selectedCollab.deal_left && selectedCollab.Deal_limit 
                                ? `${((selectedCollab.Deal_limit - selectedCollab.deal_left) / selectedCollab.Deal_limit) * 100}%`
                                : '75%' 
                            }}
                          />
                        </div>
                        <span className="remaining-count">
                          {selectedCollab.deal_left && selectedCollab.Deal_limit 
                            ? `${selectedCollab.deal_left * 20}/${selectedCollab.Deal_limit * 20}`
                            : '300/400'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="offer-content">
                      <div className="offer-metrics">
                        {(selectedCollab._actions_turbo?.Plates || 0) > 0 && (
                          <div className="metric" data-metric="plates">
                            <span className="metric-label">Plates</span>
                            <div className="metric-value-container">
                              <span className="metric-value" data-metric-value="plates">{selectedCollab._actions_turbo.Plates}</span>
                              <div className="metric-icon">🍽</div>
                            </div>
                          </div>
                        )}
                        {(selectedCollab._actions_turbo?.Drinks || 0) > 0 && (
                          <div className="metric" data-metric="drinks">
                            <span className="metric-label">Drinks</span>
                            <div className="metric-value-container">
                              <span className="metric-value" data-metric-value="drinks">{selectedCollab._actions_turbo.Drinks}</span>
                              <div className="metric-icon">🥂</div>
                            </div>
                          </div>
                        )}
                        {(parseInt(selectedCollab._actions_turbo?.Gym as string) || 0) > 0 && (
                          <div className="metric" data-metric="gym">
                            <span className="metric-label">Gym</span>
                            <div className="metric-value-container">
                              <span className="metric-value" data-metric-value="gym">{parseInt(selectedCollab._actions_turbo.Gym as string) || 0}</span>
                              <div className="metric-icon">🏋️</div>
                            </div>
                          </div>
                        )}
                        {(parseInt(selectedCollab._actions_turbo?.Beauty as string) || 0) > 0 && (
                          <div className="metric" data-metric="beauty">
                            <span className="metric-label">Beauty</span>
                            <div className="metric-value-container">
                              <span className="metric-value" data-metric-value="beauty">{parseInt(selectedCollab._actions_turbo.Beauty as string) || 0}</span>
                              <div className="metric-icon">💄</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="card-type-minimal">
                      <div className="type-indicator">
                        <span className="type-label">
                          {selectedCollab._actions_turbo?.Action_Name || 'Neural Review Protocol'}
                        </span>
                        <div className="completion-badge">
                          <div className="pulse-dot"></div>
                          <span className="selected-text">Selected</span>
                        </div>
                      </div>

                      {/* Auto-expanding content */}
                      <div className="expanded-content">
                        <div className="content-details">
                          <h4 className="text-sm font-semibold text-white mb-2">Mission Details</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCollab._actions_turbo?.Descrizione || restaurant.Description || 'Premium collaboration experience with exclusive benefits and rewards.'}
                          </p>
                        </div>
                       </div>
                     </div>
                   </div>
                )}
              </div>
             </div>
           )}
         </div>
       </div>

       {/* Sticky Bottom Bar (following exact pattern) */}
       <div className="fixed bottom-0 left-0 right-0 z-50">
         {/* Gradient Fade */}
         <div className="h-20 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
         
         <div className="bg-black/95 backdrop-blur-2xl border-t border-white/10 px-6 pb-8 pt-4">
           {/* Booking Summary - Show when offer is selected */}
           {selectedCollab && (
             <div className="mb-4">
               <div className="flex items-center gap-3 text-white">
                 <div className="flex items-center gap-2">
                   <span className="text-sm">{selectedCollab._actions_turbo?.Action_Name}</span>
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
           
             {/* Main CTA Buttons */}
             <div className="flex gap-3">
               <button
                 onClick={isBookingReady ? handleBooking : handleDateTimeSelect}
                 disabled={!selectedCollab}
                 className={`flex-1 px-6 py-4 text-base font-semibold rounded-full transition-all duration-300 ${
                   selectedCollab
                     ? 'text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] transform hover:scale-105'
                     : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 opacity-60 hover:opacity-70'
                 }`}
                 style={selectedCollab ? { background: 'var(--gradient-red)' } : undefined}
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
           restaurantId={parseInt(id || '0')}
           offerId={selectedCollab?.id || 0}
         />
      </div>
   );
 };

export default RestaurantDetail;