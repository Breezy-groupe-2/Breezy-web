# api-contract-alignment - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** The front-end will call the correct API endpoints with the correct HTTP methods and data shapes, matching the documented API contract. Server error messages will display correctly, usernames will accept the right length, and the mock dev server will simulate the real backend accurately.

**Why this approach:** We're fixing all URLs, HTTP methods, and field names to match the contract while keeping the front-end's richer data model (display names, follow counts, like state, embedded author objects). This avoids a massive UI rewrite — the contract is likely a simplified view of what the backend actually returns via Mongoose population. We keep username-based profile URLs for good UX and keep the full moderation panel as an optional beyond-contract feature.

**What it will NOT do:** No backend changes, no URL structure changes (keeping `/profile/username`), no removal of display names or follow counts, no removal of Google sign-in or the moderation reports panel, no new test framework.

**Effort:** Medium
**Risk:** Medium — we assume the backend accepts usernames where the contract specifies IDs, and returns extra fields (displayName, counts, isLiked) not documented in the contract. If either assumption is wrong, profile/follow calls will 404 or the UI will show missing data.
**Decisions to sanity-check:** (1) username-in-`:id`-param assumption, (2) keeping extra fields not in the contract, (3) keeping moderation reports/content-deletion beyond the contract.

Your next move: approve, or run a high-accuracy review. Full execution detail follows below.

---

> TL;DR (machine): Medium effort, Medium risk — 12 todos across 3 waves aligning front-end API layer to contract (URLs, methods, ID types, field names, error handling, missing endpoints) while keeping richer data model, username routes, and full moderation panel.

## Scope
### Must have
- Contract source of truth: `/home/sliiz/breezy/Breezy-api/docs/api-contract.md` (absolute path, exists in sibling repo — verified during planning)
- All ID types changed from `number` to `string` across types, mocks, API functions, and component props
- `Post.likesCount` renamed to `Post.likeCount` (contract field name) across all files
- `PaginatedResponse<T>` type removed; all list endpoints return bare arrays
- `auth.api.ts:getMe` calls `GET /auth/me` (was `/users/me`)
- `posts.api.ts`: `updatePost` uses `PUT` (was `PATCH`); like/unlike use `/like` singular (was `/likes`); `getUserPosts` calls `GET /posts/user/:username` (was `/users/:username/posts`); `getAllPosts` removed (dead code); `getOwnPosts` (`GET /posts/me`) added; `getPostsByAuthors` (`GET /posts?authorIds=`) added
- `feed.api.ts:getFeed` calls `GET /feed?limit=` (was `GET /posts`)
- `comments.api.ts`: `addReply` return type changed from `Comment` to `Reply`; `getReplies` (`GET /comments/:id/replies`) added
- `profile.api.ts`: `updateProfile` uses `PUT` (was `PATCH`); `avatarUrl` added to payload; `updatePreferences` (`PATCH /users/me/preferences`) added
- `admin.api.ts:setAccountStatus` calls `PATCH /users/:username/moderation` with `{ status, durationHours?, reason }` (was `PATCH /moderation/accounts/:username`)
- Error handling in auth forms reads `data.error` (was `data.message`)
- Username validation changed from 3-20 to 3-50 in RegisterStep2Form and ConversationalAuth
- MSW mocks updated to match all above changes; mock handlers added for missing contract endpoints
- `Number(id)` conversion removed from `post/[id]/page.tsx`

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No removal of `displayName`, `followersCount`, `followingCount`, `isLiked`, `commentsCount`, or embedded `author` from the data model (Practical alignment — these are kept)
- No route structure changes (keeping `/profile/[username]`)
- No backend changes (Breezy-api is a separate repo)
- No UI redesign — only data-binding renames where fields change name
- No removal of Google sign-in or the moderation reports/content-deletion features
- No new test framework setup (no test infrastructure exists in this project)
- No `useInfiniteScroll` or pagination hook implementation (out of scope)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: none (no test framework exists; verification via `npm run lint` + `npm run build` + TypeScript compiler)
- Evidence: .omo/evidence/task-<N>-api-contract-alignment.txt (lint/build output)
- Per-todo: `npm run lint` must pass; after Wave 1 and Wave 3: `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` must pass
- Final wave: grep-audit that no `PaginatedResponse` imports remain, no `/likes` (plural) URLs remain, no `Number(id)` remains, no `data?.message` remains in auth forms

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means under-split.

- **Wave 1 (3 todos):** Types + mocks foundation. Must complete before Wave 2 because API files import types and mocks must match.
- **Wave 2 (5 todos):** API layer fixes. All 5 API files can be edited in parallel after Wave 1.
- **Wave 3 (4 todos):** Component & page updates. All 4 can be edited in parallel after Wave 2.
- **Final wave (4 checks):** Parallel verification audits.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 (types) | — | 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 | — |
| 2 (mock data) | 1 | 3 | — |
| 3 (mock handlers) | 1, 2 | — | — |
| 4 (auth.api) | 1 | 10, 11 | 5, 6, 7, 8 |
| 5 (posts.api) | 1 | 9, 11 | 4, 6, 7, 8 |
| 6 (feed.api) | 1 | 9 | 4, 5, 7, 8 |
| 7 (comments.api) | 1 | 11 | 4, 5, 6, 8 |
| 8 (profile/users/admin) | 1 | 11, 12 | 4, 5, 6, 7 |
| 9 (likesCount rename) | 1, 5, 6 | 11 | 10, 12 |
| 10 (error handling) | 1 | — | 4, 5, 6, 7, 8, 9, 11, 12 |
| 11 (ID type cleanup) | 1, 4, 5, 7, 8, 9 | — | 10, 12 |
| 12 (username validation) | 1 | — | 4, 5, 6, 7, 8, 9, 10, 11 |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

### Wave 1 — Types & mocks foundation

- [ ] 1. Realign TypeScript types to contract (ID types, field names, add Reply, remove PaginatedResponse)
  What to do / Must NOT do:
  - Change `User.id` from `number` to `string` (types/index.ts:4)
  - Change `Post.id` from `number` to `string` (types/index.ts:18)
  - Change `Comment.id` from `number` to `string` (types/index.ts:29)
  - Change `Like.id`, `Like.userId`, `Like.postId`, `Like.commentId` from `number` to `string` (types/index.ts:40-44)
  - Change `Follow.id`, `Follow.followerId`, `Follow.followingId` from `number` to `string` (types/index.ts:48-52)
  - Change `Notification.id`, `Notification.actorId`, `Notification.postId` from `number` to `string` (types/index.ts:55-60)
  - Rename `Post.likesCount` to `Post.likeCount` (types/index.ts:21)
  - Change `Post.author` type stays `User` (Practical: keep embedded author)
  - Change `Post.parentId` from `number` to `string` (types/index.ts:24)
  - Change `Comment.postId` from `number` to `string` (types/index.ts:32)
  - Change `Comment.parentId` from `number` to `string` (types/index.ts:33)
  - Change `Comment.likesCount` to `Comment.likeCount` (types/index.ts:34) — renamed for consistency with Post.likeCount; the field itself is kept (Practical: extra field not in contract, but name should be consistent)
  - Change `Comment.replies` type stays `Comment[]?` — do NOT change to `Reply[]` (CommentItem.tsx:130 renders replies recursively as Comment objects; Reply type is for API response typing only)
  - Add `role: "user" | "moderator" | "admin"` and `preferences?: { theme: { mode: "light" | "dark"; accentColor: string } }` to `User` interface (optional fields, since backend may not always return them)
  - Add new `Reply` interface: `{ id: string; parentCommentId: string; content: string; author: User; createdAt: string }` (Practical: keep embedded `author` instead of contract's `authorId`)
  - Remove `PaginatedResponse<T>` interface entirely (types/index.ts:90-96)
  - Must NOT remove `displayName`, `followersCount`, `followingCount`, `isLiked`, `commentsCount`, `status`, `isAdmin` from `User` or `Post` (Practical alignment keeps these)
  - Must NOT change `AuthResponse` shape (already `{ token: string; user: User }`)
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  References (executor has NO interview context):
  - src/types/index.ts:1-96 (entire file — all interfaces)
  - Breezy-api/docs/api-contract.md:46-117 (Common Models: User, Public Profile, Post, Comment, Reply, User Summary)
  - Breezy-api/docs/api-contract.md:633-644 (status code summary for error context)
  Acceptance criteria (agent-executable):
  - `npm run lint` passes with zero errors
  - `rg -n "PaginatedResponse" src/types/index.ts` returns no matches
  - `rg -n "id: number" src/types/index.ts` returns no matches
  - `rg -n "likesCount" src/types/index.ts` returns no matches (all renamed to likeCount)
  - `rg -n "interface Reply" src/types/index.ts` returns at least one match (new interface)
  QA scenarios (name the exact tool + invocation): happy: `npm run lint` exits 0 after edit; failure: TypeScript build would fail if `PaginatedResponse` is still imported anywhere (caught in Wave 2). Evidence .omo/evidence/task-1-api-contract-alignment.txt
  Commit: Y | refactor(types): align ID types to string, rename likesCount→likeCount, add Reply, remove PaginatedResponse

- [ ] 2. Update MSW mock data to string IDs, likeCount, role, preferences
  What to do / Must NOT do:
  - Change all `id: number` values to string IDs in MOCK_USERS (data.ts:5,16,27,38,49,61,73,85,97,109), MOCK_ME (data.ts:164), MOCK_POSTS (data.ts:179,188,197,206,215,224), MOCK_COMMENTS (data.ts:236,245) — use strings like `"u1"`, `"p1"`, `"c1"` etc.
  - Rename `likesCount` to `likeCount` in all MOCK_POSTS entries (data.ts:182,191,200,209,218,227) and MOCK_COMMENTS (data.ts:240,249)
  - Add `role: "user"` to all MOCK_USERS entries; add `role: "admin"` to MOCK_ME (data.ts:174 already has isAdmin: true, add role too)
  - Add `preferences: { theme: { mode: "dark", accentColor: "#1DA1F2" } }` to MOCK_ME and optionally to MOCK_USERS
  - Change `postId: 1` (data.ts:239,248) to `postId: "p1"` (string)
  - Must NOT remove `displayName`, `followersCount`, `followingCount`, `isLiked`, `commentsCount`, `status`, `isAdmin` from mock data
  - Must NOT change MOCK_REPORTS or MOCK_MOD_ACCOUNTS (they use string IDs already and are not part of the contract alignment)
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3
  References:
  - src/mocks/data.ts:1-253 (entire file)
  - src/types/index.ts (updated in task 1 — for new field names)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "likesCount" src/mocks/data.ts` returns no matches
  - `rg -n "id: [0-9]" src/mocks/data.ts` returns no matches (all IDs are now strings)
  - `rg -n "postId: [0-9]" src/mocks/data.ts` returns no matches (postId is now string)
  - `rg -n "role:" src/mocks/data.ts` returns at least 11 matches (one per user + MOCK_ME)
  QA scenarios: happy: lint passes; failure: TypeScript would error if mock data doesn't match updated types. Evidence .omo/evidence/task-2-api-contract-alignment.txt
  Commit: Y | refactor(mocks): update mock data to string IDs, likeCount, role, preferences

- [ ] 3. Update MSW handlers: remove pagination, fix URLs, add missing endpoints, fix methods
  What to do / Must NOT do:
  - Remove `PaginatedResponse` wrapping from all list handlers: posts list (handlers.ts:86-95 → return `posts` directly), comments list (handlers.ts:159-169 → return `postComments` directly), followers (handlers.ts:218-224 → return `list` directly), following (handlers.ts:226-232 → return `list` directly), user posts (handlers.ts:236-246 → return `userPosts` directly)
  - Change `GET /api/v1/posts` handler (handlers.ts:86) to `GET /api/v1/feed` — this is the feed endpoint now. Return `posts` directly (bare array).
  - Add new `GET /api/v1/posts` handler that accepts `?authorIds=` and `&limit=` query params (contract: List Posts by Authors). Parse `authorIds` from URL search params, filter posts by author IDs, return bare array.
  - Add new `GET /api/v1/posts/me` handler — return posts where `author.username === currentUsername(request)`, bare array
  - Change `GET /api/v1/users/:username` handler (handlers.ts:77) — keep as-is (returns user by username, which is our Practical approach)
  - Add new `GET /api/v1/auth/me` handler — return the current user (auth view) based on token. This is DIFFERENT from `GET /api/v1/users/me` which returns a public profile. For mocks, return the full user object.
  - Change `GET /api/v1/users/me` handler (handlers.ts:69) — keep it, it returns the public profile for the current user
  - Change `http.patch` for posts update (handlers.ts:120) to `http.put` — `PUT /api/v1/posts/:id`
  - Change `http.post` for likes (handlers.ts:139) from `/likes` to `/like` — `POST /api/v1/posts/:id/like`. Return `HttpResponse.json({ id: params.id, likeCount: <count> })` instead of 204 null.
  - Change `http.delete` for unlike (handlers.ts:148) from `/likes` to `/like` — `DELETE /api/v1/posts/:id/like`. Return `HttpResponse.json({ id: params.id, likeCount: <count> })` instead of 204 null.
  - Change `http.patch` for profile update (handlers.ts:192) to `http.put` — `PUT /api/v1/users/me`
  - Change all `Number(params.id)` comparisons (handlers.ts:115,124,126,133,141,150,161,178) to string comparison `params.id` (IDs are now strings)
  - Change `getUserPosts` mock handler (handlers.ts:236) from `/api/v1/users/:username/posts` to `/api/v1/posts/user/:username` — return bare array
  - Add new `GET /api/v1/comments/:commentId/replies` handler — return replies for a comment, bare array of Reply objects
  - Add new `PATCH /api/v1/users/me/preferences` handler — accept `{ theme: { mode, accentColor } }`, return updated preferences
  - Change `PATCH /api/v1/moderation/accounts/:username` (handlers.ts:272) to `PATCH /api/v1/users/:username/moderation` — accept `{ status, durationHours?, reason }` body
  - Rename `likesCount` to `likeCount` in all handler logic (handlers.ts:104,143,152,179) — note: line 185 is `commentsCount` not `likesCount`, do not rename it
  - Change `id: Date.now()` in register handler (handlers.ts:47) to `id: String(Date.now())` or `crypto.randomUUID()`
  - Change `id: Date.now()` in create post handler (handlers.ts:101) to string
  - Change `id: Date.now()` in create comment handler (handlers.ts:175) to string
  - Change `postId: Number(params.id)` in create comment handler (handlers.ts:178) to `postId: params.id` (string)
  - Must NOT remove Google auth handler, moderation reports/content-deletion handlers (kept per decision)
  - Must NOT remove `displayName`, `followersCount`, etc. from handler responses
  Parallelization: Wave 1 | Blocked by: 1, 2 | Blocks: none
  References:
  - src/mocks/handlers.ts:1-281 (entire file)
  - src/mocks/data.ts (updated in task 2)
  - Breezy-api/docs/api-contract.md:122-629 (all endpoint definitions)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "PaginatedResponse|data:\s*posts|data:\s*postComments|data:\s*list|data:\s*userPosts" src/mocks/handlers.ts` returns no matches (pagination removed)
  - `rg -n "/likes\b" src/mocks/handlers.ts` returns no matches (changed to /like)
  - `rg -n "http\.patch.*posts/:id" src/mocks/handlers.ts` returns no matches (changed to http.put)
  - `rg -n "http\.patch.*users/me\b" src/mocks/handlers.ts` returns no matches (changed to http.put; updatePreferences uses /users/me/preferences which is different)
  - `rg -n "/api/v1/feed" src/mocks/handlers.ts` returns at least one match
  - `rg -n "/api/v1/auth/me" src/mocks/handlers.ts` returns at least one match
  - `rg -n "/api/v1/posts/me" src/mocks/handlers.ts` returns at least one match
  - `rg -n "/api/v1/comments/:commentId/replies" src/mocks/handlers.ts` returns at least one match
  - `rg -n "Number\(params" src/mocks/handlers.ts` returns no matches (all Number() conversions removed)
  QA scenarios: happy: lint passes + `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` passes; failure: build fails if handler return shapes don't match updated types. Evidence .omo/evidence/task-3-api-contract-alignment.txt
  Commit: Y | refactor(mocks): align handlers to contract — remove pagination, fix URLs/methods, add missing endpoints

### Wave 2 — API layer fixes

- [ ] 4. Fix auth.api.ts — getMe path
  What to do / Must NOT do:
  - Change `getMe()` URL from `"/api/v1/users/me"` to `"/api/v1/auth/me"` (auth.api.ts:31)
  - Keep `loginUser`, `registerUser`, `loginWithGoogle` as-is (URLs and payloads already match contract)
  - Must NOT change payload shapes or return types
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 11 | Can parallelize with: 5, 6, 7, 8, 10, 12
  References:
  - src/features/auth/auth.api.ts:30-33 (getMe function)
  - Breezy-api/docs/api-contract.md:176-190 (GET /auth/me endpoint)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n 'users/me' src/features/auth/auth.api.ts` returns no matches
  - `rg -n 'auth/me' src/features/auth/auth.api.ts` returns at least one match
  QA scenarios: happy: lint passes; failure: TypeScript would error if return type doesn't match User. Evidence .omo/evidence/task-4-api-contract-alignment.txt
  Commit: Y | fix(auth): change getMe endpoint from /users/me to /auth/me

- [ ] 5. Fix posts.api.ts — methods, URLs, add missing endpoints, remove PaginatedResponse
  What to do / Must NOT do:
  - Remove `getAllPosts()` function entirely (posts.api.ts:4-7) — it's dead code (no callers; the home page uses `getFeed()` from feed.api.ts)
  - Change `getPost(id)` parameter type from `number` to `string` (posts.api.ts:9)
  - Change `createPost` — keep as-is (URL and payload match contract)
  - Change `updatePost(id, content)` parameter type from `number` to `string`; change HTTP method from `apiClient.patch` to `apiClient.put` (posts.api.ts:19-21)
  - Change `deletePost(id)` parameter type from `number` to `string` (posts.api.ts:24)
  - Change `likePost(id)` parameter type from `number` to `string`; change URL from `/likes` to `/like`; change return type from `Promise<void>` to `Promise<{ id: string; likeCount: number }>`; return `data` (posts.api.ts:28-30)
  - Change `unlikePost(id)` parameter type from `number` to `string`; change URL from `/likes` to `/like`; change return type from `Promise<void>` to `Promise<{ id: string; likeCount: number }>`; return `data` (posts.api.ts:32-34)
  - Change `getUserPosts(username)` URL from `/api/v1/users/${username}/posts` to `/api/v1/posts/user/${username}`; remove `PaginatedResponse` wrapper — change `apiClient.get<PaginatedResponse<Post>>` to `apiClient.get<Post[]>` and return `data` directly (posts.api.ts:36-41)
  - Remove `import type { Post, PaginatedResponse }` → change to `import type { Post }` (posts.api.ts:2)
  - Add new `getOwnPosts()` function: `apiClient.get<Post[]>("/api/v1/posts/me")` → return `data`
  - Add new `getPostsByAuthors(authorIds: string[], limit?: number)` function: `apiClient.get<Post[]>("/api/v1/posts", { params: { authorIds: authorIds.join(","), limit } })` → return `data`
  - Must NOT change `createPost` URL or payload
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 9, 11 | Can parallelize with: 4, 6, 7, 8
  References:
  - src/features/posts/posts.api.ts:1-41 (entire file)
  - Breezy-api/docs/api-contract.md:322-456 (Posts section: all endpoints)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "PaginatedResponse" src/features/posts/posts.api.ts` returns no matches
  - `rg -n "/likes" src/features/posts/posts.api.ts` returns no matches
  - `rg -n "apiClient.patch" src/features/posts/posts.api.ts` returns no matches
  - `rg -n "getOwnPosts" src/features/posts/posts.api.ts` returns at least one match
  - `rg -n "getPostsByAuthors" src/features/posts/posts.api.ts` returns at least one match
  - `rg -n "posts/user/" src/features/posts/posts.api.ts` returns at least one match
  QA scenarios: happy: lint passes; failure: TypeScript would error if callers pass number IDs (caught in Wave 3). Evidence .omo/evidence/task-5-api-contract-alignment.txt
  Commit: Y | fix(posts): align to contract — PUT for update, /like singular, /posts/user/:id, add getOwnPosts and getPostsByAuthors

- [ ] 6. Fix feed.api.ts — getFeed URL, remove PaginatedResponse
  What to do / Must NOT do:
  - Change `getFeed()` URL from `"/api/v1/posts"` to `"/api/v1/feed"` (feed.api.ts:5)
  - Remove `PaginatedResponse` wrapper — change `apiClient.get<PaginatedResponse<Post>>` to `apiClient.get<Post[]>` and return `data` directly (feed.api.ts:5-6)
  - Change import from `import type { Post, PaginatedResponse }` to `import type { Post }` (feed.api.ts:2)
  - Add optional `limit` parameter: `getFeed(limit?: number)` — if provided, add `{ params: { limit } }` to the request
  - Must NOT change return type (stays `Promise<Post[]>`)
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 9 | Can parallelize with: 4, 5, 7, 8
  References:
  - src/features/feed/feed.api.ts:1-7 (entire file)
  - Breezy-api/docs/api-contract.md:610-629 (GET /feed endpoint)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "PaginatedResponse" src/features/feed/feed.api.ts` returns no matches
  - `rg -n '/api/v1/posts' src/features/feed/feed.api.ts` returns no matches
  - `rg -n '/api/v1/feed' src/features/feed/feed.api.ts` returns at least one match
  QA scenarios: happy: lint passes; failure: build fails if home page still expects pagination (it doesn't — it already receives Post[]). Evidence .omo/evidence/task-6-api-contract-alignment.txt
  Commit: Y | fix(feed): change getFeed endpoint from /posts to /feed, remove pagination wrapper

- [ ] 7. Fix comments.api.ts — remove PaginatedResponse, addReply return type, add getReplies
  What to do / Must NOT do:
  - Change `getComments(postId)` parameter type from `number` to `string`; remove `PaginatedResponse` wrapper — change `apiClient.get<PaginatedResponse<Comment>>` to `apiClient.get<Comment[]>` and return `data` directly (comments.api.ts:4-9)
  - Change `addComment(postId, content)` parameter type from `number` to `string` (comments.api.ts:11)
  - Change `addReply(commentId, content)` parameter type from `number` to `string`; change return type from `Promise<Comment>` to `Promise<Reply>`; change `apiClient.post<Comment>` to `apiClient.post<Reply>` (comments.api.ts:19-24). Note: the caller in post/[id]/page.tsx does NOT use the return value of addReply (it constructs an optimistic reply locally at :317-338), so no component change is needed for this return type change. NOTE: post/[id]/page.tsx:316-338 currently does not call `addReply` API at all — it only updates local state. This is a pre-existing bug and is OUT OF SCOPE for this plan (contract alignment only, not feature implementation). Wiring `addReply` into the onReply handler is a separate task.
  - Remove `import type { Comment, PaginatedResponse }` → change to `import type { Comment, Reply }` (comments.api.ts:2)
  - Add new `getReplies(commentId: string): Promise<Reply[]>` function: `apiClient.get<Reply[]>(\`/api/v1/comments/${commentId}/replies\`)` → return `data`
  - Must NOT change `addComment` URL or payload
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 11 | Can parallelize with: 4, 5, 6, 8
  References:
  - src/features/comments/comments.api.ts:1-25 (entire file)
  - Breezy-api/docs/api-contract.md:460-538 (Comments section)
  - src/types/index.ts (updated in task 1 — for Reply type)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "PaginatedResponse" src/features/comments/comments.api.ts` returns no matches
  - `rg -n "Promise<Comment>" src/features/comments/comments.api.ts` returns no matches in addReply (should be Promise<Reply>)
  - `rg -n "getReplies" src/features/comments/comments.api.ts` returns at least one match
  QA scenarios: happy: lint passes; failure: TypeScript would error if post detail page passes number to getComments (caught in Wave 3). Evidence .omo/evidence/task-7-api-contract-alignment.txt
  Commit: Y | fix(comments): remove pagination, type addReply as Reply, add getReplies endpoint

- [ ] 8. Fix profile.api.ts, users.api.ts, admin.api.ts — methods, URLs, add updatePreferences, align moderation
  What to do / Must NOT do:
  - **profile.api.ts:**
    - Change `updateProfile` HTTP method from `apiClient.patch` to `apiClient.put` (profile.api.ts:13)
    - Add `avatarUrl?: string` to the `updateProfile` payload type (profile.api.ts:9-12) — contract accepts `{ bio?, avatarUrl? }`; keep `displayName?` too (Practical: backend likely accepts it)
    - Add new `updatePreferences(payload: { theme: { mode: "light" | "dark"; accentColor: string } }): Promise<User>` function: `apiClient.patch("/api/v1/users/me/preferences", payload)` → return `data`. NOTE: This function is intentionally added for API coverage only — no UI consumer is wired in this plan. The settings page (settings/page.tsx:20-22) currently manages theme via local localStorage only. Wiring `updatePreferences` to the settings/theme flow is a separate task outside this plan's scope.
    - Keep `getProfile(username)` as-is (URL `/api/v1/users/${username}` stays — Practical: username in :id param)
  - **users.api.ts:**
    - Remove `PaginatedResponse` from `getFollowers` — change `apiClient.get<PaginatedResponse<User>>` to `apiClient.get<User[]>` and return `data` directly (users.api.ts:12-17)
    - Remove `PaginatedResponse` from `getFollowing` — change `apiClient.get<PaginatedResponse<User>>` to `apiClient.get<User[]>` and return `data` directly (users.api.ts:19-23)
    - Change import from `import type { User, PaginatedResponse }` to `import type { User }` (users.api.ts:2)
    - Keep `followUser`, `unfollowUser` as-is (URLs and methods match contract, username in :id param per Practical decision)
  - **admin.api.ts:**
    - Change `setAccountStatus(username, status)` to call `PATCH /api/v1/users/${username}/moderation` with body `{ status, reason: "Moderation action" }` (admin.api.ts:22-23) — contract requires `reason` field; `durationHours` is optional, omit it
    - Keep `getReports`, `dismissReport`, `deleteContent`, `getModAccounts` as-is (these are beyond-contract optional features, kept per decision)
    - Must NOT remove the reports/content-deletion functions
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 11, 12 | Can parallelize with: 4, 5, 6, 7
  References:
  - src/features/profile/profile.api.ts:1-15 (entire file)
  - src/features/users/users.api.ts:1-24 (entire file)
  - src/features/admin/admin.api.ts:1-24 (entire file)
  - Breezy-api/docs/api-contract.md:194-318 (Users section: profile, preferences, moderation)
  - Breezy-api/docs/api-contract.md:542-606 (Follows section)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "PaginatedResponse" src/features/users/users.api.ts` returns no matches
  - `rg -n "apiClient.patch.*users/me" src/features/profile/profile.api.ts` returns no matches in updateProfile (should be put); but updatePreferences uses patch
  - `rg -n "updatePreferences" src/features/profile/profile.api.ts` returns at least one match
  - `rg -n "moderation/accounts" src/features/admin/admin.api.ts` returns no matches
  - `rg -n "users/.*moderation" src/features/admin/admin.api.ts` returns at least one match
  QA scenarios: happy: lint passes; failure: TypeScript would error if admin page passes wrong args to setAccountStatus (it passes username + status, which still works). Evidence .omo/evidence/task-8-api-contract-alignment.txt
  Commit: Y | fix(profile,users,admin): PUT for profile update, remove pagination, align moderation to /users/:id/moderation, add updatePreferences

### Wave 3 — Component & page updates

- [ ] 9. Rename likesCount→likeCount and fix ID types in all components and pages
  What to do / Must NOT do:
  - **PostCard.tsx:** Change `onLike?: (id: number) => void` to `(id: string) => void` (:12); `onDelete?: (id: number)` to `(id: string)` (:13); `onUpdate?: (id: number, ...)` to `(id: string, ...)` (:14); change `count={post.likesCount}` to `count={post.likeCount}` (:243)
  - **home/page.tsx:** Change `handleLike(id: number)` to `(id: string)` (:67); change optimistic post `id: Date.now()` to `id: crypto.randomUUID()` (:43); change all `p.likesCount` to `p.likeCount` (:76,77,89); change `handleDelete(id: number)` to `(id: string)` (:97); change `handleUpdate(id: number, ...)` to `(id: string, ...)` (:106)
  - **profile/[username]/page.tsx:** Change `handleLike(id: number)` to `(id: string)` (:62); change all `p.likesCount` to `p.likeCount` (:68,77,78)
  - **post/[id]/page.tsx:** Remove `Number(id)` conversion (:45) — change `getPost(Number(id))` to `getPost(id)` and `getComments(Number(id))` to `getComments(id)`; change `handleLikeComment(commentId: number)` to `(commentId: string)` (:98); change all `p.likesCount`/`c.likesCount` to `p.likeCount`/`c.likeCount` (:58,105,270,295); change optimistic reply `id: Date.now()` to `id: crypto.randomUUID()` (:325); change `postId: post.id` stays string now (:328); change `likesCount: 0` to `likeCount: 0` (:330)
  - **CommentItem.tsx:** Change `onReply?: (commentId: number, ...)` to `(commentId: string, ...)` (:11); `onLike?: (commentId: number)` to `(commentId: string)` (:12); change `comment.likesCount` to `comment.likeCount` (:87)
  - **post/[id]/page.tsx:** Change `c.likesCount` to `c.likeCount` in handleLikeComment (:105); change optimistic reply `likesCount: 0` to `likeCount: 0` (:330)
  - **ComposeSheet.tsx:** Run `rg -n "likesCount|id: number|Number\(" src/features/feed/ComposeSheet.tsx` — this file has no references to these patterns (verified: ComposeSheet only handles text input and compose submission, no post rendering). No changes needed.
  - Must NOT change any display logic, styling, or component structure
  - Must NOT remove `isLiked`, `commentsCount`, or `displayName` references (kept per Practical decision)
  Parallelization: Wave 3 | Blocked by: 1, 5, 6 | Blocks: 11 | Can parallelize with: 10, 12
  References:
  - src/features/posts/PostCard.tsx:9-16,243 (props interface, likesCount usage)
  - src/app/(main)/home/page.tsx:42-50,67-95,97-109 (optimistic post, handleLike, handleDelete, handleUpdate)
  - src/app/(main)/profile/[username]/page.tsx:62-82 (handleLike)
  - src/app/(main)/post/[id]/page.tsx:45,53-62,98-110,270,295,325-333 (Number(id), handleLike, handleLikeComment, likesCount, optimistic reply)
  - src/features/comments/CommentItem.tsx:8-13,87 (props interface, likesCount)
  - src/features/feed/ComposeSheet.tsx (check for references)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "likesCount" src/features/ src/app/ src/mocks/ src/types/` returns no matches (all renamed to likeCount)
  - `rg -n "Number\(id\)" src/app/` returns no matches
  - `rg -n "\(id: number\)" src/features/posts/PostCard.tsx src/features/comments/CommentItem.tsx` returns no matches
  - `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` passes
  QA scenarios: happy: lint + build pass; failure: TypeScript would error if any `likesCount` reference remains (property doesn't exist on Post anymore). Evidence .omo/evidence/task-9-api-contract-alignment.txt
  Commit: Y | refactor(components): rename likesCount→likeCount, change ID types to string across all components

- [ ] 10. Fix error handling in auth forms — read data.error instead of data.message
  What to do / Must NOT do:
  - **LoginForm.tsx:** Change `err.response.data?.message` to `err.response.data?.error` (LoginForm.tsx:40)
  - **RegisterStep2Form.tsx:** Change `err.response.data?.message` to `err.response.data?.error` (RegisterStep2Form.tsx:61)
  - **ConversationalAuth.tsx:** Change `err.response.data?.message` to `err.response.data?.error` (ConversationalAuth.tsx:111)
  - Must NOT change the fallback messages (they stay in French as-is)
  - Must NOT change any other logic in these files
  Parallelization: Wave 3 | Blocked by: 1 | Blocks: none | Can parallelize with: 4, 5, 6, 7, 8, 9, 11, 12
  References:
  - src/features/auth/LoginForm.tsx:38-44 (error catch block)
  - src/features/auth/RegisterStep2Form.tsx:59-65 (error catch block)
  - src/features/auth/ConversationalAuth.tsx:109-115 (error catch block)
  - Breezy-api/docs/api-contract.md:25-44 (Common Error Format: { error, details? })
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "data?.message" src/features/auth/` returns no matches
  - `rg -n "data?.error" src/features/auth/` returns at least 3 matches
  QA scenarios: happy: lint passes; failure: no runtime impact if server returns { error: "..." } — the message will now display correctly. Evidence .omo/evidence/task-10-api-contract-alignment.txt
  Commit: Y | fix(auth): read data.error instead of data.message to match contract error format

- [ ] 11. Remove Number(id) and fix remaining ID type references in post detail page and callers
  What to do / Must NOT do:
  - This is a focused cleanup pass for any `Number()` conversions or `number` type annotations that remain after task 9
  - **post/[id]/page.tsx:** Verify `useParams<{ id: string }>()` is already string (:15) — it is; verify `Number(id)` was removed in task 9; if any `as number` casts remain, remove them
  - **post/[id]/page.tsx:** The `handleAddComment` function calls `addComment(post.id, ...)` (:68) — `post.id` is now string, `addComment` now accepts string — verify no cast needed
  - **post/[id]/page.tsx:** The `savePostEdit` function calls `updatePost(post.id, ...)` (:90) — `post.id` is now string, `updatePost` now accepts string — verify no cast needed
  - **post/[id]/page.tsx:** The `handleDeletePost` function calls `deletePost(post.id)` (:80) — `post.id` is now string, `deletePost` now accepts string — verify no cast needed
  - **profile/[username]/page.tsx:** Verify `handleLike(id)` (:62) is now `string` — done in task 9; verify `(wasLiked ? unlikePost : likePost)(id)` (:81) passes string — it does
  - **home/page.tsx:** Verify `(wasLiked ? unlikePost : likePost)(id)` (:94) passes string — done in task 9
  - Run `rg -n "Number(" src/app/ src/features/` to find any remaining numeric conversions and fix them
  - Run `rg -n ": number" src/features/posts/ src/features/comments/ src/features/profile/ src/features/users/` to find any remaining number type annotations on ID parameters and fix them
  - Must NOT change any logic — only type annotations and conversions
  Parallelization: Wave 3 | Blocked by: 1, 4, 5, 7, 8, 9 | Blocks: none | Can parallelize with: 10, 12
  References:
  - src/app/(main)/post/[id]/page.tsx:15,45,61,68,80,90 (all ID usage points)
  - src/app/(main)/profile/[username]/page.tsx:62,81 (handleLike, like/unlike calls)
  - src/app/(main)/home/page.tsx:67,94 (handleLike, like/unlike calls)
  - src/features/posts/posts.api.ts (updated in task 5 — all params now string)
  - src/features/comments/comments.api.ts (updated in task 7 — all params now string)
  Acceptance criteria:
  - `npm run lint` passes
  - `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` passes
  - `rg -n "Number\(" src/app/ src/features/posts/ src/features/comments/ src/mocks/` returns no matches
  QA scenarios: happy: lint + build pass with zero Number() conversions; failure: TypeScript build would fail if any function expects number but receives string. Evidence .omo/evidence/task-11-api-contract-alignment.txt
  Commit: Y | refactor(cleanup): remove all Number(id) conversions, verify string ID types across callers

- [ ] 12. Update username validation from 3-20 to 3-50 in register forms
  What to do / Must NOT do:
  - **RegisterStep2Form.tsx:** Change regex from `/^[a-zA-Z0-9_]{3,20}$/` to `/^[a-zA-Z0-9_]{3,50}$/` (RegisterStep2Form.tsx:31); change error message from "3 à 20 caractères : lettres, chiffres ou _." to "3 à 50 caractères : lettres, chiffres ou _." (RegisterStep2Form.tsx:31)
  - **ConversationalAuth.tsx:** Change regex from `/^[a-zA-Z0-9]{3,20}$/` to `/^[a-zA-Z0-9_]{3,50}$/` (ConversationalAuth.tsx:86) — also add underscore support (contract allows underscores); change error message from "3 à 20 caractères, lettres et chiffres." to "3 à 50 caractères : lettres, chiffres ou _." (ConversationalAuth.tsx:88)
  - **ConversationalAuth.tsx:** Change `setValue` username filter from `/[^a-zA-Z0-9]/g` to `/[^a-zA-Z0-9_]/g` (ConversationalAuth.tsx:72) — allow underscores
  - Must NOT change password validation (already >= 8, contract says 8-128)
  - Must NOT change email validation
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: none | Can parallelize with: 4, 5, 6, 7, 8, 9, 10, 11
  References:
  - src/features/auth/RegisterStep2Form.tsx:29-33 (validateUsername function)
  - src/features/auth/ConversationalAuth.tsx:72,79-89 (setValue filter, validate function)
  - Breezy-api/docs/api-contract.md:141-146 (username validation: 3–50 chars, letters, numbers, underscores)
  Acceptance criteria:
  - `npm run lint` passes
  - `rg -n "{3,20}" src/features/auth/` returns no matches
  - `rg -n "{3,50}" src/features/auth/` returns at least 2 matches
  - `rg -n "a-zA-Z0-9_" src/features/auth/ConversationalAuth.tsx` returns at least 2 matches (regex in validate + filter in setValue, both now include underscore)
  QA scenarios: happy: lint passes; failure: no runtime impact — validation is more permissive now. Evidence .omo/evidence/task-12-api-contract-alignment.txt
  Commit: Y | fix(auth): align username validation to contract (3-50 chars, allow underscores)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — run `rg -n "PaginatedResponse|/likes\b|Number\(|data\?\.message|\{3,20\}|likesCount" src/` — must return zero matches. Then run endpoint coverage check: `rg -n "/api/v1/feed" src/features/feed/feed.api.ts && rg -n "/api/v1/auth/me" src/features/auth/auth.api.ts && rg -n "/api/v1/posts/me" src/features/posts/posts.api.ts && rg -n "posts/user/" src/features/posts/posts.api.ts && rg -n "/api/v1/comments/.*/replies" src/features/comments/comments.api.ts && rg -n "users/me/preferences" src/features/profile/profile.api.ts && rg -n "users/.*/moderation" src/features/admin/admin.api.ts` — every command must return at least one match. Also verify mock handler coverage: `rg -n "/api/v1/feed" src/mocks/handlers.ts && rg -n "/api/v1/auth/me" src/mocks/handlers.ts && rg -n "/api/v1/posts/me" src/mocks/handlers.ts && rg -n "/api/v1/comments/:commentId/replies" src/mocks/handlers.ts` — every command must return at least one match. Evidence .omo/evidence/f1-api-contract-alignment.txt
- [ ] F2. Code quality review — `npm run lint` passes with zero errors; `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` passes with zero TypeScript errors. Verify no `any` types were introduced: `rg -n ": any\b|as any\b" src/features/ src/types/ src/mocks/` returns zero matches. Evidence .omo/evidence/f2-api-contract-alignment.txt
- [ ] F3. MSW smoke test — start dev server with `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run dev` in background, then run curl assertions: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/feed` (expect 200 with MSW); `curl -s http://localhost:3000/api/v1/feed | jq 'type'` (expect "array" not "object" — verifies pagination removed); `curl -s -X POST http://localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"camille@example.com","password":"test"}' | jq '.token'` (expect non-null); `curl -s http://localhost:3000/api/v1/posts/p1 | jq '.likeCount'` (expect number, verifies likeCount field name). Kill dev server after. Evidence .omo/evidence/f3-api-contract-alignment.txt
- [ ] F4. Scope fidelity — verify no `displayName`, `followersCount`, `followingCount`, `isLiked`, `commentsCount`, or embedded `author` was removed from types or mocks (Practical alignment keeps these). Command: `rg -n "displayName|followersCount|followingCount|isLiked|commentsCount|author:" src/types/index.ts src/mocks/data.ts` must return matches. Also verify `Reply` type exists: `rg -n "interface Reply" src/types/index.ts` must return at least one match. Evidence .omo/evidence/f4-api-contract-alignment.txt

## Commit strategy
- One commit per todo (12 commits total)
- Commit type: `refactor` for type/mock/component changes, `fix` for API URL/method/error-handling corrections
- Example messages:
  - `refactor(types): align ID types to string, rename likesCount→likeCount, add Reply, remove PaginatedResponse`
  - `fix(posts): align to contract — PUT for update, /like singular, /posts/user/:id, add getOwnPosts and getPostsByAuthors`
  - `fix(auth): read data.error instead of data.message to match contract error format`
- Commits should be squashed into a single PR or merged as a sequence onto a `feature/api-contract-alignment` branch
- Run `npm run lint` before each commit; run `npm run build` after Wave 1 and Wave 3

## Success criteria
1. Every API endpoint in `Breezy-api/docs/api-contract.md` has a matching front-end function in `src/features/*/*.api.ts` with the correct URL, HTTP method, and parameter types — EXCEPT for the intentionally-kept beyond-contract endpoints (Google sign-in, moderation reports/content-deletion)
2. All TypeScript types use `string` IDs (no `number` IDs anywhere in `src/types/index.ts`)
3. `Post.likesCount` is renamed to `Post.likeCount` everywhere (zero `likesCount` matches in `src/`)
4. `PaginatedResponse<T>` type is removed and no file imports it (zero matches in `src/`)
5. Error handling in auth forms reads `data.error` (zero `data?.message` matches in `src/features/auth/`)
6. Username validation accepts 3-50 characters with underscores (zero `{3,20}` matches in `src/features/auth/`)
7. MSW mock handlers exist for every contract endpoint, including the newly-added ones (`/feed`, `/auth/me`, `/posts/me`, `/posts?authorIds=`, `/comments/:id/replies`, `/users/me/preferences`, `/users/:id/moderation`)
8. `npm run lint` passes with zero errors
9. `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build` passes with zero TypeScript errors
10. The front-end's richer data model (displayName, followersCount, isLiked, commentsCount, embedded author) is preserved — no UI regression
