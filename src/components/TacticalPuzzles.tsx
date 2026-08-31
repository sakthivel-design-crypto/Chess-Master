import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { 
  Zap, Award, RefreshCw, Sparkles, HelpCircle, ArrowRight, Play, CheckCircle2,
  XCircle, Eye, Trophy, Target, Flame, Lightbulb, ChevronRight, Search, RotateCcw, BarChart3
} from "lucide-react";
import { UserProfile } from "../types";
import { VALIDATED_PUZZLES, ChessPuzzle, validateSinglePuzzle } from "../data/puzzleData";
import { Chessboard } from "./Chessboard";
import confetti from "canvas-confetti";
import { saveUserProfileToFirestore } from "../services/firestoreService";

interface TacticalPuzzlesProps {
  profile: UserProfile;
  onAwardProgress: (xp: number, coins: number, badgeId?: string, isPuzzleWin?: boolean) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onNavigateToAnalyzer?: (fen?: string) => void;
}

export const TacticalPuzzles: React.FC<TacticalPuzzlesProps> = ({
  profile,
  onAwardProgress,
  onUpdateProfile,
  onNavigateToAnalyzer
}) => {
  // Available filter choices
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];
  const themes = [
    "All", "Back Rank Mate", "Mate in 1", "Fork", "Pin", "Skewer", 
    "Sacrifice", "Remove the Defender", "Promotion", "Endgame", "Hanging Piece", "Defensive Move"
  ];

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Puzzles filtered by criteria
  const availablePuzzles = VALIDATED_PUZZLES.filter((p) => {
    const matchesDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    const matchesTheme = selectedTheme === "All" || p.theme === selectedTheme;
    const matchesSearch = searchQuery === "" || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesTheme && matchesSearch;
  });

  // Current active puzzle
  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const activePuzzle: ChessPuzzle = availablePuzzles[activePuzzleIndex] || VALIDATED_PUZZLES[0];

  // Chess board state
  const [boardGame, setBoardGame] = useState<Chess>(() => new Chess(activePuzzle.fen));
  const [solutionIndex, setSolutionIndex] = useState<number>(0); // Current index in activePuzzle.solutionMoves
  const [isOpponentThinking, setIsOpponentThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Status feedback state
  const [moveFeedback, setMoveFeedback] = useState<{
    type: "idle" | "correct_step" | "incorrect" | "solved" | "revealed";
    message: string;
  }>({
    type: "idle",
    message: `Find the best move for ${activePuzzle.sideToMove === "white" ? "White" : "Black"}.`
  });

  // Hint & Solution reveal state
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = no hint, 1 = idea text, 2 = highlight piece
  const [showSolutionRequested, setShowSolutionRequested] = useState<boolean>(false);

  // Stats tracking for current session & profile persistence
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [solveTimeSeconds, setSolveTimeSeconds] = useState<number>(0);

  // AI Coach walkthrough
  const [aiWalkthrough, setAiWalkthrough] = useState<string>("");
  const [loadingWalkthrough, setLoadingWalkthrough] = useState<boolean>(false);

  // Ensure active puzzle is valid on load
  useEffect(() => {
    if (activePuzzle) {
      loadPuzzle(activePuzzle);
    }
  }, [activePuzzleIndex, selectedDifficulty, selectedTheme]);

  const loadPuzzle = (puzzle: ChessPuzzle) => {
    // Validate puzzle FEN and moves before display
    if (!validateSinglePuzzle(puzzle)) {
      console.warn(`Puzzle ${puzzle.puzzleId} failed validation. Loading next available puzzle.`);
      if (availablePuzzles.length > 1) {
        setActivePuzzleIndex((prev) => (prev + 1) % availablePuzzles.length);
        return;
      }
    }

    try {
      const g = new Chess(puzzle.fen);
      setBoardGame(g);
      setSolutionIndex(0);
      setIsOpponentThinking(false);
      setLastMove(null);
      setHintLevel(0);
      setShowSolutionRequested(false);
      setAttemptsOnCurrent(0);
      setStartTime(Date.now());
      setAiWalkthrough("");
      setMoveFeedback({
        type: "idle",
        message: `Find the best move for ${puzzle.sideToMove === "white" ? "White" : "Black"}.`
      });
    } catch (e) {
      console.error("Error loading puzzle FEN:", e);
    }
  };

  const handleNextPuzzle = () => {
    if (availablePuzzles.length > 0) {
      const nextIdx = (activePuzzleIndex + 1) % availablePuzzles.length;
      setActivePuzzleIndex(nextIdx);
    }
  };

  const handleResetPuzzle = () => {
    loadPuzzle(activePuzzle);
  };

  // Helper to compare played move against expected move in solution
  const isMatchingMove = (
    moveResult: { from: string; to: string; promotion?: string; san?: string; lan?: string },
    expectedMoveStr: string
  ): boolean => {
    const lan = moveResult.from + moveResult.to + (moveResult.promotion || "");
    const lanNoPromo = moveResult.from + moveResult.to;
    const san = moveResult.san || "";

    const cleanExpected = expectedMoveStr.replace(/[+#x=]/g, "").toLowerCase();
    const cleanSan = san.replace(/[+#x=]/g, "").toLowerCase();

    return (
      lan.toLowerCase() === cleanExpected ||
      lanNoPromo.toLowerCase() === cleanExpected ||
      cleanSan === cleanExpected ||
      moveResult.from + moveResult.to === expectedMoveStr.slice(0, 4)
    );
  };

  // User makes a move on the board
  const handlePuzzleMove = (from: string, to: string) => {
    if (moveFeedback.type === "solved" || isOpponentThinking || showSolutionRequested) {
      return;
    }

    try {
      const testChess = new Chess(boardGame.fen());
      const moveResult = testChess.move({ from, to, promotion: "q" });

      if (!moveResult) {
        setMoveFeedback({
          type: "incorrect",
          message: "✗ Illegal move in this position. Try again."
        });
        return;
      }

      const expectedMoveStr = activePuzzle.solutionMoves[solutionIndex];
      const isCorrect = isMatchingMove(moveResult, expectedMoveStr);

      if (isCorrect) {
        // Execute move on real board state
        boardGame.move({ from, to, promotion: "q" });
        const newGame = new Chess(boardGame.fen());
        setBoardGame(newGame);
        setLastMove({ from, to });

        const nextIndex = solutionIndex + 1;

        if (nextIndex >= activePuzzle.solutionMoves.length) {
          // PUZZLE COMPLETELY SOLVED!
          const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          setSolveTimeSeconds(duration);

          setMoveFeedback({
            type: "solved",
            message: "🎉 PUZZLE SOLVED! Excellent tactical vision!"
          });

          confetti({
            particleCount: 120,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#10B981", "#3B82F6", "#F59E0B"]
          });

          // Calculate rating gain
          const isFirstTry = attemptsOnCurrent === 0;
          const eloGain = isFirstTry ? 20 : 8;

          // Award progress & XP
          onAwardProgress(150, 50, "puzzle_master", true);

          // Update user profile stats
          if (onUpdateProfile) {
            const currentStats = profile.puzzleStats || {
              attempted: 0,
              solved: 0,
              accuracy: 0,
              currentRating: profile.puzzleElo || 1200,
              bestRating: profile.puzzleElo || 1200,
              correctStreak: 0,
              averageTimeSeconds: 0
            };

            const newAttempted = currentStats.attempted + 1;
            const newSolved = currentStats.solved + 1;
            const newAccuracy = Math.round((newSolved / newAttempted) * 100);
            const newRating = (profile.puzzleElo || 1200) + eloGain;
            const newBestRating = Math.max(newRating, currentStats.bestRating || newRating);
            const newStreak = currentStats.correctStreak + 1;

            const updatedProfile: UserProfile = {
              ...profile,
              puzzleElo: newRating,
              puzzleStats: {
                attempted: newAttempted,
                solved: newSolved,
                accuracy: newAccuracy,
                currentRating: newRating,
                bestRating: newBestRating,
                correctStreak: newStreak,
                averageTimeSeconds: Math.round(
                  ((currentStats.averageTimeSeconds || 0) * currentStats.solved + duration) / newSolved
                )
              }
            };

            onUpdateProfile(updatedProfile);
            if (!updatedProfile.isGuest) {
              const permanentId = updatedProfile.id || updatedProfile.uid || (updatedProfile.email ? "usr_" + updatedProfile.email.replace(/[^a-zA-Z0-9]/g, "_") : "usr_user");
              const userToSave = {
                ...updatedProfile,
                id: permanentId,
                uid: permanentId,
                createdAt: (updatedProfile as any).createdAt || new Date().toISOString()
              };
              saveUserProfileToFirestore(userToSave as any).catch(console.warn);
            }
            try {
              localStorage.setItem("chessmaster_user_profile", JSON.stringify(updatedProfile));
            } catch (err) {
              console.warn("Could not persist puzzle stats:", err);
            }
          }
        } else {
          // Opponent response turn
          setSolutionIndex(nextIndex);
          setMoveFeedback({
            type: "correct_step",
            message: "✓ Correct! Opponent responding..."
          });

          setIsOpponentThinking(true);
          setTimeout(() => {
            const opponentMoveStr = activePuzzle.solutionMoves[nextIndex];
            if (opponentMoveStr) {
              const opFrom = opponentMoveStr.slice(0, 2);
              const opTo = opponentMoveStr.slice(2, 4);
              const opPromo = opponentMoveStr.length === 5 ? opponentMoveStr[4].toLowerCase() : "q";

              try {
                newGame.move({ from: opFrom, to: opTo, promotion: opPromo });
              } catch {
                try {
                  newGame.move(opponentMoveStr);
                } catch (e) {
                  console.error("Opponent move execution failed:", e);
                }
              }

              setBoardGame(new Chess(newGame.fen()));
              setLastMove({ from: opFrom, to: opTo });
              setSolutionIndex(nextIndex + 1);
              setMoveFeedback({
                type: "idle",
                message: "✓ Opponent responded. Find the next best move!"
              });
            }
            setIsOpponentThinking(false);
          }, 700);
        }
      } else {
        // Incorrect move
        setAttemptsOnCurrent((prev) => prev + 1);
        setMoveFeedback({
          type: "incorrect",
          message: "✗ Incorrect move. Try again!"
        });

        // Reset streak on failed attempt if profile update function exists
        if (onUpdateProfile && attemptsOnCurrent === 0) {
          const currentStats = profile.puzzleStats || {
            attempted: 0,
            solved: 0,
            accuracy: 0,
            currentRating: profile.puzzleElo || 1200,
            bestRating: profile.puzzleElo || 1200,
            correctStreak: 0,
            averageTimeSeconds: 0
          };

          const newAttempted = currentStats.attempted + 1;
          const newAccuracy = Math.round((currentStats.solved / newAttempted) * 100);

          const updatedProfile: UserProfile = {
            ...profile,
            puzzleStats: {
              ...currentStats,
              attempted: newAttempted,
              accuracy: newAccuracy,
              correctStreak: 0
            }
          };
          onUpdateProfile(updatedProfile);
          if (!updatedProfile.isGuest) {
            const permanentId = updatedProfile.id || updatedProfile.uid || (updatedProfile.email ? "usr_" + updatedProfile.email.replace(/[^a-zA-Z0-9]/g, "_") : "usr_user");
            const userToSave = {
              ...updatedProfile,
              id: permanentId,
              uid: permanentId,
              createdAt: (updatedProfile as any).createdAt || new Date().toISOString()
            };
            saveUserProfileToFirestore(userToSave as any).catch(console.warn);
          }
        }
      }
    } catch (e) {
      setMoveFeedback({
        type: "incorrect",
        message: "✗ Invalid move. Check square coordinates."
      });
    }
  };

  // Reveal full solution sequence
  const handleRevealSolution = () => {
    setShowSolutionRequested(true);
    setMoveFeedback({
      type: "revealed",
      message: "Solution revealed below. Reset position to practice again."
    });
  };

  // AI Coach walkthrough fetch
  const fetchAiWalkthrough = async () => {
    setLoadingWalkthrough(true);
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: activePuzzle.fen,
          move: activePuzzle.solutionMoves[0],
          history: activePuzzle.solutionMoves,
          rating: profile.puzzleElo || profile.elo
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiWalkthrough(data.explanation);
      } else {
        setAiWalkthrough(activePuzzle.explanationSteps.join("\n\n"));
      }
    } catch (e) {
      setAiWalkthrough(activePuzzle.explanationSteps.join("\n\n"));
    } finally {
      setLoadingWalkthrough(false);
    }
  };

  // Stats derived from UserProfile
  const stats = profile.puzzleStats || {
    attempted: 0,
    solved: 0,
    accuracy: 0,
    currentRating: profile.puzzleElo || 1200,
    bestRating: profile.puzzleElo || 1200,
    correctStreak: 0,
    averageTimeSeconds: 0
  };

  // Highlights for hint system
  const highlights = hintLevel >= 2 && activePuzzle.hintPieceSquare ? [activePuzzle.hintPieceSquare] : [];

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-12">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Validated Tactical Puzzles
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
            <span>Tactical Vision Gym</span>
            <Zap className="h-6 w-6 text-amber-400 fill-current animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Solve 100% verified legal chess puzzles. Train pattern recognition across forks, pins, checkmates, and endgame combinations.
          </p>
        </div>

        {/* User Rating & Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Puzzle Elo
            </div>
            <div className="text-xl font-black font-mono text-amber-300 mt-1">
              {profile.puzzleElo || 1200}
            </div>
            <div className="text-[10px] text-slate-500">Best: {stats.bestRating || profile.puzzleElo || 1200}</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Solved
            </div>
            <div className="text-xl font-black font-mono text-emerald-300 mt-1">
              {stats.solved} <span className="text-xs font-normal text-slate-500">/ {stats.attempted}</span>
            </div>
            <div className="text-[10px] text-slate-500">Acc: {stats.accuracy}%</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Accuracy
            </div>
            <div className="text-xl font-black font-mono text-amber-400 mt-1">
              {stats.accuracy}%
            </div>
            <div className="text-[10px] text-slate-500">Tactics precision</div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Target className="h-3 w-3 text-sky-400" /> Verified
            </div>
            <div className="text-xl font-black font-mono text-sky-300 mt-1">
              100%
            </div>
            <div className="text-[10px] text-slate-500">Legal FEN engine</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setActivePuzzleIndex(0);
              }}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Tactical Theme:</span>
            <select
              value={selectedTheme}
              onChange={(e) => {
                setSelectedTheme(e.target.value);
                setActivePuzzleIndex(0);
              }}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              {themes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-200">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search puzzle name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActivePuzzleIndex(0);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Main Grid: Board & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Board & Interactive Controls */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-4">
          <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col items-center relative overflow-hidden">
            {/* Side To Move Badge */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border border-slate-600 shadow-sm ${
                  activePuzzle.sideToMove === "white" ? "bg-white" : "bg-slate-900 border-white"
                }`} />
                <span className="text-xs font-black font-display tracking-tight text-slate-200">
                  {activePuzzle.sideToMove === "white" ? "WHITE TO MOVE" : "BLACK TO MOVE"}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {activePuzzle.theme} • {activePuzzle.puzzleRating} ELO
              </span>
            </div>

            {/* Main Interactive Chessboard */}
            <div className="w-full max-w-[500px]">
              <Chessboard
                game={boardGame}
                onMove={handlePuzzleMove}
                lastMove={lastMove}
                highlights={highlights}
                orientation={activePuzzle.sideToMove}
                interactive={moveFeedback.type !== "solved" && !isOpponentThinking}
                theme={profile.settings?.boardTheme || "cosmic_wood"}
              />
            </div>

            {/* Board Footer Action Buttons */}
            <div className="w-full flex items-center justify-between pt-4 mt-3 border-t border-slate-900 text-xs">
              <button
                onClick={handleResetPuzzle}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer bg-slate-950"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span>Reset Position</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Hint Button */}
                <button
                  onClick={() => setHintLevel((prev) => Math.min(prev + 1, 2))}
                  disabled={moveFeedback.type === "solved" || hintLevel >= 2}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 px-3.5 py-2 text-amber-300 hover:bg-amber-500/10 transition-all cursor-pointer bg-slate-950 disabled:opacity-50"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>{hintLevel === 0 ? "Hint" : hintLevel === 1 ? "Piece Hint" : "Hint Active"}</span>
                </button>

                {/* Show Solution Button */}
                <button
                  onClick={handleRevealSolution}
                  disabled={moveFeedback.type === "solved" || showSolutionRequested}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer bg-slate-950 disabled:opacity-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Show Solution</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Status Feedback Bar */}
          <div className={`p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-3 shadow-md ${
            moveFeedback.type === "solved"
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
              : moveFeedback.type === "incorrect"
              ? "bg-red-950/60 border-red-500/50 text-red-300 animate-shake"
              : moveFeedback.type === "correct_step"
              ? "bg-sky-950/60 border-sky-500/50 text-sky-300"
              : moveFeedback.type === "revealed"
              ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
              : "bg-slate-900 border-slate-800 text-slate-300"
          }`}>
            <div className="flex items-center gap-2.5">
              {moveFeedback.type === "solved" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
              {moveFeedback.type === "incorrect" && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
              {moveFeedback.type === "correct_step" && <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />}
              {moveFeedback.type === "revealed" && <Eye className="h-5 w-5 text-amber-400 shrink-0" />}
              {moveFeedback.type === "idle" && <Target className="h-5 w-5 text-amber-400 shrink-0" />}
              <span>{moveFeedback.message}</span>
            </div>

            {moveFeedback.type === "solved" && (
              <button
                onClick={handleNextPuzzle}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Hint Display Box */}
          {hintLevel > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 font-bold font-mono uppercase tracking-wider text-[10px] text-amber-400">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>Tactical Hint ({hintLevel}/2)</span>
              </div>
              <p className="leading-relaxed">
                {activePuzzle.hintIdea}
              </p>
              {hintLevel >= 2 && activePuzzle.hintPieceSquare && (
                <p className="text-[11px] font-mono text-amber-300/90 font-bold">
                  💡 Highlighted square <span className="bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">{activePuzzle.hintPieceSquare.toUpperCase()}</span> contains the key tactical piece!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Puzzle Details, Solution Steps & AI Coach */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          
          {/* Active Puzzle Info Header */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black font-mono tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {activePuzzle.difficulty.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black font-mono tracking-wider bg-slate-800 text-slate-300">
                  {activePuzzle.theme}
                </span>
              </div>

              <span className="text-xs font-mono font-bold text-slate-400">
                Puzzle {activePuzzleIndex + 1} of {availablePuzzles.length}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-white">
                {activePuzzle.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                {activePuzzle.description}
              </p>
            </div>

            {/* Solved Completion Modal Card */}
            {moveFeedback.type === "solved" && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500/50 text-white space-y-4 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-display text-lg">
                    <Trophy className="h-6 w-6 text-amber-400 animate-bounce" />
                    <span>PUZZLE SOLVED!</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                    +20 Rating
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-emerald-900/60 text-center font-mono">
                  <div className="p-2 bg-slate-950/60 rounded-xl border border-emerald-900/40">
                    <div className="text-[10px] text-slate-400 uppercase">Rating</div>
                    <div className="text-sm font-bold text-amber-300">{activePuzzle.puzzleRating}</div>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-xl border border-emerald-900/40">
                    <div className="text-[10px] text-slate-400 uppercase">Attempts</div>
                    <div className="text-sm font-bold text-emerald-300">{attemptsOnCurrent + 1}</div>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-xl border border-emerald-900/40">
                    <div className="text-[10px] text-slate-400 uppercase">Time</div>
                    <div className="text-sm font-bold text-sky-300">{solveTimeSeconds}s</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleNextPuzzle}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg"
                  >
                    <span>Next Puzzle</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {onNavigateToAnalyzer && (
                    <button
                      onClick={() => onNavigateToAnalyzer(activePuzzle.fen)}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700"
                    >
                      <BarChart3 className="h-4 w-4 text-sky-400" />
                      <span>Analyze Position</span>
                    </button>
                  )}

                  <button
                    onClick={handleResetPuzzle}
                    className="py-3 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Revealed Solution Box */}
            {showSolutionRequested && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                <div className="text-amber-300 font-bold font-mono uppercase tracking-wider text-[10px]">
                  Verified Solution Moves:
                </div>
                <div className="flex flex-wrap gap-2">
                  {activePuzzle.solutionMoves.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-200 font-mono text-xs font-bold">
                      {idx + 1}. {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Walkthrough Explanation Steps */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Tactical Breakdown
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {activePuzzle.explanationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Coach Review Button */}
            {!aiWalkthrough && (
              <button
                onClick={fetchAiWalkthrough}
                disabled={loadingWalkthrough}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loadingWalkthrough ? (
                  <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-400" />
                )}
                <span>Ask AI Coach for Deep Explanation</span>
              </button>
            )}

            {aiWalkthrough && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs text-slate-300 leading-relaxed space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-display">
                  <Sparkles className="h-4 w-4 fill-current animate-pulse" />
                  <span>AI Coach Tactical Masterclass</span>
                </div>
                <p className="whitespace-pre-line text-slate-300 text-xs">
                  {aiWalkthrough}
                </p>
              </div>
            )}
          </div>

          {/* Quick Selection List of Filtered Puzzles */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Select Puzzle ({availablePuzzles.length})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {availablePuzzles.map((puz, index) => {
                const isActive = activePuzzle.puzzleId === puz.puzzleId;
                return (
                  <button
                    key={puz.puzzleId}
                    onClick={() => {
                      setActivePuzzleIndex(index);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span>#{index + 1}</span>
                      <span className="text-amber-400">{puz.puzzleRating}</span>
                    </div>
                    <div className="truncate font-display text-white text-xs">{puz.title}</div>
                    <div className="text-[10px] font-normal text-slate-400 truncate mt-1">
                      {puz.theme}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
