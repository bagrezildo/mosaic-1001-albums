import type { Album } from '../types/album';

interface AlbumCardProps {
  album: Album;
  onToggleListen: (id: string) => void;
}

export function AlbumCard({ album, onToggleListen }: AlbumCardProps) {
  const isListened = album.isListened ?? false;

  const handleSpotifyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://open.spotify.com/album/${album.spotifyId}`, '_blank');
  };

  // Formata a data ISO (ex: "2024-03-15T00:00:00.000Z") para DD/MM/AAAA
  const formattedDate = album.listenedAt
    ? (() => {
        const date = new Date(album.listenedAt);
        return isNaN(date.getTime())
          ? null
          : date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
      })()
    : null;

  return (
    <div 
      onClick={() => onToggleListen(album.id)}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-neutral-900 border border-neutral-800 transition-all duration-300 hover:scale-102 hover:border-neutral-700 flex flex-col justify-between"
    >
      <div>
        {/* Capa com filtro P&B */}
        <div className="aspect-square w-full overflow-hidden bg-neutral-950 relative">
          <img
            src={album.imageUrl}
            alt={`${album.name} - ${album.artist}`}
            loading="lazy"
            className={`h-full w-full object-cover transition-all duration-500 ${
              isListened
                ? 'grayscale-0 opacity-100'
                : 'grayscale opacity-40 group-hover:opacity-65'
            }`}
          />

          {/* Badge de Avaliação */}
          {isListened && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-neutral-950 text-xs font-bold px-2 py-0.5 rounded shadow">
              {album.rating ? `${album.rating}★` : '✓'}
            </div>
          )}

          {/* Botão Spotify */}
          <button
            onClick={handleSpotifyClick}
            title="Ouvir no Spotify"
            className="absolute bottom-2 right-2 p-1.5 bg-neutral-950/80 hover:bg-[#1DB954] text-white hover:text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md backdrop-blur-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.673.465-1.026.25-2.812-1.718-6.353-2.107-10.523-1.154-.403.092-.806-.157-.898-.56-.092-.403.157-.806.56-.898 4.567-1.042 8.48-.6 11.637 1.336.353.215.465.673.25 1.026zm1.467-3.262c-.27.44-.847.58-1.287.31-3.22-1.98-8.128-2.55-11.936-1.393-.497.15-1.025-.133-1.176-.63-.15-.497.133-1.025.63-1.176 4.356-1.322 9.774-.683 13.46 1.583.44.27.58.847.31 1.287zm.126-3.41c-3.86-2.29-10.223-2.502-13.887-1.39-.59.18-1.217-.16-1.396-.75-.18-.59.16-1.217.75-1.396 4.218-1.28 11.238-1.03 15.688 1.612.53.315.704 1.002.39 1.532-.315.53-1.002.704-1.532.39z"/>
            </svg>
          </button>
        </div>

        {/* Informações */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-neutral-100 truncate" title={album.name}>
            {album.name}
          </h3>
          <p className="text-xs text-neutral-400 truncate mt-0.5" title={album.artist}>
            {album.artist}
          </p>

          {/* Ano de Lançamento e Data em que foi ouvido */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>{album.year}</span>

            {formattedDate && (
              <span className="text-neutral-400 flex items-center gap-1 font-mono text-[10px]" title="Data em que foi gerado/ouvido">
                <svg className="w-3 h-3 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formattedDate}
              </span>
            )}
          </div>

          {/* Comentário / Review */}
          {album.review && (
            <div 
              className="mt-2.5 p-2 bg-neutral-950/70 border border-neutral-800 rounded text-[11px] text-neutral-300 italic relative"
              title={album.review}
            >
              <span className="text-emerald-400 font-bold not-italic mr-1">“</span>
              <span className="line-clamp-2">{album.review}</span>
              <span className="text-emerald-400 font-bold not-italic ml-1">”</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}