import DateTimeSheetLayout from "./DateTimeSheetLayout";

return (
  <DateTimeSheetLayout
    open={open}
    onClose={onClose}

    viewDate={viewDate}
    selectedDate={selectedDate}
    onSelectDate={handleSelectDate}
    onMonthChange={goMonth}

    availableDays={availableDays}
    availabilityLoading={availabilityLoading}
    availabilityError={availabilityError}

    timeframes={timeframes}
    activeTimeframe={activeTf}
    onSelectTimeframe={setActiveTf}

    slots={slots}
    selectedSlot={selectedSlot}
    onSelectSlot={setSelectedSlot}

    variant="day-first" // o "fast"
    capacityMode="day"  // pronto anche per "slot"

    onConfirm={handleConfirm}
  />
);
