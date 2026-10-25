import { 
  TournamentPlayer, 
  TournamentMatch, 
  TournamentFormat, 
  TournamentTiebreak,
  TournamentPodiumPlayer
} from "../types";

/**
 * Calculates standard round count for tournament size and format
 */
export function calculateTotalRounds(playersCount: number, format: TournamentFormat): number {
  if (playersCount <= 1) return 1;

  if (format === "round_robin") {
    return playersCount % 2 === 0 ? playersCount - 1 : playersCount;
  }

  // Swiss System rounds based on FIDE recommendations
  if (playersCount <= 2) return 1;
  if (playersCount <= 4) return 2;
  if (playersCount <= 8) return 3;
  if (playersCount <= 16) return 4;
  if (playersCount <= 32) return 5;
  return Math.min(6, playersCount - 1);
}

/**
 * Generates unique match ID
 */
export function generateMatchId(tournamentId: string, roundNumber: number, boardNumber: number): string {
  return `match_${tournamentId}_r${roundNumber}_b${boardNumber}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Generates unique game ID for multiplayer integration
 */
export function generateGameId(tournamentId: string, roundNumber: number, boardNumber: number): string {
  return `game_t_${tournamentId}_r${roundNumber}_b${boardNumber}_${Date.now()}`;
}

/**
 * Generates pairings for Swiss System Round 1
 */
export function generateSwissRound1Pairings(
  tournamentId: string,
  players: TournamentPlayer[]
): TournamentMatch[] {
  // Sort by rating descending (seeding)
  const sorted = [...players].sort((a, b) => (b.rating || 1200) - (a.rating || 1200));
  const matches: TournamentMatch[] = [];

  let pool = [...sorted];
  let boardNumber = 1;

  // If odd number of players, lowest seed gets a bye
  if (pool.length % 2 !== 0) {
    const byePlayer = pool.pop()!;
    matches.push({
      matchId: generateMatchId(tournamentId, 1, 999),
      boardNumber: 0,
      roundNumber: 1,
      whiteUid: byePlayer.uid,
      blackUid: "BYE",
      whiteName: byePlayer.username,
      blackName: "BYE",
      whiteRating: byePlayer.rating,
      blackRating: 0,
      whitePhoto: byePlayer.profilePicture,
      status: "completed",
      result: "1-0",
      winnerUid: byePlayer.uid,
      isBye: true,
      byePlayerUid: byePlayer.uid,
      byePlayerName: byePlayer.username,
      completedAt: new Date().toISOString()
    });
  }

  // Split into Top Half and Bottom Half (FIDE Swiss)
  const half = pool.length / 2;
  const topHalf = pool.slice(0, half);
  const bottomHalf = pool.slice(half);

  for (let i = 0; i < half; i++) {
    const p1 = topHalf[i];
    const p2 = bottomHalf[i];

    // Alternate colors: Board 1 = p1 White, Board 2 = p2 White, etc.
    const p1IsWhite = i % 2 === 0;
    const white = p1IsWhite ? p1 : p2;
    const black = p1IsWhite ? p2 : p1;

    matches.push({
      matchId: generateMatchId(tournamentId, 1, boardNumber),
      boardNumber,
      roundNumber: 1,
      whiteUid: white.uid,
      blackUid: black.uid,
      whiteName: white.username,
      blackName: black.username,
      whiteRating: white.rating,
      blackRating: black.rating,
      whitePhoto: white.profilePicture,
      blackPhoto: black.profilePicture,
      status: "waiting",
      result: null,
      winnerUid: null,
      gameId: generateGameId(tournamentId, 1, boardNumber),
      isBye: false
    });
    boardNumber++;
  }

  return matches;
}

/**
 * Generates pairings for Swiss System subsequent rounds (Round 2+)
 */
export function generateSwissSubsequentRoundPairings(
  tournamentId: string,
  roundNumber: number,
  players: TournamentPlayer[]
): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  let pool = [...players];

  // If odd, pick fair bye player
  if (pool.length % 2 !== 0) {
    // Pick player with 0 byes, lowest score, then lowest rating
    const byeCandidates = pool
      .filter((p) => (p.byeCount || 0) === 0)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return (a.rating || 1200) - (b.rating || 1200);
      });

    const byePlayer = byeCandidates[0] || pool[pool.length - 1];
    pool = pool.filter((p) => p.uid !== byePlayer.uid);

    matches.push({
      matchId: generateMatchId(tournamentId, roundNumber, 999),
      boardNumber: 0,
      roundNumber,
      whiteUid: byePlayer.uid,
      blackUid: "BYE",
      whiteName: byePlayer.username,
      blackName: "BYE",
      whiteRating: byePlayer.rating,
      blackRating: 0,
      whitePhoto: byePlayer.profilePicture,
      status: "completed",
      result: "1-0",
      winnerUid: byePlayer.uid,
      isBye: true,
      byePlayerUid: byePlayer.uid,
      byePlayerName: byePlayer.username,
      completedAt: new Date().toISOString()
    });
  }

  // Sort remaining pool by score descending, then rating descending
  pool.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.rating || 1200) - (a.rating || 1200);
  });

  // Pairing search with backtracking
  const pairs = findSwissMatching(pool);

  let boardNumber = 1;
  for (const [p1, p2] of pairs) {
    // Determine colors based on white/black history
    const { white, black } = determineColors(p1, p2);

    matches.push({
      matchId: generateMatchId(tournamentId, roundNumber, boardNumber),
      boardNumber,
      roundNumber,
      whiteUid: white.uid,
      blackUid: black.uid,
      whiteName: white.username,
      blackName: black.username,
      whiteRating: white.rating,
      blackRating: black.rating,
      whitePhoto: white.profilePicture,
      blackPhoto: black.profilePicture,
      status: "waiting",
      result: null,
      winnerUid: null,
      gameId: generateGameId(tournamentId, roundNumber, boardNumber),
      isBye: false
    });
    boardNumber++;
  }

  return matches;
}

/**
 * Backtracking algorithm to find valid Swiss pairings without rematches
 */
function findSwissMatching(
  players: TournamentPlayer[]
): [TournamentPlayer, TournamentPlayer][] {
  const result: [TournamentPlayer, TournamentPlayer][] = [];
  const used = new Set<string>();

  function backtrack(index: number): boolean {
    if (index >= players.length) return true;

    const current = players[index];
    if (used.has(current.uid)) {
      return backtrack(index + 1);
    }

    // Try candidates from same or adjacent score groups
    for (let j = index + 1; j < players.length; j++) {
      const candidate = players[j];
      if (used.has(candidate.uid)) continue;

      // Check if already played
      const alreadyPlayed = (current.previousOpponents || []).includes(candidate.uid);
      if (alreadyPlayed) continue;

      // Try this pair
      used.add(current.uid);
      used.add(candidate.uid);
      result.push([current, candidate]);

      if (backtrack(index + 1)) {
        return true;
      }

      // Backtrack
      used.delete(current.uid);
      used.delete(candidate.uid);
      result.pop();
    }

    return false;
  }

  const success = backtrack(0);

  // Fallback if strict no-rematch is mathematically impossible due to small pool
  if (!success) {
    const fallbackUsed = new Set<string>();
    const fallbackResult: [TournamentPlayer, TournamentPlayer][] = [];

    for (let i = 0; i < players.length; i++) {
      const p1 = players[i];
      if (fallbackUsed.has(p1.uid)) continue;

      let bestCandidate: TournamentPlayer | null = null;
      let minScoreDiff = Infinity;

      for (let j = i + 1; j < players.length; j++) {
        const p2 = players[j];
        if (fallbackUsed.has(p2.uid)) continue;

        const diff = Math.abs(p1.score - p2.score);
        const alreadyPlayed = (p1.previousOpponents || []).includes(p2.uid);
        const penalty = diff + (alreadyPlayed ? 100 : 0);

        if (penalty < minScoreDiff) {
          minScoreDiff = penalty;
          bestCandidate = p2;
        }
      }

      if (bestCandidate) {
        fallbackUsed.add(p1.uid);
        fallbackUsed.add(bestCandidate.uid);
        fallbackResult.push([p1, bestCandidate]);
      }
    }
    return fallbackResult;
  }

  return result;
}

/**
 * Determines which player gets White based on color balance
 */
function determineColors(
  p1: TournamentPlayer,
  p2: TournamentPlayer
): { white: TournamentPlayer; black: TournamentPlayer } {
  const p1Diff = (p1.whiteGames || 0) - (p1.blackGames || 0);
  const p2Diff = (p2.whiteGames || 0) - (p2.blackGames || 0);

  // If p1 played more Whites, p1 prefers Black
  if (p1Diff > p2Diff) {
    return { white: p2, black: p1 };
  } else if (p2Diff > p1Diff) {
    return { white: p1, black: p2 };
  }

  // Tiebreaker: Alternating or random
  return Math.random() > 0.5 
    ? { white: p1, black: p2 } 
    : { white: p2, black: p1 };
}

/**
 * Generates Round Robin pairings for a given round using Polygon / Berger method
 */
export function generateRoundRobinPairings(
  tournamentId: string,
  roundNumber: number,
  players: TournamentPlayer[]
): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  const list: (TournamentPlayer | null)[] = [...players];

  // If odd, append null dummy for Bye
  if (list.length % 2 !== 0) {
    list.push(null);
  }

  const n = list.length;
  const half = n / 2;
  const roundIdx = roundNumber - 1;

  // Polygon rotation: index 0 is fixed, indices 1 to n-1 rotate
  const rotated = new Array<TournamentPlayer | null>(n);
  rotated[0] = list[0];

  for (let i = 1; i < n; i++) {
    const newIdx = ((i - 1 + roundIdx) % (n - 1)) + 1;
    rotated[newIdx] = list[i];
  }

  let boardNumber = 1;

  for (let i = 0; i < half; i++) {
    const p1 = rotated[i];
    const p2 = rotated[n - 1 - i];

    if (!p1 || !p2) {
      // Bye match
      const byePlayer = p1 || p2;
      if (byePlayer) {
        matches.push({
          matchId: generateMatchId(tournamentId, roundNumber, 999),
          boardNumber: 0,
          roundNumber,
          whiteUid: byePlayer.uid,
          blackUid: "BYE",
          whiteName: byePlayer.username,
          blackName: "BYE",
          whiteRating: byePlayer.rating,
          blackRating: 0,
          whitePhoto: byePlayer.profilePicture,
          status: "completed",
          result: "1-0",
          winnerUid: byePlayer.uid,
          isBye: true,
          byePlayerUid: byePlayer.uid,
          byePlayerName: byePlayer.username,
          completedAt: new Date().toISOString()
        });
      }
      continue;
    }

    // Color alternation
    const p1White = (roundIdx + i) % 2 === 0;
    const white = p1White ? p1 : p2;
    const black = p1White ? p2 : p1;

    matches.push({
      matchId: generateMatchId(tournamentId, roundNumber, boardNumber),
      boardNumber,
      roundNumber,
      whiteUid: white.uid,
      blackUid: black.uid,
      whiteName: white.username,
      blackName: black.username,
      whiteRating: white.rating,
      blackRating: black.rating,
      whitePhoto: white.profilePicture,
      blackPhoto: black.profilePicture,
      status: "waiting",
      result: null,
      winnerUid: null,
      gameId: generateGameId(tournamentId, roundNumber, boardNumber),
      isBye: false
    });
    boardNumber++;
  }

  return matches;
}

/**
 * Calculates standings with Buchholz and Sonneborn-Berger tiebreaks
 */
export function calculateTournamentStandings(
  players: TournamentPlayer[],
  allCompletedMatches: TournamentMatch[],
  tiebreakMethod: TournamentTiebreak = "buchholz"
): TournamentPlayer[] {
  // Map of UID -> player copy
  const playerMap = new Map<string, TournamentPlayer>();
  for (const p of players) {
    playerMap.set(p.uid, { ...p });
  }

  // Calculate Buchholz & Sonneborn-Berger
  for (const [uid, player] of playerMap.entries()) {
    let buchholz = 0;
    let sonnebornBerger = 0;

    const playerMatches = allCompletedMatches.filter(
      (m) => (m.whiteUid === uid || m.blackUid === uid) && !m.isBye
    );

    for (const match of playerMatches) {
      const oppUid = match.whiteUid === uid ? match.blackUid : match.whiteUid;
      const opp = playerMap.get(oppUid);
      if (!opp) continue;

      const oppScore = opp.score || 0;
      buchholz += oppScore;

      const isWhite = match.whiteUid === uid;
      if (match.result === "1-0") {
        if (isWhite) sonnebornBerger += oppScore;
      } else if (match.result === "0-1") {
        if (!isWhite) sonnebornBerger += oppScore;
      } else if (match.result === "1/2-1/2") {
        sonnebornBerger += oppScore * 0.5;
      }
    }

    player.buchholzScore = Math.round(buchholz * 10) / 10;
    player.sonnebornBergerScore = Math.round(sonnebornBerger * 10) / 10;
  }

  const sorted = Array.from(playerMap.values()).sort((a, b) => {
    // 1. Primary: Score descending
    if (b.score !== a.score) return b.score - a.score;

    // 2. Secondary: Configured tiebreak
    if (tiebreakMethod === "buchholz") {
      if ((b.buchholzScore || 0) !== (a.buchholzScore || 0)) {
        return (b.buchholzScore || 0) - (a.buchholzScore || 0);
      }
      if ((b.sonnebornBergerScore || 0) !== (a.sonnebornBergerScore || 0)) {
        return (b.sonnebornBergerScore || 0) - (a.sonnebornBergerScore || 0);
      }
      if (b.wins !== a.wins) return b.wins - a.wins;
    } else if (tiebreakMethod === "sonneborn_berger") {
      if ((b.sonnebornBergerScore || 0) !== (a.sonnebornBergerScore || 0)) {
        return (b.sonnebornBergerScore || 0) - (a.sonnebornBergerScore || 0);
      }
      if ((b.buchholzScore || 0) !== (a.buchholzScore || 0)) {
        return (b.buchholzScore || 0) - (a.buchholzScore || 0);
      }
      if (b.wins !== a.wins) return b.wins - a.wins;
    } else {
      // Wins first
      if (b.wins !== a.wins) return b.wins - a.wins;
      if ((b.buchholzScore || 0) !== (a.buchholzScore || 0)) {
        return (b.buchholzScore || 0) - (a.buchholzScore || 0);
      }
      if ((b.sonnebornBergerScore || 0) !== (a.sonnebornBergerScore || 0)) {
        return (b.sonnebornBergerScore || 0) - (a.sonnebornBergerScore || 0);
      }
    }

    // 3. Tertiary: Rating descending
    return (b.rating || 1200) - (a.rating || 1200);
  });

  // Assign ranks
  sorted.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return sorted;
}

/**
 * Extracts top 3 podium finishers
 */
export function extractPodium(standings: TournamentPlayer[]): {
  champion: TournamentPodiumPlayer | null;
  secondPlace: TournamentPodiumPlayer | null;
  thirdPlace: TournamentPodiumPlayer | null;
} {
  const getPodiumPlayer = (p?: TournamentPlayer, rank: number = 1): TournamentPodiumPlayer | null => {
    if (!p) return null;
    return {
      uid: p.uid,
      username: p.username,
      rating: p.rating,
      score: p.score,
      rank,
      profilePicture: p.profilePicture
    };
  };

  return {
    champion: getPodiumPlayer(standings[0], 1),
    secondPlace: getPodiumPlayer(standings[1], 2),
    thirdPlace: getPodiumPlayer(standings[2], 3)
  };
}
