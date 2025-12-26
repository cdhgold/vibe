import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
}

const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (err) {
        setError('게시글을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  if (loading) return <div className="container">로딩 중...</div>;
  if (error) return <div className="container" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>게시판</h1>
        <Link to="/create" className="btn-primary">
          새 글 작성
        </Link>
      </div>
      <table className="post-table">
        <thead>
          <tr>
            <th style={{width: '10%'}}>번호</th>
            <th>제목</th>
            <th style={{width: '15%'}}>작성자</th>
            <th style={{width: '20%'}}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td><Link to={`/post/${post.id}`}>{post.title}</Link></td>
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