import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file.');
  process.exit(1);
}

// 접속 시도 로그 출력 (비밀번호 마스킹)
console.log(`Connecting to MongoDB: ${MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const commentSchema = new mongoose.Schema({
  id: Number,
  content: String,
  author: String,
  date: String
});

const postSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  password: { type: String, required: true, select: false },
  date: { type: String, required: true },
  comments: [commentSchema]
});

const Post = mongoose.model('Post', postSchema);

// 전체 게시글 조회
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().select('-password -content -comments').sort({ id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

// 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ id: parseInt(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read post' });
  }
});

// 게시글 작성
app.post('/api/posts', async (req, res) => {
  try {
    const lastPost = await Post.findOne().sort({ id: -1 });
    const newId = lastPost ? lastPost.id + 1 : 1;
    
    const newPost = new Post({
      id: newId,
      ...req.body,
      date: new Date().toISOString().split('T')[0],
      comments: []
    });

    await newPost.save();
    
    const responsePost = newPost.toObject();
    delete responsePost.password;
    delete responsePost._id;
    delete responsePost.__v;

    res.status(201).json(responsePost);
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

    const post = await Post.findOne({ id }).select('+password');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    post.title = title;
    post.content = content;
    post.author = author;
    
    await post.save();

    const responsePost = post.toObject();
    delete responsePost.password;

    res.json(responsePost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 댓글 작성
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findOne({ id: parseInt(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      id: Date.now(),
      content: req.body.content,
      author: '익명', // 로그인 기능이 없으므로 익명 처리
      date: new Date().toISOString().split('T')[0]
    };
    
    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 게시글 삭제
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const id = parseInt(req.params.id);

    const post = await Post.findOne({ id }).select('+password');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    await Post.deleteOne({ id });

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

    const post = await Post.findOne({ id }).select('+password');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.password !== password) {
      return res.status(403).json({ valid: false, error: 'Incorrect password' });
    }

    res.json({ valid: true });
  } catch (err) {
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