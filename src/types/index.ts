
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface ThreadSegment {
  id: string;
  content: string;
  order: number;
  reactions: Record<string, string[]>; // emoji -> userIds
}

export interface Thread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  segments: ThreadSegment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  bookmarks: string[]; // userIds
  forks: string[]; // threadIds
  originalThreadId?: string; // if this is a fork
  views: number;
}

export interface Collection {
  id: string;
  name: string;
  userId: string;
  threadIds: string[];
  createdAt: string;
  isPrivate: boolean;
}

export interface Analytics {
  threadsCreated: number;
  totalBookmarks: number;
  totalReactions: number;
  totalViews: number;
  mostForkedThread?: Thread;
  activityOverTime: { date: string; count: number }[];
}
