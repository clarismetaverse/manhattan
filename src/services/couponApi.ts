const XANO_BASE_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3";

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

export const fetchCouponData = async (bookingId: number): Promise<CouponResponse> => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/get_coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: bookingId.toString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching coupon data:', error);
    throw error;
  }
};