import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from "../lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { GameRequest, MultiplayerGame, GameMoveRecord } from "../types";
import { Chess } from "chess.js";

/**
 * Search for a user profile in Firestore by username
 */
export async function searchUserByUsername(searchQuery: string): Promise<{
  id: string;
  username: string;
  elo: number;
  level: number;
  profilePicture?: string;
  email?: string;
} | null> {
  const trimmed = searchQuery.trim();
  if (!trimmed) return null;

  try {
    const usersRef = collection(db, "users");
    // Check exact username match
    const q1 = query(usersRef, where("username", "==", trimmed), limit(1));
    const snap1 = await getDocs(q1);

    if (!snap1.empty) {
      const d = snap1.docs[0].data();
      return {
        id: snap1.docs[0].id,
        username: d.username || trimmed,
        elo: d.elo || 1200,
        level: d.level || 1,
        profilePicture: d.profilePicture || d.profileImageUrl || "",
        email: d.email || ""
      };
    }

    // Try case-insensitive comparison over fetched results or local fallback
    const allSnap = await getDocs(query(usersRef, limit(100)));
    let foundDoc: any = null;
    allSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.username && data.username.toLowerCase() === trimmed.toLowerCase()) {
        foundDoc = { id: docSnap.id, ...data };
      }
    });

    if (foundDoc) {
      return {
        id: foundDoc.id,
        username: foundDoc.username,
        elo: foundDoc.elo || 1200,
        level: foundDoc.level || 1,
        profilePicture: foundDoc.profilePicture || foundDoc.profileImageUrl || "",
        email: foundDoc.email || ""
      };
    }

    // Check registered local users DB in localStorage as fallback
    const registeredUsersRaw = localStorage.getItem("chessmaster_registered_users");
    if (registeredUsersRaw) {
      const registeredUsers = JSON.parse(registeredUsersRaw);
      const match = registeredUsers.find(
        (u: any) => u.username && u.username.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        return {
          id: match.email || match.username,
          username: match.username,
          elo: match.profile?.elo || 1200,
          level: match.profile?.level || 1,
          profilePicture: match.profile?.profilePicture || match.profile?.profileImageUrl || "",
          email: match.email || ""
        };
      }
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "users");
    return null;
  }
}

/**
 * Send a game request to a friend
 */
export async function sendGameRequest(sender: {
  id: string;
  username: string;
  elo: number;
  level: number;
  profilePicture?: string;
}, receiver: {
  id: string;
  username: string;
}): Promise<{ success: boolean; message?: string }> {
  if (sender.username.toLowerCase() === receiver.username.toLowerCase()) {
    return { success: false, message: "You cannot send a challenge to yourself." };
  }

  const path = "gameRequests";
  try {
    const requestsRef = collection(db, "gameRequests");

    // Check if duplicate pending request exists
    const qPending = query(
      requestsRef, 
      where("senderUsername", "==", sender.username), 
      where("receiverUsername", "==", receiver.username), 
      where("status", "==", "pending")
    );
    const snapPending = await getDocs(qPending);
    if (!snapPending.empty) {
      return { success: false, message: "Game request already sent." };
    }

    // Check reverse pending request
    const qReverse = query(
      requestsRef,
      where("senderUsername", "==", receiver.username),
      where("receiverUsername", "==", sender.username),
      where("status", "==", "pending")
    );
    const snapReverse = await getDocs(qReverse);
    if (!snapReverse.empty) {
      return { success: false, message: "This player has already sent you a challenge! Check your received requests." };
    }

    // Check if game already in progress
    const gamesRef = collection(db, "games");
    const qActive = query(
      gamesRef,
      where("status", "==", "active")
    );
    const snapActive = await getDocs(qActive);
    let inProgress = false;
    snapActive.forEach((d) => {
      const g = d.data();
      const players = [g.whiteUsername?.toLowerCase(), g.blackUsername?.toLowerCase()];
      if (players.includes(sender.username.toLowerCase()) && players.includes(receiver.username.toLowerCase())) {
        inProgress = true;
      }
    });

    if (inProgress) {
      return { success: false, message: "Game already in progress." };
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRequest: Omit<GameRequest, "id"> = {
      requestId,
      senderId: sender.id,
      senderUsername: sender.username,
      senderRating: sender.elo,
      senderLevel: sender.level,
      senderProfilePicture: sender.profilePicture || "",
      receiverId: receiver.id,
      receiverUsername: receiver.username,
      status: "pending",
      type: "game_invitation",
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "gameRequests", requestId), newRequest);
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, message: "Failed to send request. Please try again." };
  }
}

/**
 * Subscribe to incoming & outgoing game requests for a user
 */
export function subscribeToUserGameRequests(
  username: string, 
  onUpdate: (requests: GameRequest[]) => void
) {
  if (!username) return () => {};

  const requestsRef = collection(db, "gameRequests");
  return onSnapshot(requestsRef, (snapshot) => {
    const list: GameRequest[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as GameRequest;
      if (
        data.senderUsername?.toLowerCase() === username.toLowerCase() ||
        data.receiverUsername?.toLowerCase() === username.toLowerCase()
      ) {
        list.push({ ...data, id: docSnap.id });
      }
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "gameRequests");
  });
}

/**
 * Update request status (accepted, declined, etc.)
 */
export async function updateGameRequestStatus(
  requestId: string, 
  status: "accepted" | "declined" | "expired",
  gameId?: string,
  gameModeConfig?: any
) {
  const path = `gameRequests/${requestId}`;
  try {
    const reqRef = doc(db, "gameRequests", requestId);
    const updatePayload: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (gameId) updatePayload.gameId = gameId;
    if (gameModeConfig) updatePayload.gameModeConfig = gameModeConfig;

    await updateDoc(reqRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Create a new real-time multiplayer game session
 */
export async function createMultiplayerGame(
  request: GameRequest,
  config: {
    mode: string;
    timeControlLabel: string;
    initialTimeSeconds: number;
    incrementSeconds: number;
    colorPreference: "white" | "black" | "random";
    senderBoardTheme?: string;
    receiverBoardTheme?: string;
  }
): Promise<string> {
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `games/${gameId}`;

  // Resolve player colors
  let senderColor: "white" | "black" = "white";
  if (config.colorPreference === "white") {
    senderColor = "white";
  } else if (config.colorPreference === "black") {
    senderColor = "black";
  } else {
    senderColor = Math.random() > 0.5 ? "white" : "black";
  }

  const whitePlayer = senderColor === "white" ? {
    id: request.senderId,
    username: request.senderUsername,
    rating: request.senderRating,
    pic: request.senderProfilePicture,
    theme: config.senderBoardTheme || "classic_wood"
  } : {
    id: request.receiverId,
    username: request.receiverUsername,
    rating: 1200,
    pic: "",
    theme: config.receiverBoardTheme || "classic_wood"
  };

  const blackPlayer = senderColor === "white" ? {
    id: request.receiverId,
    username: request.receiverUsername,
    rating: 1200,
    pic: "",
    theme: config.receiverBoardTheme || "classic_wood"
  } : {
    id: request.senderId,
    username: request.senderUsername,
    rating: request.senderRating,
    pic: request.senderProfilePicture,
    theme: config.senderBoardTheme || "classic_wood"
  };

  const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const newGame: Omit<MultiplayerGame, "id"> = {
    gameId,
    whitePlayerId: whitePlayer.id,
    whiteUsername: whitePlayer.username,
    whiteRating: whitePlayer.rating,
    whiteProfilePicture: whitePlayer.pic || "",
    blackPlayerId: blackPlayer.id,
    blackUsername: blackPlayer.username,
    blackRating: blackPlayer.rating,
    blackProfilePicture: blackPlayer.pic || "",
    timeControl: config.timeControlLabel,
    gameMode: config.mode,
    initialTimeSeconds: config.initialTimeSeconds,
    incrementSeconds: config.incrementSeconds,
    status: "lobby",
    whiteReady: false,
    blackReady: false,
    currentTurn: "w",
    fen: initialFen,
    moveHistory: [],
    whiteTimeLeft: config.initialTimeSeconds,
    blackTimeLeft: config.initialTimeSeconds,
    lastMoveTimestamp: Date.now(),
    whiteBoardTheme: whitePlayer.theme,
    blackBoardTheme: blackPlayer.theme,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "games", gameId), newGame);
    await updateGameRequestStatus(request.requestId, "accepted", gameId, {
      mode: config.mode,
      timeControlLabel: config.timeControlLabel,
      initialTimeSeconds: config.initialTimeSeconds,
      incrementSeconds: config.incrementSeconds
    });
    return gameId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Toggle a player's ready state in the pre-game lobby.
 * When both players are ready, transition game status to "active".
 */
export async function togglePlayerReadyState(
  gameId: string,
  playerColor: "w" | "b",
  currentWhiteReady: boolean = false,
  currentBlackReady: boolean = false
) {
  const path = `games/${gameId}`;
  try {
    const gameRef = doc(db, "games", gameId);
    let nextWhiteReady = currentWhiteReady;
    let nextBlackReady = currentBlackReady;

    if (playerColor === "w") {
      nextWhiteReady = !currentWhiteReady;
    } else {
      nextBlackReady = !currentBlackReady;
    }

    const bothReady = nextWhiteReady && nextBlackReady;

    const payload: any = {
      whiteReady: nextWhiteReady,
      blackReady: nextBlackReady,
      updatedAt: new Date().toISOString()
    };

    if (bothReady) {
      payload.status = "active";
      payload.lastMoveTimestamp = Date.now();
    }

    await updateDoc(gameRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribe to real-time updates for a single game
 */
export function subscribeToGame(
  gameId: string, 
  onUpdate: (game: MultiplayerGame | null) => void
) {
  if (!gameId) return () => {};

  const gameRef = doc(db, "games", gameId);
  return onSnapshot(gameRef, (snap) => {
    if (snap.exists()) {
      onUpdate({ ...snap.data(), id: snap.id } as MultiplayerGame);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `games/${gameId}`);
  });
}

/**
 * Subscribe to all active or completed games for a user
 */
export function subscribeToUserActiveGames(
  username: string, 
  onUpdate: (games: MultiplayerGame[]) => void
) {
  if (!username) return () => {};

  const gamesRef = collection(db, "games");
  return onSnapshot(gamesRef, (snapshot) => {
    const list: MultiplayerGame[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as MultiplayerGame;
      if (
        data.whiteUsername?.toLowerCase() === username.toLowerCase() ||
        data.blackUsername?.toLowerCase() === username.toLowerCase()
      ) {
        list.push({ ...data, id: docSnap.id });
      }
    });
    // Sort by updatedAt newest first
    list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "games");
  });
}

/**
 * Submit a move to an ongoing real-time multiplayer game
 */
export async function makeMultiplayerMove(
  game: MultiplayerGame,
  move: { from: string; to: string; promotion?: string },
  playerColor: "w" | "b"
): Promise<{ success: boolean; error?: string }> {
  if (game.status !== "active") {
    return { success: false, error: "Game is not active." };
  }

  if (game.currentTurn !== playerColor) {
    return { success: false, error: "It is not your turn." };
  }

  const chess = new Chess(game.fen);
  let moveResult: any = null;
  try {
    moveResult = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || "q"
    });
  } catch {
    return { success: false, error: "Illegal move." };
  }

  if (!moveResult) {
    return { success: false, error: "Illegal move." };
  }

  // Calculate elapsed time for current turn
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.floor((now - (game.lastMoveTimestamp || now)) / 1000));
  
  let newWhiteTime = game.whiteTimeLeft;
  let newBlackTime = game.blackTimeLeft;

  if (playerColor === "w") {
    newWhiteTime = Math.max(0, game.whiteTimeLeft - elapsedSeconds) + (game.incrementSeconds || 0);
  } else {
    newBlackTime = Math.max(0, game.blackTimeLeft - elapsedSeconds) + (game.incrementSeconds || 0);
  }

  // Check game ending conditions
  let newStatus: "active" | "completed" = "active";
  let winner: "white" | "black" | "draw" | null = null;
  let finishReason: any = null;

  if (chess.isCheckmate()) {
    newStatus = "completed";
    winner = playerColor === "w" ? "white" : "black";
    finishReason = "checkmate";
  } else if (
    chess.isDraw() || 
    chess.isStalemate() || 
    chess.isThreefoldRepetition() || 
    chess.isInsufficientMaterial() ||
    (chess as any).isDrawByFiftyMoves?.()
  ) {
    newStatus = "completed";
    winner = "draw";
    if (chess.isStalemate()) finishReason = "stalemate";
    else if (chess.isThreefoldRepetition()) finishReason = "threefold";
    else if (chess.isInsufficientMaterial()) finishReason = "insufficient";
    else if ((chess as any).isDrawByFiftyMoves?.()) finishReason = "fifty_move";
    else finishReason = "draw_agreement";
  }

  const moveRecord: GameMoveRecord = {
    moveNumber: Math.ceil(((game.moveHistory?.length || 0) + 1) / 2),
    color: playerColor,
    from: move.from,
    to: move.to,
    san: moveResult.san,
    fenAfter: chess.fen(),
    timestamp: now
  };

  const updatedMoveHistory = [...(game.moveHistory || []), moveRecord];
  const nextTurn: "w" | "b" = playerColor === "w" ? "b" : "w";

  const winnerId = winner === "white" ? game.whitePlayerId : winner === "black" ? game.blackPlayerId : winner === "draw" ? "draw" : null;
  const resultStr = winner === "white" ? "1-0" : winner === "black" ? "0-1" : winner === "draw" ? "1/2-1/2" : null;

  const path = `games/${game.gameId}`;
  try {
    const gameRef = doc(db, "games", game.gameId);
    const updatePayload: any = {
      fen: chess.fen(),
      currentTurn: nextTurn,
      moveHistory: updatedMoveHistory,
      whiteTimeLeft: newWhiteTime,
      blackTimeLeft: newBlackTime,
      lastMoveTimestamp: now,
      status: newStatus,
      winner: winner,
      finishReason: finishReason,
      updatedAt: new Date().toISOString()
    };

    if (newStatus === "completed") {
      updatePayload.winnerId = winnerId;
      updatePayload.result = resultStr;
      updatePayload.terminationReason = finishReason;
      updatePayload.gameType = game.gameMode || "rapid";
      updatePayload.timeControl = game.timeControl || "10+5";
      updatePayload.moveCount = updatedMoveHistory.length;
      updatePayload.completedAt = new Date().toISOString();
    }

    await updateDoc(gameRef, updatePayload);

    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false, error: "Failed to update game state." };
  }
}

/**
 * Handle player resignation
 */
export async function resignMultiplayerGame(gameId: string, resigningColor: "white" | "black", gameData?: MultiplayerGame) {
  const winner = resigningColor === "white" ? "black" : "white";
  const path = `games/${gameId}`;
  try {
    const gameRef = doc(db, "games", gameId);
    const winnerId = gameData 
      ? (winner === "white" ? gameData.whitePlayerId : gameData.blackPlayerId)
      : winner;
    const resultStr = winner === "white" ? "1-0" : "0-1";

    await updateDoc(gameRef, {
      status: "completed",
      winner: winner,
      winnerId: winnerId,
      result: resultStr,
      finishReason: "resignation",
      terminationReason: "resignation",
      gameType: gameData?.gameMode || "rapid",
      timeControl: gameData?.timeControl || "10+5",
      moveCount: gameData?.moveHistory?.length || 0,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Handle game timeout
 */
export async function timeoutMultiplayerGame(gameId: string, timedOutColor: "white" | "black", gameData?: MultiplayerGame) {
  const winner = timedOutColor === "white" ? "black" : "white";
  const path = `games/${gameId}`;
  try {
    const gameRef = doc(db, "games", gameId);
    const winnerId = gameData 
      ? (winner === "white" ? gameData.whitePlayerId : gameData.blackPlayerId)
      : winner;
    const resultStr = winner === "white" ? "1-0" : "0-1";

    await updateDoc(gameRef, {
      status: "completed",
      winner: winner,
      winnerId: winnerId,
      result: resultStr,
      finishReason: "timeout",
      terminationReason: "timeout",
      gameType: gameData?.gameMode || "rapid",
      timeControl: gameData?.timeControl || "10+5",
      moveCount: gameData?.moveHistory?.length || 0,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Offer or accept/decline draw
 */
export async function offerOrRespondDraw(
  gameId: string, 
  username: string, 
  action: "offer" | "accept" | "decline",
  gameData?: MultiplayerGame
) {
  const path = `games/${gameId}`;
  try {
    const gameRef = doc(db, "games", gameId);
    if (action === "offer") {
      await updateDoc(gameRef, {
        drawOfferedBy: username,
        updatedAt: new Date().toISOString()
      });
    } else if (action === "accept") {
      await updateDoc(gameRef, {
        status: "completed",
        winner: "draw",
        winnerId: "draw",
        result: "1/2-1/2",
        finishReason: "draw_agreement",
        terminationReason: "draw_agreement",
        gameType: gameData?.gameMode || "rapid",
        timeControl: gameData?.timeControl || "10+5",
        moveCount: gameData?.moveHistory?.length || 0,
        drawOfferedBy: null,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      await updateDoc(gameRef, {
        drawOfferedBy: null,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Request or accept a rematch
 */
export async function handleRematchRequest(
  game: MultiplayerGame, 
  requestingUsername: string,
  action: "request" | "accept" | "decline"
): Promise<string | null> {
  const path = `games/${game.gameId}`;
  try {
    const gameRef = doc(db, "games", game.gameId);

    if (action === "request") {
      await updateDoc(gameRef, {
        rematchRequestedBy: requestingUsername,
        updatedAt: new Date().toISOString()
      });
      return null;
    } else if (action === "decline") {
      await updateDoc(gameRef, {
        rematchRequestedBy: null,
        updatedAt: new Date().toISOString()
      });
      return null;
    } else if (action === "accept") {
      // Create a brand new rematch game with swapped colors!
      const newGameId = `game_${Date.now()}_rematch_${Math.random().toString(36).substring(2, 6)}`;
      const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      const newGame: Omit<MultiplayerGame, "id"> = {
        gameId: newGameId,
        whitePlayerId: game.blackPlayerId,
        whiteUsername: game.blackUsername,
        whiteRating: game.blackRating,
        whiteProfilePicture: game.blackProfilePicture || "",
        blackPlayerId: game.whitePlayerId,
        blackUsername: game.whiteUsername,
        blackRating: game.whiteRating,
        blackProfilePicture: game.whiteProfilePicture || "",
        timeControl: game.timeControl,
        gameMode: game.gameMode,
        initialTimeSeconds: game.initialTimeSeconds,
        incrementSeconds: game.incrementSeconds,
        status: "active",
        currentTurn: "w",
        fen: initialFen,
        moveHistory: [],
        whiteTimeLeft: game.initialTimeSeconds,
        blackTimeLeft: game.initialTimeSeconds,
        lastMoveTimestamp: Date.now(),
        whiteBoardTheme: game.blackBoardTheme || "classic_wood",
        blackBoardTheme: game.whiteBoardTheme || "classic_wood",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "games", newGameId), newGame);
      await updateDoc(gameRef, {
        rematchGameId: newGameId,
        rematchRequestedBy: null,
        updatedAt: new Date().toISOString()
      });

      return newGameId;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return null;
  }
}

/**
 * Atomically finalize ratings for both players in a completed multiplayer match
 */
export async function finalizeMultiplayerGameRatings(
  gameId: string,
  winner: "white" | "black" | "draw",
  whiteUserId: string,
  blackUserId: string,
  gameModeKey: string = "rapid"
): Promise<{ whiteNewRating: number; blackNewRating: number; ratingDeltaWhite: number; ratingDeltaBlack: number } | null> {
  const path = `games/${gameId}`;
  try {
    const result = await runTransaction(db, async (transaction) => {
      const gameRef = doc(db, "games", gameId);
      const gameSnap = await transaction.get(gameRef);

      if (!gameSnap.exists()) {
        throw new Error("Game document not found.");
      }

      const gameData = gameSnap.data();
      if (gameData.ratingUpdated) {
        // Ratings already processed for this game
        return null;
      }

      const whiteRef = doc(db, "users", whiteUserId);
      const blackRef = doc(db, "users", blackUserId);

      const whiteSnap = await transaction.get(whiteRef);
      const blackSnap = await transaction.get(blackRef);

      const whiteData = whiteSnap.exists() ? whiteSnap.data() : {};
      const blackData = blackSnap.exists() ? blackSnap.data() : {};

      const modeKey = (gameModeKey || "rapid") as "bullet" | "blitz" | "rapid" | "classical";

      const whiteRatings = whiteData.ratings || { bullet: 400, blitz: 400, rapid: 400, classical: 400 };
      const blackRatings = blackData.ratings || { bullet: 400, blitz: 400, rapid: 400, classical: 400 };

      const whiteCurrRating = whiteRatings[modeKey] || whiteData.elo || whiteData.rating || 400;
      const blackCurrRating = blackRatings[modeKey] || blackData.elo || blackData.rating || 400;

      // Calculate rating delta
      let ratingDeltaWhite = 0;
      let ratingDeltaBlack = 0;

      if (winner === "white") {
        ratingDeltaWhite = 20;
        ratingDeltaBlack = -10;
      } else if (winner === "black") {
        ratingDeltaWhite = -10;
        ratingDeltaBlack = 20;
      } else {
        ratingDeltaWhite = 5;
        ratingDeltaBlack = 5;
      }

      const whiteNewRating = Math.max(100, whiteCurrRating + ratingDeltaWhite);
      const blackNewRating = Math.max(100, blackCurrRating + ratingDeltaBlack);

      // White payload
      if (whiteSnap.exists()) {
        const whiteModeStats = whiteData.modeStats?.[modeKey] || { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 };
        const updatedWhiteRatings = { ...whiteRatings, [modeKey]: whiteNewRating };
        const updatedWhiteModeStats = {
          ...(whiteData.modeStats || {}),
          [modeKey]: {
            games: (whiteModeStats.games || 0) + 1,
            wins: (whiteModeStats.wins || 0) + (winner === "white" ? 1 : 0),
            losses: (whiteModeStats.losses || 0) + (winner === "black" ? 1 : 0),
            draws: (whiteModeStats.draws || 0) + (winner === "draw" ? 1 : 0),
            highest: Math.max(whiteModeStats.highest || 400, whiteNewRating)
          }
        };

        transaction.update(whiteRef, {
          rating: whiteNewRating,
          elo: whiteNewRating,
          ratings: updatedWhiteRatings,
          modeStats: updatedWhiteModeStats,
          gamesPlayed: (whiteData.gamesPlayed || 0) + 1,
          wins: (whiteData.wins || 0) + (winner === "white" ? 1 : 0),
          losses: (whiteData.losses || 0) + (winner === "black" ? 1 : 0),
          draws: (whiteData.draws || 0) + (winner === "draw" ? 1 : 0)
        });
      }

      // Black payload
      if (blackSnap.exists()) {
        const blackModeStats = blackData.modeStats?.[modeKey] || { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 };
        const updatedBlackRatings = { ...blackRatings, [modeKey]: blackNewRating };
        const updatedBlackModeStats = {
          ...(blackData.modeStats || {}),
          [modeKey]: {
            games: (blackModeStats.games || 0) + 1,
            wins: (blackModeStats.wins || 0) + (winner === "black" ? 1 : 0),
            losses: (blackModeStats.losses || 0) + (winner === "white" ? 1 : 0),
            draws: (blackModeStats.draws || 0) + (winner === "draw" ? 1 : 0),
            highest: Math.max(blackModeStats.highest || 400, blackNewRating)
          }
        };

        transaction.update(blackRef, {
          rating: blackNewRating,
          elo: blackNewRating,
          ratings: updatedBlackRatings,
          modeStats: updatedBlackModeStats,
          gamesPlayed: (blackData.gamesPlayed || 0) + 1,
          wins: (blackData.wins || 0) + (winner === "black" ? 1 : 0),
          losses: (blackData.losses || 0) + (winner === "white" ? 1 : 0),
          draws: (blackData.draws || 0) + (winner === "draw" ? 1 : 0)
        });
      }

      // Mark game document as ratingUpdated: true
      transaction.update(gameRef, {
        ratingUpdated: true,
        updatedAt: new Date().toISOString()
      });

      return { whiteNewRating, blackNewRating, ratingDeltaWhite, ratingDeltaBlack };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return null;
  }
}
