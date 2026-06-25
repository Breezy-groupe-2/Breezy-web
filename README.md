# Breezy Web

Front-end React/Next.js for the Breezy social network — a Twitter/X-inspired platform.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
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
| `NEXT_PUBLIC_USE_MSW` | Enable MSW mocking in development | `true` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (for Google sign-in) | `your-client-id` |

Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Auto-format with Prettier |
| `npm run format:check` | Check formatting (CI) |
| `npm run commit` | Interactive commit via Commitizen |

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
    (main)/          # Protected pages: home, profile, post, admin, activity, search
    suspended/       # Suspended/banned user page
  features/
    auth/            # Login/register forms, auth API
    feed/            # Feed queries, compose sheet
    posts/           # PostCard, like, post API
    comments/        # Comment thread, reply form
    profile/         # Profile API
    users/           # Follow API, user search
    admin/           # Admin moderation panel
    moderation/      # Report API
    media/           # Media upload
  components/
    ui/              # Avatar, BreezyLogo, Button, EmptyState, Icon, Input, LikeButton, Spinner
    layout/          # Sidebar, Dock, RightRail, AuthGuard
  hooks/             # useAuth
  lib/               # Axios instance, token helpers
  store/             # Auth context, theme context, compose context, follow context
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
