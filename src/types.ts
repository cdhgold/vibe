// 댓글 타입 정의
export interface Comment {
  id: number;
  content: string;
  author: string;
  date: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  comments?: Comment[];
  fileName?: string;
  password?: string;
}

export interface NewPost {
  title: string;
  content: string;
  author: string;
  password?: string;
}