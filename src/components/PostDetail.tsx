import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Post } from '../types';
import PasswordModal from './PasswordModal';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getPostById(id)
      .then((data) => {
        setPost({ ...data });
        setLoading(false);
      })
      .catch(() => {
        alert('게시글을 찾을 수 없습니다.');
        navigate('/');
      });
  }, [id, navigate]);

  const openModal = (action: 'edit' | 'delete') => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (password: string) => {
    if (!id) return;

    if (modalAction === 'edit') {
      try {
        const isValid = await api.verifyPassword(id, password);
        if (isValid) {
          setIsModalOpen(false);
          navigate(`/edit/${id}`, { state: { password } });
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } catch (error) {
        console.error('Password verification error:', error);
        alert('오류가 발생했습니다.');
      }
    } else if (modalAction === 'delete') {
      try {
        await api.deletePost(id, password);
        setIsModalOpen(false);
        navigate('/');
      } catch (error) {
        console.error('Delete post error:', error);
        alert('삭제 실패: 비밀번호가 일치하지 않거나 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment || !id) return;
    const newComment = await api.addComment(id, comment);
    if (newComment) {
      setPost(prev => prev ? ({
        ...prev,
        comments: [...prev.comments, newComment]
      }) : null);
      setComment('');
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!post) return null;

  return (
    <div className="container">
      <div className="post-view">
        <div className="post-header">
          <h2>{post.title}</h2>
          <div className="meta">
            <span>작성자: {post.author}</span>
            <span>날짜: {post.date}</span>
          </div>
        </div>
        <div className="post-content">
          {post.content}
        </div>
        <div className="btn-group">
          <button onClick={() => openModal('edit')} className="btn-primary">수정</button>
          <button onClick={() => openModal('delete')} className="btn-danger" style={{ marginLeft: '10px', marginRight: '10px' }}>삭제</button>
          <button onClick={() => navigate('/')} className="btn-secondary">목록으로</button>
        </div>
      </div>

      <div className="comment-section">
        <h3>댓글 ({post.comments?.length || 0})</h3>
        <div className="comment-list">
          {post.comments?.map((c) => (
            <div key={c.id} className="comment-item">
              <strong>{c.author}</strong>: {c.content} <span className="date">({c.date})</span>
            </div>
          ))}
        </div>
        <div className="comment-form">
          <input 
            type="text"  
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder="댓글을 입력하세요..." 
          />
          <button onClick={handleCommentSubmit} className="btn-small">등록</button>
        </div>
      </div>

      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        title={modalAction === 'edit' ? '수정하기' : '삭제하기'}
      />
    </div>
  );
};

export default PostDetail;