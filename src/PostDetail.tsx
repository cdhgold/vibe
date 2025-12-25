import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => setPost(data))
      .catch(err => console.error('Error fetching post:', err));
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await fetch(`http://localhost:3001/api/posts/${id}`, { method: 'DELETE' });
        navigate('/');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail">
      <h2>{post.title}</h2>
      <p>작성자: {post.author} | 작성일: {post.date}</p>
      <div className="content">{post.content}</div>
      <button onClick={handleDelete}>삭제</button>
      <Link to="/">목록으로</Link>
    </div>
  );
};

export default PostDetail;