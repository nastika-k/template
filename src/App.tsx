import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import MainContent from './components/MainContent/MainContent';
import Footer from './components/Footer/Footer';
import SearchPage from './components/SearchPage/SearchPage';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
