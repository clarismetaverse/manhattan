import React from 'react';
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

interface BookingButtonProps {
  selectedOffer?: SelectedOffer;
  selectedDateTime?: SelectedDateTime;
  onSelectDateTime: () => void;
  onBook: () => void;
}

export const BookingButton: React.FC<BookingButtonProps> = ({
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
        return 'Choose collaboration';
      case 'select-datetime':
        return 'Select date & time';
      case 'ready-to-book':
        return 'Reserve Now';
      default:
        return 'Choose collaboration';
    }
  };

  const isDisabled = getButtonState() !== 'ready-to-book';
  const handleClick = () => {
    if (getButtonState() === 'ready-to-book') {
      onBook();
    } else if (getButtonState() === 'select-datetime') {
      onSelectDateTime();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        disabled={false} // Always clickable for better UX
        className={`px-8 py-4 text-base font-semibold rounded-full shadow-lg transition-all duration-300 min-w-[200px] ${
          isDisabled
            ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 opacity-60 hover:opacity-70'
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] scale-100 hover:scale-105'
        }`}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};