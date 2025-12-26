import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

app.use(cors());
app.use(express.json());

// 데이터 디렉토리 및 파일 자동 생성
const initData = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
      console.log(`Created data file: ${DATA_FILE}`);
    } else {
      console.error('Failed to initialize data:', error);
    }
  }
};

initData();

// 파일 읽기/쓰기 헬퍼 함수
const readPosts = async () => {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writePosts = async (posts) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
};

// 전체 게시글 조회
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await readPosts();
    const postList = posts.map(({ id, title, author, date, comments }) => ({
      id,
      title,
      author,
      date,
      comments: comments || [],
    })).sort((a, b) => b.id - a.id);
    res.json(postList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

// 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  try {
    const posts = await readPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read post' });
  }
});

// 게시글 작성
app.post('/api/posts', async (req, res) => {
  try {
    const posts = await readPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

    const newPost = {
      id: newId,
      ...req.body,
      date: new Date().toISOString().split('T')[0],
      comments: []
    };

    posts.unshift(newPost);
    await writePosts(posts);
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 게시글 수정
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { password, title, content, author } = req.body;
    const id = parseInt(req.params.id);
    const posts = await readPosts();
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    if (posts[postIndex].password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    posts[postIndex] = { ...posts[postIndex], title, content, author };
    await writePosts(posts);
    res.json(posts[postIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 댓글 작성
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const posts = await readPosts();
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));

    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      id: Date.now(),
      content: req.body.content,
      author: '익명', // 로그인 기능이 없으므로 익명 처리
      date: new Date().toISOString().split('T')[0]
    };
    
    if (!posts[postIndex].comments) {
      posts[postIndex].comments = [];
    }
    posts[postIndex].comments.push(newComment);
    await writePosts(posts);
    
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 게시글 삭제
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const id = parseInt(req.params.id);
    let posts = await readPosts();
    const postToDelete = posts.find(p => p.id === id);

    if (!postToDelete) return res.status(404).json({ error: 'Post not found' });

    if (postToDelete.password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    const updatedPosts = posts.filter(p => p.id !== id);
    await writePosts(updatedPosts);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// 비밀번호 검증
app.post('/api/posts/:id/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const id = parseInt(req.params.id);

    const posts = await readPosts();
    const post = posts.find(p => p.id === id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.password !== password) {
      return res.status(403).json({ valid: false, error: 'Incorrect password' });
    }

    res.json({ valid: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 정적 파일 제공 (React 빌드 결과물)
app.use(express.static(path.join(__dirname, '../dist')));

// SPA 라우팅 처리 (모든 요청을 index.html로)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});