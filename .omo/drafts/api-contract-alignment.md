---
slug: api-contract-alignment
status: plan-written
intent: clear
pending-action: none (plan written, awaiting user decision to start work or run high-accuracy review)
approach: Practical alignment — fix all URLs, HTTP methods, path params, field names, error handling to match contract. Keep richer data model (embedded authors, displayName, counts, isLiked). Keep username routes. Keep full moderation panel. 12 todos across 3 waves.
---

# Draft: api-contract-alignment

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->

| id | outcome | status | evidence |
|----|---------|--------|----------|
| C1-types | Realign TypeScript types (User, Post, Comment, Reply, AuthResponse) to match contract models | active | src/types/index.ts; api-contract.md:48-117 |
| C2-auth | Fix auth API layer (getMe path, error field, username validation) | active | src/features/auth/auth.api.ts; api-contract.md:121-190 |
| C3-posts | Fix posts API layer (methods, like/unlike URLs, missing endpoints, response shapes) | active | src/features/posts/posts.api.ts; api-contract.md:322-456 |
| C4-users-profile | Fix users/profile/follows API layer (ID vs username, missing endpoints, methods) | active | src/features/profile/profile.api.ts, src/features/users/users.api.ts; api-contract.md:194-606 |
| C5-comments-feed | Fix comments/feed API layer (feed URL, reply type, missing endpoints, pagination) | active | src/features/comments/comments.api.ts, src/features/feed/feed.api.ts; api-contract.md:460-629 |
| C6-admin | Decide moderation panel scope vs contract's PATCH /users/:id/moderation | active | src/features/admin/admin.api.ts; api-contract.md:288-318 |
| C7-mocks | Update MSW handlers and mock data to match chosen alignment strategy | active | src/mocks/handlers.ts, src/mocks/data.ts |
| C8-routing | Decide profile route param (username vs ID) and update callers | active | src/app/(main)/profile/[username]/page.tsx |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->

| assumption | adopted default | rationale | reversible? |
|------------|----------------|-----------|-------------|
| Google sign-in | Keep as-is (not in contract, marked mock in README) | Optional feature, reversible, low risk | Yes |
| PaginatedResponse removal | Remove wrapper, use bare arrays per contract | No consumer reads pagination metadata; no infinite scroll exists; contract returns bare arrays | Yes |
| Error field | Switch from data.message to data.error per contract | Contract defines { error, details? }; current code reads .message which never shows server messages | Yes |

## Findings (cited - path:lines)

### The front-end was built against MSW mocks, not the contract
- Mocks and front-end share the same "fantasy" shape: numeric IDs, username path params, paginated envelopes, embedded author objects, likesCount/isLiked/commentsCount, displayName, followersCount/followingCount, moderation panel, Google sign-in.
- Contract uses: MongoDB ObjectId strings, :id path params, bare arrays, authorId references, likeCount (no isLiked/commentsCount), no displayName, role-based (not status/isAdmin), no Google, no moderation panel.
- Evidence: src/mocks/handlers.ts (all 25 handlers), src/mocks/data.ts (all mock objects), src/types/index.ts:1-96, api-contract.md:46-117

### ID type mismatch (number vs string)
- All front-end types use number IDs: User.id (types/index.ts:4), Post.id (:18), Comment.id (:29)
- Contract uses MongoDB ObjectId strings everywhere (api-contract.md:52,66,77,89,102,114)
- Number(id) conversion at post/[id]/page.tsx:45 will break on string IDs
- post.author.id and me.id are never read anywhere in src/ (explore agent confirmed zero grep matches)

### Username vs ID routing
- Profile route uses [username] param (profile/[username]/page.tsx:16)
- All user API calls pass username, not ID: getProfile, getUserPosts, followUser, unfollowUser, getFollowers, getFollowing
- Contract uses :id (ObjectId) for all user endpoints; NO username→ID lookup endpoint exists
- Contract has GET /users/me for current user's profile (api-contract.md:211-224) — front-end calls GET /users/me in auth.api.ts:31 but expects auth-view User, not Public Profile
- getFollowers/getFollowing are dead code (zero callers in src/)

### Response shape mismatches
- Post: front-end has author: User (embedded), likesCount, commentsCount, isLiked; contract has authorId: string, likeCount, no commentsCount, no isLiked
- Comment: front-end has author: User, postId: number, likesCount, isLiked; contract has authorId: string, postId: string, replies: [], no likesCount/isLiked
- Reply: contract has separate model { parentCommentId, content, authorId, createdAt }; front-end uses Comment type for replies
- User auth view: contract has { id, username, email, role, preferences }; front-end has { id, username, displayName, email, bio, avatarUrl, followersCount, followingCount, createdAt, status, isAdmin }
- Public Profile: contract has { id, username, bio, avatarUrl }; front-end uses the same rich User type

### Endpoint-level mismatches (19 of 21 mapped endpoints diverge)
- GET /auth/me → front-end calls GET /users/me (wrong endpoint)
- PUT /posts/:id → front-end uses PATCH
- POST /posts/:id/like → front-end calls /posts/:id/likes (plural)
- DELETE /posts/:id/like → front-end calls /posts/:id/likes (plural)
- GET /feed?limit= → front-end calls GET /posts (wrong endpoint, no limit param)
- GET /posts/me → missing
- GET /posts?authorIds= → missing
- GET /posts/user/:userId → front-end calls /users/:username/posts
- PUT /users/me → front-end uses PATCH, sends displayName (not in contract), omits avatarUrl
- GET /users/me (profile) → missing
- PATCH /users/me/preferences → missing
- PATCH /users/:id/moderation → front-end uses /moderation/accounts/:username
- GET /comments/:commentId/replies → missing
- POST /api/v1/auth/google → not in contract
- All /api/v1/moderation/* endpoints → not in contract

### displayName usage (49 data-field matches in 16 files)
- Mostly display-only (Avatar, Sidebar, PostCard, CommentItem, etc.)
- Used in logic: Avatar.tsx:32,40 (initials + gradient), profile/[username]/page.tsx:105 (banner gradient hash)
- Written to API: profile.api.ts:10 (updateProfile payload)
- Not in contract's User or Public Profile models

### followersCount/followingCount
- Used in profile/[username]/page.tsx:236,245 (display) and :52,57 (optimistic follow/unfollow)
- Not in contract's Public Profile
- Would cause runtime crash: toLocaleString("fr") on undefined

### Pagination is dead code
- PaginatedResponse<T> defined at types/index.ts:90-96
- 6 API functions declare it but all immediately unwrap data.data and discard metadata
- Zero consumers read .total, .page, .limit, or .hasMore
- No useInfiniteScroll hook, no IntersectionObserver, no loadMore pattern
- Mocks hard-code hasMore: false everywhere

### Build/lint state
- npm run lint: passes
- npm run build: passes with NEXT_PUBLIC_API_URL set; fails without it (axios.ts throws at module load)

## Decisions (with rationale)

### User decisions (answered)
1. **Alignment strictness: Practical** — Fix all URLs, HTTP methods, and path params to match the contract. Keep the front-end's richer data model (embedded authors, displayName, counts, isLiked). Assume the backend returns more than the contract documents via Mongoose .populate(). Rationale: avoids a massive UI rewrite; the contract is likely a simplified view.
2. **Profile routing: Keep username routes** — Keep /profile/[username] routes. Assume the backend's GET /users/:id accepts usernames as well as IDs. Rationale: least disruptive, preserves UX. Risk: if backend rejects usernames, fallback is to resolve via getProfile() which returns the user object with ID.
3. **Moderation panel scope: Keep panel, align status call** — Keep the full admin panel. Change setAccountStatus to PATCH /users/:id/moderation with contract payload { status, durationHours?, reason }. Leave reports/content-deletion as-is. Rationale: they're optional features beyond the contract that add value.

### Adopted defaults (confirmed by user via no veto)
1. Remove PaginatedResponse wrapper → bare arrays (no consumer uses metadata, contract returns arrays)
2. Switch error reading from data.message to data.error (contract defines { error, details? })
3. Keep Google sign-in as-is (optional, mock, not in contract)
4. Keep MSW mocks updated to match chosen strategy (needed for dev to work)

## Scope IN
- src/types/index.ts — type realignment
- src/features/*/​*.api.ts — all API modules (auth, posts, comments, feed, profile, users, admin)
- src/mocks/handlers.ts, src/mocks/data.ts — mock alignment
- src/lib/axios.ts — error envelope handling (if strict)
- Route files that pass identifiers to API calls
- Components that read response fields not in the contract (displayName, counts, isLiked)

## Scope OUT (Must NOT have)
- No backend changes (Breezy-api is a separate repo)
- No new features beyond what's needed for contract alignment
- No UI redesign (only data-binding changes where fields are removed/renamed)
- No test framework setup unless tests already exist

## Open questions

### Q1: Alignment strictness
The contract and the front-end describe two different APIs. The front-end embeds full `author` objects in Post/Comment, has `displayName`, `followersCount`/`followingCount`, `isLiked`, `commentsCount`, numeric IDs, and pagination. The contract uses `authorId` references, has none of those extra fields, uses string IDs, and returns bare arrays. Which strategy?

Options:
a) **Practical (recommended)**: Fix all URLs, HTTP methods, and path params to match the contract. Keep the front-end's richer data model (assume the backend returns embedded authors, displayName, counts, isLiked even though the contract doesn't document them). This avoids a massive UI rewrite.
b) **Strict**: Rewrite all types to match the contract exactly. Remove displayName, counts, isLiked, commentsCount. Use authorId references (would require fetching users separately for every post/comment). String IDs. This breaks most of the UI and requires significant rework.
c) **Update contract**: Amend the API contract to document the extra fields the front-end needs (embedded authors, displayName, counts, isLiked). Then align URLs/methods only.

WHY: This fork determines the entire scope. Strict means rewriting every component that reads `post.author.username` or `post.author.displayName` (which is all of them). Practical means the backend likely populates these fields via Mongoose `.populate()` even though the contract simplifies them. The contract may be a simplified view, not the actual response.

### Q2: Profile routing — username vs ID
The contract uses `GET /users/:id` (ObjectId) with no username→ID lookup endpoint. The front-end uses `/profile/[username]` routes and passes usernames to all user API calls. Options:

a) **Keep username routes, assume backend accepts usernames in :id param (recommended if Practical)**: The backend's Mongoose `findById` won't match usernames, but maybe the profile-service has a fallback. This is the least disruptive option.
b) **Switch to ID-based routes `/profile/[id]`**: Fully contract-aligned. URLs become `/profile/651a2b3c...`. Requires changing the Next.js route structure and all profile links throughout the app.
c) **Hybrid: keep username in URL, resolve to ID via a lookup**: But there's no lookup endpoint in the contract. Would need to use the feed or post data to find the user ID, which is fragile.

WHY: This is a cross-cutting product choice (public URL surface). Twitter/X uses usernames in URLs for good UX. But the contract only supports IDs. The choice depends on whether the backend can handle usernames.

### Q3: Moderation panel scope
The front-end has a full admin panel with reports, content deletion, and account management (`/api/v1/moderation/*`). The contract only defines `PATCH /users/:id/moderation` for suspend/ban. Moderation is listed as optional in AGENTS.md. Options:

a) **Keep the panel, align only the status-change call (recommended)**: Change `setAccountStatus` to use `PATCH /users/:id/moderation` with the contract's payload `{ status, durationHours?, reason }`. Leave reports/content-deletion as-is (they're optional features beyond the contract).
b) **Trim to contract only**: Remove reports and content-deletion. Keep only suspend/ban via `PATCH /users/:id/moderation`.
c) **Remove the entire admin panel**: Moderation is optional per AGENTS.md.

WHY: This is a feature scope decision. The reports/content-deletion features have no contract endpoint, but they're optional features that add value. Removing them is a product choice.

## Approval gate
status: approved
pending-action: none
plan-written: 2026-06-23
notes: |
  Plan written to .omo/plans/api-contract-alignment.md with 12 todos across 3 waves.
  Metis gap analysis: agent didn't deliver results; performed gap analysis manually.
  Key gap found and fixed: Comment.replies must stay Comment[] (not Reply[]) because
  CommentItem.tsx:130 renders replies recursively as Comment objects.
  Other gaps checked: ComposeSheet.tsx and RightRail.tsx have no likesCount/ID references
  (no changes needed). Like/Follow/Notification types are dead (never imported) but still
  updated for consistency.
  
  Wave 3 — Component & page updates:
  - Update all likesCount references to likeCount (PostCard, home page, profile page, post detail page)
  - Update error handling in auth forms to read data.error instead of data.message
  - Remove Number(id) conversion in post/[id]/page.tsx (IDs are now strings)
  - Update likePost/unlikePost callers to use returned { id, likeCount } where beneficial
  - Remove PaginatedResponse type imports
  - Update username validation from 3-20 to 3-50 (contract) in RegisterStep2Form and ConversationalAuth
