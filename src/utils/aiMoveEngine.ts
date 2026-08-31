import { Chess, Move } from "chess.js";

export type AiRatingLevel = 200 | 400 | 800 | 1200 | 1600 | 2000 | 2400;

export interface AiProfileConfig {
  name: string;
  rating: AiRatingLevel;
  title: string;
  avatar: string;
  description: string;
  thinkTimeMin: number;
  thinkTimeMax: number;
}

export const AI_PROFILES: Record<AiRatingLevel, AiProfileConfig> = {
  200: {
    name: "Zen Novice",
    rating: 200,
    title: "Beginner Bot",
    avatar: "🌱",
    description: "Learning basic pawn moves and piece shapes.",
    thinkTimeMin: 500,
    thinkTimeMax: 900
  },
  400: {
    name: "Zen Apprentice",
    rating: 400,
    title: "Easy Bot",
    avatar: "🐣",
    description: "Recognizes undefended pieces and basic captures.",
    thinkTimeMin: 600,
    thinkTimeMax: 1100
  },
  800: {
    name: "Zen Scholar",
    rating: 800,
    title: "Intermediate Bot",
    avatar: "🎓",
    description: "Develops pieces toward center and guards king.",
    thinkTimeMin: 800,
    thinkTimeMax: 1400
  },
  1200: {
    name: "Zen Tactician",
    rating: 1200,
    title: "Advanced Bot",
    avatar: "⚔️",
    description: "Calculates tactics, forks, and piece activity.",
    thinkTimeMin: 1000,
    thinkTimeMax: 1800
  },
  1600: {
    name: "Zen Strategist",
    rating: 1600,
    title: "Expert Bot",
    avatar: "🧠",
    description: "Evaluates pawn structures and positional advantages.",
    thinkTimeMin: 1200,
    thinkTimeMax: 2200
  },
  2000: {
    name: "Zen Master",
    rating: 2000,
    title: "Master Bot",
    avatar: "🏆",
    description: "Packs deep calculation and endgame precision.",
    thinkTimeMin: 1500,
    thinkTimeMax: 2500
  },
  2400: {
    name: "Zen Grandmaster",
    rating: 2400,
    title: "Grandmaster Bot",
    avatar: "👑",
    description: "Formidable engine-level calculations and deep vision.",
    thinkTimeMin: 1800,
    thinkTimeMax: 3000
  }
};

// Piece material values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Simple positional evaluation tables
const CENTER_SQUARES = new Set(["d4", "d5", "e4", "e5", "c4", "c5", "f4", "f5"]);

function evaluateBoard(game: Chess): number {
  let total = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type] || 0;
        const square = String.fromCharCode(97 + c) + (8 - r);
        let centerBonus = CENTER_SQUARES.has(square) ? 20 : 0;

        if (piece.color === "w") {
          total += val + centerBonus;
        } else {
          total -= val + centerBonus;
        }
      }
    }
  }

  if (game.inCheck()) {
    total += game.turn() === "w" ? -50 : 50;
  }

  return total;
}

// Select move based on rating level
export function calculateBestMove(
  game: Chess,
  rating: AiRatingLevel
): { move: Move; evalScore: number } | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isWhite = game.turn() === "w";

  // 1. Beginner (200 Elo)
  if (rating === 200) {
    if (Math.random() < 0.6) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return { move: randomMove, evalScore: 0 };
    }
  }

  // 2. Easy (400 Elo)
  if (rating === 400) {
    if (Math.random() < 0.45) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return { move: randomMove, evalScore: 0 };
    }
  }

  // Evaluate 1-ply or 2-ply
  let bestMove: Move = moves[0];
  let bestValue = isWhite ? -Infinity : Infinity;

  // Prioritize captures and checks
  const sortedMoves = [...moves].sort((a, b) => {
    const aScore = (a.captured ? 10 : 0) + (a.san.includes("+") ? 5 : 0);
    const bScore = (b.captured ? 10 : 0) + (b.san.includes("+") ? 5 : 0);
    return bScore - aScore;
  });

  const depth = rating >= 2000 ? 3 : rating >= 1200 ? 2 : 1;

  for (const move of sortedMoves) {
    game.move(move);

    let score = 0;
    if (depth > 1) {
      const replyMoves = game.moves({ verbose: true });
      let replyBest = isWhite ? Infinity : -Infinity;

      for (const reply of replyMoves) {
        game.move(reply);
        const val = evaluateBoard(game);
        if (isWhite) {
          if (val < replyBest) replyBest = val;
        } else {
          if (val > replyBest) replyBest = val;
        }
        game.undo();
      }

      score = replyMoves.length > 0 ? replyBest : evaluateBoard(game);
    } else {
      score = evaluateBoard(game);
    }

    game.undo();

    // Random mistake chance for mid-levels
    const mistakeChance = rating === 800 ? 0.25 : rating === 1200 ? 0.12 : 0.02;
    if (Math.random() < mistakeChance) {
      score += (Math.random() - 0.5) * 150;
    }

    if (isWhite) {
      if (score > bestValue) {
        bestValue = score;
        bestMove = move;
      }
    } else {
      if (score < bestValue) {
        bestValue = score;
        bestMove = move;
      }
    }
  }

  return { move: bestMove, evalScore: bestValue / 100 };
}
