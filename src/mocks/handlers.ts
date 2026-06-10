import { http, HttpResponse, delay } from "msw";
import { MOCK_ME, MOCK_POSTS, MOCK_USERS, MOCK_COMMENTS } from "./data";
import type { Post, Comment } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let posts: Post[] = [...MOCK_POSTS];
let comments: Comment[] = [...MOCK_COMMENTS];

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/auth/login`, async () => {
    await delay(400);
    return HttpResponse.json({ token: "mock-jwt-token", user: MOCK_ME });
  }),

  http.post(`${BASE}/api/v1/auth/register`, async () => {
    await delay(500);
    return HttpResponse.json({ token: "mock-jwt-token", user: MOCK_ME });
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
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${BASE}/api/v1/posts/:id/likes`, async ({ params }) => {
    await delay(150);
    const id = Number(params.id);
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: false, likesCount: Math.max(0, p.likesCount - 1) } : p
    );
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Comments ──────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/posts/:id/comments`, async ({ params }) => {
    await delay(250);
    const postComments = comments.filter((c) => c.postId === Number(params.id) && !c.parentId);
    return HttpResponse.json({
      data: postComments,
      total: postComments.length,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  }),

  http.post(`${BASE}/api/v1/posts/:id/comments`, async ({ request, params }) => {
    await delay(300);
    const body = (await request.json()) as { content: string };
    const newComment: Comment = {
      id: Date.now(),
      content: body.content,
      author: MOCK_ME,
      postId: Number(params.id),
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    comments = [newComment, ...comments];
    posts = posts.map((p) =>
      p.id === newComment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    );
    return HttpResponse.json(newComment, { status: 201 });
  }),

  // ── Profile edit ──────────────────────────────────────────────────────────

  http.patch(`${BASE}/api/v1/users/me`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as Partial<typeof MOCK_ME>;
    return HttpResponse.json({ ...MOCK_ME, ...body });
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
