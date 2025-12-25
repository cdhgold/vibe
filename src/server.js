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
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

app.use(cors());
app.use(express.json());

// 데이터 디렉토리 및 파일 초기화
const initData = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(INDEX_FILE);
    } catch {
      await fs.writeFile(INDEX_FILE, JSON.stringify([]));
    }
  } catch (err) {
    console.error('Failed to initialize data:', err);
  }
};

initData();

// 인덱스 파일 읽기
const readIndex = async () => {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// 인덱스 파일 쓰기
const writeIndex = async (indexData) => {
  await fs.writeFile(INDEX_FILE, JSON.stringify(indexData, null, 2));
};

// 특정 데이터 파일 읽기
const readDataFile = async (fileName) => {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading data file ${fileName}:`, err);
    return [];
  }
};

// 특정 데이터 파일 쓰기
const writeDataFile = async (fileName, data) => {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// 오늘 날짜 문자열 (YYYYMMDD)
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 전체 게시글 조회
app.get('/api/posts', async (req, res) => {
  try {
    // 목록 조회 시에는 index.json만 읽어서 반환
    const index = await readIndex();
    // 최신순 정렬 (ID 역순)
    res.json(index.sort((a, b) => b.id - a.id));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

// 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  try {
    const index = await readIndex();
    const entry = index.find(p => p.id === parseInt(req.params.id));
    
    if (!entry) return res.status(404).json({ error: 'Post not found' });

    // 해당 파일에서 상세 내용 조회
    const postsInFile = await readDataFile(entry.fileName);
    const post = postsInFile.find(p => p.id === parseInt(req.params.id));
    
    if (!post) return res.status(404).json({ error: 'Post content not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read post' });
  }
});

// 게시글 작성
app.post('/api/posts', async (req, res) => {
  try {
    const index = await readIndex();
    const newId = index.length > 0 ? Math.max(...index.map(p => p.id)) + 1 : 1;
    const today = getTodayString();
    
    // 저장할 파일 결정 로직
    let targetFileName = `posts_${today}_1.json`;
    let maxSeq = 1;

    // 현재 날짜의 파일 목록 스캔
    const files = await fs.readdir(DATA_DIR);
    const todayFiles = files.filter(f => f.startsWith(`posts_${today}_`) && f.endsWith('.json'));
    
    if (todayFiles.length > 0) {
      // 시퀀스 번호 추출하여 가장 마지막 파일 찾기
      todayFiles.forEach(f => {
        const match = f.match(/_(\d+)\.json$/);
        if (match) {
          const seq = parseInt(match[1]);
          if (seq > maxSeq) maxSeq = seq;
        }
      });
      targetFileName = `posts_${today}_${maxSeq}.json`;
      
      // 파일 크기 체크 (1MB 제한)
      const stats = await fs.stat(path.join(DATA_DIR, targetFileName));
      if (stats.size > 1024 * 1024) { // 1MB 초과 시 새 파일 생성
        targetFileName = `posts_${today}_${maxSeq + 1}.json`;
      }
    }

    const postsInFile = await readDataFile(targetFileName);
    
    const newPost = {
      id: newId,
      ...req.body,
      date: new Date().toISOString().split('T')[0],
      comments: []
    };
    
    // 데이터 파일에 저장
    postsInFile.push(newPost);
    await writeDataFile(targetFileName, postsInFile);

    // 인덱스 파일 업데이트 (메타데이터만 저장)
    index.push({
      id: newId,
      title: newPost.title,
      author: newPost.author,
      date: newPost.date,
      fileName: targetFileName
    });
    await writeIndex(index);

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

    const index = await readIndex();
    const entryIndex = index.findIndex(p => p.id === id);
    
    if (entryIndex === -1) return res.status(404).json({ error: 'Post not found' });
    
    const entry = index[entryIndex];
    const postsInFile = await readDataFile(entry.fileName);
    const postIndex = postsInFile.findIndex(p => p.id === id);

    if (postIndex === -1) return res.status(404).json({ error: 'Post content not found' });

    // 비밀번호 확인
    if (postsInFile[postIndex].password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    // 데이터 업데이트
    postsInFile[postIndex] = { ...postsInFile[postIndex], title, content, author };
    await writeDataFile(entry.fileName, postsInFile);

    // 인덱스 업데이트 (제목, 작성자 변경 반영)
    index[entryIndex] = { ...index[entryIndex], title, author };
    await writeIndex(index);

    res.json(postsInFile[postIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 댓글 작성
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const index = await readIndex();
    const entry = index.find(p => p.id === parseInt(req.params.id));
    if (!entry) return res.status(404).json({ error: 'Post not found' });

    const postsInFile = await readDataFile(entry.fileName);
    const postIndex = postsInFile.findIndex(p => p.id === parseInt(req.params.id));
    
    if (postIndex === -1) return res.status(404).json({ error: 'Post content not found' });

    const newComment = {
      id: Date.now(),
      content: req.body.content,
      author: '익명', // 로그인 기능이 없으므로 익명 처리
      date: new Date().toISOString().split('T')[0]
    };
    
    postsInFile[postIndex].comments.push(newComment);
    await writeDataFile(entry.fileName, postsInFile);
    
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

    const index = await readIndex();
    const entryIndex = index.findIndex(p => p.id === id);
    
    if (entryIndex === -1) return res.status(404).json({ error: 'Post not found' });
    
    const entry = index[entryIndex];
    const postsInFile = await readDataFile(entry.fileName);
    const postIndex = postsInFile.findIndex(p => p.id === id);

    if (postIndex === -1) return res.status(404).json({ error: 'Post content not found' });

    // 비밀번호 확인
    if (postsInFile[postIndex].password !== password) {
      return res.status(403).json({ error: 'Incorrect password' });
    }

    // 데이터 파일에서 삭제
    postsInFile.splice(postIndex, 1);
    await writeDataFile(entry.fileName, postsInFile);

    // 인덱스 파일에서 삭제
    index.splice(entryIndex, 1);
    await writeIndex(index);

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

    const index = await readIndex();
    const entry = index.find(p => p.id === id);
    if (!entry) return res.status(404).json({ error: 'Post not found' });

    const postsInFile = await readDataFile(entry.fileName);
    const post = postsInFile.find(p => p.id === id);
    if (!post) return res.status(404).json({ error: 'Post content not found' });

    if (post.password !== password) {
      return res.status(403).json({ valid: false, error: 'Incorrect password' });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});