import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { 
  MultiplayerGame, 
  GameMoveRecord,
  UserProfile,
  MatchRecord,
  GameModeKey,
  ModeStats,
  CompletedGameData
} from "../types";
import { 
  subscribeToGame, 
  makeMultiplayerMove, 
  resignMultiplayerGame, 
  timeoutMultiplayerGame, 
  offerOrRespondDraw, 
  handleRematchRequest,
  togglePlayerReadyState,
  finalizeMultiplayerGameRatings
} from "../services/multiplayerService";
import { saveUserProfileToFirestore } from "../services/firestoreService";
import { Chessboard } from "./Chessboard";
import { MoveHistoryPanel } from "./MoveHistoryPanel";
import { BoardThemeSelector } from "./BoardThemeSelector";
import { soundEngine } from "../utils/chessSound";
import { navigationManager } from "../utils/navigationManager";
import { 
  Swords, 
  Flag, 
  Handshake, 
  RotateCcw, 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Zap, 
  BarChart3, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  Hourglass,
  Play
} from "lucide-react";

interface FriendChessMatchProps {
  gameId: string;
  currentUsername: string;
  currentUserId: string;
  userProfile?: UserProfile;
  onBack: () => void;
  onFinishGoToDashboard?: () => void;
  onAnalyzeGame: (gameData: CompletedGameData | string) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  userBoardTheme?: string;
}

export const FriendChessMatch: React.FC<FriendChessMatchProps> = ({
  gameId,
  currentUsername,
  currentUserId,
  userProfile,
  onBack,
  onFinishGoToDashboard,
  onAnalyzeGame,
  onUpdateProfile,
  userBoardTheme = "classic_wood"
}) => {
  const [gameData, setGameData] = useState<MultiplayerGame | null>(null);
  const [chessInstance, setChessInstance] = useState<Chess>(new Chess());
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(userBoardTheme);

  // Clocks
  const [whiteClock, setWhiteClock] = useState<number>(600);
  const [blackClock, setBlackClock] = useState<number>(600);

  // Result modal visibility
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(true);
  const hasProcessedGameEndRef = useRef<boolean>(false);

  // Player role ("w" | "b")
  const isWhite = gameData?.whiteUsername?.toLowerCase() === currentUsername.toLowerCase();
  const isBlack = gameData?.blackUsername?.toLowerCase() === currentUsername.toLowerCase();
  const playerColor: "w" | "b" = isWhite ? "w" : "b";

  // Subscribe to real-time game updates from Firestore
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      if (updatedGame) {
        setGameData(updatedGame);
        try {
          const newChess = new Chess(updatedGame.fen);
          setChessInstance(newChess);
        } catch (e) {
          console.error("Error setting FEN:", e);
        }
        setWhiteClock(updatedGame.whiteTimeLeft);
        setBlackClock(updatedGame.blackTimeLeft);

        // If rematch was accepted, reset processed end ref & modal state
        if (updatedGame.status === "active") {
          hasProcessedGameEndRef.current = false;
          setShowGameOverModal(true);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  // Back navigation handling for FriendChessMatch
  useEffect(() => {
    const unregister = navigationManager.registerHandler({
      id: "friend-chess-match-back",
      priority: 85,
      handleBack: () => {
        if (showThemeModal) {
          setShowThemeModal(false);
          return true;
        }
        if (showResignConfirm) {
          setShowResignConfirm(false);
          return true;
        }
        if (showDrawConfirm) {
          setShowDrawConfirm(false);
          return true;
        }
        if (showLeaveConfirm) {
          setShowLeaveConfirm(false);
          return true;
        }

        // If game is active, prompt leave confirmation modal
        if (gameData?.status === "active") {
          setShowLeaveConfirm(true);
          return true;
        }

        // If game is finished or in lobby, navigate back
        onBack();
        return true;
      }
    });
    return unregister;
  }, [showThemeModal, showResignConfirm, showDrawConfirm, showLeaveConfirm, gameData?.status, onBack]);

  // Handle game finish -> update player stats once
  useEffect(() => {
    if (!gameData) return;

    const isFinished = gameData.status !== "active" && gameData.status !== "lobby";

    if (isFinished && !hasProcessedGameEndRef.current) {
      hasProcessedGameEndRef.current = true;

      const isMyWin = gameData.winner === (isWhite ? "white" : "black");
      const isMyLoss = gameData.winner === (isWhite ? "black" : "white");
      const isDraw = gameData.winner === "draw" || gameData.status === "draw";

      if (isMyWin) soundEngine.playVictory();
      else if (isMyLoss) soundEngine.playDefeat();
      else soundEngine.playGameEnd();

      // Trigger atomic transaction for both players' ratings in Firestore
      const winnerVal = gameData.winner === "white" ? "white" : gameData.winner === "black" ? "black" : "draw";
      finalizeMultiplayerGameRatings(
        gameData.gameId,
        winnerVal,
        gameData.whitePlayerId || gameData.whiteUsername,
        gameData.blackPlayerId || gameData.blackUsername,
        gameData.gameMode || "rapid"
      ).catch((err) => {
        console.warn("Unable to finalize multiplayer game ratings:", err);
      });

      // Update local profile & UI
      if (userProfile && onUpdateProfile) {
        const modeKey = (gameData.gameMode || "rapid") as GameModeKey;
        const currentRating = userProfile.ratings?.[modeKey] || userProfile.elo || 400;

        let ratingDelta = 0;
        if (isMyWin) ratingDelta = 20;
        else if (isMyLoss) ratingDelta = -10;
        else if (isDraw) ratingDelta = 5;

        const newRating = Math.max(100, currentRating + ratingDelta);
        const updatedRatings = {
          ...(userProfile.ratings || { bullet: 400, blitz: 400, rapid: 400, classical: 400 }),
          [modeKey]: newRating
        };

        const currentModeStats = userProfile.modeStats?.[modeKey] || { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 };
        const baseModeStats: Record<GameModeKey, ModeStats> = userProfile.modeStats || {
          bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
          blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
          rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
          classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
        };
        const updatedModeStats: Record<GameModeKey, ModeStats> = {
          ...baseModeStats,
          [modeKey]: {
            games: (currentModeStats.games || 0) + 1,
            wins: (currentModeStats.wins || 0) + (isMyWin ? 1 : 0),
            losses: (currentModeStats.losses || 0) + (isMyLoss ? 1 : 0),
            draws: (currentModeStats.draws || 0) + (isDraw ? 1 : 0),
            highest: Math.max(currentModeStats.highest || 400, newRating)
          }
        };

        const newMatchRecord: MatchRecord = {
          id: gameData.gameId,
          gameMode: modeKey,
          timeControl: gameData.timeControl || "10+5",
          opponent: isWhite ? gameData.blackUsername : gameData.whiteUsername,
          opponentRating: isWhite ? (gameData.blackRating || 400) : (gameData.whiteRating || 400),
          result: isMyWin ? "win" : isMyLoss ? "loss" : "draw",
          ratingBefore: currentRating,
          ratingAfter: newRating,
          ratingChange: ratingDelta,
          moves: gameData.moveHistory?.length || 0,
          accuracy: 85,
          date: new Date().toISOString()
        };

        const updatedProfile: UserProfile = {
          ...userProfile,
          gamesPlayed: (userProfile.gamesPlayed || 0) + 1,
          wins: (userProfile.wins || 0) + (isMyWin ? 1 : 0),
          losses: (userProfile.losses || 0) + (isMyLoss ? 1 : 0),
          draws: (userProfile.draws || 0) + (isDraw ? 1 : 0),
          elo: newRating,
          rating: newRating,
          highestRating: Math.max(userProfile.highestRating || 400, newRating),
          ratings: updatedRatings,
          modeStats: updatedModeStats,
          matchHistory: [newMatchRecord, ...(userProfile.matchHistory || [])].slice(0, 50)
        };

        onUpdateProfile(updatedProfile);
        if (!updatedProfile.isGuest) {
          const userToSave = {
            ...updatedProfile,
            id: currentUserId || updatedProfile.email || updatedProfile.username,
            createdAt: (updatedProfile as any).createdAt || new Date().toISOString()
          };
          saveUserProfileToFirestore(userToSave as any).catch((err) => {
            console.error("Failed saving rating to Firestore:", err);
          });
        }
      }
    }
  }, [gameData, isWhite, userProfile, onUpdateProfile]);

  const handleDirectGoToDashboard = () => {
    if (onFinishGoToDashboard) {
      onFinishGoToDashboard();
    } else {
      onBack();
    }
  };

  // Real-time local clock countdown & timeout handler
  useEffect(() => {
    if (!gameData || gameData.status !== "active") return;

    const timer = setInterval(() => {
      const now = Date.now();
      const lastMoveTs = gameData.lastMoveTimestamp || now;
      const elapsed = Math.floor((now - lastMoveTs) / 1000);

      if (gameData.currentTurn === "w") {
        const remaining = Math.max(0, gameData.whiteTimeLeft - elapsed);
        setWhiteClock(remaining);

        if (remaining <= 0 && isWhite) {
          timeoutMultiplayerGame(gameData.gameId, "white", gameData);
        }
      } else {
        const remaining = Math.max(0, gameData.blackTimeLeft - elapsed);
        setBlackClock(remaining);

        if (remaining <= 0 && isBlack) {
          timeoutMultiplayerGame(gameData.gameId, "black", gameData);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameData, isWhite, isBlack]);

  // Handle player making a move on the board
  const handleBoardMove = async (from: string, to: string, promotion?: string) => {
    if (!gameData || gameData.status !== "active") return false;

    if ((gameData.currentTurn === "w" && !isWhite) || (gameData.currentTurn === "b" && !isBlack)) {
      setMoveError("It is your opponent's turn.");
      soundEngine.playIllegalMove();
      setTimeout(() => setMoveError(null), 2500);
      return false;
    }

    setIsSubmittingMove(true);
    setMoveError(null);

    const result = await makeMultiplayerMove(gameData, { from, to, promotion }, playerColor);
    setIsSubmittingMove(false);

    if (!result.success) {
      setMoveError(result.error || "Illegal move.");
      soundEngine.playIllegalMove();
      setTimeout(() => setMoveError(null), 2500);
      return false;
    }

    soundEngine.playMove();
    return true;
  };

  // Toggle ready state in pre-game match lobby
  const handleToggleReady = async () => {
    if (!gameData || gameData.status !== "lobby") return;
    await togglePlayerReadyState(
      gameData.gameId,
      playerColor,
      gameData.whiteReady || false,
      gameData.blackReady || false
    );
  };

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!gameData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-amber-200/80 font-semibold text-sm">Connecting to real-time chess arena...</p>
      </div>
    );
  }

  // Derive opponent & current player info
  const whitePlayerInfo = {
    name: gameData.whiteUsername,
    rating: gameData.whiteRating || 1200,
    avatar: gameData.whiteProfilePicture
  };

  const blackPlayerInfo = {
    name: gameData.blackUsername,
    rating: gameData.blackRating || 1200,
    avatar: gameData.blackProfilePicture
  };

  const topPlayer = isWhite ? blackPlayerInfo : whitePlayerInfo;
  const bottomPlayer = isWhite ? whitePlayerInfo : blackPlayerInfo;

  const topClock = isWhite ? blackClock : whiteClock;
  const bottomClock = isWhite ? whiteClock : blackClock;

  const isMyTurn = (gameData.currentTurn === "w" && isWhite) || (gameData.currentTurn === "b" && isBlack);

  // Compute captured pieces
  const capturedWhite: string[] = []; // Black pieces captured by White
  const capturedBlack: string[] = []; // White pieces captured by Black
  try {
    chessInstance.history({ verbose: true }).forEach((m) => {
      if (m.captured) {
        if (m.color === "w") {
          capturedWhite.push(m.captured);
        } else {
          capturedBlack.push(m.captured);
        }
      }
    });
  } catch {
    // fallback
  }

  const pieceSymbols: Record<string, string> = {
    p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚"
  };

  // Convert game moves to SAN history format
  const formattedMoveHistory = (gameData.moveHistory || []).reduce((acc: any[], move: GameMoveRecord) => {
    if (move.color === "w") {
      acc.push({
        moveNumber: acc.length + 1,
        whiteSan: move.san
      });
    } else {
      if (acc.length > 0 && !acc[acc.length - 1].blackSan) {
        acc[acc.length - 1].blackSan = move.san;
      } else {
        acc.push({
          moveNumber: acc.length + 1,
          whiteSan: "...",
          blackSan: move.san
        });
      }
    }
    return acc;
  }, []);

  // ----------------------------------------------------
  // PRE-GAME MATCH LOBBY VIEW
  // ----------------------------------------------------
  if (gameData.status === "lobby") {
    const myReady = isWhite ? gameData.whiteReady : gameData.blackReady;
    const opponentReady = isWhite ? gameData.blackReady : gameData.whiteReady;

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in py-8">
        <div className="flex items-center justify-between bg-[#0F121E]/90 border border-amber-500/20 p-4 rounded-2xl backdrop-blur-xl shadow-xl">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-900/80 hover:bg-amber-500/20 text-amber-200 rounded-xl border border-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Leave Lobby</span>
          </button>
          <div className="text-right">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              {gameData.timeControl}
            </span>
          </div>
        </div>

        <div className="bg-[#0F121E] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 animate-pulse" />

          <div className="space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <Swords className="h-7 w-7 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">PRE-GAME MATCH LOBBY</h2>
            <p className="text-xs text-slate-400">Both players must confirm ready to start the match.</p>
          </div>

          {/* PLAYERS & READY STATUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* White Player */}
            <div className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
              gameData.whiteReady 
                ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                : "bg-slate-900/90 border-slate-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-amber-300 text-sm">
                    {gameData.whiteProfilePicture ? (
                      <img src={gameData.whiteProfilePicture} alt={gameData.whiteUsername} className="w-full h-full object-cover" />
                    ) : (
                      gameData.whiteUsername.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white">{gameData.whiteUsername}</p>
                  <p className="text-[10px] font-bold text-amber-400">White Player ♙ ({gameData.whiteRating || 1200})</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Status:</span>
                {gameData.whiteReady ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready ✓
                  </span>
                ) : (
                  <span className="text-amber-400/80 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
                    <Hourglass className="h-3.5 w-3.5" /> Waiting...
                  </span>
                )}
              </div>
            </div>

            {/* Black Player */}
            <div className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
              gameData.blackReady 
                ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10" 
                : "bg-slate-900/90 border-slate-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-amber-300 text-sm">
                    {gameData.blackProfilePicture ? (
                      <img src={gameData.blackProfilePicture} alt={gameData.blackUsername} className="w-full h-full object-cover" />
                    ) : (
                      gameData.blackUsername.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white">{gameData.blackUsername}</p>
                  <p className="text-[10px] font-bold text-amber-400">Black Player ♟ ({gameData.blackRating || 1200})</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Status:</span>
                {gameData.blackReady ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready ✓
                  </span>
                ) : (
                  <span className="text-amber-400/80 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 animate-pulse">
                    <Hourglass className="h-3.5 w-3.5" /> Waiting...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* TOGGLE READY BUTTON */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleToggleReady}
              className={`w-full py-4 text-sm font-black rounded-2xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                myReady
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950"
              }`}
            >
              {myReady ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>YOU ARE READY! (WAITING FOR OPPONENT...)</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  <span>I AM READY FOR MATCH</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400">
              {myReady && !opponentReady
                ? "Waiting for opponent to click ready..."
                : !myReady && opponentReady
                  ? "Your opponent is ready! Click READY to start the game."
                  : "Click ready when you are set to start."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE / COMPLETED GAME VIEW
  // ----------------------------------------------------
  const isTopTurn = (chessInstance.turn() === (isWhite ? "b" : "w")) && gameData.status === "active";
  const isBottomTurn = (chessInstance.turn() === (isWhite ? "w" : "b")) && gameData.status === "active";

  const handleBackClick = () => {
    if (gameData.status === "active") {
      setShowLeaveConfirm(true);
    } else {
      if (onFinishGoToDashboard) onFinishGoToDashboard();
      else onBack();
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    if (gameData.status === "active") {
      resignMultiplayerGame(gameData.gameId, isWhite ? "white" : "black");
    }
    if (onFinishGoToDashboard) onFinishGoToDashboard();
    else onBack();
  };

  const renderTimer = (time: number, isTurn: boolean) => {
    const isLowTime = time <= 30 && gameData.status === "active";
    const formatted = formatTime(time);

    return (
      <div
        className={`transition-all duration-200 select-none flex items-center justify-center ${
          isTurn
            ? isLowTime
              ? "bg-rose-950/90 border-2 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
              : "bg-slate-900/95 border-2 border-amber-400 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40"
            : "bg-slate-950/70 border border-slate-800/80 text-slate-400 shadow-inner"
        } px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl min-w-[95px] sm:min-w-[120px]`}
      >
        <span className="font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-wider leading-none tabular-nums">
          {formatted}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070a12] flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-hidden font-sans">
      {/* TOP HEADER: ← Back button */}
      <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] flex items-center justify-start shrink-0 pt-1 pb-1">
        <button
          id="friend-match-back-button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          <span>Back</span>
        </button>
      </div>

      {/* TOP PLAYER INFO & TIMER */}
      <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] flex items-center justify-between px-1 py-1 shrink-0">
        <div className="flex flex-col items-start min-w-0 pr-3">
          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
            {topPlayer.name}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Rating: <span className="text-amber-400 font-bold">{topPlayer.rating}</span>
          </span>
        </div>
        {renderTimer(topClock, isTopTurn)}
      </div>

      {/* CENTER: CHESSBOARD */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 py-1">
        <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] aspect-square relative flex items-center justify-center">
          <Chessboard
            game={chessInstance}
            orientation={isWhite ? "white" : "black"}
            theme={selectedTheme as any}
            onMove={(from, to, promo) => handleBoardMove(from, to, promo)}
            disabled={gameData.status !== "active" || !isMyTurn || isSubmittingMove}
          />
        </div>
      </div>

      {/* BOTTOM PLAYER INFO & TIMER */}
      <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] flex items-center justify-between px-1 py-1 shrink-0">
        <div className="flex flex-col items-start min-w-0 pr-3">
          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[280px]">
            {bottomPlayer.name}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Rating: <span className="text-amber-400 font-bold">{bottomPlayer.rating}</span>
          </span>
        </div>
        {renderTimer(bottomClock, isBottomTurn)}
      </div>

      {/* LEAVE GAME CONFIRMATION MODAL */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#121624] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black font-display text-white">Leave Game?</h3>
              <p className="text-xs text-slate-300">
                Your current game is still in progress.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                id="friend-cancel-leave-btn"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                id="friend-confirm-leave-btn"
                onClick={handleConfirmLeave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER RESULT OVERLAY MODAL */}
      {gameData.status !== "active" && showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0F121E] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl text-3xl">
              {gameData.winner === "draw" || gameData.status === "draw"
                ? "🤝"
                : gameData.winner === (isWhite ? "white" : "black")
                  ? "🏆"
                  : "🛡️"}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black font-mono uppercase tracking-widest text-slate-400">
                GAME OVER
              </span>
              <h2 className={`text-2xl font-black font-display uppercase tracking-wider ${
                gameData.winner === "draw" || gameData.status === "draw"
                  ? "text-amber-400"
                  : gameData.winner === (isWhite ? "white" : "black")
                    ? "text-emerald-400"
                    : "text-rose-400"
              }`}>
                {gameData.winner === "draw" || gameData.status === "draw"
                  ? "Game Drawn 🤝"
                  : gameData.winner === (isWhite ? "white" : "black")
                    ? "You Win! 🎉"
                    : "Defeat"}
              </h2>
              <div className="inline-block px-3 py-0.5 rounded-full font-mono font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Result: {gameData.winner === "white" ? "1 – 0" : gameData.winner === "black" ? "0 – 1" : "1/2 – 1/2"}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Reason: <span className="font-bold text-amber-300 capitalize">{gameData.finishReason || gameData.terminationReason || gameData.status}</span>
              </p>
            </div>

            {/* Primary Action: Back to Dashboard */}
            <div className="space-y-2.5 pt-1">
              <button
                id="friend-gameover-back-btn"
                onClick={handleDirectGoToDashboard}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                <span>Back to Dashboard</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  id="friend-gameover-rematch-btn"
                  onClick={() => handleRematchRequest(gameData, currentUsername, "request")}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4 text-amber-400" />
                  <span>Request Rematch</span>
                </button>

                <button
                  id="friend-gameover-analyze-btn"
                  onClick={() => {
                    const sanMoves = gameData.moveHistory?.map((m) => m.san) || [];
                    const pgnText = sanMoves.join(" ");
                    const isUserWhite = isWhite;
                    const completedGameData: CompletedGameData = {
                      gameId: gameData.gameId || "friend_match_" + Date.now(),
                      whitePlayer: gameData.whiteUsername || "White",
                      blackPlayer: gameData.blackUsername || "Black",
                      whiteRating: gameData.whiteRating || 1200,
                      blackRating: gameData.blackRating || 1200,
                      playerColor: isUserWhite ? "w" : "b",
                      result: gameData.winner ? (gameData.winner === (isUserWhite ? "white" : "black") ? "win" : "loss") : "draw",
                      resultScore: gameData.winner === "white" ? "1-0" : gameData.winner === "black" ? "0-1" : "1/2-1/2",
                      terminationReason: gameData.terminationReason || "Match completed",
                      sanMoves: sanMoves,
                      finalFen: gameData.currentFen || chessInstance.fen(),
                      initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                      pgn: pgnText,
                      gameMode: "Friend Match",
                      timeControl: gameData.timeControl || "Friendly",
                      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    };
                    onAnalyzeGame(completedGameData);
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs rounded-xl border border-teal-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="h-4 w-4 text-teal-400" />
                  <span>Analyze Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendChessMatch;
