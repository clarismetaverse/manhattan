{offer && (
  <DateTimeSheet
    open={sheetOpen}
    onClose={() => setSheetOpen(false)}
    offerId={selectedOfferId ?? offer.id}
    venueId={restaurantId}
    onConfirm={(payload) => {
      const timeframeLabel = getTimeframeLabel(payload.timeframeId);
      setConfirmedSlot({ ...payload, timeframeLabel });

      const matchedOffer =
        offers.find((currentOffer) => currentOffer.id === payload.offerId) ?? offer;

      navigate("/booking/preview", {
        state: {
          date: payload.date,
          time: payload.timeLabel,
          meal: timeframeLabel,
          venueId: restaurantId,
          venueName: restaurantName,
          offerId: matchedOffer.id,
          offerTitle: matchedOffer.title,
        },
      });
    }}
  />
)}
