import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, MessageCircle, Share, CheckCircle, AlertCircle, XCircle, Instagram, ArrowLeft, RotateCcw, X as Close } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CheckInSlider from '@/components/CheckInSlider';
import { fetchCouponData, type CouponResponse } from '@/services/couponApi';
import { toast } from '@/hooks/use-toast';

// Clean component without Framer Motion dependencies

interface BookingData {
  id: number;
  user_turbo_id: number;
  BookingDay: string;
  ApprovalStatus: boolean;
  MinuteStart: number | null;
  HourStart: number | null;
  HourEnd: number | null;
  MinuteEnd: number | null;
  coupon_status: string;
  vanue_images: any[];
  check_in_status?: 'not_available' | 'available' | 'checked_in' | 'missed';
  check_in_time?: string;
  _timeframes_turbo?: {
    Name: string;
    restaurant_id: number;
    Spot_limit: boolean;
    Minute_Start: number;
    End: number;
    Minute_End: number;
    DayOfWeek: string;
  };
  _restaurant_turbo?: {
    Name: string;
    Instagram: string;
    Maps_Link: string;
    Adress: string;
    Cover?: {
      url: string;
      name: string;
      width: number;
      height: number;
    };
  };
  _offers_turbo?: {
    id: number;
    Offer_Name: string;
    Description?: string;
    instructions: string;
    Offer_Cover?: {
      url: string;
      name: string;
      width: number;
      height: number;
    };
    Reel: boolean;
    Tiktok: boolean;
    Story: boolean;
    Diary: boolean;
  };
  _actions_turbo?: {
    Action_Name: string;
    Type: string;
    Action_icon: {
      url: string;
    };
    Descrizione: string;
  };
  user_turbo: {
    id: number;
    name: string;
    NickName: string;
  };
}

interface BookingCardProps {
  booking: BookingData;
  onChatClick?: (bookingId: number) => void;
  onShareClick?: (bookingId: number) => void;
  onMapsClick?: (mapsLink: string) => void;
  onInstagramClick?: (instagramLink: string) => void;
  onUpdateBooking?: (bookingId: number, updates: Partial<BookingData>) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onChatClick,
  onShareClick,
  onMapsClick,
  onInstagramClick
}) => {
  const [selected, setSelected] = useState<BookingData | null>(null);
  const [showCheckInSlider, setShowCheckInSlider] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'not_available' | 'available' | 'checked_in' | 'missed'>(
    booking.check_in_status || 'not_available'
  );
  const [couponData, setCouponData] = useState<CouponResponse | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);


  // Check-in availability logic (debugging mode - always allow check-in if approved)
  const getCheckInAvailability = () => {
    // ApprovalStatus: false means approved (NOT pending)
    const isApproved = !booking.ApprovalStatus || booking.coupon_status?.toLowerCase().includes('approved');
    
    if (!isApproved || checkInStatus === 'checked_in') {
      return checkInStatus === 'checked_in' ? 'checked_in' : 'not_available';
    }

    // For debugging: always allow check-in if approved
    return 'available';
  };

  const currentAvailability = getCheckInAvailability();

  const handleCheckIn = async () => {
    console.log('🎯 Check-in button clicked, availability:', currentAvailability);
    if (currentAvailability === 'available') {
      setShowCheckInSlider(true);
      // Create coupon data from existing booking data instead of API call
      createCouponFromBooking();
    }
  };

  const handleCheckInComplete = () => {
    console.log('✅ Check-in completed, setting status...');
    setCheckInStatus('checked_in');
    setShowCheckInSlider(false);
    // Don't call loadCouponData here - it's already called in handleCheckIn
  };

  const createCouponFromBooking = () => {
    console.log('🎨 Creating coupon from existing booking data');
    setLoadingCoupon(true);
    
    // Transform booking data into coupon format
    const mockCouponData: CouponResponse = {
      id: booking.id,
      BookingTimestamp: Date.now(),
      user_turbo_id: booking.user_turbo_id,
      BookingDay: booking.BookingDay,
      restaurant_id: booking._restaurant_turbo?.Cover ? 1 : booking.id,
      MinuteStart: booking.MinuteStart,
      HourStart: formatTime(booking.HourStart, booking.MinuteStart),
      HourEnd: booking.HourEnd,
      MinuteEnd: formatTime(booking.HourEnd, booking.MinuteEnd),
      vanue_images: booking.vanue_images || [],
      _restaurant_turbo: {
        id: 1,
        Name: booking._restaurant_turbo?.Name || 'Restaurant',
        About: 'Premium dining experience perfect for content creation',
        Instagram: booking._restaurant_turbo?.Instagram || '@restaurant',
        Tags: '@venue',
        Tag2: '@claris.app',
        Maps_Link: booking._restaurant_turbo?.Maps_Link || '',
        Adress: booking._restaurant_turbo?.Adress || 'Restaurant Address',
        Cover: {
          access: 'public',
          path: '/covers/restaurant.jpg',
          url: booking._offers_turbo?.Offer_Cover?.url || booking._restaurant_turbo?.Cover?.url || '',
          name: 'restaurant-cover.jpg',
          type: 'image/jpeg',
          size: 1024000,
          mime: 'image/jpeg',
          meta: {
            width: booking._offers_turbo?.Offer_Cover?.width || booking._restaurant_turbo?.Cover?.width || 800,
            height: booking._offers_turbo?.Offer_Cover?.height || booking._restaurant_turbo?.Cover?.height || 600
          }
        }
      },
      _actions_turbo: {
        id: 1,
        Descrizione: booking._actions_turbo?.Descrizione || booking._offers_turbo?.Description || 'Create amazing content at this venue',
        Action_Name: booking._actions_turbo?.Action_Name || booking._offers_turbo?.Offer_Name || 'Instagram Reel',
        Extra_People: 0,
        Plates: 3,
        Drinks: 2,
        Gym: '',
        Accomodation: 0,
        Action_icon: {
          access: 'public',
          path: '/icons/action.png',
          url: booking._actions_turbo?.Action_icon?.url || '',
          name: 'action-icon.png',
          type: 'image/png',
          size: 50000,
          mime: 'image/png',
          meta: {
            width: 64,
            height: 64
          }
        }
      },
      _user_turbo: {
        id: booking.user_turbo.id,
        name: booking.user_turbo.name || booking.user_turbo.NickName || 'User',
        IG_account: `@${booking.user_turbo.NickName || 'user'}`,
        UserStatus: 'Premium',
        IG: true,
        TikTok: false,
        Profile_pic: {
          access: 'public',
          path: '/profiles/default.jpg',
          url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.user_turbo.name || 'user'}`,
          name: 'profile.jpg',
          type: 'image/svg+xml',
          size: 10000,
          mime: 'image/svg+xml',
          meta: {
            width: 200,
            height: 200
          }
        },
        profile_images: null
      }
    };

    setCouponData(mockCouponData);
    setLoadingCoupon(false);
    
    toast({
      title: "Coupon Ready!",
      description: "Your premium ticket has been activated.",
    });
  };

  const getCheckInButtonText = () => {
    switch (currentAvailability) {
      case 'not_available':
        return 'Check-in not available';
      case 'available':
        return 'Check In Now';
      case 'checked_in':
        return 'Checked In';
      default:
        return 'Check In';
    }
  };

  const getCheckInButtonColor = () => {
    switch (currentAvailability) {
      case 'available':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white';
      case 'checked_in':
        return 'bg-green-500/20 border border-green-500/40 text-green-400';
      default:
        return 'bg-gray-500/20 border border-gray-500/40 text-gray-400';
    }
  };

  const formatTime = (hour: number | null | undefined, minute: number | null | undefined) => {
    const h = hour ?? 0;
    const m = minute ?? 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    // ApprovalStatus: false means approved/confirmed, true means pending
    if (!booking.ApprovalStatus) {
      return {
        bg: 'bg-emerald-400/20',
        border: 'border-emerald-400/40',
        text: 'text-emerald-400',
        label: 'Confirmed',
        icon: CheckCircle
      };
    } else {
      return {
        bg: 'bg-amber-400/20',
        border: 'border-amber-400/40', 
        text: 'text-amber-400',
        label: 'Pending',
        icon: AlertCircle
      };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return {
        month: format(date, 'MMM'),
        day: format(date, 'd'),
        weekday: format(date, 'EEE')
      };
    } catch {
      return { month: 'Jan', day: '1', weekday: 'Mon' };
    }
  };

  const getSocialMediaIcon = () => {
    if (!booking._offers_turbo) return '📱';
    if (booking._offers_turbo.Tiktok && booking._offers_turbo.Reel) return '📱';
    if (booking._offers_turbo.Tiktok) return '🎵';
    if (booking._offers_turbo.Reel) return '📹';
    if (booking._offers_turbo.Story) return '📸';
    return '📱';
  };

  const handleCardClick = () => {
    setSelected(booking);
  };

  const reset = () => {
    setSelected(null);
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selected) {
        reset();
      }
    };

    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selected]);

  const status = getStatusColor();
  const StatusIcon = status.icon;
  const dateInfo = formatDate(booking.BookingDay);

  // Mock data for the detail view
  const currentBooking = selected ? {
    id: selected.id,
    status: !selected.ApprovalStatus ? "confirmed" : "pending",
    venue: selected._restaurant_turbo?.Name || selected._offers_turbo?.Offer_Name || 'Restaurant',
    address: selected._restaurant_turbo?.Adress || 'Restaurant Address',
    description: 'A premium dining experience with Instagram-worthy dishes and exceptional service. Perfect for content creation.',
    cover: 'from-red-900 via-red-800 to-orange-900',
    requirements: {
      posts: 2,
      stories: 3,
      reviews: 1,
      deadline: 7
    },
    experience: {
      plates: 3,
      drinks: 2,
      desserts: 1
    }
  } : null;

  const statusCfg = currentBooking?.status === "confirmed" 
    ? { bg: 'bg-emerald-400/20', border: 'border-emerald-400/40', text: 'text-emerald-400' }
    : { bg: 'bg-amber-400/20', border: 'border-amber-400/40', text: 'text-amber-400' };

  return (
    <>
      {/* Card View */}
      <div 
        className="bg-gray-900/90 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group hover:bg-gray-800/90 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1 shadow-lg shadow-black/40 relative border border-gray-700/30"
        onClick={handleCardClick}
      >
        
        {/* Cover Image Header */}
        <div className="relative h-36 overflow-hidden">
          <div>
            {booking._offers_turbo?.Offer_Cover?.url ? (
              <img 
                src={booking._offers_turbo.Offer_Cover.url}
                alt={booking._offers_turbo?.Offer_Name || 'Venue'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-500 text-sm">Venue Cover Image</div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Date Calendar */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[50px]">
            <div className="text-gray-300 text-xs uppercase tracking-wider font-medium">
              {dateInfo.month}
            </div>
            <div className="text-white text-lg font-semibold leading-tight">
              {dateInfo.day}
            </div>
            <div className="text-gray-400 text-xs">
              {dateInfo.weekday}
            </div>
          </div>

          {/* Time Badge */}
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-300" />
              <span className="text-white text-sm font-medium">
                {formatTime(booking.HourStart, booking.MinuteStart)} - {formatTime(booking.HourEnd, booking.MinuteEnd)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`absolute top-4 right-4 ${status.bg} rounded-full px-3 py-1 flex items-center gap-1`}>
            <span className={`${status.text} text-xs font-medium`}>{status.label}</span>
          </div>

          {/* Coupon Badge */}
          {booking.coupon_status && (
            <div className="absolute top-4 left-4 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1 flex items-center gap-1">
              <span className="text-green-400 text-xs font-medium">🎟️ {booking.coupon_status}</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Restaurant Name & Address */}
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2">
              {booking._restaurant_turbo?.Name || booking._offers_turbo?.Offer_Name || 'Restaurant'}
            </h3>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapsClick?.(booking._restaurant_turbo?.Maps_Link || '');
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors mt-0.5"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {booking._restaurant_turbo?.Adress || 'Restaurant Address'}
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick?.(booking.id);
                }}
                className="flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 transition-colors ml-3"
              >
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Section - Protocol & Chat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                {booking._actions_turbo?.Action_icon?.url ? (
                  <img 
                    src={booking._actions_turbo.Action_icon.url}
                    alt={booking._actions_turbo?.Action_Name || 'Action icon'}
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <span className="text-red-400 text-sm">{getSocialMediaIcon()}</span>
                )}
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  {booking._offers_turbo?.Offer_Name || booking._actions_turbo?.Action_Name || 'Holographic Experience'}
                </div>
                <div className="text-gray-400 text-xs">
                  {booking._actions_turbo?.Type || 'Instagram Reel'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChatClick?.(booking.id);
              }}
              className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg px-4 py-2 transition-all text-white"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Chat</span>
            </button>
          </div>

          {/* Check-in Bar */}
          {(!booking.ApprovalStatus || booking.coupon_status?.toLowerCase().includes('approved')) && currentAvailability !== 'not_available' && (
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckIn();
                }}
                disabled={currentAvailability !== 'available'}
                className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${getCheckInButtonColor()} ${
                  currentAvailability === 'available' 
                    ? 'shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                    : 'cursor-not-allowed'
                }`}
              >
                {getCheckInButtonText()}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail View Overlay */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto animate-fade-in">
          {/* Header pinned to very top */}
          <div className="sticky -top-2 flex items-center justify-between h-16 px-6 bg-black/60 backdrop-blur-md z-20">
            <button
              onClick={reset}
              className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-red-600/20"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`${statusCfg.bg} ${statusCfg.border} rounded-xl px-3 py-1`}>
              <span className={`${statusCfg.text} font-medium capitalize`}>
                {currentBooking.status === "confirmed" ? "Confirmed" : "Pending"}
              </span>
            </div>
          </div>

          {/* Scrollable detail content */}
          <div
            ref={detailRef}
            className="p-6 space-y-8 max-w-md mx-auto animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >

            {/* Cover */}
            <div className="relative overflow-hidden rounded-2xl h-64 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-full h-full">
                {selected._offers_turbo?.Offer_Cover?.url ? (
                  <img 
                    src={selected._offers_turbo.Offer_Cover.url}
                    alt={selected._offers_turbo?.Offer_Name || 'Venue'}
                    className="w-full h-full object-cover scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center scale-110">
                    <div className="text-gray-500 text-sm">Venue Cover Image</div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Venue Info */}
            <section className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-2 shadow-2xl shadow-black/50 -mt-8 relative z-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-white text-xl">{currentBooking.venue}</h3>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
                <p className="text-gray-300">{currentBooking.address}</p>
              </div>
              <p className="text-gray-400 text-sm">{currentBooking.description}</p>
            </section>

            {/* Content Instructions */}
            <section className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-white font-medium mb-2">Content Instructions</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Deliver {currentBooking.requirements.posts} Instagram posts, {currentBooking.requirements.stories} stories and {currentBooking.requirements.reviews} Google review(s). Deadline: {currentBooking.requirements.deadline} days.
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc pl-5">
                <li>High quality photos with natural light</li>
                <li>Tag @{currentBooking.venue.toLowerCase().split(' ').join('')} and location</li>
                <li>Use trending hashtags relevant to food and travel</li>
                <li>Share behind-the-scenes moments on stories</li>
                <li>Leave a detailed review mentioning service, food and atmosphere</li>
              </ul>
            </section>

            {/* Experience Includes */}
            <section className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl shadow-black/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-white font-medium mb-6">Experience Includes</h3>
              
              {/* Coupon Info */}
              {selected.coupon_status && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎟️</span>
                    <div>
                      <div className="text-green-400 font-medium text-sm">Coupon Available</div>
                      <div className="text-green-300 text-xs">{selected.coupon_status}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Plates</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white text-2xl font-light">{currentBooking.experience.plates}</span>
                    <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">🍽</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Drinks</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white text-2xl font-light">{currentBooking.experience.drinks}</span>
                    <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">🥂</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Desserts</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white text-2xl font-light">{currentBooking.experience.desserts}</span>
                    <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">🍰</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Check-in Button in Detail View */}
            {(!booking.ApprovalStatus || booking.coupon_status?.toLowerCase().includes('approved')) && currentAvailability !== 'not_available' && (
              <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckIn();
                  }}
                  disabled={currentAvailability !== 'available'}
                  className={`w-full py-4 px-6 rounded-xl text-base font-medium transition-all duration-300 ${getCheckInButtonColor()} ${
                    currentAvailability === 'available' 
                      ? 'shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                      : 'cursor-not-allowed'
                  }`}
                >
                  {getCheckInButtonText()}
                </button>
              </div>
            )}

            {/* Compact Actions */}
            <div className="grid grid-cols-3 gap-3 pb-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <button className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-xs text-red-300 hover:text-red-200">
                <Close className="w-3 h-3" />
                <span>Cancel</span>
              </button>
              <button className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-xs text-amber-300 hover:text-amber-200">
                <RotateCcw className="w-3 h-3" />
                <span>Resched.</span>
              </button>
              <button className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-200 hover:text-white">
                <MessageCircle className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Slider Modal */}
      {showCheckInSlider && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <CheckInSlider 
              onClose={handleCheckInComplete} 
              couponData={couponData}
              loadingCoupon={loadingCoupon}
            />
          </div>
        </div>
      )}
    </>
  );
};