import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCw, RefreshCw, Undo2, Sliders, Flag, Handshake, BarChart2, 
  Sparkles, Bot, Volume2, VolumeX, ShieldAlert, Zap, Award, Clock, Crown, Flame, PlayCircle, Swords, FileText, ArrowLeft, Trophy, Check, Settings
} from "lucide-react";

import { Chessboard } from "./Chessboard";
import { MoveHistoryItem } from "./MoveHistoryPanel";
import { MoveQuality } from "./MoveQualityBadge";
import { ChessSettingsModal } from "./ChessSettingsModal";
import { GameModeSelector } from "./GameModeSelector";
import { RatingChangeModal } from "./RatingChangeModal";
import { ScoreSheetDownloadModal } from "./ScoreSheetDownloadModal";
import { ChessTheme, UserProfile, GameModeKey, GAME_MODES, TimeControlConfig, MatchRecord, DEFAULT_RATINGS, CompletedGameData, GameModeConfig } from "../types";
import { soundEngine } from "../utils/chessSound";
import { calculateEloChange, calculateGameAccuracy } from "../utils/eloRating";
import { AI_PROFILES, calculateBestMove, AiRatingLevel } from "../utils/aiMoveEngine";
import { recordDailyActivity } from "../utils/streakManager";
import { saveUserProfileToFirestore } from "../services/firestoreService";
import { 
  getCurrentPlayerColor, 
  advanceGameColorSequence, 
  getGameColorSequenceIndex 
} from "../utils/gameColorManager";
import { navigationManager } from "../utils/navigationManager";

interface PlayAiArenaProps {
  profile: UserProfile;
  theme: ChessTheme;
  setTheme: (t: ChessTheme) => void;
  initialModeInfo?: { mode: GameModeKey; timestamp: number } | null;
  onNavigateToAnalyzer?: (completedGame?: CompletedGameData) => void;
  onAwardProgress?: (xp: number, coins: number, badgeId?: string) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onGoToArena?: () => void;
  onGoToDashboard?: () => void;
}

export const PlayAiArena: React.FC<PlayAiArenaProps> = ({
  profile,
  theme,
  setTheme,
  initialModeInfo,
  onNavigateToAnalyzer,
  onAwardProgress,
  onUpdateProfile,
  onGoToArena,
  onGoToDashboard
}) => {
  // Whether an active match is currently running
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Selector screen configuration when game is not active
  const [selectorInitialMode, setSelectorInitialMode] = useState<GameModeKey>("blitz");
  const [selectorInitialStep, setSelectorInitialStep] = useState<"format" | "time_control">("format");

  // Match intro matchmaking & VS screen state
  const [matchIntroStage, setMatchIntroStage] = useState<"none" | "finding_opponent" | "vs_screen">("none");

  // Active Mode & Time Control Settings
  const [activeGameMode, setActiveGameMode] = useState<GameModeKey>("blitz");
  const [activeTimeControl, setActiveTimeControl] = useState<TimeControlConfig>({
    label: "3+2",
    initialSeconds: 180,
    incrementSeconds: 2,
    description: "3 min • 2s increment",
    tag: "Popular"
  });
  const [botRating, setBotRating] = useState<number>(1200);

  // Rating Change Modal state
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    gameMode: GameModeKey;
    timeControl: string;
    result: "win" | "loss" | "draw";
    ratingBefore: number;
    ratingAfter: number;
    ratingChange: number;
    opponentName: string;
    accuracy: number;
  }>({
    isOpen: false,
    gameMode: "blitz",
    timeControl: "3+2",
    result: "win",
    ratingBefore: 200,
    ratingAfter: 218,
    ratingChange: 18,
    opponentName: "Zen AI Bot",
    accuracy: 85.0
  });

  // Game State
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [sanMoveList, setSanMoveList] = useState<MoveHistoryItem[]>([]);
  const [evalHistory, setEvalHistory] = useState<number[]>([0.0]);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(-1);

  // Bot & User Settings
  const [difficulty, setDifficulty] = useState<string>("Advanced Bot");
  const [playerColor, setPlayerColor] = useState<"w" | "b">(() => getCurrentPlayerColor());
  const [isFlipped, setIsFlipped] = useState<boolean>(() => getCurrentPlayerColor() === "b");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [coachingText, setCoachingText] = useState<string>(() => {
    const col = getCurrentPlayerColor();
    return `Game ready! You are playing as ${col === "w" ? "White" : "Black"}. Develop your pieces and control the center.`;
  });

  // Move Quality & Finish Data
  const [lastMoveQuality, setLastMoveQuality] = useState<MoveQuality | null>(null);
  const [lastMoveCoords, setLastMoveCoords] = useState<{ from: string; to: string } | null>(null);
  const [completedGameData, setCompletedGameData] = useState<CompletedGameData | null>(null);

  // Timers (in seconds)
  const [whiteTimer, setWhiteTimer] = useState<number>(180);
  const [blackTimer, setBlackTimer] = useState<number>(180);
  const [gameStatus, setGameStatus] = useState<"ongoing" | "win" | "loss" | "draw" | "resigned">("ongoing");
  const [terminationReason, setTerminationReason] = useState<string>("Checkmate");

  // Leave Game Confirmation modal state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);

  // Settings Modal & Audio
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScoreSheetModalOpen, setIsScoreSheetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [showQualityBadges, setShowQualityBadges] = useState(true);
  const [autoQueen, setAutoQueen] = useState(true);

  // Captured pieces lists
  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]);

  // Active Mode Config
  const currentModeConfig = GAME_MODES.find((m) => m.key === activeGameMode) || GAME_MODES[1];
  const playerCurrentModeRating = profile.ratings ? (profile.ratings[activeGameMode] || 200) : 200;

  // React to initialModeInfo changes from Dashboard or RatingCards
  const lastHandledTimestampRef = useRef<number>(0);
  useEffect(() => {
    if (initialModeInfo && initialModeInfo.timestamp !== lastHandledTimestampRef.current) {
      lastHandledTimestampRef.current = initialModeInfo.timestamp;
      // Do NOT start game immediately! Open selector on time_control step for this mode!
      setIsGameActive(false);
      setSelectorInitialMode(initialModeInfo.mode);
      setSelectorInitialStep("time_control");
    }
  }, [initialModeInfo]);

  // Back navigation handling for PlayAiArena
  useEffect(() => {
    const unregister = navigationManager.registerHandler({
      id: "play-ai-arena-back",
      priority: 80,
      handleBack: () => {
        // Priority 1: Modals inside the screen
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return true;
        }
        if (isScoreSheetModalOpen) {
          setIsScoreSheetModalOpen(false);
          return true;
        }
        if (ratingModal.isOpen) {
          setRatingModal((prev) => ({ ...prev, isOpen: false }));
          return true;
        }
        if (showLeaveConfirm) {
          setShowLeaveConfirm(false);
          return true;
        }

        // Priority 2: In-Game Active Match Protection
        if (isGameActive && gameStatus === "ongoing" && (gameHistory.length > 0 || whiteTimer < activeTimeControl.initialSeconds)) {
          setShowLeaveConfirm(true);
          return true;
        }

        // Priority 3: In Active Game (ended) -> Return to Game Mode Selector
        if (isGameActive && gameStatus !== "ongoing") {
          setIsGameActive(false);
          setSelectorInitialStep("format");
          return true;
        }

        // Priority 4: If not in game, go back to Dashboard
        if (onGoToDashboard) {
          onGoToDashboard();
          return true;
        } else if (onGoToArena) {
          onGoToArena();
          return true;
        }

        return false;
      }
    });
    return unregister;
  }, [
    isSettingsOpen,
    isScoreSheetModalOpen,
    ratingModal.isOpen,
    showLeaveConfirm,
    isGameActive,
    gameStatus,
    gameHistory.length,
    whiteTimer,
    activeTimeControl.initialSeconds,
    onGoToDashboard,
    onGoToArena
  ]);

  // Start new match only after user verifies and confirms time control in selector
  const handleStartGameWithMode = (
    modeKey: GameModeKey,
    tc: TimeControlConfig,
    diff: string,
    botElo: number,
    chosenColor: "w" | "b" | "random" | "alternate" = "alternate",
    personality?: string
  ) => {
    processedMatchRef.current = false;
    setActiveGameMode(modeKey);
    setActiveTimeControl(tc);
    setDifficulty(diff);
    setBotRating(botElo);

    // Resolve color
    let finalColor: "w" | "b";
    if (chosenColor === "random") {
      finalColor = Math.random() < 0.5 ? "w" : "b";
    } else if (chosenColor === "w" || chosenColor === "b") {
      finalColor = chosenColor;
    } else {
      finalColor = getCurrentPlayerColor();
    }

    setPlayerColor(finalColor);
    setIsFlipped(finalColor === "b");

    // Initialize Game State
    const freshGame = new Chess();
    setGame(freshGame);
    setGameHistory([]);
    setSanMoveList([]);
    setEvalHistory([0.0]);
    setCurrentPlyIndex(-1);
    setGameStatus("ongoing");
    setTerminationReason("Checkmate");
    setWhiteTimer(tc.initialSeconds);
    setBlackTimer(tc.initialSeconds);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setLastMoveQuality(null);
    setLastMoveCoords(null);
    setIsGameActive(true);

    const personalityLabel = personality ? ` [${personality}]` : "";
    setCoachingText(`Match launched in ${modeKey.toUpperCase()} format (${tc.label})${personalityLabel}. You play as ${finalColor === "w" ? "White" : "Black"}. Good luck!`);

    // Launch Match Intro sequence
    setMatchIntroStage("finding_opponent");

    setTimeout(() => {
      setMatchIntroStage("vs_screen");
      soundEngine.playGameStart();

      setTimeout(() => {
        setMatchIntroStage("none");
        if (finalColor === "b") {
          setTimeout(() => {
            triggerAiMove();
          }, 300);
        }
      }, 1500);
    }, 1000);
  };

  // Trigger AI opening move if player starts as Black
  useEffect(() => {
    if (isGameActive && playerColor === "b" && game.turn() === "w" && gameHistory.length === 0 && gameStatus === "ongoing" && matchIntroStage === "none") {
      const timer = setTimeout(() => {
        triggerAiMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGameActive, playerColor, matchIntroStage]);

  // Timer Tick Interval
  useEffect(() => {
    if (!isGameActive || gameStatus !== "ongoing" || matchIntroStage !== "none") return;

    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTimer((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTimer((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, game, gameStatus, matchIntroStage]);

  // Handle timeout end game cleanly
  useEffect(() => {
    if (!isGameActive || gameStatus !== "ongoing") return;
    if (whiteTimer === 0) {
      handleFinishGame(playerColor === "w" ? "loss" : "win", "Timeout");
    } else if (blackTimer === 0) {
      handleFinishGame(playerColor === "b" ? "loss" : "win", "Timeout");
    }
  }, [isGameActive, whiteTimer, blackTimer, gameStatus, playerColor]);

  const processedMatchRef = useRef<boolean>(false);

  // Finish game & trigger rating calculation
  const handleFinishGame = (matchResult: "win" | "loss" | "draw", reason: string = "Checkmate") => {
    if (processedMatchRef.current && gameStatus !== "ongoing") return;
    processedMatchRef.current = true;

    setGameStatus(matchResult);
    setTerminationReason(reason);
    soundEngine.playGameEnd(matchResult === "win");

    const currentModeElo = profile.ratings ? (profile.ratings[activeGameMode] || profile.elo || 400) : (profile.elo || 400);
    const existingStats = profile.modeStats ? profile.modeStats[activeGameMode] : { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 };
    const gamesInMode = existingStats ? existingStats.games : 0;

    const eloResult = calculateEloChange(currentModeElo, botRating, matchResult, gamesInMode);
    const accuracyVal = calculateGameAccuracy(sanMoveList.length * 2);
    const allSanMoves = game.history();

    const userIsWhite = playerColor === "w";
    const whitePlayerName = userIsWhite ? (profile.username || "You") : `Zen AI (${botRating} Elo)`;
    const blackPlayerName = userIsWhite ? `Zen AI (${botRating} Elo)` : (profile.username || "You");
    const whiteRatingVal = userIsWhite ? eloResult.ratingBefore : botRating;
    const blackRatingVal = userIsWhite ? botRating : eloResult.ratingBefore;
    const scoreVal = matchResult === "win" ? (userIsWhite ? "1-0" : "0-1") : matchResult === "loss" ? (userIsWhite ? "0-1" : "1-0") : "1/2-1/2";

    const completedData: CompletedGameData = {
      gameId: "match_" + Date.now(),
      whitePlayer: whitePlayerName,
      blackPlayer: blackPlayerName,
      whiteRating: whiteRatingVal,
      blackRating: blackRatingVal,
      playerColor: playerColor,
      result: matchResult,
      resultScore: scoreVal,
      terminationReason: reason,
      sanMoves: allSanMoves,
      finalFen: game.fen(),
      initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      pgn: game.pgn() || allSanMoves.join(" "),
      gameMode: activeGameMode,
      timeControl: activeTimeControl.label,
      baseTimeSeconds: activeTimeControl.initialSeconds,
      incrementSeconds: activeTimeControl.incrementSeconds,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      accuracy: accuracyVal,
      evalHistory: evalHistory
    };
    setCompletedGameData(completedData);

    // Match Log Record
    const matchRecord: MatchRecord = {
      id: completedData.gameId,
      gameMode: activeGameMode,
      timeControl: activeTimeControl.label,
      baseTimeSeconds: activeTimeControl.initialSeconds,
      incrementSeconds: activeTimeControl.incrementSeconds,
      opponent: `Zen AI (${botRating} Elo)`,
      opponentRating: botRating,
      result: matchResult,
      ratingBefore: eloResult.ratingBefore,
      ratingAfter: eloResult.ratingAfter,
      ratingChange: eloResult.ratingChange,
      moves: allSanMoves.length,
      accuracy: accuracyVal,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      pgn: game.pgn() || allSanMoves.join(" "),
      finalFen: game.fen(),
      initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      sanMoves: allSanMoves,
      playerColor: playerColor,
      whitePlayer: whitePlayerName,
      blackPlayer: blackPlayerName,
      whiteRating: whiteRatingVal,
      blackRating: blackRatingVal,
      terminationReason: reason,
      resultScore: scoreVal,
      evalHistory: evalHistory
    };

    // Update Profile Object
    const updatedRatings = {
      ...(profile.ratings || DEFAULT_RATINGS),
      [activeGameMode]: eloResult.ratingAfter
    };

    const updatedModeStats = {
      ...(profile.modeStats || {
        bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
        blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
        rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 },
        classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 400 }
      }),
      [activeGameMode]: {
        games: gamesInMode + 1,
        wins: (existingStats?.wins || 0) + (matchResult === "win" ? 1 : 0),
        losses: (existingStats?.losses || 0) + (matchResult === "loss" ? 1 : 0),
        draws: (existingStats?.draws || 0) + (matchResult === "draw" ? 1 : 0),
        highest: Math.max(existingStats?.highest || 400, eloResult.ratingAfter)
      }
    };

    const updatedHistory = [matchRecord, ...(profile.matchHistory || [])];
    const { updatedProfile: activityProfile } = recordDailyActivity(profile);

    const calculatedElo = Math.max(...(Object.values(updatedRatings) as number[]));
    const updatedProfile: UserProfile = {
      ...activityProfile,
      elo: calculatedElo,
      rating: calculatedElo,
      ratings: updatedRatings,
      modeStats: updatedModeStats,
      matchHistory: updatedHistory,
      gamesPlayed: (profile.gamesPlayed || 0) + 1,
      wins: (profile.wins || 0) + (matchResult === "win" ? 1 : 0),
      losses: (profile.losses || 0) + (matchResult === "loss" ? 1 : 0),
      draws: (profile.draws || 0) + (matchResult === "draw" ? 1 : 0)
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }

    if (!updatedProfile.isGuest) {
      const permanentId = updatedProfile.id || updatedProfile.uid || (updatedProfile.email ? "usr_" + updatedProfile.email.replace(/[^a-zA-Z0-9]/g, "_") : "usr_user");
      const userToSave = {
        ...updatedProfile,
        id: permanentId,
        uid: permanentId,
        createdAt: (updatedProfile as any).createdAt || new Date().toISOString()
      };
      saveUserProfileToFirestore(userToSave as any).catch((err) => {
        console.error("Failed saving rating to Firestore:", err);
      });
    }

    if (onAwardProgress && matchResult === "win") {
      onAwardProgress(200, 50, "victory_mode_" + activeGameMode);
    }

    // Trigger Rating Modal
    setRatingModal({
      isOpen: true,
      gameMode: activeGameMode,
      timeControl: activeTimeControl.label,
      result: matchResult,
      ratingBefore: eloResult.ratingBefore,
      ratingAfter: eloResult.ratingAfter,
      ratingChange: eloResult.ratingChange,
      opponentName: `Zen AI Bot (${botRating} Elo)`,
      accuracy: accuracyVal
    });
  };

  // Sync Audio Toggle
  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Move Quality calculation
  const evaluateMoveQuality = (moveSan: string, evalDiff: number): MoveQuality => {
    if (moveSan.includes("#")) return "Brilliant";
    if (evalDiff > 2.0) return "Brilliant";
    if (evalDiff > 1.2) return "Great";
    if (evalDiff > 0.4) return "Best";
    if (evalDiff >= -0.2) return "Excellent";
    if (evalDiff >= -0.6) return "Good";
    if (evalDiff >= -1.5) return "Inaccuracy";
    if (evalDiff >= -3.0) return "Mistake";
    return "Blunder";
  };

  // Execute Player Move
  const handlePlayerMove = async (from: string, to: string, promotion?: string) => {
    if (gameStatus !== "ongoing" || isAiThinking) return;

    const moveObj = game.move({
      from,
      to,
      promotion: promotion || "q"
    });

    if (!moveObj) return;

    if (moveObj.captured) {
      soundEngine.playCapture();
    } else if (game.inCheck()) {
      soundEngine.playCheck();
    } else {
      soundEngine.playMove();
    }

    const newFen = game.fen();
    const updatedHistory = [...gameHistory, newFen];
    setGameHistory(updatedHistory);

    if (moveObj.captured) {
      if (moveObj.color === "w") {
        setWhiteCaptured((prev) => [...prev, moveObj.captured!]);
      } else {
        setBlackCaptured((prev) => [...prev, moveObj.captured!]);
      }
    }

    setLastMoveCoords({ from, to });

    const prevEval = evalHistory[evalHistory.length - 1] || 0.0;
    const estimatedNewEval = prevEval + (moveObj.captured ? 0.8 : (Math.random() * 0.4 - 0.2));
    const evalDiff = estimatedNewEval - prevEval;
    const quality = evaluateMoveQuality(moveObj.san, evalDiff);

    setLastMoveQuality(quality);
    if (quality === "Brilliant") {
      soundEngine.playBrilliant();
    }

    setSanMoveList((prev) => {
      const list = [...prev];
      if (moveObj.color === "w") {
        list.push({
          moveNumber: list.length + 1,
          whiteSan: moveObj.san,
          whiteQuality: quality,
          whiteEval: estimatedNewEval
        });
      } else {
        if (list.length > 0 && list[list.length - 1].whiteSan && !list[list.length - 1].blackSan) {
          list[list.length - 1].blackSan = moveObj.san;
          list[list.length - 1].blackQuality = quality;
          list[list.length - 1].blackEval = estimatedNewEval;
        } else {
          list.push({
            moveNumber: list.length + 1,
            whiteSan: "...",
            blackSan: moveObj.san,
            blackQuality: quality,
            blackEval: estimatedNewEval
          });
        }
      }
      return list;
    });
    setEvalHistory((prev) => [...prev, estimatedNewEval]);
    setCurrentPlyIndex(updatedHistory.length - 1);

    // Apply Time Increment
    if (activeTimeControl.incrementSeconds > 0) {
      if (moveObj.color === "w") {
        setWhiteTimer((t) => t + activeTimeControl.incrementSeconds);
      } else {
        setBlackTimer((t) => t + activeTimeControl.incrementSeconds);
      }
    }

    // Check game termination
    if (game.isCheckmate()) {
      const result = game.turn() === playerColor ? "loss" : "win";
      handleFinishGame(result, "Checkmate");
      return;
    }

    if (game.isStalemate()) {
      handleFinishGame("draw", "Stalemate");
      return;
    }

    if (game.isThreefoldRepetition()) {
      handleFinishGame("draw", "Threefold Repetition");
      return;
    }

    if (game.isInsufficientMaterial()) {
      handleFinishGame("draw", "Insufficient Material");
      return;
    }

    if (game.isDraw()) {
      handleFinishGame("draw", "Draw");
      return;
    }

    // Trigger AI turn
    if (game.turn() !== playerColor) {
      triggerAiMove();
    }
  };

  // Trigger AI engine move
  const triggerAiMove = async () => {
    setIsAiThinking(true);

    const validRating = (
      [200, 400, 800, 1200, 1600, 2000, 2400].includes(botRating) ? botRating : 1200
    ) as AiRatingLevel;
    const aiProfile = AI_PROFILES[validRating];

    const thinkMs = Math.floor(
      Math.random() * (aiProfile.thinkTimeMax - aiProfile.thinkTimeMin) + aiProfile.thinkTimeMin
    );

    setTimeout(() => {
      if (game.isGameOver()) {
        setIsAiThinking(false);
        return;
      }

      const calculated = calculateBestMove(game, validRating);
      if (!calculated) {
        setIsAiThinking(false);
        return;
      }

      const aiMoveObj = game.move(calculated.move);
      if (aiMoveObj) {
        if (aiMoveObj.captured) {
          soundEngine.playCapture();
        } else if (game.inCheck()) {
          soundEngine.playCheck();
        } else {
          soundEngine.playMove();
        }

        setLastMoveCoords({ from: aiMoveObj.from, to: aiMoveObj.to });

        if (aiMoveObj.captured) {
          if (aiMoveObj.color === "w") {
            setWhiteCaptured((prev) => [...prev, aiMoveObj.captured!]);
          } else {
            setBlackCaptured((prev) => [...prev, aiMoveObj.captured!]);
          }
        }

        const newFen = game.fen();
        setGameHistory((prev) => [...prev, newFen]);

        const prevEval = evalHistory[evalHistory.length - 1] || 0.0;
        const newEval = prevEval - (aiMoveObj.captured ? 0.7 : 0.1);
        setEvalHistory((prev) => [...prev, newEval]);

        setSanMoveList((prev) => {
          const list = [...prev];
          if (aiMoveObj.color === "w") {
            list.push({
              moveNumber: list.length + 1,
              whiteSan: aiMoveObj.san,
              whiteEval: newEval
            });
          } else {
            if (list.length > 0 && list[list.length - 1].whiteSan && !list[list.length - 1].blackSan) {
              list[list.length - 1].blackSan = aiMoveObj.san;
              list[list.length - 1].blackEval = newEval;
            } else {
              list.push({
                moveNumber: list.length + 1,
                whiteSan: "...",
                blackSan: aiMoveObj.san,
                blackEval: newEval
              });
            }
          }
          return list;
        });

        setCurrentPlyIndex((prev) => prev + 1);

        // Time increment for AI
        if (activeTimeControl.incrementSeconds > 0) {
          if (aiMoveObj.color === "w") {
            setWhiteTimer((t) => t + activeTimeControl.incrementSeconds);
          } else {
            setBlackTimer((t) => t + activeTimeControl.incrementSeconds);
          }
        }

        if (game.isCheckmate()) {
          handleFinishGame("loss", "Checkmate");
        } else if (game.isStalemate()) {
          handleFinishGame("draw", "Stalemate");
        } else if (game.isThreefoldRepetition()) {
          handleFinishGame("draw", "Threefold Repetition");
        } else if (game.isInsufficientMaterial()) {
          handleFinishGame("draw", "Insufficient Material");
        } else if (game.isDraw()) {
          handleFinishGame("draw", "Draw");
        }
      }
      setIsAiThinking(false);
    }, thinkMs);
  };

  // Rematch with Same Time Control
  const handleRematchSameTimeControl = () => {
    processedMatchRef.current = false;
    const nextColor = advanceGameColorSequence();
    setPlayerColor(nextColor);
    setIsFlipped(nextColor === "b");

    const newG = new Chess();
    setGame(newG);
    setGameHistory([]);
    setSanMoveList([]);
    setEvalHistory([0.0]);
    setCurrentPlyIndex(-1);
    setGameStatus("ongoing");
    setTerminationReason("Checkmate");
    setWhiteTimer(activeTimeControl.initialSeconds || 180);
    setBlackTimer(activeTimeControl.initialSeconds || 180);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setLastMoveQuality(null);
    setLastMoveCoords(null);
    setIsGameActive(true);
    setCoachingText(`Rematch started in ${activeGameMode.toUpperCase()} (${activeTimeControl.label}). You are playing as ${nextColor === "w" ? "White" : "Black"}. Good luck!`);

    if (nextColor === "b") {
      setTimeout(() => {
        triggerAiMove();
      }, 500);
    }
  };

  // Change Time Control action -> Opens the GameModeSelector
  const handleChangeTimeControl = () => {
    setIsGameActive(false);
    setSelectorInitialMode(activeGameMode);
    setSelectorInitialStep("time_control");
  };

  const handleResign = () => {
    if (gameStatus !== "ongoing") return;
    handleFinishGame("loss", "Resignation");
  };

  const handleDrawClaim = () => {
    if (gameStatus !== "ongoing") return;
    if (game.isDraw()) {
      handleFinishGame("draw", "Draw Agreement");
    } else {
      setCoachingText("AI Coach declines the draw offer. The position requires further play!");
    }
  };

  // User Rating & Opponent Rating
  const userRating = playerCurrentModeRating;
  const opponentRating = botRating;
  const aiBotName = AI_PROFILES[([200, 400, 800, 1200, 1600, 2000, 2400].includes(botRating) ? botRating : 1200) as AiRatingLevel]?.name || "ChessZen AI";

  // Top player vs Bottom player based on board orientation
  const topPlayer = playerColor === "w" ? {
    name: aiBotName,
    rating: opponentRating,
    colorLabel: "Black",
    timer: blackTimer,
    isWhiteClock: false
  } : {
    name: aiBotName,
    rating: opponentRating,
    colorLabel: "White",
    timer: whiteTimer,
    isWhiteClock: true
  };

  const bottomPlayer = playerColor === "w" ? {
    name: profile.username || "Player",
    rating: userRating,
    colorLabel: "White",
    timer: whiteTimer,
    isWhiteClock: true
  } : {
    name: profile.username || "Player",
    rating: userRating,
    colorLabel: "Black",
    timer: blackTimer,
    isWhiteClock: false
  };

  // Back button in active match
  const handleBackClick = () => {
    if (gameStatus === "ongoing") {
      setShowLeaveConfirm(true);
    } else {
      setIsGameActive(false);
      setSelectorInitialStep("format");
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    if (gameStatus === "ongoing") {
      handleFinishGame("loss", "Resignation");
    }
    setIsGameActive(false);
    setSelectorInitialStep("format");
  };

  // Render Timer Pill Component
  const renderTimer = (time: number, isWhiteClock: boolean) => {
    const isTurn = game.turn() === (isWhiteClock ? "w" : "b") && gameStatus === "ongoing";
    const isLowTime = time <= 30 && gameStatus === "ongoing";
    const m = Math.floor(time / 60);
    const s = time % 60;
    const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

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

  // ─────────────────────────────────────────────────────────────
  // 1. PRE-GAME / FORMAT & TIME CONTROL SELECTION VIEW
  // ─────────────────────────────────────────────────────────────
  if (!isGameActive) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 font-sans select-none animate-fade-in pb-16">
        <GameModeSelector
          ratings={profile.ratings || DEFAULT_RATINGS}
          defaultMode={selectorInitialMode}
          initialStep={selectorInitialStep}
          onStartGame={handleStartGameWithMode}
          onCancel={onGoToDashboard ? onGoToDashboard : undefined}
          isStandalone={true}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ACTIVE CHESS MATCH VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#070a12] flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-hidden font-sans">
      {/* TOP HEADER: ← Back button & Mode Badge */}
      <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] flex items-center justify-between shrink-0 pt-1 pb-1">
        <button
          id="back-button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold uppercase flex items-center gap-1">
            <span>{currentModeConfig.icon}</span>
            <span>{currentModeConfig.name} {activeTimeControl.label}</span>
          </span>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Board Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
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
        {renderTimer(topPlayer.timer, topPlayer.isWhiteClock)}
      </div>

      {/* CENTER: CHESSBOARD */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 py-1">
        <div className="w-full max-w-[min(94vw,calc(100vh-175px),580px)] aspect-square relative flex items-center justify-center">
          <Chessboard
            game={game}
            onMove={handlePlayerMove}
            lastMove={lastMoveCoords}
            isFlipped={isFlipped}
            playerColor={playerColor}
            theme={theme}
            interactive={gameStatus === "ongoing" && !isAiThinking && matchIntroStage === "none"}
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
        {renderTimer(bottomPlayer.timer, bottomPlayer.isWhiteClock)}
      </div>

      {/* LEAVE GAME CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-sm w-full bg-[#121624] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4"
            >
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
                  id="cancel-leave-btn"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-leave-btn"
                  onClick={handleConfirmLeave}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-rose-600/30 transition-all"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER RESULT OVERLAY */}
      {gameStatus !== "ongoing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-gradient-to-b from-[#121624] to-[#0B0D17] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto shadow-xl">
              {gameStatus === "win" ? "🏆" : gameStatus === "loss" ? "🛡️" : "🤝"}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-black font-mono uppercase tracking-widest text-slate-400">
                GAME OVER • {currentModeConfig.name.toUpperCase()} ({activeTimeControl.label})
              </span>
              <h2 className={`text-3xl font-black font-display uppercase tracking-wide ${
                gameStatus === "win" ? "text-emerald-400" : gameStatus === "loss" ? "text-rose-400" : "text-amber-300"
              }`}>
                {gameStatus === "win" ? "You Win! 🎉" : gameStatus === "loss" ? "Defeat" : "Game Drawn 🤝"}
              </h2>
              <div className="inline-block px-3 py-1 rounded-lg font-mono font-black text-sm bg-amber-500/20 text-amber-300 border border-amber-500/30 my-1">
                {gameStatus === "win" ? "1 – 0" : gameStatus === "loss" ? "0 – 1" : "1/2 – 1/2"}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Reason: <span className="font-bold text-amber-300">{terminationReason}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Same Time Control Rematch */}
                <button
                  id="gameover-rematch-btn"
                  onClick={handleRematchSameTimeControl}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Rematch ({activeTimeControl.label})</span>
                </button>

                {/* 2. Change Time Control */}
                <button
                  id="gameover-change-tc-btn"
                  onClick={handleChangeTimeControl}
                  className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>Change Time</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 3. Analyze Game */}
                {onNavigateToAnalyzer && (
                  <button
                    id="gameover-analyze-btn"
                    onClick={() => {
                      if (completedGameData) {
                        onNavigateToAnalyzer(completedGameData);
                      } else {
                        const userIsWhite = playerColor === "w";
                        const allMoves = game.history();
                        const fallbackData: CompletedGameData = {
                          gameId: "match_" + Date.now(),
                          whitePlayer: userIsWhite ? (profile.username || "You") : `Zen AI (${botRating} Elo)`,
                          blackPlayer: userIsWhite ? `Zen AI (${botRating} Elo)` : (profile.username || "You"),
                          whiteRating: userIsWhite ? (profile.ratings?.[activeGameMode] || profile.elo || 400) : botRating,
                          blackRating: userIsWhite ? botRating : (profile.ratings?.[activeGameMode] || profile.elo || 400),
                          playerColor: playerColor,
                          result: gameStatus === "resigned" ? "loss" : gameStatus,
                          resultScore: gameStatus === "win" ? (userIsWhite ? "1-0" : "0-1") : gameStatus === "loss" || gameStatus === "resigned" ? (userIsWhite ? "0-1" : "1-0") : "1/2-1/2",
                          terminationReason: terminationReason || "Game Ended",
                          sanMoves: allMoves,
                          finalFen: game.fen(),
                          initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                          pgn: game.pgn() || allMoves.join(" "),
                          gameMode: activeGameMode,
                          timeControl: activeTimeControl.label,
                          baseTimeSeconds: activeTimeControl.initialSeconds,
                          incrementSeconds: activeTimeControl.incrementSeconds,
                          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                          accuracy: ratingModal.accuracy,
                          evalHistory: evalHistory
                        };
                        onNavigateToAnalyzer(fallbackData);
                      }
                    }}
                    className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <BarChart2 className="h-4 w-4 text-teal-400" />
                    <span>Analyze</span>
                  </button>
                )}

                {/* 4. Back to Dashboard / Formats */}
                <button
                  id="gameover-back-btn"
                  onClick={() => {
                    setIsGameActive(false);
                    setSelectorInitialStep("format");
                    if (onGoToDashboard) onGoToDashboard();
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Modal */}
      <ChessSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        showEvalBar={showEvalBar}
        setShowEvalBar={setShowEvalBar}
        showQualityBadges={showQualityBadges}
        setShowQualityBadges={setShowQualityBadges}
        autoQueen={autoQueen}
        setAutoQueen={setAutoQueen}
      />

      {/* Download Score Sheet Modal */}
      <ScoreSheetDownloadModal
        isOpen={isScoreSheetModalOpen}
        onClose={() => setIsScoreSheetModalOpen(false)}
        gameData={{
          gameId: `CZ-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toISOString().split("T")[0],
          whitePlayer: playerColor === "w" ? profile.username : (AI_PROFILES[([200, 400, 800, 1200, 1600, 2000, 2400].includes(botRating) ? botRating : 1200) as AiRatingLevel]?.name || "ChessZen AI"),
          blackPlayer: playerColor === "b" ? profile.username : (AI_PROFILES[([200, 400, 800, 1200, 1600, 2000, 2400].includes(botRating) ? botRating : 1200) as AiRatingLevel]?.name || "ChessZen AI"),
          whiteRating: playerColor === "w" ? playerCurrentModeRating : botRating,
          blackRating: playerColor === "b" ? playerCurrentModeRating : botRating,
          gameType: currentModeConfig.name,
          timeControl: activeTimeControl.label,
          result: gameStatus === "win" ? "1-0" : gameStatus === "loss" ? "0-1" : "1/2-1/2",
          resultReason: gameStatus === "win" ? "Victory" : gameStatus === "loss" ? "Defeat" : "Draw",
          moves: sanMoveList.map((m) => ({
            moveNumber: m.moveNumber,
            white: m.whiteSan,
            black: m.blackSan || ""
          }))
        }}
        onSuccessToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />
    </div>
  );
};
