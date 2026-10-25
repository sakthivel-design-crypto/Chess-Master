import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  Tournament,
  TournamentPlayer,
  TournamentRound,
  TournamentMatch,
  TournamentFormat,
  TournamentTiebreak,
  TournamentTimeControlConfig,
  MultiplayerGame
} from "../types";
import {
  calculateTotalRounds,
  generateSwissRound1Pairings,
  generateSwissSubsequentRoundPairings,
  generateRoundRobinPairings,
  calculateTournamentStandings,
  extractPodium
} from "../utils/tournamentPairing";

/**
 * Generates an uppercase alphanumeric Room ID with 'CZ-' prefix.
 * e.g. "CZ-8K4P2Q"
 */
export function generateTournamentRoomId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CZ-${code}`;
}

/**
 * Standard preset time controls for Friends Tournament
 */
export const TOURNAMENT_TIME_CONTROLS: TournamentTimeControlConfig[] = [
  // Bullet
  { label: "1+0", category: "bullet", mode: "bullet", initialTimeSeconds: 60, incrementSeconds: 0 },
  { label: "1+1", category: "bullet", mode: "bullet", initialTimeSeconds: 60, incrementSeconds: 1 },
  { label: "2+1", category: "bullet", mode: "bullet", initialTimeSeconds: 120, incrementSeconds: 1 },
  // Blitz
  { label: "3+0", category: "blitz", mode: "blitz", initialTimeSeconds: 180, incrementSeconds: 0 },
  { label: "3+2", category: "blitz", mode: "blitz", initialTimeSeconds: 180, incrementSeconds: 2 },
  { label: "5+0", category: "blitz", mode: "blitz", initialTimeSeconds: 300, incrementSeconds: 0 },
  { label: "5+3", category: "blitz", mode: "blitz", initialTimeSeconds: 300, incrementSeconds: 3 },
  // Rapid
  { label: "10+0", category: "rapid", mode: "rapid", initialTimeSeconds: 600, incrementSeconds: 0 },
  { label: "10+5", category: "rapid", mode: "rapid", initialTimeSeconds: 600, incrementSeconds: 5 },
  { label: "15+10", category: "rapid", mode: "rapid", initialTimeSeconds: 900, incrementSeconds: 10 },
  // Classical
  { label: "30+0", category: "classical", mode: "classical", initialTimeSeconds: 1800, incrementSeconds: 0 },
  { label: "60+0", category: "classical", mode: "classical", initialTimeSeconds: 3600, incrementSeconds: 0 },
];

/**
 * Create a new Friends Tournament
 */
export async function createFriendsTournament(
  host: {
    uid: string;
    username: string;
    rating: number;
    profilePicture?: string;
  },
  options: {
    name: string;
    format: TournamentFormat;
    maxPlayers: number;
    timeControl: TournamentTimeControlConfig;
    tiebreakMethod?: TournamentTiebreak;
  }
): Promise<{ success: boolean; tournament?: Tournament; error?: string }> {
  try {
    const tournamentId = `t_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const roomId = generateTournamentRoomId();

    const newTournament: Tournament = {
      id: tournamentId,
      tournamentId,
      roomId,
      name: options.name.trim() || "ChessZen Friends Championship",
      hostUid: host.uid,
      hostUsername: host.username,
      hostPhoto: host.profilePicture || "",
      format: options.format,
      maxPlayers: Math.min(50, Math.max(2, options.maxPlayers || 50)),
      timeControl: `${options.timeControl.label} ${options.timeControl.category.toUpperCase()}`,
      timeControlDetails: options.timeControl,
      visibility: "private",
      status: "waiting",
      currentRound: 0,
      totalRounds: 0,
      tiebreakMethod: options.tiebreakMethod || "buchholz",
      playersCount: 1,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };

    const hostPlayer: TournamentPlayer = {
      uid: host.uid,
      username: host.username,
      rating: host.rating || 1200,
      profilePicture: host.profilePicture || "",
      joinedAt: new Date().toISOString(),
      isHost: true,
      score: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gamesPlayed: 0,
      whiteGames: 0,
      blackGames: 0,
      byeCount: 0,
      previousOpponents: [],
      buchholzScore: 0,
      sonnebornBergerScore: 0,
      rank: 1
    };

    // Save tournament doc
    await setDoc(doc(db, "tournaments", tournamentId), newTournament);

    // Save room index for fast code lookup
    await setDoc(doc(db, "tournamentRooms", roomId), {
      roomId,
      tournamentId,
      status: "waiting",
      createdAt: new Date().toISOString()
    });

    // Save host in players subcollection
    await setDoc(doc(db, "tournaments", tournamentId, "players", host.uid), hostPlayer);

    return { success: true, tournament: newTournament };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, "tournaments");
    return { success: false, error: err.message || "Failed to create tournament" };
  }
}

/**
 * Look up a tournament by Room ID (e.g. "CZ-8K4P2Q")
 */
export async function getTournamentByRoomId(roomId: string): Promise<Tournament | null> {
  const cleanRoomId = roomId.trim().toUpperCase();
  if (!cleanRoomId) return null;

  try {
    // 1. Direct index lookup
    const roomSnap = await getDoc(doc(db, "tournamentRooms", cleanRoomId));
    if (roomSnap.exists()) {
      const { tournamentId } = roomSnap.data();
      if (tournamentId) {
        const tSnap = await getDoc(doc(db, "tournaments", tournamentId));
        if (tSnap.exists()) {
          return { ...tSnap.data(), id: tSnap.id } as Tournament;
        }
      }
    }

    // 2. Query fallback
    const tQuery = query(collection(db, "tournaments"), where("roomId", "==", cleanRoomId));
    const snap = await getDocs(tQuery);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { ...docSnap.data(), id: docSnap.id } as Tournament;
    }

    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `tournamentRooms/${cleanRoomId}`);
    return null;
  }
}

/**
 * Join an existing tournament using Room ID with atomic concurrency checks
 */
export async function joinTournamentByRoomId(
  roomId: string,
  player: {
    uid: string;
    username: string;
    rating: number;
    profilePicture?: string;
  }
): Promise<{ success: boolean; tournament?: Tournament; error?: string }> {
  const cleanRoomId = roomId.trim().toUpperCase();
  if (!cleanRoomId) {
    return { success: false, error: "Please enter a valid Room ID." };
  }

  const tournament = await getTournamentByRoomId(cleanRoomId);
  if (!tournament) {
    return { success: false, error: "Tournament not found. Please check the Room ID." };
  }

  return joinTournamentById(tournament.tournamentId, player);
}

/**
 * Join tournament by tournamentId using Firestore transaction
 */
export async function joinTournamentById(
  tournamentId: string,
  player: {
    uid: string;
    username: string;
    rating: number;
    profilePicture?: string;
  }
): Promise<{ success: boolean; tournament?: Tournament; error?: string }> {
  try {
    const tRef = doc(db, "tournaments", tournamentId);
    const pRef = doc(db, "tournaments", tournamentId, "players", player.uid);

    let updatedTournament: Tournament | null = null;

    await runTransaction(db, async (transaction) => {
      const tSnap = await transaction.get(tRef);
      if (!tSnap.exists()) {
        throw new Error("Tournament not found.");
      }

      const tData = tSnap.data() as Tournament;

      if (tData.status === "cancelled") {
        throw new Error("Tournament has been cancelled.");
      }

      if (tData.status === "completed") {
        throw new Error("Tournament has already ended.");
      }

      if (tData.status === "in_progress") {
        throw new Error("Tournament has already started.");
      }

      if (tData.status !== "waiting") {
        throw new Error("Tournament is not open for registration.");
      }

      const pSnap = await transaction.get(pRef);
      if (pSnap.exists()) {
        // Already joined
        updatedTournament = { ...tData, id: tSnap.id };
        return;
      }

      if (tData.playersCount >= tData.maxPlayers) {
        throw new Error(`Tournament is full (Max ${tData.maxPlayers} players).`);
      }

      const newPlayer: TournamentPlayer = {
        uid: player.uid,
        username: player.username,
        rating: player.rating || 1200,
        profilePicture: player.profilePicture || "",
        joinedAt: new Date().toISOString(),
        isHost: false,
        score: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gamesPlayed: 0,
        whiteGames: 0,
        blackGames: 0,
        byeCount: 0,
        previousOpponents: [],
        buchholzScore: 0,
        sonnebornBergerScore: 0
      };

      const newCount = (tData.playersCount || 0) + 1;
      transaction.update(tRef, {
        playersCount: newCount
      });
      transaction.set(pRef, newPlayer);

      updatedTournament = {
        ...tData,
        id: tSnap.id,
        playersCount: newCount
      };
    });

    return { success: true, tournament: updatedTournament || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Unable to join tournament." };
  }
}

/**
 * Leave a tournament before it starts
 */
export async function leaveTournament(
  tournamentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tRef = doc(db, "tournaments", tournamentId);
    const pRef = doc(db, "tournaments", tournamentId, "players", userId);

    await runTransaction(db, async (transaction) => {
      const tSnap = await transaction.get(tRef);
      if (!tSnap.exists()) throw new Error("Tournament not found.");

      const tData = tSnap.data() as Tournament;
      if (tData.status !== "waiting") {
        throw new Error("Cannot leave a tournament that is already in progress.");
      }

      if (tData.hostUid === userId) {
        throw new Error("Host cannot leave the tournament. You can cancel it instead.");
      }

      const pSnap = await transaction.get(pRef);
      if (pSnap.exists()) {
        transaction.delete(pRef);
        transaction.update(tRef, {
          playersCount: Math.max(1, (tData.playersCount || 1) - 1)
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to leave tournament." };
  }
}

/**
 * Host removes a player from the lobby before the tournament starts
 */
export async function removePlayerFromTournament(
  tournamentId: string,
  hostUid: string,
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tRef = doc(db, "tournaments", tournamentId);
    const pRef = doc(db, "tournaments", tournamentId, "players", targetUid);

    await runTransaction(db, async (transaction) => {
      const tSnap = await transaction.get(tRef);
      if (!tSnap.exists()) throw new Error("Tournament not found.");

      const tData = tSnap.data() as Tournament;
      if (tData.hostUid !== hostUid) {
        throw new Error("Only the tournament host can remove players.");
      }

      if (tData.status !== "waiting") {
        throw new Error("Cannot remove players once tournament has started.");
      }

      if (targetUid === hostUid) {
        throw new Error("Cannot remove host.");
      }

      const pSnap = await transaction.get(pRef);
      if (pSnap.exists()) {
        transaction.delete(pRef);
        transaction.update(tRef, {
          playersCount: Math.max(1, (tData.playersCount || 1) - 1)
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove player." };
  }
}

/**
 * Host cancels the tournament before start
 */
export async function cancelFriendsTournament(
  tournamentId: string,
  hostUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tRef = doc(db, "tournaments", tournamentId);
    const tSnap = await getDoc(tRef);
    if (!tSnap.exists()) return { success: false, error: "Tournament not found" };

    const tData = tSnap.data() as Tournament;
    if (tData.hostUid !== hostUid) {
      return { success: false, error: "Only the host can cancel this tournament" };
    }

    await updateDoc(tRef, {
      status: "cancelled",
      completedAt: new Date().toISOString()
    });

    if (tData.roomId) {
      await updateDoc(doc(db, "tournamentRooms", tData.roomId), {
        status: "cancelled"
      }).catch(() => {});
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel tournament" };
  }
}

/**
 * Host starts the tournament
 */
export async function startFriendsTournament(
  tournamentId: string,
  hostUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tRef = doc(db, "tournaments", tournamentId);
    const tSnap = await getDoc(tRef);
    if (!tSnap.exists()) return { success: false, error: "Tournament not found." };

    const tData = tSnap.data() as Tournament;
    if (tData.hostUid !== hostUid) {
      return { success: false, error: "Only the host can start the tournament." };
    }

    if (tData.status !== "waiting") {
      return { success: false, error: "Tournament is not in waiting state." };
    }

    // Fetch all players
    const pSnap = await getDocs(collection(db, "tournaments", tournamentId, "players"));
    const players: TournamentPlayer[] = [];
    pSnap.forEach((d) => players.push(d.data() as TournamentPlayer));

    if (players.length < 2) {
      return { success: false, error: "At least 2 players are required to start the tournament." };
    }

    const totalRounds = calculateTotalRounds(players.length, tData.format);

    // Generate Round 1 pairings
    const round1Matches: TournamentMatch[] = tData.format === "round_robin"
      ? generateRoundRobinPairings(tournamentId, 1, players)
      : generateSwissRound1Pairings(tournamentId, players);

    // Write Round 1 document
    const roundDocRef = doc(db, "tournaments", tournamentId, "rounds", "round_1");
    const newRound: TournamentRound = {
      roundId: "round_1",
      roundNumber: 1,
      status: "active",
      createdAt: new Date().toISOString(),
      totalMatches: round1Matches.length,
      completedMatches: round1Matches.filter((m) => m.status === "completed").length
    };
    await setDoc(roundDocRef, newRound);

    // Write individual match documents & create real-time games for non-byes
    for (const match of round1Matches) {
      await setDoc(
        doc(db, "tournaments", tournamentId, "rounds", "round_1", "matches", match.matchId),
        match
      );

      // If this is a real game (not a bye), initialize the multiplayer game doc
      if (!match.isBye && match.gameId) {
        await createTournamentGameSession(tData, match);
      }
    }

    // Update tournament status
    await updateDoc(tRef, {
      status: "in_progress",
      currentRound: 1,
      totalRounds,
      startedAt: new Date().toISOString()
    });

    if (tData.roomId) {
      await updateDoc(doc(db, "tournamentRooms", tData.roomId), {
        status: "in_progress"
      }).catch(() => {});
    }

    return { success: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `tournaments/${tournamentId}`);
    return { success: false, error: err.message || "Failed to start tournament" };
  }
}

/**
 * Creates an active multiplayer game session in `games/{gameId}` for a tournament match
 */
async function createTournamentGameSession(
  tournament: Tournament,
  match: TournamentMatch
) {
  if (!match.gameId) return;

  const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const tc = tournament.timeControlDetails;

  const newGame: Omit<MultiplayerGame, "id"> = {
    gameId: match.gameId,
    whitePlayerId: match.whiteUid,
    whiteUsername: match.whiteName,
    whiteRating: match.whiteRating,
    whiteProfilePicture: match.whitePhoto || "",
    blackPlayerId: match.blackUid,
    blackUsername: match.blackName,
    blackRating: match.blackRating,
    blackProfilePicture: match.blackPhoto || "",
    timeControl: tc?.label || tournament.timeControl || "10+0",
    gameMode: tc?.mode || "rapid",
    initialTimeSeconds: tc?.initialTimeSeconds || 600,
    incrementSeconds: tc?.incrementSeconds || 0,
    status: "active",
    whiteReady: true,
    blackReady: true,
    currentTurn: "w",
    fen: initialFen,
    moveHistory: [],
    whiteTimeLeft: tc?.initialTimeSeconds || 600,
    blackTimeLeft: tc?.initialTimeSeconds || 600,
    lastMoveTimestamp: Date.now(),
    whiteBoardTheme: "classic_wood",
    blackBoardTheme: "classic_wood",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, "games", match.gameId), newGame);
}

/**
 * Record a completed match result in the tournament
 */
export async function recordTournamentMatchResult(
  tournamentId: string,
  roundNumber: number,
  matchId: string,
  result: "1-0" | "0-1" | "1/2-1/2",
  winnerUid: string | "draw"
): Promise<{ success: boolean; error?: string }> {
  try {
    const roundId = `round_${roundNumber}`;
    const matchRef = doc(db, "tournaments", tournamentId, "rounds", roundId, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return { success: false, error: "Match not found." };
    }

    const matchData = matchSnap.data() as TournamentMatch;
    if (matchData.status === "completed") {
      // Already recorded
      return { success: true };
    }

    // Update match document
    await updateDoc(matchRef, {
      status: "completed",
      result,
      winnerUid,
      completedAt: new Date().toISOString()
    });

    // Determine points earned
    let whiteScoreDelta = 0;
    let blackScoreDelta = 0;
    let whiteWin = 0;
    let whiteDraw = 0;
    let whiteLoss = 0;
    let blackWin = 0;
    let blackDraw = 0;
    let blackLoss = 0;

    if (result === "1-0") {
      whiteScoreDelta = 1;
      whiteWin = 1;
      blackLoss = 1;
    } else if (result === "0-1") {
      blackScoreDelta = 1;
      blackWin = 1;
      whiteLoss = 1;
    } else if (result === "1/2-1/2") {
      whiteScoreDelta = 0.5;
      blackScoreDelta = 0.5;
      whiteDraw = 1;
      blackDraw = 1;
    }

    // Update White Player document atomically
    const whitePlayerRef = doc(db, "tournaments", tournamentId, "players", matchData.whiteUid);
    const whiteSnap = await getDoc(whitePlayerRef);
    if (whiteSnap.exists()) {
      const p = whiteSnap.data() as TournamentPlayer;
      const opps = p.previousOpponents || [];
      if (!opps.includes(matchData.blackUid)) opps.push(matchData.blackUid);

      await updateDoc(whitePlayerRef, {
        score: (p.score || 0) + whiteScoreDelta,
        wins: (p.wins || 0) + whiteWin,
        draws: (p.draws || 0) + whiteDraw,
        losses: (p.losses || 0) + whiteLoss,
        gamesPlayed: (p.gamesPlayed || 0) + 1,
        whiteGames: (p.whiteGames || 0) + 1,
        previousOpponents: opps
      });
    }

    // Update Black Player document atomically
    const blackPlayerRef = doc(db, "tournaments", tournamentId, "players", matchData.blackUid);
    const blackSnap = await getDoc(blackPlayerRef);
    if (blackSnap.exists()) {
      const p = blackSnap.data() as TournamentPlayer;
      const opps = p.previousOpponents || [];
      if (!opps.includes(matchData.whiteUid)) opps.push(matchData.whiteUid);

      await updateDoc(blackPlayerRef, {
        score: (p.score || 0) + blackScoreDelta,
        wins: (p.wins || 0) + blackWin,
        draws: (p.draws || 0) + blackDraw,
        losses: (p.losses || 0) + blackLoss,
        gamesPlayed: (p.gamesPlayed || 0) + 1,
        blackGames: (p.blackGames || 0) + 1,
        previousOpponents: opps
      });
    }

    // Check if the whole round is completed
    await checkAndAdvanceRound(tournamentId, roundNumber);

    return { success: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, `tournaments/${tournamentId}/matches`);
    return { success: false, error: err.message || "Failed to record match result" };
  }
}

/**
 * Checks if current round is complete and advances to next round or finishes tournament
 */
export async function checkAndAdvanceRound(
  tournamentId: string,
  roundNumber: number
): Promise<void> {
  const roundId = `round_${roundNumber}`;
  const roundRef = doc(db, "tournaments", tournamentId, "rounds", roundId);
  const matchesRef = collection(db, "tournaments", tournamentId, "rounds", roundId, "matches");

  const mSnap = await getDocs(matchesRef);
  const matches: TournamentMatch[] = [];
  mSnap.forEach((d) => matches.push(d.data() as TournamentMatch));

  const completedMatches = matches.filter((m) => m.status === "completed");
  await updateDoc(roundRef, {
    completedMatches: completedMatches.length,
    totalMatches: matches.length
  });

  if (completedMatches.length < matches.length) {
    // Round is not yet complete
    return;
  }

  // Mark round as completed
  await updateDoc(roundRef, {
    status: "completed",
    completedAt: new Date().toISOString()
  });

  // Check tournament status
  const tRef = doc(db, "tournaments", tournamentId);
  const tSnap = await getDoc(tRef);
  if (!tSnap.exists()) return;

  const tData = tSnap.data() as Tournament;

  if (roundNumber < tData.totalRounds) {
    // Generate Next Round!
    await generateAndStartNextRound(tournamentId, roundNumber + 1, tData);
  } else {
    // Tournament Finished!
    await finalizeTournamentInternal(tournamentId, tData);
  }
}

/**
 * Generates and starts next round (Round 2+)
 */
async function generateAndStartNextRound(
  tournamentId: string,
  nextRoundNumber: number,
  tournament: Tournament
) {
  const pSnap = await getDocs(collection(db, "tournaments", tournamentId, "players"));
  const players: TournamentPlayer[] = [];
  pSnap.forEach((d) => players.push(d.data() as TournamentPlayer));

  const nextMatches = tournament.format === "round_robin"
    ? generateRoundRobinPairings(tournamentId, nextRoundNumber, players)
    : generateSwissSubsequentRoundPairings(tournamentId, nextRoundNumber, players);

  const roundDocId = `round_${nextRoundNumber}`;
  const nextRoundDoc: TournamentRound = {
    roundId: roundDocId,
    roundNumber: nextRoundNumber,
    status: "active",
    createdAt: new Date().toISOString(),
    totalMatches: nextMatches.length,
    completedMatches: nextMatches.filter((m) => m.status === "completed").length
  };

  await setDoc(doc(db, "tournaments", tournamentId, "rounds", roundDocId), nextRoundDoc);

  for (const match of nextMatches) {
    await setDoc(
      doc(db, "tournaments", tournamentId, "rounds", roundDocId, "matches", match.matchId),
      match
    );

    if (!match.isBye && match.gameId) {
      await createTournamentGameSession(tournament, match);
    }
  }

  await updateDoc(doc(db, "tournaments", tournamentId), {
    currentRound: nextRoundNumber
  });
}

/**
 * Finalizes tournament: computes tiebreaks, determines champion and podium
 */
async function finalizeTournamentInternal(
  tournamentId: string,
  tournament: Tournament
) {
  // Fetch all players
  const pSnap = await getDocs(collection(db, "tournaments", tournamentId, "players"));
  const players: TournamentPlayer[] = [];
  pSnap.forEach((d) => players.push(d.data() as TournamentPlayer));

  // Fetch all completed matches across all rounds
  const allMatches: TournamentMatch[] = [];
  for (let r = 1; r <= tournament.totalRounds; r++) {
    const mSnap = await getDocs(
      collection(db, "tournaments", tournamentId, "rounds", `round_${r}`, "matches")
    );
    mSnap.forEach((d) => allMatches.push(d.data() as TournamentMatch));
  }

  // Calculate final standings and tiebreaks
  const finalStandings = calculateTournamentStandings(players, allMatches, tournament.tiebreakMethod);
  const podium = extractPodium(finalStandings);

  // Update individual player ranks and tiebreaks in Firestore
  for (const p of finalStandings) {
    await updateDoc(doc(db, "tournaments", tournamentId, "players", p.uid), {
      rank: p.rank,
      buchholzScore: p.buchholzScore,
      sonnebornBergerScore: p.sonnebornBergerScore
    });
  }

  // Update tournament doc with status completed and podium
  await updateDoc(doc(db, "tournaments", tournamentId), {
    status: "completed",
    completedAt: new Date().toISOString(),
    champion: podium.champion,
    secondPlace: podium.secondPlace,
    thirdPlace: podium.thirdPlace
  });

  if (tournament.roomId) {
    await updateDoc(doc(db, "tournamentRooms", tournament.roomId), {
      status: "completed"
    }).catch(() => {});
  }
}

/**
 * Subscribe to a single tournament document
 */
export function subscribeToTournament(
  tournamentId: string,
  onUpdate: (t: Tournament | null) => void
) {
  if (!tournamentId) return () => {};
  return onSnapshot(doc(db, "tournaments", tournamentId), (snap) => {
    if (snap.exists()) {
      onUpdate({ ...snap.data(), id: snap.id } as Tournament);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `tournaments/${tournamentId}`);
  });
}

/**
 * Subscribe to players in a tournament
 */
export function subscribeToTournamentPlayers(
  tournamentId: string,
  onUpdate: (players: TournamentPlayer[]) => void
) {
  if (!tournamentId) return () => {};
  const colRef = collection(db, "tournaments", tournamentId, "players");
  return onSnapshot(colRef, (snap) => {
    const list: TournamentPlayer[] = [];
    snap.forEach((d) => list.push(d.data() as TournamentPlayer));
    // Sort by score descending, then rating
    list.sort((a, b) => (b.score !== a.score ? b.score - a.score : (b.rating || 1200) - (a.rating || 1200)));
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `tournaments/${tournamentId}/players`);
  });
}

/**
 * Subscribe to all rounds in a tournament
 */
export function subscribeToTournamentRounds(
  tournamentId: string,
  onUpdate: (rounds: TournamentRound[]) => void
) {
  if (!tournamentId) return () => {};
  const colRef = collection(db, "tournaments", tournamentId, "rounds");
  return onSnapshot(colRef, (snap) => {
    const list: TournamentRound[] = [];
    snap.forEach((d) => list.push(d.data() as TournamentRound));
    list.sort((a, b) => a.roundNumber - b.roundNumber);
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `tournaments/${tournamentId}/rounds`);
  });
}

/**
 * Subscribe to matches of a specific round
 */
export function subscribeToRoundMatches(
  tournamentId: string,
  roundNumber: number,
  onUpdate: (matches: TournamentMatch[]) => void
) {
  if (!tournamentId || !roundNumber) return () => {};
  const colRef = collection(db, "tournaments", tournamentId, "rounds", `round_${roundNumber}`, "matches");
  return onSnapshot(colRef, (snap) => {
    const list: TournamentMatch[] = [];
    snap.forEach((d) => list.push(d.data() as TournamentMatch));
    list.sort((a, b) => a.boardNumber - b.boardNumber);
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `tournaments/${tournamentId}/rounds/round_${roundNumber}/matches`);
  });
}

/**
 * Subscribe to user's tournaments (hosted or participant)
 */
export function subscribeToUserTournaments(
  userId: string,
  onUpdate: (tournaments: Tournament[]) => void
) {
  if (!userId) return () => {};
  const tCol = collection(db, "tournaments");

  // Query all tournaments
  return onSnapshot(tCol, (snap) => {
    const list: Tournament[] = [];
    snap.forEach((d) => {
      const data = d.data() as Tournament;
      list.push({ ...data, id: d.id });
    });
    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, "tournaments");
  });
}

/**
 * Aliases & wrappers for component consumption
 */
export async function startTournament(
  tournamentId: string,
  hostUid?: string
): Promise<{ success: boolean; error?: string }> {
  let uid = hostUid;
  if (!uid) {
    const tSnap = await getDoc(doc(db, "tournaments", tournamentId));
    if (!tSnap.exists()) return { success: false, error: "Tournament not found" };
    uid = (tSnap.data() as Tournament).hostUid;
  }
  return startFriendsTournament(tournamentId, uid);
}

export async function cancelTournament(
  tournamentId: string,
  hostUid?: string
): Promise<{ success: boolean; error?: string }> {
  let uid = hostUid;
  if (!uid) {
    const tSnap = await getDoc(doc(db, "tournaments", tournamentId));
    if (!tSnap.exists()) return { success: false, error: "Tournament not found" };
    uid = (tSnap.data() as Tournament).hostUid;
  }
  return cancelFriendsTournament(tournamentId, uid);
}

export async function advanceTournamentRound(
  tournamentId: string,
  roundNumber?: number
): Promise<void> {
  let currentRound = roundNumber;
  if (!currentRound) {
    const tSnap = await getDoc(doc(db, "tournaments", tournamentId));
    if (!tSnap.exists()) return;
    currentRound = (tSnap.data() as Tournament).currentRound;
  }
  await checkAndAdvanceRound(tournamentId, currentRound);
}

export async function finalizeTournament(
  tournamentId: string,
  tournament?: Tournament
): Promise<void> {
  let tData = tournament;
  if (!tData) {
    const tSnap = await getDoc(doc(db, "tournaments", tournamentId));
    if (!tSnap.exists()) return;
    tData = tSnap.data() as Tournament;
  }
  await finalizeTournamentInternal(tournamentId, tData);
}

export async function fetchUserTournaments(userId: string): Promise<Tournament[]> {
  try {
    const tSnap = await getDocs(collection(db, "tournaments"));
    const list: Tournament[] = [];
    tSnap.forEach((d) => {
      const data = d.data() as Tournament;
      list.push({ ...data, id: d.id });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    return [];
  }
}

export function subscribeToTournamentMatches(
  tournamentId: string,
  roundNumber: number,
  onUpdate: (matches: TournamentMatch[]) => void
) {
  return subscribeToRoundMatches(tournamentId, roundNumber, onUpdate);
}
