import type { Post, NewPost, Comment } from '../types';

const mockData = {
  posts: [
    { id: 1, title: 'Vite로 만든 게시판', content: 'Vite는 정말 빠릅니다.', author: '김속도', date: '2023-10-27', comments: [] },
    { id: 2, title: '리액트 컴포넌트 구조', content: '컴포넌트를 잘 나누는 것이 중요합니다.', author: '이구조', date: '2023-10-28', comments: [] },
  ] as Post[],
  nextId: 3,
};

const api = {
  getPosts: (): Promise<Post[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockData.posts]), 300);
    });
  },
  getPostById: (id: string): Promise<Post> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const post = mockData.posts.find((p) => p.id === parseInt(id));
        post ? resolve(post) : reject('Post not found');
      }, 300);
    });
  },
  createPost: (newPost: NewPost): Promise<Post> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post: Post = {
          ...newPost,
          id: mockData.nextId++,
          date: new Date().toISOString().slice(0, 10),
          comments: []
        };
        mockData.posts.unshift(post);
        resolve(post);
      }, 300);
    });
  },
  addComment: (postId: string, commentContent: string): Promise<Comment | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = mockData.posts.find((p) => p.id === parseInt(postId));
        if (post) {
          const newComment: Comment = {
            id: Math.random(),
            content: commentContent,
            author: '익명',
            date: new Date().toISOString().slice(0, 10)
          };
          if (!post.comments) post.comments = [];
          post.comments.push(newComment);
          resolve(newComment);
        } else {
          resolve(null);
        }
      }, 200);
    });
  }
};

export default api;