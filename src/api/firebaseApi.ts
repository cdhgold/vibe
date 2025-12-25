import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// This file provides a thin Firestore-backed API. It is NOT wired by default.
// To enable in your app, change the export in `src/api/index.ts` to `firebaseApi`.

const firebaseApi = {
  getPosts: async (): Promise<any[]> => {
    if (!db) throw new Error('Firebase not configured. Set VITE_FIREBASE_* env vars.');
    const snap = await getDocs(collection(db, 'posts'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  getPostById: async (id: string): Promise<any> => {
    if (!db) throw new Error('Firebase not configured.');
    const dRef = doc(db, 'posts', id);
    const dSnap = await getDoc(dRef);
    if (!dSnap.exists()) throw new Error('Post not found');
    return { id: dSnap.id, ...dSnap.data() };
  },

  createPost: async (newPost: any): Promise<any> => {
    if (!db) throw new Error('Firebase not configured.');
    const data = {
      ...newPost,
      date: new Date().toISOString().slice(0, 10),
      comments: [],
    };
    const ref = await addDoc(collection(db, 'posts'), data);
    return { id: ref.id, ...data };
  },

  addComment: async (postId: string, commentContent: string): Promise<any | null> => {
    if (!db) throw new Error('Firebase not configured.');
    const pRef = doc(db, 'posts', postId);
    const pSnap = await getDoc(pRef);
    if (!pSnap.exists()) return null;
    const prev = pSnap.data() as any;
    const newComment = {
      id: Date.now().toString(),
      content: commentContent,
      author: '익명',
      date: new Date().toISOString().slice(0, 10),
    };
    const updated = { comments: [...(prev.comments || []), newComment] };
    await updateDoc(pRef, updated);
    return newComment;
  }
};

export default firebaseApi;
