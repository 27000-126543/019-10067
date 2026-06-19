export type Platform = 'weibo' | 'wechat' | 'douyin' | 'xiaohongshu' | 'forum';

export type NodeType = 'source' | 'amplifier' | 'follower' | 'comment';

export type EdgeType = 'direct-repost' | 'adaptation' | 'comment' | 'mention';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PostNode {
  id: string;
  type: NodeType;
  platform: Platform;
  author: string;
  avatar: string;
  content: string;
  timestamp: number;
  timeLabel: string;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  isScreenshot: boolean;
  commentSnippet?: string;
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  explanation?: string;
  isCorrect?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  coverImage: string;
  nodes: PostNode[];
  correctOrder: string[];
  correctEdges: Edge[];
  turningPointId: string;
  turningPointExplanation: string;
}

export interface StudentProgress {
  eventId: string;
  timelineOrder: string[];
  timelineScore: number;
  timelineChecked: boolean;
  studentEdges: Edge[];
  networkScore: number;
  networkChecked: boolean;
  selectedTurningPoint: string | null;
  turningPointSubmitted: boolean;
  turningPointCorrect: boolean;
  completedAt: number | null;
}

export interface ClassMistake {
  type: 'order' | 'edge' | 'turning';
  description: string;
  count: number;
}

export interface ClassStats {
  eventId: string;
  totalStudents: number;
  completedStudents: number;
  averageTimelineScore: number;
  averageNetworkScore: number;
  commonMistakes: ClassMistake[];
  bestPathRevealed: boolean;
}

export type GameStep = 'timeline' | 'network' | 'turning' | 'result';
