import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import PostEdit from './components/PostEdit';
import './App.css';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>바이브코딩(1인개발사)</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/create" element={<PostForm />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/edit/:id" element={<PostEdit />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
