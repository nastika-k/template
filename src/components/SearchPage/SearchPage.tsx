import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SearchPage.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { searchArtists, searchAlbums, searchTracks } from "./../../lastfm";

/**
 * Получает параметры запроса из URL-адреса.
 * @returns {URLSearchParams} Объект, содержащий параметры запроса.
 */
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage: React.FC = () => {
  const query = useQuery().get('query') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const navigate = useNavigate();

  /**
   * Функция для выполнения поиска при изменении параметра запроса.
   */
  useEffect(() => {
    setSearchTerm(query);

    if (!query) return;

    /**
     * Функция для получения данных поиска.
     */
    async function fetchData() {
      try {
        const [artistsRes, albumsRes, tracksRes] = await Promise.all([
          searchArtists(query),
        searchAlbums(query),
          searchTracks(query),
        ]);

        setArtists(artistsRes.slice(0, 8));
        setAlbums(albumsRes.slice(0, 8));
        setTracks(tracksRes);
      } catch (err) {
        console.error("Ошибка при поиске:", err);
      }
    }

    fetchData();
  }, [query]);

  /**
   * Обрабатывает событие поиска и обновляет URL-адрес с параметром запроса.
   */
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  /**
   * Очищает поле поиска.
   */
  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container-content-top">
          <h1 className="search-title">Search results for "{query}"</h1>
          <nav className="search-tabs">
            <ul>
              <li className="active"><button>Top Results</button></li>
              <li><button>Artists</button></li>
              <li><button>Albums</button></li>
              <li><button>Tracks</button></li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="search-content-container">
        <div className="search-main-content">
          <div className="search-input-block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              placeholder="Search again..."
            />
            <div className="search-actions">
              <button className="icon-button" onClick={handleClear}>
                <FaTimes />
              </button>
              <div className="divider" />
              <button className="icon-button" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
          <div className="artist-search">
            <h2 className="section-title">Artists</h2>
            <div className="artists-grid-tight">
              {artists.map((artist, idx) => (
                <div className="artist-thumb" key={idx}>
                  <img src={artist.image?.[0]?.['#text']} alt={artist.name} />
                  <a href={artist.url} className="artist-name" target="_blank" rel="noreferrer">
                    {artist.name}
                  </a>
                  {artist.listeners && (
                    <div className="listeners-count">{parseInt(artist.listeners).toLocaleString()} listeners</div>
                  )}
                </div>
              ))}
            </div>
            {artists.length > 0 && <a href="#" className="more-link">More artists &gt;</a>}
          </div>
          
          <div className="albums-search">
            <h2 className="section-title">Albums</h2>
              <div className="albums-grid">
                {albums.map((album, idx) => (
                  <div className="album-thumb" key={idx}>
                    <img src={album.image?.[0]?.['#text']} alt={album.name} />
                    <div className="album-title">{album.name}</div>
                    <div className="album-artist">{album.artist}</div>
                  </div>
                ))}
              </div>
              {albums.length > 0 && <a href="#" className="more-link">More albums &gt;</a>}
          </div>
          
          <div className="track-search">
            <h2 className="section-title">Tracks</h2>
            <ul className="track-list-search">
              {tracks.map((track, idx) => (
                <li className="track-item-search" key={idx}>
                  <button className="play-button" aria-label="Play">
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 3.5v9l8-4.5-8-4.5z" />
                    </svg>
                  </button>
                  <img src={track.image?.[0]?.['#text']} alt={track.name} />
                  <button className="heart-button" aria-label="Add to favorites">♡</button>
                  <div className="track-info-search">
                    <span className="track-name-search">{track.name}</span>
                    <span className="track-artist-search">{track.artist}</span>
                  </div>
                  <span className="track-duration-search">
                    -
                  </span>
                </li>
              ))}
            </ul>
            {tracks.length > 0 && <a href="#" className="more-link">More tracks &gt;</a>}
          </div>
        </div>        
      </div>
    </div>
  );
};

export default SearchPage;