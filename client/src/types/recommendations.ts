/**
 * @file recommendations.ts
 * Type definitions for user demographic profiles, clean air plans, and session models.
 */

import type { AtmosphericData } from './telemetry';
import type { ChatMessage } from './chat';

export type HouseholdType = 'individual' | 'family' | 'elderly' | 'shared';

export type CommuteMode = 'metro' | 'bus' | 'car' | 'cycling' | 'walking';

export interface UserProfile {
  city: string;
  householdType: HouseholdType | string;
  householdSize: number;
  commute: CommuteMode | string;
  healthConcern?: boolean;
  seasonContext?: string;
  notes?: string;
}

export interface RecommendationItems {
  routines: string[];
  indoorHacks: string[];
  alternatives: string[];
  impacts: string[];
}

export interface PlanMetadata {
  isMock?: boolean;
  source?: string;
  model?: string;
  cached?: boolean;
  cacheKey?: string;
}

export interface PlanResult {
  sessionId: string;
  profile: UserProfile;
  recommendations: RecommendationItems;
  atmospheric?: AtmosphericData;
  chatHistory?: ChatMessage[];
  metadata?: PlanMetadata;
}
