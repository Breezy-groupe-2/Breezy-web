export type UserStatus = "active" | "suspended" | "banned";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  status?: UserStatus;
  isAdmin?: boolean;
  role?: "user" | "moderator" | "admin";
  preferences?: { theme: { mode: "light" | "dark"; accentColor: string } };
}

export interface Post {
  id: string;
  content: string;
  author: User;
  likeCount: number;
  commentsCount: number;
  isLiked: boolean;
  parentId?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  likeCount: number;
  isLiked: boolean;
  replies?: Comment[];
  createdAt: string;
}

export interface Reply {
  id: string;
  parentCommentId: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "reply";
  actorId: string;
  actor: User;
  postId?: string;
  read: boolean;
  createdAt: string;
}

export type ReportReason = "Spam" | "Harcèlement" | "Contenu inapproprié" | "Désinformation";

export interface Report {
  id: string;
  kind: "post" | "comment";
  author: { username: string; displayName: string; avatarUrl?: string };
  reason: ReportReason;
  count: number;
  time: string;
  text: string;
  onPostAuthor?: { username: string; displayName: string };
}

export interface ModAccount {
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: UserStatus;
}

export interface Trend {
  tag: string;
  count: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}


