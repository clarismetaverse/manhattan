import type { UserProfileResponse } from '@/services/couponApi';

export type Profile = UserProfileResponse;
export type Mode = 'UGC' | 'PRO';
export type RingState = 'idle' | 'sweeping' | 'lit';
