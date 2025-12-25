import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api';

const PostEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState(location.state?.password || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getPostById(id)
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setAuthor(data.author);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/');
      });
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!title || !content || !author || !password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await api.updatePost(id, { title, content, author, password });
      alert('수정되었습니다.');
      navigate(`/post/${id}`);
    } catch (error: any) {
      alert(error.message || '수정 실패');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2>게시글 수정</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group"><label>제목</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="form-group"><label>작성자</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
        <div className="form-group"><label>비밀번호</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" /></div>
        <div className="form-group"><label>내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} /></div>
        <div className="btn-group">
          <button type="submit" className="btn-primary">수정</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">취소</button>
        </div>
      </form>
    </div>
  );
};

export default PostEdit;
