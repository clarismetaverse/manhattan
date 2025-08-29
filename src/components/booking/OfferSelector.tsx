import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Offer {
  id: number;
  actionIcon?: string;
  actionName: string;
  value: number;
  available: boolean;
  dealLeft?: number;
}

interface OfferSelectorProps {
  offers: Offer[];
  selectedOfferId?: number;
  onSelectOffer: (offer: Offer) => void;
}

export const OfferSelector: React.FC<OfferSelectorProps> = ({
  offers,
  selectedOfferId,
  onSelectOffer
}) => {
  const availableOffers = offers.filter(offer => offer.available && (offer.dealLeft ?? 1) > 0);

  if (availableOffers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose your collaboration</h3>
      <div className="grid gap-3">
        {availableOffers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;
          
          return (
            <Card
              key={offer.id}
              className={`cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? 'ring-2 ring-primary shadow-md bg-primary/5'
                  : 'hover:shadow-md hover:bg-muted/30'
              }`}
              onClick={() => onSelectOffer(offer)}
            >
              {/* Selection Indicator - Red Circle */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Action Icon */}
                  <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                    {offer.actionIcon ? (
                      <img
                        src={offer.actionIcon}
                        alt={offer.actionName}
                        className="w-8 h-8 rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded bg-primary/20" />
                    )}
                  </div>

                  {/* Offer Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1">
                      {offer.actionName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        €{offer.value}
                      </span>
                      {offer.dealLeft && offer.dealLeft < 10 && (
                        <span className="text-xs text-muted-foreground">
                          {offer.dealLeft} left
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};