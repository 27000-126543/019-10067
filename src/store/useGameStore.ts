import { create } from 'zustand';
import type { StudentProgress, Edge } from '@/types';

interface GameState {
  currentEventId: string | null;
  progress: StudentProgress | null;
  setCurrentEvent: (eventId: string) => void;
  setTimelineOrder: (order: string[]) => void;
  setTimelineCheckedAndScore: (checked: boolean, score: number) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  setNetworkCheckedAndScore: (checked: boolean, score: number) => void;
  setTurningPoint: (nodeId: string | null) => void;
  setTurningPointSubmittedAndCorrect: (submitted: boolean, correct: boolean) => void;
  resetTurningPoint: () => void;
  resetProgress: (eventId: string) => void;
  completeGame: () => void;
}

const createDefaultProgress = (eventId: string): StudentProgress => ({
  eventId,
  timelineOrder: [],
  timelineScore: 0,
  timelineChecked: false,
  studentEdges: [],
  networkScore: 0,
  networkChecked: false,
  selectedTurningPoint: null,
  turningPointSubmitted: false,
  turningPointCorrect: false,
  completedAt: null,
});

const migrateProgress = (data: any): StudentProgress => {
  return {
    ...data,
    timelineChecked: data.timelineChecked ?? (data.timelineScore > 0),
    networkChecked: data.networkChecked ?? (data.networkScore > 0),
    turningPointSubmitted: data.turningPointSubmitted ?? false,
    turningPointCorrect: data.turningPointCorrect ?? false,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  currentEventId: null,
  progress: null,

  setCurrentEvent: (eventId: string) => {
    const saved = localStorage.getItem(`progress_${eventId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = migrateProgress(parsed);
        set({ currentEventId: eventId, progress: migrated });
      } catch (e) {
        set({ currentEventId: eventId, progress: createDefaultProgress(eventId) });
      }
    } else {
      set({ currentEventId: eventId, progress: createDefaultProgress(eventId) });
    }
  },

  setTimelineOrder: (order: string[]) => {
    const { progress } = get();
    if (progress) {
      const newProgress = {
        ...progress,
        timelineOrder: order,
        timelineChecked: false,
        timelineScore: 0,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setTimelineCheckedAndScore: (checked: boolean, score: number) => {
    const { progress } = get();
    if (progress) {
      const newProgress = {
        ...progress,
        timelineChecked: checked,
        timelineScore: score,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  addEdge: (edge: Edge) => {
    const { progress } = get();
    if (progress) {
      const newEdges = [...progress.studentEdges, edge];
      const newProgress = {
        ...progress,
        studentEdges: newEdges,
        networkChecked: false,
        networkScore: 0,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  removeEdge: (edgeId: string) => {
    const { progress } = get();
    if (progress) {
      const newEdges = progress.studentEdges.filter((e) => e.id !== edgeId);
      const newProgress = {
        ...progress,
        studentEdges: newEdges,
        networkChecked: false,
        networkScore: 0,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  setNetworkCheckedAndScore: (checked: boolean, score: number) => {
    const { progress } = get();
    if (progress) {
      const newProgress = {
        ...progress,
        networkChecked: checked,
        networkScore: score,
      };
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

  setTurningPointSubmittedAndCorrect: (submitted: boolean, correct: boolean) => {
    const { progress } = get();
    if (progress) {
      const newProgress = {
        ...progress,
        turningPointSubmitted: submitted,
        turningPointCorrect: correct,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  resetTurningPoint: () => {
    const { progress } = get();
    if (progress) {
      const newProgress = {
        ...progress,
        selectedTurningPoint: null,
        turningPointSubmitted: false,
        turningPointCorrect: false,
      };
      set({ progress: newProgress });
      localStorage.setItem(`progress_${progress.eventId}`, JSON.stringify(newProgress));
    }
  },

  resetProgress: (eventId: string) => {
    const newProgress = createDefaultProgress(eventId);
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
