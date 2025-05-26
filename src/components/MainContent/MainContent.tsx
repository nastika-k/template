import React, { useEffect, useState } from 'react';
import './MainContent.css';
import { fetchTopArtists, fetchPopularTracks } from './../../lastfm';

const MainContent: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tracksError, setTracksError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopArtists()
      .then(setArtists)
      .catch(err => setError("Не удалось загрузить артистов. Попробуйте позже."));
    
    fetchPopularTracks()
      .then(setTracks)
      .catch(err => setTracksError("Не удалось загрузить популярные треки. Попробуйте позже."));
  }, []);

  return (
    <main className="main-content">
      <div className="music-header-container">
        <h1 className="music-title">Music</h1>
      </div>
      <div className="page-content">
        {/* Hot right now section */}
        <div className="hot-now-container">
          <h2 className="hot-now-title">Hot right now</h2>
          {error && artists.length === 0 && (
            <p className="error-message">{error}</p>
          )}
          <div className="artists-grid">
            {artists.map((artist) => (
              <div className="artist-card" key={artist.mbid || artist.name}>
                <a href={artist.url} target="_blank" rel="noopener noreferrer">
                  <img src={artist.image?.[2]['#text'] || ''} alt={artist.name} />
                </a>
                <h3>
                  <a href={artist.url} target="_blank" rel="noopener noreferrer">
                    {artist.name}
                  </a>
                </h3>
                <ul className="artist-genres">
                  {artist.tags && artist.tags.length > 0 ? (
                    artist.tags.slice(0, 3).map((tag: any, idx: any) => (
                      <li key={idx}>
                        <a
                          href={`https://www.last.fm/tag/${encodeURIComponent(tag)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {tag}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li><em>Жанры не найдены</em></li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="popular-tracks-container">
          <h2 className="hot-now-title">Popular tracks</h2>
          {tracksError && tracks.length === 0 && (
            <p className="error-message">{tracksError}</p>
          )}
          <div className="tracks-grid">
            {tracks.map((track) => (
              <div className="track-item" key={track.mbid || `${track.name}-${track.artist.name}`}>
                <a href={track.url} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={track.image?.[2]['#text'] || ''} 
                    alt={`${track.name} - ${track.artist.name}`} 
                    className="track-cover"
                  />
                </a>
                <div className="track-info">
                  <h3 className="track-title">
                    <a href={track.url} target="_blank" rel="noopener noreferrer">
                      {track.name}
                    </a>
                  </h3>
                  <p className="track-artist">
                    <a 
                      href={track.artist.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {track.artist.name}
                    </a>
                  </p>
                  <ul className="track-genres">
                    {track.tags && track.tags.length > 0 ? (
                      track.tags
                        .filter((tag: string) => /^[a-zA-Z\-]+$/.test(tag))
                        .slice(0, 3)
                        .map((tag: string, idx: number) => (
                          <li key={idx}>
                            <a
                              href={`https://www.last.fm/tag/${encodeURIComponent(tag)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {tag}
                            </a>
                          </li>
                        ))
                    ) : (
                      <li><em>Жанры не найдены</em></li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;