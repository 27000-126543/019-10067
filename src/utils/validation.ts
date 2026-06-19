import type { Edge, Event, PostNode } from '@/types';

export const validateTimelineOrder = (
  userOrder: string[],
  correctOrder: string[]
): { score: number; correctPositions: boolean[] } => {
  if (userOrder.length !== correctOrder.length) {
    return { score: 0, correctPositions: [] };
  }

  const correctPositions = userOrder.map(
    (id, index) => id === correctOrder[index]
  );

  const correctCount = correctPositions.filter(Boolean).length;
  const score = Math.round((correctCount / correctOrder.length) * 100);

  return { score, correctPositions };
};

export const isEdgeCorrect = (
  edge: Edge,
  correctEdges: Edge[]
): boolean => {
  return correctEdges.some(
    (correct) => correct.source === edge.source && correct.target === edge.target
  );
};

export const getEdgeCorrectness = (
  edge: Edge,
  correctEdges: Edge[]
): Edge => {
  const isCorrect = isEdgeCorrect(edge, correctEdges);
  const correctEdge = correctEdges.find(
    (correct) => correct.source === edge.source && correct.target === edge.target
  );

  return {
    ...edge,
    isCorrect,
    type: correctEdge?.type || edge.type,
    explanation: correctEdge?.explanation,
  };
};

export const calculateNetworkScore = (
  studentEdges: Edge[],
  correctEdges: Edge[]
): number => {
  if (correctEdges.length === 0) return 0;

  let correctCount = 0;
  studentEdges.forEach((edge) => {
    if (isEdgeCorrect(edge, correctEdges)) {
      correctCount++;
    }
  });

  const wrongEdges = studentEdges.length - correctCount;
  const missedEdges = correctEdges.length - correctCount;

  const maxScore = 100;
  const deductionPerWrong = 10;
  const deductionPerMissed = 8;

  let score = maxScore - wrongEdges * deductionPerWrong - missedEdges * deductionPerMissed;
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getNodeTypeLabel = (type: PostNode['type']): string => {
  const labels: Record<PostNode['type'], string> = {
    source: '信息源头',
    amplifier: '放大节点',
    follower: '跟风传播',
    comment: '评论回复',
  };
  return labels[type];
};

export const getPlatformLabel = (platform: PostNode['platform']): string => {
  const labels: Record<PostNode['platform'], string> = {
    weibo: '微博',
    wechat: '微信',
    douyin: '抖音',
    xiaohongshu: '小红书',
    forum: '论坛',
  };
  return labels[platform];
};

export const getEventById = (events: Event[], id: string): Event | undefined => {
  return events.find((event) => event.id === id);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};
