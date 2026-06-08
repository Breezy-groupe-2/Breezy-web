export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  parentId?: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  postId: number;
  parentId?: number;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
  createdAt: string;
}

export interface Like {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
  createdAt: string;
}

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "reply";
  actorId: number;
  actor: User;
  postId?: number;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
