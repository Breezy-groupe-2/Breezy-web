import { http, HttpResponse, delay } from "msw";
import { MOCK_ME, MOCK_POSTS, MOCK_USERS, MOCK_COMMENTS, MOCK_REPORTS, MOCK_MOD_ACCOUNTS } from "./data";
import type { Post, Comment, User, ModAccount, Report } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let posts: Post[] = [...MOCK_POSTS];
let comments: Comment[] = [...MOCK_COMMENTS];
let users: User[] = [...MOCK_USERS, MOCK_ME];
let reports: Report[] = [...MOCK_REPORTS];
let modAccounts: ModAccount[] = [...MOCK_MOD_ACCOUNTS];

function buildToken(username: string) {
  return `mock-jwt-token:${username}`;
}

function currentUsername(request: Request) {
  const raw = request.headers.get("authorization");
  if (!raw) return null;
  const token = raw.replace(/^Bearer\s+/i, "");
  const match = token.match(/^mock-jwt-token:(.+)$/);
  return match?.[1] ?? null;
}

function findUserByLogin(email?: string, username?: string) {
  return (
    users.find((u) => u.email === email || u.username === username || u.username === email) ??
    null
  );
}

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/auth/login`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { email?: string; password?: string };
    const user = findUserByLogin(body.email) ?? MOCK_ME;
    return HttpResponse.json({ token: buildToken(user.username), user });
  }),

  http.post(`${BASE}/api/v1/auth/register`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as { email?: string; password?: string; username?: string };
    const username = body.username?.trim() || `user-${Date.now()}`;
    const user: User = {
      id: String(Date.now()),
      username,
      displayName: username,
      email: body.email ?? `${username}@example.com`,
      bio: "",
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    users = [...users, user];
    return HttpResponse.json({ token: buildToken(user.username), user });
  }),

  http.post(`${BASE}/api/v1/auth/google`, async () => {
    await delay(600);
    return HttpResponse.json({ token: buildToken(MOCK_ME.username), user: MOCK_ME });
  }),

  // ── Current user ──────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/users/me`, async ({ request }) => {
    await delay(200);
    const username = currentUsername(request);
    const user = username ? users.find((u) => u.username === username) : null;
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(user);
  }),

  http.get(`${BASE}/api/v1/auth/me`, async ({ request }) => {
    await delay(200);
    const username = currentUsername(request);
    const user = username ? users.find((u) => u.username === username) : null;
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(user);
  }),

  http.get(`${BASE}/api/v1/users/:username`, async ({ params }) => {
    await delay(200);
    const user = users.find((u) => u.username === params.username);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  // ── Posts ─────────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/feed`, async () => {
    await delay(300);
    return HttpResponse.json(posts);
  }),

  http.get(`${BASE}/api/v1/posts`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const authorIdsParam = url.searchParams.get("authorIds");
    const limitParam = url.searchParams.get("limit");
    const authorIds = authorIdsParam ? authorIdsParam.split(",") : null;
    let result = authorIds ? posts.filter((p) => authorIds.includes(p.author.id)) : posts;
    const limit = limitParam ? Number(limitParam) : null;
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    return HttpResponse.json(result);
  }),

  http.get(`${BASE}/api/v1/posts/me`, async ({ request }) => {
    await delay(300);
    const username = currentUsername(request);
    if (!username) return new HttpResponse(null, { status: 401 });
    const userPosts = posts.filter((p) => p.author.username === username);
    return HttpResponse.json(userPosts);
  }),

  http.post(`${BASE}/api/v1/posts`, async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { content: string; mediaUrl?: string };
    const newPost: Post = {
      id: String(Date.now()),
      content: body.content,
      mediaUrl: body.mediaUrl,
      author: MOCK_ME,
      likeCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    posts = [newPost, ...posts];
    return HttpResponse.json(newPost, { status: 201 });
  }),

  http.post(`${BASE}/api/v1/media/upload`, async () => {
    await delay(600);
    const seed = Math.floor(Math.random() * 200) + 1;
    return HttpResponse.json({ url: `https://picsum.photos/seed/${seed}/800/600` });
  }),

  http.get(`${BASE}/api/v1/posts/:id`, async ({ params }) => {
    await delay(200);
    const post = posts.find((p) => p.id === params.id);
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(post);
  }),

  http.put(`${BASE}/api/v1/posts/:id`, async ({ request, params }) => {
    await delay(250);
    const body = (await request.json()) as { content: string };
    posts = posts.map((p) =>
      p.id === params.id ? { ...p, content: body.content } : p
    );
    const updated = posts.find((p) => p.id === params.id);
    if (!updated) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(updated);
  }),

  http.delete(`${BASE}/api/v1/posts/:id`, async ({ params }) => {
    await delay(200);
    posts = posts.filter((p) => p.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Likes ─────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/posts/:id/like`, async ({ params }) => {
    await delay(150);
    const id = params.id;
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: true, likeCount: p.likeCount + 1 } : p
    );
    const updated = posts.find((p) => p.id === id);
    return HttpResponse.json({ id, likeCount: updated?.likeCount ?? 0 });
  }),

  http.delete(`${BASE}/api/v1/posts/:id/like`, async ({ params }) => {
    await delay(150);
    const id = params.id;
    posts = posts.map((p) =>
      p.id === id ? { ...p, isLiked: false, likeCount: Math.max(0, p.likeCount - 1) } : p
    );
    const updated = posts.find((p) => p.id === id);
    return HttpResponse.json({ id, likeCount: updated?.likeCount ?? 0 });
  }),

  // ── Comments ──────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/posts/:id/comments`, async ({ params }) => {
    await delay(250);
    const postComments = comments.filter((c) => c.postId === params.id && !c.parentId);
    return HttpResponse.json(postComments);
  }),

  http.post(`${BASE}/api/v1/posts/:id/comments`, async ({ request, params }) => {
    await delay(300);
    const body = (await request.json()) as { content: string };
    const newComment: Comment = {
      id: String(Date.now()),
      content: body.content,
      author: MOCK_ME,
      postId: params.id as string,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    comments = [newComment, ...comments];
    posts = posts.map((p) =>
      p.id === newComment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    );
    return HttpResponse.json(newComment, { status: 201 });
  }),

  http.get(`${BASE}/api/v1/comments/:commentId/replies`, async ({ params }) => {
    await delay(200);
    const replies = comments.filter((c) => c.parentId === params.commentId);
    return HttpResponse.json(replies);
  }),

  // ── Profile edit ──────────────────────────────────────────────────────────

  http.put(`${BASE}/api/v1/users/me`, async ({ request }) => {
    await delay(300);
    const username = currentUsername(request);
    if (!username) return new HttpResponse(null, { status: 401 });
    const body = (await request.json()) as Partial<typeof MOCK_ME>;
    const updated = users.find((u) => u.username === username);
    if (!updated) return new HttpResponse(null, { status: 404 });
    const next = { ...updated, ...body };
    users = users.map((u) => (u.username === username ? next : u));
    return HttpResponse.json(next);
  }),

  http.patch(
    `${BASE}/api/v1/users/me/preferences`,
    async ({ request }) => {
      await delay(200);
      const username = currentUsername(request);
      if (!username) return new HttpResponse(null, { status: 401 });
      const updated = users.find((u) => u.username === username);
      if (!updated) return new HttpResponse(null, { status: 404 });
      const body = (await request.json()) as { theme: { mode: "light" | "dark"; accentColor: string } };
      const nextPreferences = {
        ...updated.preferences,
        theme: { ...updated.preferences?.theme, ...body.theme },
      };
      const next = { ...updated, preferences: nextPreferences };
      users = users.map((u) => (u.username === username ? next : u));
      return HttpResponse.json(next.preferences);
    }
  ),

  // ── Follow ────────────────────────────────────────────────────────────────

  http.post(`${BASE}/api/v1/users/:username/follow`, async () => {
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${BASE}/api/v1/users/:username/follow`, async () => {
    await delay(200);
    return new HttpResponse(null, { status: 204 });
  }),

  // ── Followers / Following ─────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/users/:username/followers`, async ({ params }) => {
    await delay(200);
    const user = users.find((u) => u.username === params.username);
    const count = user?.followersCount ?? 0;
    const list = users.slice(0, Math.min(count, users.length));
    return HttpResponse.json(list);
  }),

  http.get(`${BASE}/api/v1/users/:username/following`, async ({ params }) => {
    await delay(200);
    const user = users.find((u) => u.username === params.username);
    const count = user?.followingCount ?? 0;
    const list = users.slice(0, Math.min(count, users.length));
    return HttpResponse.json(list);
  }),

  // ── User posts ────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/posts/user/:username`, async ({ params }) => {
    await delay(250);
    const userPosts = posts.filter((p) => p.author.username === params.username);
    return HttpResponse.json(userPosts);
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────

  http.get(`${BASE}/api/v1/moderation/reports`, async () => {
    await delay(300);
    return HttpResponse.json(reports);
  }),

  http.post(`${BASE}/api/v1/moderation/reports/:id/dismiss`, async ({ params }) => {
    await delay(250);
    reports = reports.filter((r) => r.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete(`${BASE}/api/v1/moderation/content/:reportId`, async ({ params }) => {
    await delay(250);
    reports = reports.filter((r) => r.id !== params.reportId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/api/v1/moderation/accounts`, async () => {
    await delay(300);
    return HttpResponse.json(modAccounts);
  }),

  http.patch(`${BASE}/api/v1/users/:username/moderation`, async ({ params, request }) => {
    await delay(250);
    const body = (await request.json()) as {
      status: ModAccount["status"];
      durationHours?: number;
      reason?: string;
    };
    modAccounts = modAccounts.map((a) =>
      a.username === params.username ? { ...a, status: body.status } : a
    );
    reports = reports.filter((r) => r.author.username !== params.username);
    return HttpResponse.json(modAccounts.find((a) => a.username === params.username));
  }),
];
