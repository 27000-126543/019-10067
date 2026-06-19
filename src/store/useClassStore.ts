import { create } from 'zustand';
import type { ClassStats, ClassMistake } from '@/types';
import { events } from '@/data';

const generateMockStats = (eventId: string): ClassStats => {
  const event = events.find((e) => e.id === eventId);
  if (!event) {
    return {
      eventId,
      totalStudents: 0,
      completedStudents: 0,
      averageTimelineScore: 0,
      averageNetworkScore: 0,
      commonMistakes: [],
      bestPathRevealed: false,
    };
  }

  const totalStudents = 28;
  const completedStudents = Math.floor(totalStudents * (0.5 + Math.random() * 0.4));

  const mistakes: ClassMistake[] = [
    {
      type: 'order',
      description: '将放大节点与跟风节点的顺序搞反',
      count: Math.floor(completedStudents * 0.45),
    },
    {
      type: 'edge',
      description: '遗漏了评论节点与原帖的连接',
      count: Math.floor(completedStudents * 0.38),
    },
    {
      type: 'edge',
      description: '错误地建立了两个源头节点之间的联系',
      count: Math.floor(completedStudents * 0.25),
    },
    {
      type: 'turning',
      description: '误认为最后一个大V转发是拐点',
      count: Math.floor(completedStudents * 0.52),
    },
    {
      type: 'order',
      description: '未注意到评论的时间戳略晚于原帖',
      count: Math.floor(completedStudents * 0.3),
    },
  ];

  return {
    eventId,
    totalStudents,
    completedStudents,
    averageTimelineScore: Math.floor(60 + Math.random() * 30),
    averageNetworkScore: Math.floor(50 + Math.random() * 35),
    commonMistakes: mistakes.sort((a, b) => b.count - a.count),
    bestPathRevealed: false,
  };
};

interface ClassState {
  statsByEvent: Record<string, ClassStats>;
  selectedEventId: string | null;
  initStats: () => void;
  selectEvent: (eventId: string) => void;
  revealBestPath: (eventId: string) => void;
  hideBestPath: (eventId: string) => void;
  getStats: (eventId: string) => ClassStats | undefined;
}

export const useClassStore = create<ClassState>((set, get) => ({
  statsByEvent: {},
  selectedEventId: null,

  initStats: () => {
    const stats: Record<string, ClassStats> = {};
    events.forEach((event) => {
      stats[event.id] = generateMockStats(event.id);
    });
    set({ statsByEvent: stats });
  },

  selectEvent: (eventId: string) => {
    const { statsByEvent } = get();
    if (!statsByEvent[eventId]) {
      set({
        statsByEvent: {
          ...statsByEvent,
          [eventId]: generateMockStats(eventId),
        },
      });
    }
    set({ selectedEventId: eventId });
  },

  revealBestPath: (eventId: string) => {
    const { statsByEvent } = get();
    if (statsByEvent[eventId]) {
      set({
        statsByEvent: {
          ...statsByEvent,
          [eventId]: {
            ...statsByEvent[eventId],
            bestPathRevealed: true,
          },
        },
      });
    }
  },

  hideBestPath: (eventId: string) => {
    const { statsByEvent } = get();
    if (statsByEvent[eventId]) {
      set({
        statsByEvent: {
          ...statsByEvent,
          [eventId]: {
            ...statsByEvent[eventId],
            bestPathRevealed: false,
          },
        },
      });
    }
  },

  getStats: (eventId: string) => {
    return get().statsByEvent[eventId];
  },
}));
