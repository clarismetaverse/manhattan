import React from 'react';
import UGCView from '@/components/profile/UGCView';
import BottomNavigation from '@/components/navigation/BottomNavigation';

export default function UGCViewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">UGC Portfolio</h1>
            <p className="text-muted-foreground">Your user-generated content and collaborations</p>
          </header>
          <UGCView />
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}