# AGENTS.md

## Project Context

- Breezy-web is the React/Next.js front-end for the Breezy social network (Twitter/X clone).
- The back-end lives in the sibling `Breezy-api` repository and exposes a RESTful API over HTTP with JWT authentication.
- This project targets mobile-first, responsive UI. All layout decisions should start from a narrow viewport.

## Fixed Project Requirements

- Treat the course brief as the source of truth. Required features are not open design questions.
- Required features (Fx1–Fx11): account creation, secure auth, short posts (280 chars), profile post display, chronological feed, likes, comments, replies, follows/followers, basic profile, and published post list.
- Required stack: React 19, Next.js (App Router), TypeScript, Tailwind CSS v4, Axios, mobile-first responsive UI.
- JWT must be stored client-side (localStorage or httpOnly cookie — decide once and stay consistent). Redirect to /login when the token is absent or expired.
- Optional features require an explicit scope decision before implementation: tags/search, notifications, private messages, media uploads, moderation, multilingual UI, themes.

## Architecture

- Use the Next.js App Router with route groups:
  - `(auth)` — public pages (login, register)
  - `(main)` — protected pages (home feed, profile, post detail)
- Use a feature-based source structure under `src/`:

```text
src/
  app/
    (auth)/
      login/
      register/
    (main)/
      home/
      profile/[username]/
      post/[id]/
    layout.tsx
    page.tsx
  features/
    auth/        # login/register forms, auth helpers
    feed/        # feed queries and components
    posts/       # post creation, post card, like button
    comments/    # comment thread, reply form
    profile/     # profile header, follow button
    users/       # user search, user card
  components/
    ui/          # reusable primitives: Button, Input, Avatar, Spinner
    layout/      # Sidebar, BottomNav, Header
  hooks/         # shared custom hooks (useAuth, useInfiniteScroll…)
  lib/           # axios instance, token helpers
  store/         # auth state (Context or Zustand)
  types/         # shared TypeScript interfaces (User, Post, Comment…)
```

- Keep pages thin: they compose feature components, handle routing, and pass data down. No business logic in page files.
- Keep feature folders self-contained: a feature folder owns its components, hooks, and API calls.
- Shared primitives (Button, Input, Avatar) live in `components/ui/`, not in feature folders.

## API Integration

- All HTTP calls go through the Axios instance in `lib/axios.ts`. Never import Axios directly in components.
- The Axios instance attaches the JWT from storage to every request via a request interceptor.
- On 401 responses, the response interceptor clears the stored token and redirects to `/login`.
- API base URL comes from the `NEXT_PUBLIC_API_URL` environment variable. Never hard-code URLs.

## Auth and Sessions

- Store the JWT in `localStorage` under the key `breezy_token` unless the team decides to use httpOnly cookies.
- Expose `useAuth()` hook from `store/` to read and mutate auth state everywhere.
- Protected routes redirect to `/login` when `useAuth().user` is null.
- After successful login or register, redirect to `/home`.

## TypeScript

- Use strict TypeScript. Avoid `any`; use `unknown` with narrowing when the type is genuinely uncertain.
- Define shared shapes in `types/`: `User`, `Post`, `Comment`, `Like`, `Follow`, `Notification`.
- Use `z.infer<typeof schema>` from Zod when validating API responses client-side if validation is needed.

## Styling

- Use Tailwind CSS v4 utility classes exclusively. No CSS modules, no styled-components.
- Design mobile-first: base classes for mobile, `md:` / `lg:` for wider breakpoints.
- The main layout is two-column on desktop (sidebar + content) and tab-bar on mobile.
- Keep colour tokens in Tailwind config, not inline hex values.

## Git Workflow

- Branches: `main` (stable), `dev` (integration), `feature/*` (individual features).
- Conventional Commits enforced by Commitlint + Husky on `commit-msg`.
- Use `npm run commit` (Commitizen) to create messages interactively.
- Preferred types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`.
- Example: `feat(auth): add login form and JWT storage`.

## Development Workflow

- `npm run dev` — start the development server on port 3000.
- `npm run lint` — run ESLint.
- `npm run format` — auto-format with Prettier.
- `npm run format:check` — check formatting in CI.
- `npm run build` — production build.
- Before editing, read the existing file and follow conventions already present.
- Keep changes narrowly scoped to the requested feature or fix.

## Environment Variables

- `NEXT_PUBLIC_API_URL` — base URL of the Breezy API (e.g. `http://localhost:4000`).
- Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.

## Documentation

- Write code, comments, and documentation in English.
- Keep the README updated with setup steps and environment variables.
- Keep architectural decisions that affect auth flow, routing strategy, or API contract documented inline or in `docs/`.
