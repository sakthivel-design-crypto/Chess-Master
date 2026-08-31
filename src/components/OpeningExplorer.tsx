import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { 
  BookOpen, Play, Info, Sparkles, RefreshCw, Layers, Zap, AlertTriangle, ArrowRight, ArrowLeft 
} from "lucide-react";
import { 
  CHESS_OPENINGS, CHESS_TRAPS, CHESS_GAMBITS, OpeningDetail, TrapDetail, GambitDetail, UserProfile 
} from "../types";
import { Chessboard } from "./Chessboard";
import { navigationManager } from "../utils/navigationManager";

interface OpeningExplorerProps {
  profile: UserProfile;
  initialSubTab?: "openings" | "traps" | "gambits";
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({ profile, initialSubTab = "openings" }) => {
  const [activeSubTab, setActiveSubTab] = useState<"openings" | "traps" | "gambits">(initialSubTab);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    moves: string[];
    fen: string;
    details: any;
  } | null>(null);

  // Register Back Handler for selected opening/trap/gambit item
  useEffect(() => {
    if (selectedItem) {
      const unregister = navigationManager.registerHandler({
        id: "opening-explorer-item",
        priority: 70,
        handleBack: () => {
          setSelectedItem(null);
          return true;
        }
      });
      return unregister;
    }
  }, [selectedItem]);

  const [boardGame, setBoardGame] = useState<Chess | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Practice Mode states
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState<{ status: "idle" | "correct" | "error"; text: string }>({
    status: "idle",
    text: ""
  });

  const selectItem = (item: { id: string; name: string; moves: string[]; fen: string; details: any }) => {
    setSelectedItem(item);
    const chess = new Chess(); // Start from normal initial position
    setBoardGame(chess);
    setMoveIndex(0);
    setIsAutoplayRunning(false);
    setAiExplanation("");
    setIsPracticeMode(false);
    setPracticeStatus({ status: "idle", text: "" });
  };

  // Step through the opening moves
  const handleStepForward = () => {
    if (!selectedItem || !boardGame) return;
    if (moveIndex >= selectedItem.moves.length) return;

    try {
      const nextMove = selectedItem.moves[moveIndex];
      boardGame.move(nextMove);
      setBoardGame(new Chess(boardGame.fen()));
      setMoveIndex(moveIndex + 1);
      
      // Clear practice feedback
      setPracticeStatus({ status: "idle", text: "" });
    } catch (e) {
      console.error("Autoplay Move Error:", e);
    }
  };

  const handleStepBackward = () => {
    if (!selectedItem || !boardGame) return;
    if (moveIndex <= 0) return;

    try {
      boardGame.undo();
      setBoardGame(new Chess(boardGame.fen()));
      setMoveIndex(moveIndex - 1);
      setPracticeStatus({ status: "idle", text: "" });
    } catch (e) {
      console.error(e);
    }
  };

  // Autoplay moves loop
  useEffect(() => {
    let interval: any = null;
    if (isAutoplayRunning && selectedItem && boardGame) {
      if (moveIndex < selectedItem.moves.length) {
        interval = setTimeout(() => {
          handleStepForward();
        }, 1200);
      } else {
        setIsAutoplayRunning(false);
        triggerOpeningAnalysis();
      }
    }
    return () => clearTimeout(interval);
  }, [isAutoplayRunning, moveIndex, selectedItem]);

  const triggerOpeningAnalysis = async () => {
    if (!selectedItem) return;
    setLoadingExplanation(true);
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: selectedItem.fen,
          move: selectedItem.moves[selectedItem.moves.length - 1] || "e4",
          history: selectedItem.moves,
          rating: profile.elo
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
      setAiExplanation("This opening provides balanced, central control, ready to capitalize on tactical mistakes.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handlePracticeMove = (from: string, to: string, promotion?: string) => {
    if (!selectedItem || !boardGame) return;

    try {
      const targetMove = selectedItem.moves[moveIndex];
      const testChess = new Chess(boardGame.fen());
      const playedResult = testChess.move({ from, to, promotion: promotion || "q" });

      if (playedResult) {
        // Compare with the correct opening move
        const playedMoveSan = playedResult.san;
        const playedMoveCoords = from + to;

        // Compare using moves list
        // Note: targetMove could be FEN algebraic representation like "Nf3"
        // Let's verify if the played move aligns with the opening sequence
        const testTargetChess = new Chess(boardGame.fen());
        const targetMoveObj = testTargetChess.move(targetMove);

        if (playedMoveSan === targetMove || playedMoveCoords === (targetMoveObj.from + targetMoveObj.to)) {
          boardGame.move({ from, to, promotion: "q" });
          setBoardGame(new Chess(boardGame.fen()));
          const nextIdx = moveIndex + 1;
          setMoveIndex(nextIdx);

          if (nextIdx >= selectedItem.moves.length) {
            setPracticeStatus({
              status: "correct",
              text: "🎉 Splendid! You have perfectly executed the complete sequence. Keep up the high standard!"
            });
            triggerOpeningAnalysis();
          } else {
            setPracticeStatus({
              status: "correct",
              text: "Correct! Keep executing the line."
            });
          }
        } else {
          setPracticeStatus({
            status: "error",
            text: `Inaccuracy! The best opening move here is "${targetMove}". Retrace and try again.`
          });
        }
      }
    } catch (e) {
      setPracticeStatus({
        status: "error",
        text: "Illegal move played. Keep to chess legalities."
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {!selectedItem ? (
        <div className="space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-px">
            <button
              onClick={() => setActiveSubTab("openings")}
              className={`pb-3 text-sm font-bold border-b-2 px-4 cursor-pointer transition-all ${
                activeSubTab === "openings"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Opening Theory Explorer
            </button>
            <button
              onClick={() => setActiveSubTab("traps")}
              className={`pb-3 text-sm font-bold border-b-2 px-4 cursor-pointer transition-all ${
                activeSubTab === "traps"
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Famous Chess Traps
            </button>
            <button
              onClick={() => setActiveSubTab("gambits")}
              className={`pb-3 text-sm font-bold border-b-2 px-4 cursor-pointer transition-all ${
                activeSubTab === "gambits"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Strategic Gambits
            </button>
          </div>

          {/* Grid items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSubTab === "openings" && (
              CHESS_OPENINGS.map((op) => (
                <div
                  key={op.id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-500/20 dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => selectItem({
                    id: op.id,
                    name: op.name,
                    moves: op.moves,
                    fen: op.fen,
                    details: op
                  })}
                >
                  <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono">
                      {op.side.toUpperCase()} OPENING
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display">{op.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                      {op.history}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="text-slate-400 font-mono text-[10px]">{op.moves.join(" → ")}</span>
                    <span className="inline-flex items-center gap-0.5">Explore <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              ))
            )}

            {activeSubTab === "traps" && (
              CHESS_TRAPS.map((trap) => (
                <div
                  key={trap.id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md hover:border-red-500/20 dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => selectItem({
                    id: trap.id,
                    name: trap.name,
                    moves: trap.moves,
                    fen: trap.fen,
                    details: trap
                  })}
                >
                  <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 font-mono">
                      TACTICAL TRAP
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display">{trap.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                      {trap.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                    <span className="text-slate-400 font-mono text-[10px]">{trap.moves.join(" → ")}</span>
                    <span className="inline-flex items-center gap-0.5">Study <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              ))
            )}

            {activeSubTab === "gambits" && (
              CHESS_GAMBITS.map((gam) => (
                <div
                  key={gam.id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => selectItem({
                    id: gam.id,
                    name: gam.name,
                    moves: gam.moves,
                    fen: gam.fen,
                    details: gam
                  })}
                >
                  <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono">
                      STRATEGIC GAMBIT
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display">{gam.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                      {gam.strategicIdeas}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="text-slate-400 font-mono text-[10px]">{gam.moves.join(" → ")}</span>
                    <span className="inline-flex items-center gap-0.5">Master <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Item Active Back button */}
          <button
            onClick={() => setSelectedItem(null)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Explorers list
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left board section */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#0b111e]/60 dark:backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col items-center">
                <Chessboard
                  game={boardGame!}
                  onMove={handlePracticeMove}
                  interactive={isPracticeMode && practiceStatus.status !== "correct"}
                  theme={profile.themePreference || profile.boardTheme}
                />
              </div>

              {/* Navigation timeline controls */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex gap-1">
                  <button
                    onClick={handleStepBackward}
                    disabled={isAutoplayRunning || moveIndex === 0 || isPracticeMode}
                    className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 disabled:opacity-50 cursor-pointer shadow-sm text-slate-700 dark:text-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPracticeMode(false);
                      setIsAutoplayRunning(!isAutoplayRunning);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    {isAutoplayRunning ? "Stop Autoplay" : "Autoplay"}
                  </button>
                  <button
                    onClick={handleStepForward}
                    disabled={isAutoplayRunning || moveIndex >= selectedItem.moves.length || isPracticeMode}
                    className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 disabled:opacity-50 cursor-pointer shadow-sm text-slate-700 dark:text-slate-300"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    const toggle = !isPracticeMode;
                    setIsPracticeMode(toggle);
                    const freshGame = new Chess();
                    setBoardGame(freshGame);
                    setMoveIndex(0);
                    setPracticeStatus({ status: "idle", text: "" });
                    setAiExplanation("");
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs border cursor-pointer transition-all shadow-sm ${
                    isPracticeMode
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  {isPracticeMode ? "Playing Practice Mode" : "Start Practice Mode"}
                </button>
              </div>

              <div className="text-center font-mono text-xs font-semibold text-slate-400">
                Move: {moveIndex} / {selectedItem.moves.length}
              </div>
            </div>

            {/* Right Information area */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight font-display">
                  {selectedItem.name}
                </h2>

                {/* Specific descriptions based on tab type */}
                {activeSubTab === "openings" && (
                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Historical Context</h4>
                      <p>{selectedItem.details.history}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Main Ideas</h4>
                      <p>{selectedItem.details.mainIdeas}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1 font-mono">Common Mistakes</h4>
                      <p className="text-red-500/90">{selectedItem.details.commonMistakes}</p>
                    </div>
                  </div>
                )}

                {activeSubTab === "traps" && (
                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Description</h4>
                      <p>{selectedItem.details.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1 font-mono">How to Avoid</h4>
                      <p className="text-emerald-500">{selectedItem.details.avoidance}</p>
                    </div>
                  </div>
                )}

                {activeSubTab === "gambits" && (
                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1 font-mono">Theory & Strategic Themes</h4>
                      <p>{selectedItem.details.strategicIdeas}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1 font-mono">Risks Involved</h4>
                      <p className="text-red-500/90">{selectedItem.details.risks}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1 font-mono">Refutations</h4>
                      <p>{selectedItem.details.refutation}</p>
                    </div>
                  </div>
                )}

                {/* Practice Mode notifications */}
                {isPracticeMode && practiceStatus.status !== "idle" && (
                  <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
                    practiceStatus.status === "correct"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300"
                      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-300"
                  }`}>
                    {practiceStatus.text}
                  </div>
                )}
              </div>

              {/* Server-side AI Coaching Commentary */}
              {loadingExplanation && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 flex items-center justify-center py-6">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Generating Grandmaster AI Commentary...</span>
                  </div>
                </div>
              )}

              {aiExplanation && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:bg-[#0b111e]/60 dark:backdrop-blur-md dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500 fill-current animate-pulse" />
                    <h3 className="font-bold text-slate-800 dark:text-white font-display">AI Coach Insights</h3>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
