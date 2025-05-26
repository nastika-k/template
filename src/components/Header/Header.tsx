import React, { useState } from 'react';
import { FaSearch, FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={`header ${searchOpen ? 'search-active' : ''}`}>
      <div className="header-container">
        {!searchOpen ? (
          <>
            <div className="logo">
              <a href="https://www.last.fm">
                <img
                  src="/images/logo.png"
                  alt="Last.fm"
                  className="logo-image"
                />
              </a>
            </div>

            <div className="nav-content">
              <div
                className="search-container"
                onClick={() => setSearchOpen(true)}
              >
                <FaSearch className="search-icon" />
              </div>

              <nav className="main-nav">
                <a href="#" className="nav-item">Live</a>
                <a href="#" className="nav-item">Music</a>
                <a href="#" className="nav-item">Charts</a>
                <a href="#" className="nav-item">Events</a>
              </nav>

              <div className="user-icon">
                <FaUserCircle className="user-icon-svg" />
              </div>
            </div>
          </>
        ) : (
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search for music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="cancel-button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Close search"
            >
              <FaTimes />
            </button>
            <button
              className="search-button"
              aria-label="Search"
              onClick={handleSearch}
            >
              <FaSearch />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
