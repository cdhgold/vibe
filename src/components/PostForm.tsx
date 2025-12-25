import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await api.createPost({ title, content, author, password });
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시글 작성 실패');
    }
  };

  return (
    <div className="container">
      <h2>게시글 작성</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group"><label>제목</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="form-group"><label>작성자</label><input type="text" value={author} onChange={e => setAuthor(e.target.value)} required /></div>
        <div className="form-group"><label>비밀번호</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="삭제/수정 시 필요" /></div>
        <div className="form-group"><label>내용</label><textarea value={content} onChange={e => setContent(e.target.value)} required rows={10} /></div>
        <div className="btn-group">
          <button type="submit" className="btn-primary">등록</button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">취소</button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;