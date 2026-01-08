export interface Travel {
  id: string;
  title: string;
  description: string;
  destination: string;
  price: number;
  images: string[];
  saved: boolean;
  dateRange: string;
  days: number;
  inclui?: string[];
}
