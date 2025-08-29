import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Clock, Instagram, Camera, ChevronDown, ExternalLink, ArrowRight } from 'lucide-react';

interface TicketProps {
  onReset: () => void;
}

const THRESHOLD = 0.85;

// Simple haptic feedback
const vibrate = (ms = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(ms);
  }
};

// Slider component
const Slider = ({ onComplete }: { onComplete: () => void }) => {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [maxX, setMaxX] = useState(300);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMaxX = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        setMaxX(Math.max(0, trackWidth - 64));
      }
    };
    
    updateMaxX();
    window.addEventListener('resize', updateMaxX);
    
    return () => {
      window.removeEventListener('resize', updateMaxX);
    };
  }, []);

  const progress = Math.min(Math.max(dragX / maxX, 0), 1);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    vibrate(5);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    vibrate(5);
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const newX = Math.min(Math.max(e.clientX - rect.left - 28, 0), maxX);
      setDragX(newX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const newX = Math.min(Math.max(touch.clientX - rect.left - 28, 0), maxX);
      setDragX(newX);
    };

    const handleEnd = () => {
      setDragging(false);
      if (progress >= THRESHOLD) {
        setDragX(maxX);
        onComplete();
      } else {
        setDragX(0);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, maxX, progress, onComplete]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-white/60">Selected date</div>
          <div className="font-semibold">Wednesday, 18:00 – 18:30</div>
        </div>
        <div className="text-right">
          <div className="text-white/60">Venue</div>
          <div className="font-semibold">Bari Uma</div>
        </div>
      </div>

      <div className="text-center text-sm text-white/60">Slide to Generate Premium Ticket</div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        className="relative h-16 rounded-full p-1 bg-neutral-900/60 border border-white/10 overflow-hidden"
      >
        {/* Progress */}
        <div 
          className="absolute inset-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/40 transition-transform duration-100"
          style={{ 
            transform: `scaleX(${progress})`,
            transformOrigin: "left"
          }}
        />

        {/* Handle */}
        <div
          ref={handleRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`absolute z-10 h-14 w-14 rounded-full bg-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform duration-100 ${
            dragging ? 'scale-110' : ''
          }`}
          style={{ 
            left: `${dragX}px`,
            transform: `translateY(-50%) ${dragging ? 'scale(1.1)' : ''}`,
            top: '50%'
          }}
        >
          <ArrowRight className={`h-5 w-5 text-neutral-700 transition-transform duration-100 ${dragging ? 'translate-x-0.5' : ''}`} />
          {dragging && <div className="absolute -inset-4 rounded-full bg-red-400/30 blur-sm animate-pulse" />}
        </div>

        {/* Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-sm font-medium text-white/60 transition-opacity duration-200"
            style={{ opacity: progress > 0.7 ? 0 : 1 }}
          >
            Slide to unlock premium ticket
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-white/50">
        Includes exclusive benefits & experiences
      </div>
    </div>
  );
};

// Premium Ticket component
const Ticket = ({ onReset }: TicketProps) => {
  const [addressExpanded, setAddressExpanded] = useState(false);

  useEffect(() => {
    vibrate(30);
  }, []);

  return (
    <div className="relative overflow-hidden animate-scale-in">
      {/* Header with Profile */}
      <div className="relative h-56 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black overflow-hidden">
        {/* Profile Picture - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative -mt-6 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">AI</span>
              </div>
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
        </div>

        {/* Venue Name */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">Bari Uma</h2>
            <div className="text-white/80 text-sm">Premium Experience</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Location */}
        <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-neutral-800 rounded-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">Via Brera 15, Milano</span>
                <button className="text-red-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded">
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {addressExpanded && (
                <div className="animate-accordion-down">
                  <div className="text-xs text-white/60 pb-2">
                    Zona Brera, 20121 Milano MI<br />
                    Near Pinacoteca di Brera<br />
                    Metro: Lanza (Green Line)
                  </div>
                </div>
              )}

              <button
                onClick={() => setAddressExpanded(!addressExpanded)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <span>{addressExpanded ? 'Hide' : 'Show'} full address</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${addressExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Wednesday, Aug 28</div>
              <div className="text-xs text-white/60">2024</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">18:00 – 18:30</div>
              <div className="text-xs text-white/60">30 minutes</div>
            </div>
          </div>
        </div>

        {/* Social Action */}
        <div className="border border-red-500/30 rounded-xl p-3 bg-red-500/5 animate-scale-in" style={{ animationDelay: '0.9s' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <Instagram className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-500 mb-1 text-sm">Social Action Required</div>
              <div className="text-white/90 font-medium text-sm">Post Instagram story featuring venue</div>
              <div className="text-xs text-white/60 mt-1">Tag @bariuma and use #PremiumExperience</div>
            </div>
            <Camera className="h-4 w-4 text-red-500/60" />
          </div>
        </div>

        {/* Benefits */}
        <div
          className="bg-neutral-950 border border-neutral-700 rounded-2xl p-6 animate-fade-in"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            animationDelay: '1.0s'
          }}
        >
          {/* Progress */}
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-0.5 bg-neutral-700 rounded overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
            </div>
            <span className="text-neutral-500 text-xs font-medium" style={{ fontFamily: 'SF Mono, Monaco, Consolas, monospace' }}>60/60</span>
          </div>

          {/* Metrics */}
          <div className="flex gap-10 mb-6">
            <div className="flex flex-col gap-2">
              <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider">PLATES</span>
              <div className="flex items-center gap-3">
                <span className="text-white text-3xl font-light">3</span>
                <div className="w-7 h-7 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-neutral-500 text-xs font-medium uppercase tracking-wider">DRINKS</span>
              <div className="flex items-center gap-3">
                <span className="text-white text-3xl font-light">2</span>
                <div className="w-7 h-7 bg-neutral-700 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12V7a1 1 0 011-1h4l2 5h6a1 1 0 011 1v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 6l1.5-1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l1-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-700 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-white text-base font-medium">Reel</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">SELECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10 animate-fade-in" style={{ animationDelay: '1.4s' }}>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
interface CheckInSliderProps {
  onClose?: () => void;
}

export default function CheckInSlider({ onClose }: CheckInSliderProps) {
  const [unlocked, setUnlocked] = useState(false);

  const handleComplete = () => {
    vibrate(20);
    setTimeout(() => setUnlocked(true), 220);
  };

  const handleReset = () => {
    setUnlocked(false);
    onClose?.();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/2 backdrop-blur-sm overflow-hidden animate-fade-in"
        style={{ boxShadow: '0 20px 60px -20px rgba(255,255,255,0.1)' }}
      >
        {!unlocked ? (
          <Slider onComplete={handleComplete} />
        ) : (
          <Ticket onReset={handleReset} />
        )}
      </div>
    </div>
  );
}