import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import api from '../api';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api.getPosts()
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

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
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>
                <Link to={`/post/${post.id}`}>
                  {post.title} {post.comments && post.comments.length > 0 ? `(${post.comments.length})` : ''}
                </Link>
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