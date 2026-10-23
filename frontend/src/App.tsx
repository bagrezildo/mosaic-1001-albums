import { useState, useEffect, useMemo } from 'react';
import type { ProjectData, CurrentAlbum } from './types/api';
import initialAlbumsData from './data/albums.json';
import { AlbumCard } from './components/AlbumCard';
import { TodayHero } from './components/TodayHero';
import { NextAlbumCountdown } from './components/NextAlbumCountdown';
import { DenseMosaic } from './components/DenseMosaic';

const DECADES = [
  { label: 'Todas', value: 'all' },
  { label: '50s', value: '50s' },
  { label: '60s', value: '60s' },
  { label: '70s', value: '70s' },
  { label: '80s', value: '80s' },
  { label: '90s', value: '90s' },
  { label: '2000s', value: '2000s' },
  { label: '2010s+', value: '2010s+' },
] as const;

type DecadeValue = (typeof DECADES)[number]['value'];

export default function App() {
  const [projectName, setProjectName] = useState(() => {
    return localStorage.getItem('mosaic_project_name') || '';
  });
  const [tempProjectInput, setTempProjectInput] = useState(projectName);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [todayAlbum, setTodayAlbum] = useState<CurrentAlbum | null>(null);
  const [nextAlbumDate, setNextAlbumDate] = useState<string | undefined>(undefined);
  const [isLoadingApi, setIsLoadingApi] = useState(() => Boolean(projectName));
  const [apiError, setApiError] = useState<string | null>(null);

  // Registro de status, data e reviews no localStorage
  const [manualListenedMap, setManualListenedMap] = useState<
    Record<string, { rating?: number; listenedAt?: string; review?: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('mosaic_manual_listened');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedDecade, setSelectedDecade] = useState<DecadeValue>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'listened'>('all');
  const [historySortDirection, setHistorySortDirection] = useState<'asc' | 'desc'>('asc');

  // Modo de visualização (Cards vs Mural Denso)
  const [viewMode, setViewMode] = useState<'cards' | 'mosaic'>(() => {
    return (localStorage.getItem('mosaic_view_mode') as 'cards' | 'mosaic') || 'cards';
  });

  const handleSetViewMode = (mode: 'cards' | 'mosaic') => {
    setViewMode(mode);
    localStorage.setItem('mosaic_view_mode', mode);
  };

  useEffect(() => {
    if (!projectName) return;

    let isCancelled = false;

    const loadProject = async () => {
      try {
        const res = await fetch(`/api-1001/${encodeURIComponent(projectName.trim())}`);

        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Projeto não encontrado no 1001 Albums Generator.'
              : `Erro na API (${res.status})`
          );
        }

        const data: ProjectData = await res.json();
        
        if (!isCancelled) {
          setTodayAlbum(data.currentAlbum);
          setNextAlbumDate(data.nextAlbumDate);
          setApiError(null);

          if (data.history && data.history.length > 0) {
            setManualListenedMap((prev) => {
              const updated = { ...prev };

              data.history?.forEach((item) => {
                const date = item.generatedAt || new Date().toISOString();
                const apiReview =
                  item.review ||
                  (item as unknown as { comment?: string }).comment ||
                  (item as unknown as { notes?: string }).notes;

                const entry = {
                  rating: item.rating ?? updated[item.album.spotifyId || '']?.rating,
                  listenedAt: item.generatedAt || updated[item.album.spotifyId || '']?.listenedAt || date,
                  review: apiReview || updated[item.album.spotifyId || '']?.review,
                };

                if (item.album.spotifyId) updated[item.album.spotifyId] = entry;
                if (item.album.id) updated[item.album.id] = entry;
                updated[item.album.name.toLowerCase()] = entry;
              });

              localStorage.setItem('mosaic_manual_listened', JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Falha ao buscar dados';
          setApiError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingApi(false);
        }
      }
    };

    loadProject();

    return () => {
      isCancelled = true;
    };
  }, [projectName, refreshTrigger]);

  // Lista enriquecida com status
  const albums = useMemo(() => {
    return initialAlbumsData.map((album) => {
      const saved =
        manualListenedMap[album.spotifyId] ||
        manualListenedMap[album.id] ||
        manualListenedMap[album.name.toLowerCase()];

      if (saved) {
        return {
          ...album,
          isListened: true,
          rating: saved.rating ?? 5,
          listenedAt: saved.listenedAt,
          review: saved.review,
        };
      }

      return {
        ...album,
        isListened: false,
        rating: undefined,
        listenedAt: undefined,
        review: undefined,
      };
    });
  }, [manualListenedMap]);

  // Extração de gêneros únicos ordenada por frequência
  const availableGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    initialAlbumsData.forEach((a) => {
      a.genres?.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, []);

  // Status do álbum do dia
  const todayStatus = useMemo(() => {
    if (!todayAlbum) return { isListened: false, rating: undefined };

    const key = todayAlbum.spotifyId || todayAlbum.id || todayAlbum.name.toLowerCase();
    const saved =
      manualListenedMap[key] ||
      manualListenedMap[todayAlbum.name.toLowerCase()];

    return {
      isListened: Boolean(saved),
      rating: saved?.rating,
    };
  }, [todayAlbum, manualListenedMap]);

  const handleToggleTodayListen = (rating?: number) => {
    if (!todayAlbum) return;

    const key = todayAlbum.spotifyId || todayAlbum.id || todayAlbum.name.toLowerCase();

    setManualListenedMap((prev) => {
      const updated = { ...prev };

      if (updated[key] && rating === undefined) {
        delete updated[key];
        delete updated[todayAlbum.name.toLowerCase()];
      } else {
        const entry = {
          rating: rating ?? 5,
          listenedAt: updated[key]?.listenedAt || new Date().toISOString(),
          review: updated[key]?.review,
        };
        updated[key] = entry;
        if (todayAlbum.spotifyId) updated[todayAlbum.spotifyId] = entry;
        updated[todayAlbum.name.toLowerCase()] = entry;
      }

      localStorage.setItem('mosaic_manual_listened', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleGridListen = (id: string) => {
    const target = albums.find((a) => a.id === id);
    if (!target) return;

    const key = target.spotifyId || target.id;

    setManualListenedMap((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
        delete updated[target.name.toLowerCase()];
      } else {
        const entry = {
          rating: 5,
          listenedAt: new Date().toISOString(),
          review: undefined,
        };
        updated[key] = entry;
        if (target.spotifyId) updated[target.spotifyId] = entry;
        updated[target.name.toLowerCase()] = entry;
      }
      localStorage.setItem('mosaic_manual_listened', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = tempProjectInput.trim();
    if (!cleanSlug) return;

    setIsLoadingApi(true);
    localStorage.setItem('mosaic_project_name', cleanSlug);
    setProjectName(cleanSlug);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleManualRefresh = () => {
    if (!projectName) return;
    setIsLoadingApi(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Filtragem e Ordenação
  const filteredAlbums = useMemo(() => {
    const result = albums.filter((album) => {
      const matchesSearch =
        album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'listened' && !album.isListened) return false;
      if (filterMode === 'pending' && album.isListened) return false;

      if (selectedGenre !== 'all') {
        const hasGenre = album.genres?.some(
          (g) => g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      if (selectedDecade !== 'all') {
        const y = album.year;
        if (selectedDecade === '50s' && y >= 1960) return false;
        if (selectedDecade === '60s' && (y < 1960 || y >= 1970)) return false;
        if (selectedDecade === '70s' && (y < 1970 || y >= 1980)) return false;
        if (selectedDecade === '80s' && (y < 1980 || y >= 1990)) return false;
        if (selectedDecade === '90s' && (y < 1990 || y >= 2000)) return false;
        if (selectedDecade === '2000s' && (y < 2000 || y >= 2010)) return false;
        if (selectedDecade === '2010s+' && y < 2010) return false;
      }

      return true;
    });

    if (filterMode === 'listened') {
      return [...result].sort((a, b) => {
        const parseTime = (dateStr?: string) => {
          if (!dateStr) return Date.now();
          const t = new Date(dateStr).getTime();
          return isNaN(t) ? Date.now() : t;
        };

        const timeA = parseTime(a.listenedAt);
        const timeB = parseTime(b.listenedAt);

        return historySortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }

    return result;
  }, [albums, searchTerm, filterMode, selectedGenre, selectedDecade, historySortDirection]);

  const listenedCount = albums.filter((a) => a.isListened).length;
  const progressPercent = Math.round((listenedCount / albums.length) * 100);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedGenre !== 'all' ||
    selectedDecade !== 'all' ||
    filterMode !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedDecade('all');
    setFilterMode('all');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Topo / Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Mosaic <span className="text-emerald-400">1001 Albums</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Zero login • Conectado a: <strong className="text-emerald-400 font-mono">{projectName || 'Nenhum'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NextAlbumCountdown
              targetDate={nextAlbumDate}
              onTimeUp={handleManualRefresh}
            />

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-right">
              <div className="text-xs text-neutral-400">
                Progresso: <span className="text-emerald-400 font-bold">{listenedCount}</span> / {albums.length}
              </div>
              <div className="w-28 bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSaveProject} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nome do projeto..."
                value={tempProjectInput}
                onChange={(e) => setTempProjectInput(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isLoadingApi}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {isLoadingApi ? '...' : 'Trocar'}
              </button>
            </form>
          </div>
        </header>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex justify-between items-center">
            <span>{apiError}</span>
            <button onClick={() => setApiError(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* Álbum do Dia */}
        {todayAlbum && (
          <TodayHero
            album={todayAlbum}
            projectName={projectName}
            isListened={todayStatus.isListened}
            rating={todayStatus.rating}
            onToggleListen={handleToggleTodayListen}
            onRefresh={handleManualRefresh}
            isLoading={isLoadingApi}
          />
        )}

        {/* Barra de Filtros: Linha 1 (Busca, Gênero, Status, Histórico e Alternador de Visão) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Buscar por álbum ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Todos os Gêneros ({albums.length})</option>
              {availableGenres.map(({ name, count }) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1.5 items-center">
              {(['all', 'pending', 'listened'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                    filterMode === mode
                      ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {mode === 'all' && 'Todos'}
                  {mode === 'pending' && 'Pendentes'}
                  {mode === 'listened' && 'Ouvidos'}
                </button>
              ))}

              {filterMode === 'listened' && (
                <button
                  onClick={() =>
                    setHistorySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                  }
                  title="Alternar ordem cronológica"
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 transition"
                >
                  <span className="text-neutral-500">Histórico:</span>
                  <span className="font-semibold text-emerald-400">
                    {historySortDirection === 'asc' ? '1º ao Último ↑' : 'Mais Recente ↓'}
                  </span>
                </button>
              )}

              {/* Alternador de Visualização: Cards vs Mural Denso */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 ml-auto sm:ml-0">
                <button
                  onClick={() => handleSetViewMode('cards')}
                  title="Visualização em Cards detalhados"
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'cards'
                      ? 'bg-neutral-800 text-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSetViewMode('mosaic')}
                  title="Modo Mosaico Denso (Mini-tiles)"
                  className={`p-1.5 rounded-md transition ${
                    viewMode === 'mosaic'
                      ? 'bg-neutral-800 text-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 10h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 17h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Linha 2: Filtros por Década e Indicador de Resultados */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-neutral-900">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 mr-1">Década:</span>
              {DECADES.map(({ label, value }) => {
                const isActive = selectedDecade === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedDecade(value)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-xs'
                        : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>
                Mostrando <strong className="text-neutral-200">{filteredAlbums.length}</strong> de {albums.length} álbuns
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-emerald-400 hover:text-emerald-300 underline font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grade de Cards ou Mural Denso */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onToggleListen={handleToggleGridListen}
              />
            ))}
          </div>
        ) : (
          <DenseMosaic
            albums={filteredAlbums}
            onToggleListen={handleToggleGridListen}
          />
        )}
      </div>
    </div>
  );
}