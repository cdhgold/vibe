import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Post } from '../types';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="container">
      <h2>게시글 목록</h2>
      <div className="list-header">
        <Link to="/create" className="btn-primary">글쓰기</Link>
      </div>
      <table className="post-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>작성자</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>
                <Link to={`/post/${post.id}`}>{post.title} {post.comments ? `(${post.comments.length})` : ''}</Link>
              </td>
              <td>{post.author}</td>
              <td>{post.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;