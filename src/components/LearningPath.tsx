import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { 
  Award, BookOpen, ChevronRight, CheckCircle2, Play, RefreshCw, Sparkles, HelpCircle, ArrowLeft, Trophy 
} from "lucide-react";
import { CHESS_LESSONS, ChessLesson, UserProfile } from "../types";
import { Chessboard } from "./Chessboard";
import confetti from "canvas-confetti";
import { navigationManager } from "../utils/navigationManager";

interface LearningPathProps {
  profile: UserProfile;
  onAwardProgress: (xp: number, coins: number, badgeId?: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  profile,
  onAwardProgress
}) => {
  const [selectedLesson, setSelectedLesson] = useState<ChessLesson | null>(null);

  // Register Back Handler for selected lesson
  useEffect(() => {
    if (selectedLesson) {
      const unregister = navigationManager.registerHandler({
        id: "learning-path-lesson",
        priority: 70,
        handleBack: () => {
          setSelectedLesson(null);
          return true;
        }
      });
      return unregister;
    }
  }, [selectedLesson]);
  const [boardGame, setBoardGame] = useState<Chess | null>(null);
  const [moveFeedback, setMoveFeedback] = useState<{ status: "idle" | "success" | "error"; text: string }>({
    status: "idle",
    text: ""
  });
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  
  // Quiz states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  // Completed lessons tracking in local memory/state
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem("chessmaster_completed_lessons");
    return saved ? JSON.parse(saved) : ["beg_rules"]; // Unlock the first one initially
  });

  const selectLesson = (lesson: ChessLesson) => {
    setSelectedLesson(lesson);
    const chess = new Chess(lesson.fen);
    setBoardGame(chess);
    setMoveFeedback({ status: "idle", text: "" });
    setAiExplanation("");
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizCorrect(false);
  };

  const handleLessonMove = (from: string, to: string, promotion?: string) => {
    if (!boardGame || !selectedLesson) return;

    try {
      const moveResult = boardGame.move({ from, to, promotion: promotion || "q" });
      if (moveResult) {
        // Trigger re-render of board
        setBoardGame(new Chess(boardGame.fen()));

        // Validate solution (matching algebraic or coordinate coordinates)
        const playedMove = from + to;
        const correctMove = selectedLesson.solution[0]; // simplistic first move check

        if (playedMove === correctMove || moveResult.san === correctMove) {
          setMoveFeedback({
            status: "success",
            text: "Brilliant Move! You found the correct positional solution."
          });
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
          triggerAiExplanation(selectedLesson.title, moveResult.san, boardGame.fen());
        } else {
          setMoveFeedback({
            status: "error",
            text: `Good try, but that is not the lesson's goal: "${selectedLesson.goal}". Click Reset and try again!`
          });
        }
      }
    } catch (e) {
      // Illegal move
      setMoveFeedback({
        status: "error",
        text: "That move is illegal in this position. Review piece rules!"
      });
    }
  };

  const triggerAiExplanation = async (lessonTitle: string, playedMove: string, fen: string) => {
    setLoadingExplanation(true);
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: fen,
          move: playedMove,
          rating: profile.elo,
          history: [playedMove]
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error("Error fetching AI explanation", err);
      setAiExplanation("Excellent calculation! You secured control over key squares.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedLesson || !selectedOption) return;

    setQuizSubmitted(true);
    const isCorrect = selectedOption === selectedLesson.quizAnswer;
    setQuizCorrect(isCorrect);

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#10b981", "#34d399"]
      });

      // Unlock next lessons
      if (!completedLessons.includes(selectedLesson.id)) {
        const updated = [...completedLessons, selectedLesson.id];
        setCompletedLessons(updated);
        localStorage.setItem("chessmaster_completed_lessons", JSON.stringify(updated));
        
        // Reward user
        onAwardProgress(150, 50);
      }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-amber-500/10 text-amber-300 border border-amber-500/30";
      case "Intermediate": return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30";
      case "Advanced": return "bg-amber-600/15 text-amber-200 border border-amber-400/30";
      case "Master": return "bg-amber-400/20 text-yellow-200 border border-amber-300/40 shadow-sm shadow-amber-500/10";
      default: return "bg-slate-800 text-slate-300";
    }
  };

  const levels: ("Beginner" | "Intermediate" | "Advanced" | "Master")[] = [
    "Beginner", "Intermediate", "Advanced", "Master"
  ];

  return (
    <div className="space-y-6 font-sans">
      {!selectedLesson ? (
        <div className="space-y-6">
          {/* Path Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold font-serif tracking-tight text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Grandmaster Learning Path</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Complete interactive on-board scenarios, read high-fidelity AI commentary, and ace mini quizzes to advance from rules of movement up to Master level analysis.
            </p>
          </div>

          {/* Path Category Blocks */}
          <div className="space-y-8">
            {levels.map((lvl) => {
              const levelLessons = CHESS_LESSONS.filter(l => l.level === lvl);

              return (
                <div key={lvl} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-serif tracking-wide ${getLevelColor(lvl)}`}>
                      {lvl.toUpperCase()} LEVEL
                    </span>
                    <div className="h-px flex-1 bg-amber-500/20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelLessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      const lessonIndex = CHESS_LESSONS.findIndex(l => l.id === lesson.id);
                      const isUnlocked = lessonIndex === 0 || completedLessons.includes(CHESS_LESSONS[lessonIndex - 1]?.id);

                      return (
                        <div 
                          key={lesson.id}
                          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                            isUnlocked 
                              ? "glass-card cursor-pointer hover:scale-[1.02]" 
                              : "bg-[#151922]/40 border-amber-500/10 opacity-50 pointer-events-none"
                          }`}
                          onClick={() => isUnlocked && selectLesson(lesson)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <BookOpen className="h-5 w-5 text-amber-400" />
                              {isCompleted && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" /> Completed
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-slate-100 text-base leading-snug">
                              {lesson.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {lesson.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-amber-500/15 flex justify-between items-center text-xs font-bold">
                            <span className="text-amber-400/90 font-mono">+150 XP</span>
                            <span className="text-amber-300 inline-flex items-center gap-0.5 group">
                              Start Lesson <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-amber-400" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Lesson Header */}
          <button 
            onClick={() => setSelectedLesson(null)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Lessons Path
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Chessboard */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#0b111e]/60 dark:backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col items-center">
                <Chessboard 
                  game={boardGame!} 
                  onMove={handleLessonMove} 
                  interactive={moveFeedback.status !== "success"}
                  theme={profile.themePreference || profile.boardTheme}
                />
              </div>

              <div className="flex items-center justify-between">
                <button 
                  onClick={() => selectLesson(selectedLesson)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset Board
                </button>

                <div className="text-xs font-semibold text-slate-400 font-mono">
                  {boardGame?.turn() === "w" ? "White's Turn" : "Black's Turn"}
                </div>
              </div>
            </div>

            {/* Right Column - Lesson descriptions, goals & Quiz */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Lesson Instructions */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase ${getLevelColor(selectedLesson.level)}`}>
                    {selectedLesson.level} Module
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight font-display">
                  {selectedLesson.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedLesson.longDescription}
                </p>

                {/* Lesson Challenge Goal */}
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-xs font-bold text-indigo-500 tracking-wider uppercase font-mono mb-1">Target Challenge</h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedLesson.goal}
                  </p>
                </div>

                {/* Challenge Feedback */}
                {moveFeedback.status !== "idle" && (
                  <div className={`p-4 rounded-xl text-sm font-semibold leading-relaxed border ${
                    moveFeedback.status === "success" 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30" 
                      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30"
                  }`}>
                    {moveFeedback.text}
                  </div>
                )}
              </div>

              {/* AI Explanation of move (appears on success) */}
              {loadingExplanation && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Generating AI Coach breakdown...</span>
                  </div>
                </div>
              )}

              {aiExplanation && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500 fill-current animate-pulse" />
                    <h3 className="font-bold text-slate-800 dark:text-white font-display">AI Coach Commentary</h3>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </p>
                </div>
              )}

              {/* Mini Quiz Section (unlocked after board completion or available directly) */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-800 dark:text-white font-display">Lesson Mini Quiz</h3>
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {selectedLesson.quizQuestion}
                </p>

                <div className="space-y-2">
                  {selectedLesson.quizOptions.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => !quizSubmitted && setSelectedOption(opt)}
                        disabled={quizSubmitted}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-emerald-50/50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-300" 
                            : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-[#090d16] dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={!selectedOption}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-bold text-xs py-3 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/15"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className={`p-4 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    quizCorrect 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30" 
                      : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30"
                  }`}>
                    <div>
                      {quizCorrect 
                        ? "🎉 Correct Answer! You've officially unlocked the next level of training." 
                        : `❌ Incorrect. The correct answer was: "${selectedLesson.quizAnswer}".`}
                    </div>
                    {!quizCorrect && (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedOption(null);
                        }}
                        className="rounded-lg bg-white px-3 py-1 border border-slate-300 text-[10px] text-slate-700 hover:bg-slate-50 transition-all cursor-pointer font-bold"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
