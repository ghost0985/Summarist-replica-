export interface Book {
  description: string;
  rating: any;
  coverUrl: string;
  audioLength: number | undefined;
  duration: number | undefined;
  time: number | undefined;
  id: string;
  author: string;
  title: string;
  subTitle: string;
  imageLink: string;
  audioLink?: string;
  totalRating: number;
  averageRating: number;
  keyIdeas: number;
  type: string;
  status: string;
  subscriptionRequired: boolean;
  summary: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
}
