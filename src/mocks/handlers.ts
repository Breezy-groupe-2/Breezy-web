import { http, HttpResponse, delay } from 'msw';
import { MOCK_ME, MOCK_POSTS, MOCK_USERS, MOCK_COMMENTS } from './data';
import type { Post } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let posts: Post[] = [...MOCK_POSTS];
const likedPosts = new Set<number>([1]);

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/auth/login`, async () => {
    await delay(400);
    return HttpResponse.json({ token: 'mock-jwt-token', user: MOCK_ME });
  }),

  http.post(`${BASE}/api/v1/auth/register`, async () => {
    await delay(500);
    return HttpResponse.json({ token: 'mock-jwt-token', user: MOCK_ME });
  }),

  // ── Current user ──────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/users/me`, async () => {
    await delay(200);
    return HttpResponse.json(MOCK_ME);
  }),

  http.get(`${BASE}/api/v1/users/:username`, async ({ params }) => {
    await delay(200);
    const user = MOCK_USERS.find((u) => u.username === params.username);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  // ── Posts ─────────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/posts`, async () => {
    await delay(300);
    return HttpResponse.json({
      data: posts,
      total: posts.length,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  }),

  http.post(`${BASE}/api/v1/posts`, async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { content: string };
    const newPost: Post = {
      id: Date.now(),
      content: body.content,
      author: MOCK_ME,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    posts = [newPost, ...posts];
    return HttpResponse.json(newPost, { status: 201 });
  }),

  http.get(`${BASE}/api/v1/posts/:id`, async ({ params }) => {
    await delay(200);
    const post = posts.find((p) => p.id === Number(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(post);
  }),

  // ── Likes ─────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/posts/:id/likes`, async ({ params }) => {
    await delay(150);
    const id = Number(params.id);
    likedPosts.add(id);
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${BASE}/api/v1/posts/:id/likes`, async ({ params }) => {
    await delay(150);
    const id = Number(params.id);
    likedPosts.delete(id);
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: false, likesCount: Math.max(0, p.likesCount - 1) } : p
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Comments ──────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/posts/:id/comments`, async () => {
    await delay(250);
    return HttpResponse.json({
      data: MOCK_COMMENTS,
      total: MOCK_COMMENTS.length,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  }),

  // ── Follow ────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/users/:username/follow`, async () => {
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${BASE}/api/v1/users/:username/follow`, async () => {
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── User posts ────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/users/:username/posts`, async ({ params }) => {
    await delay(250);
    const userPosts = posts.filter((p) => p.author.username === params.username);
    return HttpResponse.json({
      data: userPosts,
      total: userPosts.length,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  }),
];
