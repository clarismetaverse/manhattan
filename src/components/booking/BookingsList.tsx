import React, { useState, useEffect } from 'react';
import { BookingCard } from './BookingCard';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  vanue_images: unknown[];
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

export const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refreshing bookings...');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // Using the provided API endpoint with Upgrade parameter
      const response = await fetch('https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3/get_bookings/Upgrade', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Bookings refreshed:', data);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (bookingId: number) => {
    toast({
      title: "Opening Chat",
      description: `Starting conversation for booking #${bookingId}`,
    });
    console.log('Opening chat for booking:', bookingId);
  };

  const handleShareClick = (bookingId: number) => {
    toast({
      title: "Sharing Booking",
      description: "Booking details copied to clipboard",
    });
    console.log('Sharing booking:', bookingId);
  };

  const handleMapsClick = (mapsLink: string) => {
    if (mapsLink) {
      window.open(mapsLink, '_blank');
    }
  };

  const handleInstagramClick = (instagramLink: string) => {
    if (instagramLink) {
      window.open(instagramLink, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white text-xl font-medium mb-2">Unable to load bookings</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-white mb-1 tracking-tight">Your Bookings</h1>
            <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60 mt-3"></div>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-white text-xl font-medium mb-2">No bookings yet</h2>
            <p className="text-gray-400 text-sm">Start exploring collaborations to make your first booking</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-light text-white tracking-tight">Your Bookings</h1>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh bookings"
            >
              <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60 mt-3"></div>
          <p className="text-gray-400 text-sm mt-2">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onChatClick={handleChatClick}
              onShareClick={handleShareClick}
              onMapsClick={handleMapsClick}
              onInstagramClick={handleInstagramClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};