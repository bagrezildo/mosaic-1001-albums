import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../src/data/albums.json');

async function run() {
  console.log('[CONEXAO] Consultando https://1001albumsgenerator.com/api/v1/albums/stats...');
  
  try {
    const res = await fetch('https://1001albumsgenerator.com/api/v1/albums/stats', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    console.log(`[STATUS] HTTP ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      throw new Error(`A API respondeu com status ${res.status}`);
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.albums || data.stats || Object.values(data));

    if (!Array.isArray(list) || list.length === 0) {
      console.error('[ERRO] O retorno da API não continha uma lista válida:', data);
      return;
    }

    console.log(`[SUCESSO] ${list.length} álbuns obtidos da API oficial!`);
    console.log('[AMOSTRA DO PRIMEIRO ITEM]:', JSON.stringify(list[0], null, 2));

    const formatted = list.map((item, index) => {
      const name = item.name || item.album || item.title || `Álbum #${index + 1}`;
      const artist = item.artist || 'Artista Desconhecido';
      
      let year = 1970;
      if (item.year) {
        year = parseInt(item.year, 10);
      } else if (item.releaseDate) {
        year = parseInt(String(item.releaseDate).split('-')[0], 10);
      }

      let spotifyId = String(item.spotifyId || item.spotify_id || '').trim();
      if (spotifyId.includes('album/')) {
        spotifyId = spotifyId.split('album/')[1].split('?')[0];
      }
      if (spotifyId.includes('spotify:album:')) {
        spotifyId = spotifyId.replace('spotify:album:', '');
      }

      let imageUrl = '';
      if (Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0]?.url || item.images[1]?.url || '';
      } else if (typeof item.image === 'string') {
        imageUrl = item.image;
      } else if (typeof item.coverUrl === 'string') {
        imageUrl = item.coverUrl;
      }

      if (!imageUrl && spotifyId) {
        imageUrl = `https://open.spotify.com/image/${spotifyId}`;
      }

      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&auto=format&fit=crop&q=60';
      }

      // Extrai os gêneros cadastrados
      const rawGenres = item.genres || [];
      const genres = Array.isArray(rawGenres) ? rawGenres.filter(Boolean) : [];

      return {
        id: String(item._id || item.id || index + 1),
        name: String(name).trim(),
        artist: String(artist).trim(),
        year: isNaN(year) ? 1970 : year,
        imageUrl: imageUrl.trim(),
        spotifyId: spotifyId,
        genres: genres
      };
    });

    // Ordenar cronologicamente do mais antigo para o mais recente
    formatted.sort((a, b) => a.year - b.year);

    const targetDir = path.dirname(outputPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2), 'utf-8');
    console.log(`[SALVO] Catálogo completo gravado com sucesso em:\n  ${outputPath}`);
    console.log(`[TOTAL] ${formatted.length} álbuns integrados ao Mosaic 1001.`);
  } catch (err) {
    console.error('[ERRO]', err.message);
    process.exit(1);
  }
}

run();