const API_KEY = '67d763b89ce1ffc2c7c96d2c7afdd032';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_PLACEHOLDER = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

/**
 * Возвращает лучшее доступное изображение (предпочитая большие размеры)
 */
function getBestImage(images?: Image[]): string {
  if (!images || images.length === 0) return LASTFM_PLACEHOLDER;
  
  // Порядок приоритета размеров
  const sizePriority = ['extralarge', 'large', 'medium', 'small'];
  
  for (const size of sizePriority) {
    const image = images.find(img => img.size === size);
    if (image && image['#text'] && image['#text'].trim() !== '') {
      // Улучшаем качество изображения, если это возможно
      return image['#text']
        .replace('/34s/', '/300x300/')
        .replace('/64s/', '/300x300/')
        .replace('/174s/', '/300x300/');
    }
  }
  
  return LASTFM_PLACEHOLDER;
}

/**
 * Возвращает изображение или заглушку (совместимость со старым кодом)
 */
function getImageWithFallback(image?: Image[]): Image[] {
  return [{ size: 'large', '#text': getBestImage(image) }];
}

// Остальные интерфейсы остаются без изменений
interface Image {
  size: string;
  '#text': string;
}

interface Tag {
  name: string;
  url: string;
}

interface Artist {
  name: string;
  mbid?: string;
  url: string;
  image?: Image[];
  tags?: string[];
}

interface Track {
  name: string;
  mbid?: string;
  url: string;
  duration?: string;
  listeners?: string;
  playcount?: string;
  artist: {
    name: string;
    mbid?: string;
    url: string;
  };
  image?: Image[];
  tags?: string[];
}

interface Album {
  name: string;
  artist: string;
  url: string;
  image?: Image[];
}

// Остальные вспомогательные функции остаются без изменений
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);
  return res.json();
}

async function fetchArtistTags(name: string): Promise<string[]> {
  const url = `${BASE_URL}?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${API_KEY}&format=json`;
  try {
    const data = await fetchJson<any>(url);
    return data?.artist?.tags?.tag?.map((t: Tag) => t.name) || [];
  } catch {
    console.warn(`Не удалось получить теги для артиста "${name}"`);
    return [];
  }
}

async function fetchTrackInfo(artist: string, track: string): Promise<{ duration?: string; tags?: string[] }> {
  const url = `${BASE_URL}?method=track.getInfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${API_KEY}&format=json`;
  try {
    const data = await fetchJson<any>(url);
    return {
      duration: data?.track?.duration || undefined,
      tags: data?.track?.toptags?.tag?.map((t: Tag) => t.name) || [],
    };
  } catch {
    console.warn(`Не удалось получить данные для трека "${track}" артиста "${artist}"`);
    return {};
  }
}

// Обновленные функции поиска с улучшенными изображениями
export async function fetchTopArtists(limit: number = 12): Promise<Artist[]> {
  const url = `${BASE_URL}?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=${limit}`;
  const data = await fetchJson<any>(url);
  const artists: Artist[] = data.artists.artist;

  return Promise.all(
    artists.map(async (artist: Artist) => ({
      ...artist,
      image: [{ size: 'large', '#text': getBestImage(artist.image) }],
      tags: await fetchArtistTags(artist.name),
    }))
  );
}

export async function searchArtists(query: string): Promise<Artist[]> {
  const url = `${BASE_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=12`;
  const data = await fetchJson<any>(url);
  return (data?.results?.artistmatches?.artist || []).map((artist: Artist) => ({
    ...artist,
    image: [{ size: 'large', '#text': getBestImage(artist.image) }],
  }));
}

export async function fetchPopularTracks(limit: number = 14): Promise<Track[]> {
  const url = `${BASE_URL}?method=chart.gettoptracks&api_key=${API_KEY}&format=json&limit=${limit}`;
  const data = await fetchJson<any>(url);
  const tracks: Track[] = data.tracks.track;

  return Promise.all(
    tracks.map(async (track: Track) => {
      const { duration, tags } = await fetchTrackInfo(track.artist.name, track.name);
      return {
        ...track,
        image: [{ size: 'large', '#text': getBestImage(track.image) }],
        duration,
        tags,
        artist: {
          ...track.artist,
          url: track.artist.url || `https://www.last.fm/music/${encodeURIComponent(track.artist.name)}`,
        },
      };
    })
  );
}

export async function searchTracks(query: string): Promise<Track[]> {
  const url = `${BASE_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=10`;
  const data = await fetchJson<any>(url);
  return (data?.results?.trackmatches?.track || []).map((track: Track) => ({
    ...track,
    image: [{ size: 'large', '#text': getBestImage(track.image) }],
  }));
}

export async function searchAlbums(query: string, limit: number = 12): Promise<Album[]> {
  const url = `${BASE_URL}?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=${limit}`;
  const data = await fetchJson<any>(url);
  return (data?.results?.albummatches?.album || []).map((album: Album) => ({
    ...album,
    image: [{ size: 'large', '#text': getBestImage(album.image) }],
  }));
}