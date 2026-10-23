export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number;
  imageUrl: string;
  spotifyId: string;
  genres?: string[];
  isListened?: boolean;
  rating?: number;
  listenedAt?: string;
  review?: string;
}