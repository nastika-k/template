const API_KEY = '67d763b89ce1ffc2c7c96d2c7afdd032';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_PLACEHOLDER = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

/**
 * Возвращает URL изображения наилучшего доступного качества из массива изображений
 * @param {Image[]} [images] - Массив изображений из Last.fm API
 * @returns {string} URL изображения наилучшего качества или URL заглушки
 */
function getBestImage(images?: Image[]): string {
  if (!images || images.length === 0) return LASTFM_PLACEHOLDER;
  
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

/**
 * Выполняет HTTP-запрос и возвращает данные в формате JSON
 * @template T - Ожидаемый тип возвращаемых данных
 * @param {string} url - URL для запроса
 * @returns {Promise<T>} Promise с данными в формате JSON
 * @throws {Error} Если запрос завершился с ошибкой
 */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);
  return res.json();
}

/**
 * Получает теги артиста из Last.fm API
 * @param {string} name - Имя артиста
 * @returns {Promise<string[]>} Promise с массивом тегов артиста
 */
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

/**
 * Получает дополнительную информацию о треке (длительность и теги)
 * @param {string} artist - Имя исполнителя
 * @param {string} track - Название трека
 * @returns {Promise<{duration?: string, tags?: string[]}>} Promise с информацией о треке
 */
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

/**
 * Получает список самых популярных артистов с Last.fm
 * @param {number} [limit=12] - Количество возвращаемых артистов
 * @returns {Promise<Artist[]>} Promise с массивом популярных артистов
 */
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

/**
 * Ищет артистов по имени
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Artist[]>} Promise с массивом найденных артистов
 */
export async function searchArtists(query: string): Promise<Artist[]> {
  const url = `${BASE_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=12`;
  const data = await fetchJson<any>(url);
  return (data?.results?.artistmatches?.artist || []).map((artist: Artist) => ({
    ...artist,
    image: [{ size: 'large', '#text': getBestImage(artist.image) }],
  }));
}

/**
 * Получает список самых популярных треков с Last.fm
 * @param {number} [limit=14] - Количество возвращаемых треков
 * @returns {Promise<Track[]>} Promise с массивом популярных треков
 */
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

/**
 * Ищет треки по названию
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Track[]>} Promise с массивом найденных треков
 */
export async function searchTracks(query: string): Promise<Track[]> {
  const url = `${BASE_URL}?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=10`;
  const data = await fetchJson<any>(url);
  return (data?.results?.trackmatches?.track || []).map((track: Track) => ({
    ...track,
    image: [{ size: 'large', '#text': getBestImage(track.image) }],
  }));
}

/**
 * Ищет альбомы по названию
 * @param {string} query - Поисковый запрос
 * @param {number} [limit=12] - Количество возвращаемых альбомов
 * @returns {Promise<Album[]>} Promise с массивом найденных альбомов
 */
export async function searchAlbums(query: string, limit: number = 12): Promise<Album[]> {
  const url = `${BASE_URL}?method=album.search&album=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json&limit=${limit}`;
  const data = await fetchJson<any>(url);
  return (data?.results?.albummatches?.album || []).map((album: Album) => ({
    ...album,
    image: [{ size: 'large', '#text': getBestImage(album.image) }],
  }));
}