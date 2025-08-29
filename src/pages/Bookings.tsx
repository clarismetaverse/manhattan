import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BookingsList } from '@/components/booking/BookingsList';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const Bookings = () => {
  return (
    <>
      <Helmet>
        <title>Your Bookings - Claris</title>
        <meta name="description" content="Manage and view all your collaboration bookings in one place. Track booking status, chat with venues, and get directions." />
        <meta name="keywords" content="bookings, collaborations, reservations, status, venues" />
        <link rel="canonical" href={`${window.location.origin}/bookings`} />
        <meta property="og:title" content="Your Bookings - Claris" />
        <meta property="og:description" content="Manage and view all your collaboration bookings in one place." />
        <meta property="og:url" content={`${window.location.origin}/bookings`} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-black">
        <main className="pb-20">
          <BookingsList />
        </main>
        <BottomNavigation />
      </div>
    </>
  );
};

export default Bookings;