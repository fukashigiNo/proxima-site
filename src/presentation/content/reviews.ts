export interface Review {
  name: string;
  text: string;
  city?: string;
  source?: string;
  date?: string;
  link?: string;
}

export const REVIEWS: Review[] = [];
