import type { User, Post, Comment } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "alexmartin",
    displayName: "Alex Martin",
    email: "alex@example.com",
    bio: "Développeur full-stack passionné ☕",
    avatarUrl: undefined,
    followersCount: 142,
    followingCount: 58,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    username: "sophied",
    displayName: "Sophie Durand",
    email: "sophie@example.com",
    bio: "Frontend dev · JS addict",
    avatarUrl: undefined,
    followersCount: 320,
    followingCount: 91,
    createdAt: "2025-02-20T09:00:00Z",
  },
  {
    id: 3,
    username: "marcl",
    displayName: "Marc Lefèvre",
    email: "marc@example.com",
    bio: undefined,
    avatarUrl: undefined,
    followersCount: 87,
    followingCount: 44,
    createdAt: "2025-03-10T14:00:00Z",
  },
  {
    id: 4,
    username: "lenak",
    displayName: "Lena Kim",
    email: "lena@example.com",
    bio: "Designer & codeuse le week-end",
    avatarUrl: undefined,
    followersCount: 511,
    followingCount: 120,
    createdAt: "2025-01-28T11:00:00Z",
  },
];

export const MOCK_ME = MOCK_USERS[0];

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    content: "Enfin compris les closures en JS après des semaines ☀️ Parfois il suffit d'un bon café.",
    author: MOCK_USERS[1],
    likesCount: 47,
    commentsCount: 12,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    content: "Vue du bureau ce matin. Ça donne envie de bosser 🌅",
    author: MOCK_USERS[2],
    likesCount: 21,
    commentsCount: 5,
    isLiked: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    content: "Les petits projets sont aussi valables que les gros. Lance-toi.",
    author: MOCK_USERS[3],
    likesCount: 84,
    commentsCount: 32,
    isLiked: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    content: "Docker compose pour le dev local, c'est tellement plus propre que d'installer tout à la main. Essayez.",
    author: MOCK_USERS[0],
    likesCount: 33,
    commentsCount: 8,
    isLiked: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    content: "Totalement d'accord, les closures c'est un déclic !",
    author: MOCK_USERS[2],
    postId: 1,
    likesCount: 5,
    isLiked: false,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  {
    id: 2,
    content: "Quel langage tu apprends ?",
    author: MOCK_USERS[3],
    postId: 1,
    likesCount: 2,
    isLiked: false,
    createdAt: new Date(Date.now() - 90 * 1000).toISOString(),
  },
];
