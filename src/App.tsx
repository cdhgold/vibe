import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import PostEdit from './components/PostEdit';
import ImaginationWorld from './components/ImaginationWorld';
import './App.css';

export const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="메뉴 열기">
            &#9776;
          </button>
          <div className="header-title-container">
            <h1><Link to="/" onClick={closeMenu}>바이브코딩(1인개발사)</Link></h1>
          </div>
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">게시판</Link>
            <Link to="/imagination-world" className="nav-link">상상월드</Link>
          </nav>
        </header>

        <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>게시판</Link>
          <Link to="/imagination-world" className="nav-link" onClick={closeMenu}>상상월드</Link>
        </nav>

        {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}

        <main>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/create" element={<PostForm />} />
            <Route path="/imagination-world" element={<ImaginationWorld />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/edit/:id" element={<PostEdit />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
