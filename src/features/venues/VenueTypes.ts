export type Offer = {
  id: string;
  title: string;
  plates?: number;
  drinks?: number;
  mission: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  image: string;
  brief: string;
  offers: Offer[];
};
