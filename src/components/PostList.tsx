import { Link } from 'react-router-dom';
import postsData from '../../data/posts.json';

interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
}

const PostList = () => {
  // 데이터를 직접 import하므로 로딩, 에러, 상태 관리가 필요 없습니다.
  // `postsData`는 `Post[]` 타입의 배열로 직접 사용할 수 있습니다.
  const posts: Post[] = postsData;

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