# Breezy Web

Front-end React/Next.js for the Breezy social network — a Twitter/X-inspired platform.

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** with oklch design tokens
- **Axios** for all HTTP calls
- **MSW** (Mock Service Worker) for local API mocking
- JWT authentication stored in `localStorage`

## Prerequisites

- Node.js 20+
- The [breezy-api](../Breezy-api) backend running on port 4000 (or use MSW mocks in development)

## Setup

```bash
# 1. Clone and install
git clone https://github.com/Breezy-groupe-2/Breezy-web.git
cd Breezy-web
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Breezy API | `http://localhost:4000` |

Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Auto-format with Prettier |
| `npm run format:check` | Check formatting (CI) |

## Features

- Account creation and secure authentication (JWT)
- Conversational onboarding flow
- Short posts (280 characters)
- Chronological feed
- Like / unlike posts and comments
- Comment threads with nested replies
- Follow / unfollow users
- Followers and following lists with search
- Profile page with bio, avatar, and post history
- Edit own profile
- Edit and delete own posts
- Light / dark theme with system preference detection
- Admin moderation panel (suspend / ban users)
- Google sign-in (mock — requires backend OAuth implementation)
- Mobile-first responsive layout

## Project structure

```
src/
  app/
    (auth)/          # Public pages: login, register
    (main)/          # Protected pages: home, profile, post, admin, settings
  features/
    auth/            # Login/register forms, auth API
    feed/            # Feed queries, compose sheet
    posts/           # PostCard, like, post API
    comments/        # Comment thread, reply form
    profile/         # Profile API
    users/           # Follow API, user search
  components/
    ui/              # Button, Input, Avatar, Icon, Spinner…
    layout/          # Sidebar, BottomNav, TopBar, AuthGuard
  hooks/             # useAuth, shared hooks
  lib/               # Axios instance, token helpers
  store/             # Auth context, theme context, compose context
  types/             # Shared TypeScript interfaces
  mocks/             # MSW handlers and mock data
```

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 \
  -t breezy-web .

docker run --rm -p 3000:3000 breezy-web
```
