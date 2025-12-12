export type Offer = {
  id: string;
  title: string;
  plates?: number;
  drinks?: number;
  dessert?: number;
  champagne?: number;
  mission: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  image: string;
  gallery?: string[];
  brief: string;
  offers: Offer[];
};
