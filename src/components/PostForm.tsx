import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewPost } from '../types';

const PostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: NewPost = { title, content, author };

    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="post-form">
      <h2>게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <input type="text" placeholder="작성자" value={author} onChange={e => setAuthor(e.target.value)} required />
        </div>
        <div>
          <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default PostForm;