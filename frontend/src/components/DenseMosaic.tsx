import type { Album } from '../types/album';

interface DenseMosaicProps {
  albums: Album[];
  onToggleListen: (id: string) => void;
}

export function DenseMosaic({ albums, onToggleListen }: DenseMosaicProps) {
  return (
    <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/80">
      {/* Grade ultra compacta: de 6 a 20 colunas conforme a largura da tela */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-1.5 sm:gap-2">
        {albums.map((album) => {
          const isListened = album.isListened ?? false;

          return (
            <div
              key={album.id}
              onClick={() => onToggleListen(album.id)}
              className="group relative aspect-square rounded-md cursor-pointer bg-neutral-950 border border-neutral-800/80 hover:border-emerald-400 hover:scale-125 hover:z-40 transition-all duration-200"
            >
              {/* Capa com filtro P&B para pendentes e colorida para ouvidos */}
              <img
                src={album.imageUrl}
                alt={album.name}
                loading="lazy"
                className={`h-full w-full object-cover rounded-md transition-all duration-300 ${
                  isListened
                    ? 'grayscale-0 opacity-100 ring-1 ring-emerald-500/60'
                    : 'grayscale opacity-30 group-hover:opacity-90 group-hover:grayscale-0'
                }`}
              />

              {/* Tag de Nota nos Ouvidos */}
              {isListened && (
                <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-neutral-950 font-black text-[9px] px-1 rounded-xs leading-tight shadow-sm pointer-events-none">
                  {album.rating ? `${album.rating}★` : '✓'}
                </div>
              )}

              {/* Tooltip flutuante instantâneo */}
              <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-lg shadow-2xl text-left z-50 text-xs">
                <div className="font-bold text-white truncate" title={album.name}>
                  {album.name}
                </div>
                <div className="text-neutral-400 text-[11px] truncate mt-0.5" title={album.artist}>
                  {album.artist}
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-500">
                  <span>{album.year}</span>
                  {album.rating && (
                    <span className="text-emerald-400 font-bold">{album.rating}★</span>
                  )}
                </div>

                {album.spotifyId && (
                  <a
                    href={`https://open.spotify.com/album/${album.spotifyId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 block text-center py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded text-[10px] transition"
                  >
                    Ouvir no Spotify ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}