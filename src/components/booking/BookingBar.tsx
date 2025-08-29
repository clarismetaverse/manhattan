import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedOffer {
  id: number;
  actionIcon?: string;
  actionName: string;
  value: number;
}

interface SelectedDateTime {
  date: Date;
  timeSlot: string;
}

interface BookingBarProps {
  selectedOffer?: SelectedOffer;
  selectedDateTime?: SelectedDateTime;
  onSelectDateTime: () => void;
  onBook: () => void;
}

export const BookingBar: React.FC<BookingBarProps> = ({
  selectedOffer,
  selectedDateTime,
  onSelectDateTime,
  onBook
}) => {
  const getButtonState = () => {
    if (!selectedOffer) return 'select-offer';
    if (!selectedDateTime) return 'select-datetime';
    return 'ready-to-book';
  };

  const getButtonText = () => {
    switch (getButtonState()) {
      case 'select-offer':
        return 'Select collaboration';
      case 'select-datetime':
        return 'Choose date & time';
      case 'ready-to-book':
        return 'Reserve Now';
      default:
        return 'Select collaboration';
    }
  };

  const formatDateTime = (dateTime: SelectedDateTime) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    const dateStr = dateTime.date.toLocaleDateString('en-US', options);
    return `${dateStr}, ${dateTime.timeSlot}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected Offer Icon */}
          <div className="flex items-center justify-center w-12 h-12">
            {selectedOffer?.actionIcon ? (
              <img
                src={selectedOffer.actionIcon}
                alt="Selected action"
                className="w-8 h-8 rounded transition-opacity duration-300"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Center: Date/Time Selection */}
          <button
            onClick={onSelectDateTime}
            disabled={!selectedOffer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedDateTime ? (
              <>
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {formatDateTime(selectedDateTime)}
                </span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Select date & time</span>
              </>
            )}
          </button>

          {/* Right: Book Button */}
          <Button
            onClick={onBook}
            disabled={getButtonState() !== 'ready-to-book'}
            variant={getButtonState() === 'ready-to-book' ? 'default' : 'secondary'}
            className={`px-6 py-2 font-medium transition-all duration-300 ${
              getButtonState() === 'ready-to-book'
                ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};