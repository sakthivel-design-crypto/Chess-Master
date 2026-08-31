// Elo Rating System Utility for ChessZen AI
import { GameModeKey } from "../types";

export interface EloCalculationResult {
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  kFactor: number;
}

/**
 * Calculates updated Elo rating based on:
 * - Current player rating
 * - Opponent rating
 * - Match result ('win' | 'loss' | 'draw')
 * - Games played in mode (determines K-factor)
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: "win" | "loss" | "draw",
  gamesPlayedInMode: number = 0
): EloCalculationResult {
  const currentRating = Math.max(100, playerRating || 200);
  const oppRating = Math.max(100, opponentRating || 200);

  // K-factor determination
  // New players (<1400 or <30 games): 40
  // Intermediate (1400-1800): 20
  // Advanced (>1800): 10
  let kFactor = 40;
  if (currentRating >= 1800) {
    kFactor = 10;
  } else if (currentRating >= 1400 || gamesPlayedInMode >= 30) {
    kFactor = 20;
  }

  // Calculate expected score using standard Elo formula
  const expectedScore = 1 / (1 + Math.pow(10, (oppRating - currentRating) / 400));

  // Determine actual score
  let actualScore = 0;
  if (result === "win") {
    actualScore = 1;
  } else if (result === "draw") {
    actualScore = 0.5;
  } else {
    actualScore = 0;
  }

  // Raw change calculation
  let rawChange = kFactor * (actualScore - expectedScore);

  // Guarantee minimum change for clear feedback:
  // Win at least +2 (if huge rating difference win) or standard rounding
  let ratingChange = Math.round(rawChange);
  if (result === "win" && ratingChange <= 0) {
    ratingChange = 2;
  } else if (result === "loss" && ratingChange >= 0) {
    ratingChange = -2;
  }

  const ratingAfter = Math.max(100, currentRating + ratingChange);

  return {
    ratingBefore: currentRating,
    ratingAfter,
    ratingChange,
    kFactor
  };
}

/**
 * Calculates estimated accuracy percentage for a game based on plies, moves quality, and checkmate
 */
export function calculateGameAccuracy(
  moveHistoryLength: number,
  blundersCount: number = 0,
  mistakesCount: number = 0,
  inaccuraciesCount: number = 0
): number {
  if (moveHistoryLength === 0) return 90.0;
  
  const baseAccuracy = 95.0;
  const penalty = (blundersCount * 12.0) + (mistakesCount * 6.0) + (inaccuraciesCount * 2.5);
  const calculated = Math.max(45.0, Math.min(99.5, baseAccuracy - penalty));
  
  return parseFloat(calculated.toFixed(1));
}
