const XANO_BASE_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

export interface UserProfileResponse {
  id: number;
  name: string;
  IG_account: string;
  xp: number;
  TikTok: boolean;
  Claris: number;
  InstagramApprovation: boolean;
  Tiktokapprovation: boolean;
  TiktokRejection: boolean;
  InstagramRejection: boolean;
  bio: string;
  promocode: string;
  Profile_pic: {
    access: string;
    path: string;
    name: string;
    type: string;
    size: number;
    mime: string;
    meta: {
      width: number;
      height: number;
    };
    url: string;
  };
}

export interface CouponResponse {
  id: number;
  BookingTimestamp: number;
  user_turbo_id: number;
  BookingDay: string;
  restaurant_id: number;
  MinuteStart: number | null;
  HourStart: string;
  HourEnd: number | null;
  MinuteEnd: string;
  vanue_images: any[];
  _restaurant_turbo: {
    id: number;
    Name: string;
    About: string;
    Instagram: string;
    Tags: string;
    Tag2: string;
    Maps_Link: string;
    Adress: string;
    Cover: {
      access: string;
      path: string;
      url: string;
      name: string;
      type: string;
      size: number;
      mime: string;
      meta: {
        width: number;
        height: number;
      };
    };
  };
  _actions_turbo: {
    id: number;
    Descrizione: string;
    Action_Name: string;
    Extra_People: number;
    Plates: number;
    Drinks: number;
    Gym: string;
    Accomodation: number;
    Action_icon: {
      access: string;
      path: string;
      url: string;
      name: string;
      type: string;
      size: number;
      mime: string;
      meta: {
        width: number;
        height: number;
      };
    };
  };
  _user_turbo: {
    id: number;
    name: string;
    IG_account: string;
    UserStatus: string;
    IG: boolean;
    TikTok: boolean;
    Profile_pic: {
      access: string;
      path: string;
      url: string;
      name: string;
      type: string;
      size: number;
      mime: string;
      meta: {
        width: number;
        height: number;
      };
    };
    profile_images: any;
  };
}

export const fetchUserProfile = async (): Promise<UserProfileResponse> => {
  console.log('👤 Fetching user profile...');
  
  const authToken = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${XANO_BASE_URL}/user_turbo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }
    });
    
    console.log('📡 User Profile API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ User Profile API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ User profile data received:', data);
    return data;
  } catch (error) {
    console.error('💥 Error fetching user profile:', error);
    throw error;
  }
};

export const fetchCouponData = async (bookingId: number): Promise<CouponResponse> => {
  console.log('🎫 Fetching coupon data for booking ID:', bookingId);
  
  const authToken = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${XANO_BASE_URL}/get_bookings/user/detaiI`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        booking_id: bookingId.toString()
      })
    });
    
    console.log('📡 Coupon API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Coupon API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Coupon data received:', data);
    return data;
  } catch (error) {
    console.error('💥 Error fetching coupon data:', error);
    throw error;
  }
};