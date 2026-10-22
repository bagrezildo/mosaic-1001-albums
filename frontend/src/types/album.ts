export interface Album {
  id: string;
  name: string;
  artist: string;
  year: number;
  imageUrl: string;
  spotifyId: string;
  // Campos de controle pessoal:
  isListened?: boolean;
  rating?: number; // 1 a 5 estrelas
  listenedAt?: string;
  review?: string;
}