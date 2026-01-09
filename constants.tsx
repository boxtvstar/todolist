
import React from 'react';
import { Category, ProjectStatus, Project } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'work', name: '업무', icon: '💼' },
  { id: 'personal', name: '개인', icon: '👤' },
  { id: 'health', name: '건강', icon: '🥗' },
  { id: 'home', name: '집안일', icon: '🏠' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '신규 앱 런칭',
    description: '반응형 디자인과 AI 기능을 포함한 신규 할 일 관리 앱 런칭 프로젝트',
    progress: 45,
    status: ProjectStatus.ON_TRACK,
    deadline: '2025-12-30',
    categoryId: 'work',
    members: [],
    createdAt: '2025-01-01',
  },
  {
    id: 'p2',
    name: '이사 준비',
    description: '새 집 계약부터 짐 정리까지 완벽한 이사를 위한 체크리스트 운영',
    progress: 20,
    status: ProjectStatus.PLANNING,
    deadline: '2025-05-15',
    categoryId: 'home',
    members: [],
    createdAt: '2025-02-01',
  }
];

export const DEFAULT_AI_PROMPT = (task: string) => `
당신은 생산성 전문가입니다. 다음 할 일에 대해 3~5개의 구체적이고 실행 가능한 하위 단계를 한국어로 제안해주세요.
할 일: "${task}"
JSON 형식의 배열로 답해주세요. 예: ["단계 1", "단계 2", "단계 3"]
`;
