interface CacheEntry {
  data: WidgetResponse;
  expiresAt: number;
}

export interface WidgetResponse {
  project: string;
  album: {
    name: string;
    artist: string;
    year: number;
    imageUrl: string;
    spotifyUrl: string;
    spotifyUri: string;
    genres: string[];
  } | null;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  review: {
    isListened: boolean;
    rating: number | null;
  };
  nextAlbumDate?: string;
  updatedAt: string;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function fetchWidgetData(slug: string): Promise<WidgetResponse> {
  const normalizedSlug = slug.trim().toLowerCase();
  const cached = memoryCache.get(normalizedSlug);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const res = await fetch(
    `https://1001albumsgenerator.com/api/v1/projects/${encodeURIComponent(normalizedSlug)}`,
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("PROJECT_NOT_FOUND");
    }
    throw new Error(`UPSTREAM_ERROR_${res.status}`);
  }

  const raw: any = await res.json();
  const current = raw.currentAlbum;

  let spotifyId = String(
    current?.spotifyId || current?.spotify_id || "",
  ).trim();
  if (spotifyId.includes("album/"))
    spotifyId = spotifyId.split("album/")[1].split("?")[0];
  if (spotifyId.includes("spotify:album:"))
    spotifyId = spotifyId.replace("spotify:album:", "");

  let imageUrl = "";
  if (Array.isArray(current?.images) && current.images.length > 0) {
    imageUrl = current.images[0]?.url || "";
  } else if (typeof current?.image === "string") {
    imageUrl = current.image;
  }
  if (!imageUrl && spotifyId) {
    imageUrl = `https://open.spotify.com/image/${spotifyId}`;
  }

  // Identifica histórico e avaliações já registradas
  const history = Array.isArray(raw.history) ? raw.history : [];
  const totalListened = history.length;
  const currentHistoryEntry = history.find(
    (h: any) =>
      h.album?.id === current?.id ||
      (spotifyId && h.album?.spotifyId === spotifyId),
  );

  const payload: WidgetResponse = {
    project: normalizedSlug,
    album: current
      ? {
          name: current.name || "Álbum Desconhecido",
          artist: current.artist || "Artista Desconhecido",
          year: Number(current.year) || 1970,
          imageUrl: imageUrl || "",
          spotifyUrl: spotifyId
            ? `https://open.spotify.com/album/${spotifyId}`
            : "",
          spotifyUri: spotifyId ? `spotify:album:${spotifyId}` : "",
          genres: Array.isArray(current.genres) ? current.genres : [],
        }
      : null,
    progress: {
      current: totalListened,
      total: 1001,
      percentage: Math.round((totalListened / 1001) * 100),
    },
    review: {
      isListened: Boolean(currentHistoryEntry),
      rating: currentHistoryEntry?.rating ?? null,
    },
    nextAlbumDate: raw.nextAlbumDate,
    updatedAt: new Date().toISOString(),
  };

  memoryCache.set(normalizedSlug, {
    data: payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return payload;
}
