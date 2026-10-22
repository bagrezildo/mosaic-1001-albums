import type { CurrentAlbum } from '../types/api';

interface TodayHeroProps {
  album: CurrentAlbum;
  projectName: string;
  isListened: boolean;
  rating?: number;
  onToggleListen: (rating?: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function TodayHero({
  album,
  projectName,
  isListened,
  rating,
  onToggleListen,
  onRefresh,
  isLoading,
}: TodayHeroProps) {
  const imageUrl = album.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Cover';
  const year = album.releaseDate ? album.releaseDate.split('-')[0] : '';
  const spotifyLink = album.spotifyId
    ? `https://open.spotify.com/album/${album.spotifyId}`
    : null;

  // Link para a página do seu projeto no gerador para submeter a avaliação oficial
  const officialProjectUrl = projectName
    ? `https://1001albumsgenerator.com/${encodeURIComponent(projectName)}`
    : null;

  return (
    <div className={`border rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden transition-all duration-300 ${
      isListened 
        ? 'bg-linear-to-br from-neutral-900 via-neutral-950 to-emerald-950/20 border-emerald-500/40 shadow-emerald-500/5' 
        : 'bg-linear-to-br from-neutral-900 to-neutral-950 border-neutral-800'
    }`}>
      {/* Luz ambiente de fundo */}
      <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all ${
        isListened ? 'bg-emerald-500/20' : 'bg-neutral-700/10'
      }`} />

      {/* Topo do Card */}
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isListened ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Álbum do Dia
          </span>
          {isListened && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              Ouvido ✓ {rating ? `(${rating}★)` : ''}
            </span>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 px-2.5 py-1 rounded transition disabled:opacity-50"
        >
          {isLoading ? 'Atualizando...' : '↻ Atualizar'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        {/* Capa com status visual */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-lg overflow-hidden bg-neutral-800 shadow-lg border border-neutral-700/50 relative">
          <img
            src={imageUrl}
            alt={album.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isListened ? 'grayscale-0' : 'grayscale-50 contrast-105'
            }`}
          />
        </div>

        {/* Detalhes do Álbum */}
        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {album.name}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-medium">
              {album.artist} {year && <span className="text-neutral-500">• {year}</span>}
            </p>
          </div>

          {/* Gêneros */}
          {album.genres && album.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
              {album.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="bg-neutral-800/80 text-neutral-300 text-[11px] px-2 py-0.5 rounded-md border border-neutral-700/40"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Seletor de Avaliação Rápida (1 a 5 estrelas) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">Avaliar:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onToggleListen(star)}
                  className={`text-lg px-1 transition-transform hover:scale-125 ${
                    isListened && (rating ?? 0) >= star
                      ? 'text-amber-400'
                      : 'text-neutral-600 hover:text-amber-300'
                  }`}
                  title={`Dar ${star} estrela${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>

            {isListened && (
              <button
                type="button"
                onClick={() => onToggleListen(undefined)}
                className="text-[11px] text-neutral-500 hover:text-red-400 underline ml-1"
              >
                Desmarcar
              </button>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 flex flex-wrap gap-3 justify-center sm:justify-start items-center">
            {/* Botão de Marcar como Ouvido Direto */}
            <button
              onClick={() => onToggleListen(rating || 5)}
              className={`inline-flex items-center gap-2 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow ${
                isListened
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 hover:bg-neutral-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 hover:scale-102'
              }`}
            >
              {isListened ? '✓ Marcado como Ouvido' : 'Marcar como Ouvido'}
            </button>

            {/* Ouvir no Spotify */}
            {spotifyLink && (
              <a
                href={spotifyLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.673.465-1.026.25-2.812-1.718-6.353-2.107-10.523-1.154-.403.092-.806-.157-.898-.56-.092-.403.157-.806.56-.898 4.567-1.042 8.48-.6 11.637 1.336.353.215.465.673.25 1.026zm1.467-3.262c-.27.44-.847.58-1.287.31-3.22-1.98-8.128-2.55-11.936-1.393-.497.15-1.025-.133-1.176-.63-.15-.497.133-1.025.63-1.176 4.356-1.322 9.774-.683 13.46 1.583.44.27.58.847.31 1.287zm.126-3.41c-3.86-2.29-10.223-2.502-13.887-1.39-.59.18-1.217-.16-1.396-.75-.18-.59.16-1.217.75-1.396 4.218-1.28 11.238-1.03 15.688 1.612.53.315.704 1.002.39 1.532-.315.53-1.002.704-1.532.39z" />
                </svg>
                Ouvir no Spotify
              </a>
            )}

            {/* Link para o site oficial (para manter o gerador rodando no dia seguinte) */}
            {officialProjectUrl && (
              <a
                href={officialProjectUrl}
                target="_blank"
                rel="noreferrer"
                title="Avaliar no site oficial do 1001 Albums para gerar o próximo álbum amanhã"
                className="inline-flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs px-3 py-2 rounded-lg transition-colors border border-neutral-700"
              >
                Avaliar no Site Oficial ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}