/**
 * ChessZen Game Color Alternation & Persistence System
 * 
 * Rules:
 * 1. The user controls ONLY ONE color per game.
 * 2. Colors automatically alternate across consecutive NEW games:
 *    - Game 1: User = White, AI/Opponent = Black
 *    - Game 2: User = Black, AI/Opponent = White
 *    - Game 3: User = White, AI/Opponent = Black
 *    - Game 4: User = Black, AI/Opponent = White
 *    - Game 5: User = White, AI/Opponent = Black
 *    - Game 6: User = Black, AI/Opponent = White
 * 3. The sequence is persisted in localStorage so closing or reloading the app does not reset the sequence.
 * 4. "Restart Game" within the SAME game preserves the currently assigned color.
 * 5. "New Game" or "Play Again" advances to the next alternating color.
 */

const STORAGE_KEY = "chesszen_ai_match_color_count";

/**
 * Get the current 0-based game count sequence index
 */
export function getGameColorSequenceIndex(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return 0;
}

/**
 * Determine the user color for a given game index (0-based)
 * Game 1 (index 0) => White ('w')
 * Game 2 (index 1) => Black ('b')
 * Game 3 (index 2) => White ('w')
 * Game 4 (index 3) => Black ('b')
 * Game 5 (index 4) => White ('w')
 * Game 6 (index 5) => Black ('b')
 */
export function getColorForGameIndex(index: number): "w" | "b" {
  return index % 2 === 0 ? "w" : "b";
}

/**
 * Get the user's assigned color for the current or upcoming game
 */
export function getCurrentPlayerColor(): "w" | "b" {
  return getColorForGameIndex(getGameColorSequenceIndex());
}

/**
 * Advance the game count and return the next alternating player color
 */
export function advanceGameColorSequence(): "w" | "b" {
  const currentIndex = getGameColorSequenceIndex();
  const nextIndex = currentIndex + 1;
  try {
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
  } catch {
    // fallback
  }
  return getColorForGameIndex(nextIndex);
}

/**
 * Manually set the sequence index (useful for testing or specific reset scenarios)
 */
export function setGameColorSequenceIndex(index: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, Math.max(0, index).toString());
  } catch {
    // fallback
  }
}
