import { foodSafetyEvent } from './events/foodSafety';
import { examPolicyEvent } from './events/examPolicy';
import { celebrityRumorEvent } from './events/celebrityRumor';
import type { Event } from '@/types';

export const events: Event[] = [foodSafetyEvent, examPolicyEvent, celebrityRumorEvent];

export const getEventById = (id: string): Event | undefined => {
  return events.find((event) => event.id === id);
};
