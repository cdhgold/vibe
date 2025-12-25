import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PostForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    await api.createPost({ title, content, author, password });
    navigate('/');
  };

  return (
    <div className="container">
      <h2>게시글 작성</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label>제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
        </div>
        <div className="form-group">
          <label>작성자</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="이름" />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="삭제 시 필요합니다" />
        </div>
        <div className="form-group">
          <label>내용</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={10} />
        </div>
        <div className="btn-group">
          <button type="submit" className="btn-primary">등록</button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">취소</button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;