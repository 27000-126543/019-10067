import { create } from 'zustand';
import type { StudentProgress, Edge } from '@/types';

interface GameState {
  currentEventId: string | null;
  progress: StudentProgress | null;
  setCurrentEvent: (eventId: string) => void;
  setTimelineOrder: (order: string[]) => void;
  setTimelineScore: (score: number) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  setNetworkScore: (score: number) => void;
  setTurningPoint: (nodeId: string | null) => void;
  setTurningPointCorrect: (correct: boolean) => void;
  resetProgress: (eventId: string) => void;
  completeGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentEventId: null,
  progress: null,

  setCurrentEvent: (eventId: string) => {
    const saved = localStorage.getItem(`progress_${eventId}`);
    if (saved) {
      set({ currentEventId: eventId, progress: JSON.parse(saved) });
    } else {
      const newProgress: StudentProgress = {
        eventId,
        timelineOrder: [],
        timelineScore: 0,
        studentEdges: [],
        networkScore: 0,
        selectedTurningPoint: null,
        turningPointCorrect: false,
        completedAt: null,
      };
      set({ currentEventId: eventId, progress: newProgress });
    }
  },

  setTimelineOrder: (order: string[]) => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, timelineOrder: order };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setTimelineScore: (score: number) => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, timelineScore: score };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  addEdge: (edge: Edge) => {
    const { progress } = get();
    if (progress) {
      const newEdges = [...progress.studentEdges, edge];
      const newProgress = { ...progress, studentEdges: newEdges };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  removeEdge: (edgeId: string) => {
    const { progress } = get();
    if (progress) {
      const newEdges = progress.studentEdges.filter((e) => e.id !== edgeId);
      const newProgress = { ...progress, studentEdges: newEdges };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setNetworkScore: (score: number) => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, networkScore: score };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setTurningPoint: (nodeId: string | null) => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, selectedTurningPoint: nodeId };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setTurningPointCorrect: (correct: boolean) => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, turningPointCorrect: correct };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  resetProgress: (eventId: string) => {
    const newProgress: StudentProgress = {
      eventId,
      timelineOrder: [],
      timelineScore: 0,
      studentEdges: [],
      networkScore: 0,
      selectedTurningPoint: null,
      turningPointCorrect: false,
      completedAt: null,
    };
    set({ progress: newProgress });
    localStorage.setItem(`progress_${eventId}`, JSON.stringify(newProgress));
  },

  completeGame: () => {
    const { progress } = get();
    if (progress) {
      const newProgress = { ...progress, completedAt: Date.now() };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },
}));
