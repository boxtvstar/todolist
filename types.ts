
export enum View {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  PROJECTS = 'PROJECTS',
  HISTORY = 'HISTORY',
  MEMO = 'MEMO',
  REMINDER = 'REMINDER',
  VIDEO_NOTE = 'VIDEO_NOTE',
  FAVORITES = 'FAVORITES'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // ISO string
  categoryId: string;
  projectId?: string;
  subSteps?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  categoryId: string;
  members: string[];
  createdAt: string; // 기간 기반 진행률 계산을 위해 추가
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  images?: string[];
  updatedAt: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // Target date YYYY-MM-DD
  alerts: number[]; // e.g. [0, 1, 3]
  createdAt: string;
  userId: string;
  completed?: boolean;
  completedAt?: string;
}

export interface VideoNote {
  id: string;
  videoUrls: string[]; // 여러 유튜브 URL 가능
  script: string; // 대본 (메인)
  memo: string; // 메모 (서브)
  completed: boolean; // 완료 여부
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface FavoriteSite {
  id: string;
  title: string;
  url: string;
  description?: string;
  categoryId?: string;
  icon?: string;
  createdAt: string;
  userId: string;
}
