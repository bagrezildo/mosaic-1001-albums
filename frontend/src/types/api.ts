export interface GeneratorImage {
  url: string;
  width?: number;
  height?: number;
}

export interface CurrentAlbum {
  id: string;
  name: string;
  artist: string;
  releaseDate?: string;
  images?: GeneratorImage[];
  spotifyId?: string;
  wikipediaUrl?: string;
  genres?: string[];
  subGenres?: string[];
}

export interface HistoryItem {
  album: CurrentAlbum;
  rating?: number;
  review?: string;
  generatedAt: string;
}

export interface ProjectData {
  projectName: string;
  currentAlbum: CurrentAlbum;
  history?: HistoryItem[];
  nextAlbumDate?: string; // Retornado pela API em alguns ciclos
}