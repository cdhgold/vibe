import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  return (
    <div className="post-list">
      <h2>게시글 목록</h2>
      <Link to="/create" className="btn">글쓰기</Link>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/post/${post.id}`}>
              [{post.id}] {post.title} - {post.author} ({post.date})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostList;