import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Post } from '../types';
import PasswordModal from './PasswordModal';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'edit' | 'delete' | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getPostById(id)
      .then(data => setPost(data))
      .catch(err => {
        console.error('Error fetching post:', err);
        alert('게시글을 불러올 수 없습니다.');
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
    try {
      const newComment = await api.addComment(id, comment);
      if (post && newComment) {
        setPost({
          ...post,
          comments: [...(post.comments || []), newComment]
        });
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 등록 실패');
    }
  };

  if (!post) return <div className="loading">Loading...</div>;

  return (
    <div className="container post-view">
      <h2>{post.title}</h2>
      <div className="meta">
        <span>작성자: {post.author}</span>
        <span>작성일: {post.date}</span>
      </div>
      <div className="post-content">
        {post.content}
      </div>
      <div className="btn-group">
        <button onClick={() => openModal('edit')} className="btn-primary">수정</button>
        <button onClick={() => openModal('delete')} className="btn-secondary" style={{ marginLeft: '10px', marginRight: '10px', backgroundColor: '#dc3545' }}>삭제</button>
        <button onClick={() => navigate('/')} className="btn-secondary">목록으로</button>
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
            placeholder="댓글을 입력하세요" 
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