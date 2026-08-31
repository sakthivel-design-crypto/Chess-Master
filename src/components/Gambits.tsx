import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, Heart, Star, Award, ArrowLeft, ArrowRight, Play, Pause, 
  RotateCcw, RefreshCw, Volume2, ShieldAlert, BookOpen, HelpCircle, 
  AlertTriangle, CheckCircle2, ChevronRight, Cpu, Trophy, Swords, 
  Zap, Maximize2, Minimize2, BookOpenCheck, Clock, Layers, Sparkles
} from "lucide-react";
import { Chessboard } from "./Chessboard";
import { GAMBITS, Gambit } from "../gambitData";
import { UserProfile, ChessTheme } from "../types";
import confetti from "canvas-confetti";
import { navigationManager } from "../utils/navigationManager";

interface GambitsProps {
  profile: UserProfile;
  theme?: ChessTheme;
  onAwardProgress?: (xp: number, coins: number) => void;
}

export const Gambits: React.FC<GambitsProps> = ({ 
  profile, 
  theme = ChessTheme.TOURNAMENT,
  onAwardProgress 
}) => {
  // PROGRESS STATE & PERSISTENCE
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("gambits_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem("gambits_recent");
    return saved ? JSON.parse(saved) : [];
  });

  const [progress, setProgress] = useState<Record<string, {
    completed: boolean;
    quizScore: number;
    accuracy: number;
    timeSpent: number;
  }>>(() => {
    const saved = localStorage.getItem("gambits_progress");
    return saved ? JSON.parse(saved) : {};
  });

  // SAVING TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem("gambits_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("gambits_recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("gambits_progress", JSON.stringify(progress));
  }, [progress]);

  // BROWSER & FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<"All" | "White" | "Black">("All");
  const [diffFilter, setDiffFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [viewFilter, setViewFilter] = useState<"All" | "Favorites" | "Recently Viewed">("All");

  // SELECTED GAMBIT (LESSON / PRACTICE WINDOW)
  const [selectedGambit, setSelectedGambit] = useState<Gambit | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<
    "overview" | "lesson" | "variations" | "strategy" | "practice" | "quiz"
  >("overview");

  // INTERACTIVE BOARD STATE (LESSON MODE)
  const [lessonGame, setLessonGame] = useState<Chess>(new Chess());
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [evaluation, setEvaluation] = useState(0.0); // 0.0 is equal
  const [activeHighlights, setActiveHighlights] = useState<string[]>([]);

  // AI COACH EXPLANATION LEVEL
  const [coachLevel, setCoachLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [aiExplanationText, setAiExplanationText] = useState("");
  const [loadingAiCoach, setLoadingAiCoach] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // VARIATION SUB-TAB IN LESSON
  const [selectedVariation, setSelectedVariation] = useState<"accepted" | "declined">("accepted");
  const [variationGame, setVariationGame] = useState<Chess>(new Chess());
  const [variationIdx, setVariationIdx] = useState(0);
  const [variationHighlights, setVariationHighlights] = useState<string[]>([]);
  const [isVariationPlaying, setIsVariationPlaying] = useState(false);

  // INTERACTIVE PRACTICE CHALLENGE STATE (PRACTICE TAB)
  const [practiceGame, setPracticeGame] = useState<Chess>(new Chess());
  const [practiceMode, setPracticeMode] = useState<"lesson-moves" | "ai-sparring">("lesson-moves");
  const [practiceLog, setPracticeLog] = useState<{ type: "player" | "ai" | "coach"; text: string }[]>([]);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // QUIZ STATE
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // PRACTICE TIME TRACKER
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedGambit) {
      setTimeSpentSeconds(0);
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedGambit]);

  // Back navigation handling for Gambits subviews & selected gambit
  useEffect(() => {
    if (selectedGambit) {
      const unregister = navigationManager.registerHandler({
        id: "gambit-subview-handler",
        priority: 70,
        handleBack: () => {
          if (activeLessonTab !== "overview") {
            setActiveLessonTab("overview");
            return true;
          }
          setSelectedGambit(null);
          return true;
        }
      });
      return unregister;
    }
  }, [selectedGambit, activeLessonTab]);

  // UPDATE VIEWED LIST
  const selectGambit = (g: Gambit) => {
    setSelectedGambit(g);
    setActiveLessonTab("overview");
    setLessonGame(new Chess());
    setCurrentMoveIdx(0);
    setIsPlaying(false);
    setIsFlipped(g.side === "Black");
    setEvaluation(0.0);
    setActiveHighlights([]);
    setAiExplanationText(g.explanations[0] || "");
    setAiSummary("");
    setSelectedVariation("accepted");
    setSelectedOption(null);
    setQuizAnswered(false);

    // Initialize variations
    const varChess = new Chess();
    setVariationGame(varChess);
    setVariationIdx(0);
    setVariationHighlights([]);
    setIsVariationPlaying(false);

    // Initialize practice
    setPracticeGame(new Chess());
    setPracticeCompleted(false);
    setPracticeLog([
      { type: "coach", text: `Welcome to active sparring! I am your AI Master Coach. Select "Play AI sparring" to challenge me, or use "Follow Main Line" to master the first ${g.moves.length} moves.` }
    ]);

    // Track recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== g.id);
      return [g.id, ...filtered].slice(0, 8);
    });
  };

  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(fId => fId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // STEPPING FORWARD/BACKWARD IN MAIN LINE
  const handleStepForward = () => {
    if (!selectedGambit || currentMoveIdx >= selectedGambit.moves.length) return;
    try {
      const nextMove = selectedGambit.moves[currentMoveIdx];
      const chessCopy = new Chess(lessonGame.fen());
      const res = chessCopy.move(nextMove);
      if (res) {
        setLessonGame(chessCopy);
        const nextIdx = currentMoveIdx + 1;
        setCurrentMoveIdx(nextIdx);

        // Highlight source and target squares
        setActiveHighlights([res.from, res.to]);

        // Adapt explanation
        let baseExp = selectedGambit.explanations[currentMoveIdx] || "";
        if (coachLevel === "Beginner") {
          baseExp += " Focus on maintaining simple central control and keeping your pieces secure.";
        } else if (coachLevel === "Advanced") {
          baseExp += " Notice how this modifies key outpost dynamics, line infiltration possibilities, and tactical square pressure.";
        }
        setAiExplanationText(baseExp);

        // Update real-time engine evaluation mockup
        calculateEvaluation(chessCopy, selectedGambit.side);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStepBackward = () => {
    if (!selectedGambit || currentMoveIdx === 0) return;
    try {
      const chessCopy = new Chess(lessonGame.fen());
      const undone = chessCopy.undo();
      if (undone) {
        setLessonGame(chessCopy);
        const nextIdx = currentMoveIdx - 1;
        setCurrentMoveIdx(nextIdx);
        setActiveHighlights([undone.from, undone.to]);
        setAiExplanationText(selectedGambit.explanations[nextIdx - 1] || selectedGambit.shortDesc);
        calculateEvaluation(chessCopy, selectedGambit.side);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPosition = () => {
    setLessonGame(new Chess());
    setCurrentMoveIdx(0);
    setIsPlaying(false);
    setEvaluation(0.0);
    setActiveHighlights([]);
    if (selectedGambit) {
      setAiExplanationText(selectedGambit.shortDesc);
    }
  };

  // REAL-TIME ENGINE EVALUATION ALGORITHM
  const calculateEvaluation = (chess: Chess, side: "White" | "Black") => {
    // Basic material & position calculation
    let score = 0.0;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          const val = p.type === "p" ? 1 : p.type === "n" || p.type === "b" ? 3 : p.type === "r" ? 5 : p.type === "q" ? 9 : 0;
          score += p.color === "w" ? val : -val;
        }
      }
    }

    // Add positional modifiers based on center control and active moves
    if (chess.history().length > 0) {
      const isWhiteTurn = chess.turn() === "w";
      // Give tiny bonus to the side that moved
      score += isWhiteTurn ? -0.15 : 0.15;
    }

    // Clip and set
    setEvaluation(parseFloat(score.toFixed(2)));
  };

  // AUTOPLAY MAIN LINE LOOP
  useEffect(() => {
    let playTimer: NodeJS.Timeout | null = null;
    if (isPlaying && selectedGambit) {
      if (currentMoveIdx < selectedGambit.moves.length) {
        playTimer = setTimeout(() => {
          handleStepForward();
        }, 3000);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (playTimer) clearTimeout(playTimer);
    };
  }, [isPlaying, currentMoveIdx, selectedGambit]);

  // VOICE SPEAKER
  const handleSpeakExplanation = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const text = aiExplanationText || (selectedGambit?.shortDesc || "");
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`-]/g, ""));
      window.speechSynthesis.speak(utterance);
    }
  };

  // VARIATION SWITCHING & INDEPENDENT ENGINE STATE
  const handleSelectVariation = (varType: "accepted" | "declined") => {
    setIsVariationPlaying(false);
    setSelectedVariation(varType);
    
    // Destroy previous variation state & create a fresh new Chess game instance from initial position
    const freshGame = new Chess();
    setVariationGame(freshGame);
    setVariationIdx(0);
    setVariationHighlights([]);
    
    if (selectedGambit) {
      calculateEvaluation(freshGame, selectedGambit.side);
    }
  };

  // RESTART CURRENT VARIATION FROM INITIAL POSITION
  const handleRestartVariation = () => {
    setIsVariationPlaying(false);
    
    // Reset board and game state completely to initial starting position (Move 0)
    const freshGame = new Chess();
    setVariationGame(freshGame);
    setVariationIdx(0);
    setVariationHighlights([]);
    
    if (selectedGambit) {
      calculateEvaluation(freshGame, selectedGambit.side);
    }
  };

  // SWITCH TO NEXT OR PREVIOUS VARIATION
  const handleNextVariation = () => {
    handleSelectVariation(selectedVariation === "accepted" ? "declined" : "accepted");
  };

  const handlePreviousVariation = () => {
    handleSelectVariation(selectedVariation === "declined" ? "accepted" : "accepted");
  };

  // VARIATION FORWARD/BACKWARD
  const handleVariationStep = (dir: "fwd" | "bwd") => {
    if (!selectedGambit) return;
    const currentVarObj = selectedVariation === "accepted" 
      ? selectedGambit.acceptedVariation 
      : selectedGambit.declinedVariation;
    const movesList = currentVarObj.moves;

    if (dir === "fwd") {
      if (variationIdx >= movesList.length) return;
      try {
        const nextMove = movesList[variationIdx];
        const copy = new Chess(variationGame.fen());
        const res = copy.move(nextMove);
        if (res) {
          setVariationGame(copy);
          const newIdx = variationIdx + 1;
          setVariationIdx(newIdx);
          setVariationHighlights([res.from, res.to]);
          calculateEvaluation(copy, selectedGambit.side);

          // Track variation progress independently
          const varProgressKey = `${selectedGambit.id}_${selectedVariation}`;
          if (newIdx === movesList.length) {
            if (onAwardProgress) onAwardProgress(50, 20);
            setProgress(prev => ({
              ...prev,
              [varProgressKey]: {
                completed: true,
                quizScore: prev[varProgressKey]?.quizScore || 100,
                accuracy: 100,
                timeSpent: timeSpentSeconds
              }
            }));
          }
        }
      } catch (e) {
        console.error("Variation move error:", e);
      }
    } else {
      if (variationIdx === 0) return;
      try {
        const copy = new Chess(variationGame.fen());
        const undone = copy.undo();
        if (undone) {
          setVariationGame(copy);
          setVariationIdx(prev => prev - 1);
          setVariationHighlights([undone.from, undone.to]);
          calculateEvaluation(copy, selectedGambit.side);
        }
      } catch (e) {
        console.error("Variation undo error:", e);
      }
    }
  };

  // AUTOPLAY VARIATION LOOP
  useEffect(() => {
    let playTimer: NodeJS.Timeout | null = null;
    if (isVariationPlaying && selectedGambit && activeLessonTab === "variations") {
      const movesList = selectedVariation === "accepted" 
        ? selectedGambit.acceptedVariation.moves 
        : selectedGambit.declinedVariation.moves;

      if (variationIdx < movesList.length) {
        playTimer = setTimeout(() => {
          handleVariationStep("fwd");
        }, 2500);
      } else {
        setIsVariationPlaying(false);
      }
    }
    return () => {
      if (playTimer) clearTimeout(playTimer);
    };
  }, [isVariationPlaying, variationIdx, selectedGambit, selectedVariation, activeLessonTab]);

  // IN-DEPTH GEMINI EXPLANATION OF CURRENT MOVE
  const handleAskCoachDetail = async () => {
    if (!selectedGambit) return;
    setLoadingAiCoach(true);
    try {
      const lastMove = selectedGambit.moves[currentMoveIdx - 1] || "None";
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: lessonGame.fen(),
          move: lastMove,
          history: selectedGambit.moves.slice(0, currentMoveIdx),
          rating: coachLevel === "Beginner" ? 800 : coachLevel === "Intermediate" ? 1400 : 2200
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanationText(data.explanation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiCoach(false);
    }
  };

  // GENERATE AI SUMMARY FOR GAMBIT
  const handleGenerateSummary = async () => {
    if (!selectedGambit) return;
    setLoadingSummary(true);
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: selectedGambit.practicePosition.fen,
          move: "General Gambit Strategy",
          history: selectedGambit.moves,
          rating: profile.elo
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiSummary(data.explanation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // QUIZ SUBMISSION
  const handleSelectQuizOption = (opt: string) => {
    if (quizAnswered) return;
    setSelectedOption(opt);
  };

  const handleQuizSubmit = () => {
    if (!selectedGambit || !selectedOption) return;
    setQuizAnswered(true);

    const isCorrect = selectedOption === selectedGambit.quiz.answer;
    if (isCorrect) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      if (onAwardProgress) onAwardProgress(50, 25); // Award points

      // Mark progress
      setProgress(prev => {
        const current = prev[selectedGambit.id] || { completed: false, quizScore: 0, accuracy: 0, timeSpent: 0 };
        return {
          ...prev,
          [selectedGambit.id]: {
            ...current,
            quizScore: 100,
            timeSpent: current.timeSpent + timeSpentSeconds
          }
        };
      });
    } else {
      setProgress(prev => {
        const current = prev[selectedGambit.id] || { completed: false, quizScore: 0, accuracy: 0, timeSpent: 0 };
        return {
          ...prev,
          [selectedGambit.id]: {
            ...current,
            quizScore: 0,
            timeSpent: current.timeSpent + timeSpentSeconds
          }
        };
      });
    }
  };

  // ACTIVE SPAR/PRACTICE MOVE HANDLER
  const handlePracticeMove = async (from: string, to: string, promotion?: string) => {
    if (!selectedGambit || practiceCompleted) return;

    if (practiceMode === "lesson-moves") {
      // User must follow the gambit main line
      const currentMovesCount = practiceGame.history().length;
      if (currentMovesCount >= selectedGambit.moves.length) {
        setPracticeLog(prev => [
          ...prev,
          { type: "coach", text: "You have completed the main line practice! Switch to AI Sparring to play a real game." }
        ]);
        return;
      }

      const expectedMove = selectedGambit.moves[currentMovesCount];
      try {
        const copy = new Chess(practiceGame.fen());
        const moveRes = copy.move({ from, to, promotion: promotion || "q" });
        if (moveRes) {
          // Check if played move is the expected one
          const playedSan = moveRes.san;
          if (playedSan === expectedMove || (from + to) === expectedMove) {
            setPracticeGame(copy);
            setPracticeLog(prev => [
              ...prev,
              { type: "player", text: `Played: ${playedSan}. Excellent!` },
              { type: "coach", text: `Move ${currentMovesCount + 1}: ${selectedGambit.explanations[currentMovesCount]}` }
            ]);

            // Auto-advance if White and AI should play next move
            const nextIdx = currentMovesCount + 1;
            if (nextIdx >= selectedGambit.moves.length) {
              setPracticeCompleted(true);
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.8 } });
              if (onAwardProgress) onAwardProgress(100, 50);
              
              // Record completion progress
              setProgress(prev => {
                const current = prev[selectedGambit.id] || { completed: false, quizScore: 0, accuracy: 0, timeSpent: 0 };
                return {
                  ...prev,
                  [selectedGambit.id]: {
                    ...current,
                    completed: true,
                    accuracy: 100,
                    timeSpent: current.timeSpent + timeSpentSeconds
                  }
                };
              });

              setPracticeLog(prev => [
                ...prev,
                { type: "coach", text: "🎉 Congratulations! You have fully mastered the main line of the " + selectedGambit.name + "." }
              ]);
            } else {
              // Opponent move auto-replies
              setTimeout(() => {
                const innerCopy = new Chess(copy.fen());
                const opponentMove = selectedGambit.moves[nextIdx];
                const oppRes = innerCopy.move(opponentMove);
                if (oppRes) {
                  setPracticeGame(innerCopy);
                  setPracticeLog(prev => [
                    ...prev,
                    { type: "ai", text: `Opponent plays: ${oppRes.san}` },
                    { type: "coach", text: `Move ${nextIdx + 1}: ${selectedGambit.explanations[nextIdx]}` }
                  ]);
                }
              }, 1000);
            }
          } else {
            setPracticeLog(prev => [
              ...prev,
              { type: "coach", text: `❌ Inaccurate. The main line recommends playing "${expectedMove}". Try again!` }
            ]);
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // REAL SPAR AGAINST GEMINI ENGINE
      try {
        const copy = new Chess(practiceGame.fen());
        const moveRes = copy.move({ from, to, promotion: "q" });
        if (moveRes) {
          setPracticeGame(copy);
          setPracticeLog(prev => [
            ...prev,
            { type: "player", text: `Played: ${moveRes.san}` }
          ]);

          if (copy.isGameOver()) {
            setPracticeCompleted(true);
            const text = copy.isCheckmate() ? "You delivered checkmate! Glorious!" : "Game ended in a draw.";
            setPracticeLog(prev => [...prev, { type: "coach", text }]);
            if (copy.isCheckmate() && onAwardProgress) onAwardProgress(150, 75);
            return;
          }

          // Trigger AI turn
          setIsAiThinking(true);
          setPracticeLog(prev => [...prev, { type: "coach", text: "AI Coach is calculating the refutation..." }]);
          
          try {
            const response = await fetch("/api/coach/suggest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fen: copy.fen(),
                history: copy.history(),
                rating: 1600,
                legalMoves: copy.moves()
              })
            });
            const data = await response.json();
            
            if (data.bestMove) {
              const aiCopy = new Chess(copy.fen());
              const aiMoveRes = aiCopy.move(data.bestMove);
              if (aiMoveRes) {
                setPracticeGame(aiCopy);
                setPracticeLog(prev => [
                  ...prev,
                  { type: "ai", text: `AI: ${aiMoveRes.san}` },
                  { type: "coach", text: `Coach: ${data.explanation}` }
                ]);
              }
            } else {
              // Client fallback
              const fallbackMoves = copy.moves();
              const randMove = fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
              const aiCopy = new Chess(copy.fen());
              const aiMoveRes = aiCopy.move(randMove);
              if (aiMoveRes) {
                setPracticeGame(aiCopy);
                setPracticeLog(prev => [
                  ...prev,
                  { type: "ai", text: `AI: ${aiMoveRes.san} (fallback)` }
                ]);
              }
            }
          } catch (err) {
            console.error(err);
          } finally {
            setIsAiThinking(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePracticeUndo = () => {
    try {
      const copy = new Chess(practiceGame.fen());
      copy.undo(); // Undo AI
      copy.undo(); // Undo Player
      setPracticeGame(copy);
      setPracticeCompleted(false);
      setPracticeLog(prev => [
        ...prev,
        { type: "coach", text: "Takeback applied. Show me what you've got!" }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePracticeReset = () => {
    setPracticeGame(new Chess());
    setPracticeCompleted(false);
    setPracticeLog([
      { type: "coach", text: "Board reset. Let's practice the gambit from the beginning." }
    ]);
  };

  // FILTER LOGIC
  const filteredGambits = GAMBITS.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.eco.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSide = sideFilter === "All" || g.side === sideFilter;
    const matchesDiff = diffFilter === "All" || g.difficulty === diffFilter;

    let matchesView = true;
    if (viewFilter === "Favorites") {
      matchesView = favorites.includes(g.id);
    } else if (viewFilter === "Recently Viewed") {
      matchesView = recentlyViewed.includes(g.id);
    }

    return matchesSearch && matchesSide && matchesDiff && matchesView;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HEADER SECTION */}
      <AnimatePresence mode="wait">
        {!selectedGambit ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card p-6 shadow-xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-serif px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Interactive Academy
                </span>
                <span className="text-amber-200/60 text-xs">• Theory Lab</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-serif tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Master Chess Gambits</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Browse, explore, and practice every legendary tactical gambit. Learn historical context, mainlines, variations, and spar directly against the Grandmaster AI Engine.
              </p>
            </div>
            
            {/* Academy Overall progress */}
            <div className="bg-[#0B0D17]/80 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto shadow-inner">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-200/60 uppercase">COMPLETED GAMBITS</div>
                <div className="text-lg font-bold font-serif text-amber-300">
                  {Object.values(progress).filter((p: any) => p.completed).length} / {GAMBITS.length}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-slate-900/60 dark:bg-slate-950/60 border border-slate-800/50 rounded-xl"
          >
            <button 
              onClick={() => setSelectedGambit(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Gambits Browser
            </button>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Viewing:</span>
              <span className="text-emerald-400 font-bold">{selectedGambit.name} ({selectedGambit.eco})</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. BROWSER MODE VIEW */}
      {!selectedGambit ? (
        <div className="space-y-6">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white dark:bg-[#0b111e]/80 dark:backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search gambits by name, ECO, difficulty, style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* View filter (All, Favorites, Recently learned) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto w-full md:w-auto">
                <button 
                  onClick={() => setViewFilter("All")}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${viewFilter === "All" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}
                >
                  All Gambits
                </button>
                <button 
                  onClick={() => setViewFilter("Favorites")}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${viewFilter === "Favorites" ? "bg-rose-500 text-white" : "text-slate-400"}`}
                >
                  <Heart className="h-3 w-3 fill-current" /> Favorites ({favorites.length})
                </button>
                <button 
                  onClick={() => setViewFilter("Recently Viewed")}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${viewFilter === "Recently Viewed" ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100" : "text-slate-400"}`}
                >
                  Recently Viewed
                </button>
              </div>
            </div>

            {/* Sub filters */}
            <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
              
              {/* Side (White/Black) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-slate-400">Play Side:</span>
                <div className="inline-flex rounded-lg bg-slate-50 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
                  {["All", "White", "Black"].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setSideFilter(opt as any)}
                      className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${sideFilter === opt ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-emerald-400 shadow-sm" : ""}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-slate-400">Difficulty:</span>
                <div className="inline-flex rounded-lg bg-slate-50 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800">
                  {["All", "Beginner", "Intermediate", "Advanced"].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setDiffFilter(opt as any)}
                      className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${diffFilter === opt ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-emerald-400 shadow-sm" : ""}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ml-auto text-[10px] font-mono text-slate-400">
                Found {filteredGambits.length} matches
              </div>
            </div>
          </div>

          {/* GAMBITS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredGambits.map((g, idx) => {
                const isFavorite = favorites.includes(g.id);
                const hasCompleted = progress[g.id]?.completed;
                const score = progress[g.id]?.quizScore;

                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => selectGambit(g)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-[#0b111e]/50 hover:bg-slate-50 dark:hover:bg-[#0d1526] p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Corner badge for side */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                      <span className={`text-[9px] font-mono font-extrabold tracking-widest uppercase px-2 py-0.5 rounded ${
                        g.side === "White" 
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" 
                          : "bg-slate-950 text-white border border-slate-800"
                      }`}>
                        {g.side}
                      </span>
                      <button 
                        onClick={(e) => handleFavoriteToggle(g.id, e)}
                        className={`p-1 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isFavorite ? "text-rose-500" : "text-slate-400"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 font-bold">
                          <span>ECO: {g.eco}</span>
                          <span>•</span>
                          <span className={`font-semibold ${
                            g.difficulty === "Beginner" ? "text-emerald-500" : 
                            g.difficulty === "Intermediate" ? "text-amber-500" : "text-indigo-500"
                          }`}>{g.difficulty}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-display group-hover:text-emerald-500 transition-colors mt-0.5">
                          {g.name}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {g.shortDesc}
                      </p>

                      {/* Small dynamic stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-[11px] font-mono font-bold text-slate-400">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500">Popularity</span>
                          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>{g.popularity}%</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500">Win Rate</span>
                          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                            <Swords className="h-3 w-3 text-emerald-500" />
                            <span>{g.successRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1 text-emerald-500">
                        {hasCompleted ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 fill-emerald-500/10 text-emerald-500" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">Start Lesson</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-0.5 text-slate-400 group-hover:translate-x-1 transition-transform">
                        <span>Learn</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredGambits.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900/40 p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No Gambits Found</h4>
                <p className="text-xs">Try relaxing your filters or check your spelling.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        
        // 3. DETAILED LESSON & PRACTICE MODE
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: THE INTERACTIVE CHESSBOARD */}
          <div className={`${isFullscreen ? "lg:col-span-12" : "lg:col-span-5"} space-y-4`}>
            
            <div className="bg-white dark:bg-[#0b111e]/60 dark:backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative flex flex-col items-center">
              
              {/* FULLSCREEN / FLIP BUTTONS */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                <button 
                  onClick={() => setIsFlipped(prev => !prev)}
                  title="Flip Board"
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setIsFullscreen(prev => !prev)}
                  title="Fullscreen"
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* REAL-TIME ENGINE EVALUATION BAR */}
              <div className="w-full flex items-center gap-3 mb-4">
                <div className="h-4.5 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden relative flex items-center justify-between px-3 text-[10px] font-bold font-mono">
                  
                  {/* Dynamic side colored fill representing engine advantage */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, 50 + (evaluation * 5)))}%`,
                      opacity: 0.15
                    }}
                  />
                  
                  <span className="text-slate-500 dark:text-slate-400 relative z-10">ENGINE EVAL</span>
                  <span className={`relative z-10 ${evaluation >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {evaluation > 0 ? `+${evaluation}` : evaluation}
                  </span>
                </div>
              </div>

              {/* ACTIVE CHESSBOARD */}
              <div className="w-full max-w-[420px] aspect-square flex items-center justify-center">
                <Chessboard
                  game={
                    activeLessonTab === "practice" ? practiceGame : 
                    activeLessonTab === "variations" ? variationGame : lessonGame
                  }
                  onMove={
                    activeLessonTab === "practice" ? handlePracticeMove : () => {}
                  }
                  interactive={activeLessonTab === "practice"}
                  isFlipped={isFlipped}
                  highlights={activeLessonTab === "variations" ? variationHighlights : activeHighlights}
                  theme={theme}
                />
              </div>

              {/* STATUS AT BOTTOM OF BOARD */}
              <div className="w-full mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Side: {selectedGambit.side}</span>
                <span>Active FEN: Standard starting position</span>
              </div>
            </div>

            {/* BOARD NAVIGATION TIMELINE CONTROLS (Only for main line lesson) */}
            {activeLessonTab === "lesson" && (
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl">
                <div className="flex gap-1">
                  <button 
                    onClick={handleStepBackward}
                    disabled={currentMoveIdx === 0}
                    className="p-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 disabled:opacity-40 cursor-pointer text-xs font-bold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleStepForward}
                    disabled={currentMoveIdx >= selectedGambit.moves.length}
                    className="p-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 disabled:opacity-40 cursor-pointer text-xs font-bold"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleResetPosition}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs font-bold cursor-pointer text-slate-300"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsPlaying(prev => !prev)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" /> Auto Play
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VARIATIONS MODE NAVIGATION */}
            {activeLessonTab === "variations" && (
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSelectVariation("accepted")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      selectedVariation === "accepted" 
                        ? "bg-emerald-500 text-slate-950 font-black shadow-md" 
                        : "border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    Accepted
                  </button>
                  <button 
                    onClick={() => handleSelectVariation("declined")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      selectedVariation === "declined" 
                        ? "bg-emerald-500 text-slate-950 font-black shadow-md" 
                        : "border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    Declined
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleRestartVariation}
                    title="Restart Variation from Initial Position"
                    className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-900 rounded-lg text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all bg-slate-950"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                    <span>↻ Restart Variation</span>
                  </button>

                  <button 
                    onClick={() => setIsVariationPlaying(prev => !prev)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    {isVariationPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" /> Auto Play
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => handleVariationStep("bwd")}
                    disabled={variationIdx === 0}
                    title="Previous Move"
                    className="p-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 disabled:opacity-40 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleVariationStep("fwd")}
                    disabled={variationIdx >= (selectedVariation === "accepted" ? selectedGambit.acceptedVariation.moves.length : selectedGambit.declinedVariation.moves.length)}
                    title="Next Move"
                    className="p-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 disabled:opacity-40 cursor-pointer transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LESSON INFORMATION, VARIATIONS, AI COACH & QUIZZES */}
          <div className={`${isFullscreen ? "lg:col-span-12" : "lg:col-span-7"} space-y-6`}>
            
            {/* LESSON NAVIGATION TABS */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "lesson", label: "Step Lesson", icon: Sparkles },
                { id: "variations", label: "Variations", icon: Layers },
                { id: "strategy", label: "Strategic Ideas", icon: BookOpenCheck },
                { id: "practice", label: "Spar Practice", icon: Swords },
                { id: "quiz", label: "Quiz", icon: HelpCircle }
              ].map((tab) => {
                const isActive = activeLessonTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLessonTab(tab.id as any)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isActive 
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800" 
                        : "text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="bg-white dark:bg-[#0b111e]/80 dark:backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl min-h-[400px] flex flex-col justify-between">
              
              {/* TAB 1: OVERVIEW */}
              {activeLessonTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                      {selectedGambit.name} - Overview
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">ECO {selectedGambit.eco} • Difficulty: {selectedGambit.difficulty}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedGambit.shortDesc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">History & Origin</span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedGambit.history}</p>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">Key Inventor</span>
                      <p className="text-emerald-500 font-bold leading-relaxed">{selectedGambit.inventor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">Playing Style</span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">{selectedGambit.playingStyle}</p>
                    </div>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-slate-400 uppercase font-mono tracking-wider text-[10px]">When to use</span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedGambit.whenToUse}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STEP LESSON */}
              {activeLessonTab === "lesson" && (
                <div className="space-y-6 flex flex-col justify-between h-full">
                  
                  {/* COOPERATING COACH CHANGER */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
                        AI Coach Master Setup
                      </span>
                    </div>

                    <select
                      value={coachLevel}
                      onChange={(e) => setCoachLevel(e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] py-1 px-2 font-mono font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="Beginner">Beginner (Explain basics)</option>
                      <option value="Intermediate">Intermediate (Normal style)</option>
                      <option value="Advanced">Advanced (Tactical depths)</option>
                    </select>
                  </div>

                  {/* ACTIVE MOVE DISPLAY */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
                      <span>MOVE PROGRESSION</span>
                      <span>•</span>
                      <span>Move {currentMoveIdx} / {selectedGambit.moves.length}</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850/80 rounded-xl relative">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                          onClick={handleSpeakExplanation}
                          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                          {currentMoveIdx > 0 ? selectedGambit.moves[currentMoveIdx - 1] : "Initial Position"}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-semibold">
                        {aiExplanationText || selectedGambit.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* DYNAMIC GEMINI ENHANCEMENT BUTTON */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-bold max-w-[280px]">
                      Want custom, deep-dive strategy comments tailored to this exact move?
                    </div>
                    <button
                      onClick={handleAskCoachDetail}
                      disabled={loadingAiCoach || currentMoveIdx === 0}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                    >
                      <Cpu className="h-3.5 w-3.5" />
                      {loadingAiCoach ? "AI Thinking..." : "Ask Coach Detail"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIATIONS */}
              {activeLessonTab === "variations" && (
                <div className="space-y-6">
                  {/* Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedVariation.toUpperCase()} VARIATION
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Move {variationIdx} / {(selectedVariation === "accepted" ? selectedGambit.acceptedVariation.moves : selectedGambit.declinedVariation.moves).length}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white mt-1">
                        {selectedVariation === "accepted" ? selectedGambit.acceptedVariation.name : selectedGambit.declinedVariation.name}
                      </h2>
                    </div>

                    {/* Variation Switcher Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleSelectVariation("accepted")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedVariation === "accepted"
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800 font-extrabold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Accepted Variation
                      </button>
                      <button
                        onClick={() => handleSelectVariation("declined")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedVariation === "declined"
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800 font-extrabold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Declined Variation
                      </button>
                    </div>
                  </div>

                  {/* Previous / Next Variation Buttons */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 text-xs">
                    <button
                      onClick={handlePreviousVariation}
                      className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Previous Variation</span>
                    </button>

                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                      {selectedVariation === "accepted" ? "Line 1 of 2" : "Line 2 of 2"}
                    </span>

                    <button
                      onClick={handleNextVariation}
                      className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <span>Next Variation</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Explanation Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                      Variation Strategic Context
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {selectedVariation === "accepted" ? selectedGambit.acceptedVariation.explanation : selectedGambit.declinedVariation.explanation}
                    </p>
                  </div>

                  {/* Moves Timeline Sequence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Moves Sequence ({selectedVariation === "accepted" ? selectedGambit.acceptedVariation.moves.length : selectedGambit.declinedVariation.moves.length} Moves)
                      </span>

                      <button
                        onClick={handleRestartVariation}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>↻ Restart Variation</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60">
                      {(selectedVariation === "accepted" ? selectedGambit.acceptedVariation.moves : selectedGambit.declinedVariation.moves).map((mv, i) => (
                        <span 
                          key={i}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                            i < variationIdx 
                              ? "bg-emerald-500 text-slate-950 shadow-sm" 
                              : i === variationIdx
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {i + 1}. {mv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Completion Badge if variation finished */}
                  {variationIdx >= (selectedVariation === "accepted" ? selectedGambit.acceptedVariation.moves.length : selectedGambit.declinedVariation.moves.length) && (
                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold font-display text-sm text-emerald-200">
                            {selectedVariation === "accepted" ? selectedGambit.acceptedVariation.name : selectedGambit.declinedVariation.name} Completed!
                          </div>
                          <div className="text-[11px] text-emerald-400/80">
                            You have mastered this variation line. Ready to try the {selectedVariation === "accepted" ? "Declined" : "Accepted"} variation?
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleNextVariation}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-all shadow-md flex items-center gap-1"
                      >
                        <span>Try {selectedVariation === "accepted" ? "Declined" : "Accepted"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STRATEGIC IDEAS */}
              {activeLessonTab === "strategy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-1.5">
                      <BookOpenCheck className="h-5 w-5 text-emerald-500" /> Strategic & Tactical Themes
                    </h2>
                    <p className="text-xs text-slate-400">Essential goals, motifs, and common traps</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    
                    {/* Ideas & Motifs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-extrabold">Strategic Core Ideas</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800 dark:text-slate-300">
                          {selectedGambit.strategicIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-extrabold">Tactical Motifs</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800 dark:text-slate-300">
                          {selectedGambit.tacticalMotifs.map((motif, i) => <li key={i}>{motif}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Mistakes & Best responses */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-rose-500 block font-extrabold">Common Pitfalls</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800 dark:text-slate-300">
                          {selectedGambit.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-500 block font-extrabold">Best Defensive Responses</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800 dark:text-slate-300">
                          {selectedGambit.bestResponses.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Gemini summary generator */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 font-bold">
                        Ask Gemini to generate a custom tactical summary card of this opening!
                      </div>
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={loadingSummary}
                        className="px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 text-xs font-bold cursor-pointer transition-all"
                      >
                        {loadingSummary ? "Generating..." : "Generate AI Summary"}
                      </button>
                    </div>

                    {aiSummary && (
                      <div className="p-3 bg-emerald-950/20 text-emerald-200 border border-emerald-500/20 rounded-lg text-xs leading-relaxed">
                        {aiSummary}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: ACTIVE PRACTICE / SPAR */}
              {activeLessonTab === "practice" && (
                <div className="space-y-4 flex flex-col justify-between h-full">
                  
                  {/* Practice Settings */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setPracticeMode("lesson-moves");
                          handlePracticeReset();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer ${practiceMode === "lesson-moves" ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-950 text-slate-400"}`}
                      >
                        Follow Main Line
                      </button>
                      <button 
                        onClick={() => {
                          setPracticeMode("ai-sparring");
                          handlePracticeReset();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1 ${practiceMode === "ai-sparring" ? "bg-emerald-500 text-slate-950" : "bg-slate-100 dark:bg-slate-950 text-slate-400"}`}
                      >
                        <Cpu className="h-3 w-3" /> Play AI sparring
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={handlePracticeUndo}
                        className="px-2 py-1 text-[10px] font-extrabold uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      >
                        Undo
                      </button>
                      <button 
                        onClick={handlePracticeReset}
                        className="px-2 py-1 text-[10px] font-extrabold uppercase bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE CHAT FEEDBACK LOG */}
                  <div className="flex-1 overflow-y-auto max-h-[190px] min-h-[140px] space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 pr-2">
                    {practiceLog.map((log, i) => (
                      <div 
                        key={i} 
                        className={`text-xs p-2 rounded-lg leading-relaxed ${
                          log.type === "player" ? "bg-emerald-500/15 text-emerald-400 ml-4 border-l-2 border-emerald-500" :
                          log.type === "ai" ? "bg-indigo-500/10 text-indigo-400 ml-4 border-l-2 border-indigo-500" :
                          "bg-slate-200/40 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {log.text}
                      </div>
                    ))}
                    {isAiThinking && (
                      <div className="text-xs text-slate-400 italic animate-pulse">
                        Opponent AI is planning their response...
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 italic font-mono pt-1">
                    {practiceMode === "lesson-moves" 
                      ? "Instructions: Drag and drop pieces on the board to play the correct moves in the main line."
                      : "Instructions: Play your moves freely on the board. The Grandmaster AI engine will suggest ideal responses."
                    }
                  </div>
                </div>
              )}

              {/* TAB 6: QUIZ */}
              {activeLessonTab === "quiz" && (
                <div className="space-y-6 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                      Gambit Mastery Quiz
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Test your strategic understanding of the {selectedGambit.name}</p>
                  </div>

                  {/* QUIZ BOX */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850/80 space-y-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {selectedGambit.quiz.question}
                    </p>

                    <div className="space-y-2">
                      {selectedGambit.quiz.options.map((opt, i) => {
                        const isSelected = selectedOption === opt;
                        const isCorrectAnswer = opt === selectedGambit.quiz.answer;
                        
                        let optStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-900";
                        if (isSelected) {
                          optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500";
                        }
                        if (quizAnswered) {
                          if (isCorrectAnswer) {
                            optStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-400";
                          } else if (isSelected) {
                            optStyle = "border-rose-500 bg-rose-500/20 text-rose-400";
                          } else {
                            optStyle = "border-slate-200 dark:border-slate-850 opacity-40";
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={quizAnswered}
                            onClick={() => handleSelectQuizOption(opt)}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {quizAnswered && isCorrectAnswer && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {quizAnswered && (
                    <div className="p-4 bg-emerald-950/20 text-emerald-200 border border-emerald-500/20 rounded-xl text-xs leading-relaxed">
                      <span className="font-bold">Explanation:</span> {selectedGambit.quiz.explanation}
                    </div>
                  )}

                  {!quizAnswered && (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!selectedOption}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-extrabold cursor-pointer text-center"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
