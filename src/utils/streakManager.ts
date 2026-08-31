import { UserProfile } from "../types";

/**
 * Get current local date in YYYY-MM-DD format (avoids UTC timezone offset mismatch).
 */
export function getLocalTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's local date in YYYY-MM-DD format.
 */
export function getLocalYesterdayString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Synchronizes profile state without calculating or enforcing any streak logic.
 */
export function checkAndSyncActiveStreak(profile: UserProfile): UserProfile {
  return {
    ...profile,
    streak: 0,
    longestStreak: 0,
    bestStreak: 0,
  };
}

/**
 * Records a qualifying activity timestamp without calculating streaks.
 */
export function recordDailyActivity(profile: UserProfile): { updatedProfile: UserProfile; streakIncremented: boolean } {
  const today = getLocalTodayString();
  const updatedProfile: UserProfile = {
    ...profile,
    streak: 0,
    longestStreak: 0,
    bestStreak: 0,
    lastActivityDate: today,
    lastActiveDate: today,
  };

  return {
    updatedProfile,
    streakIncremented: false,
  };
}

