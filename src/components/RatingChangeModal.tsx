import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ShieldAlert, Handshake, TrendingUp, TrendingDown, RotateCw, BarChart2, CheckCircle2, X, FileText, ArrowLeft, Eye } from "lucide-react";
import { GameModeKey, GAME_MODES } from "../types";
import confetti from "canvas-confetti";

interface RatingChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameModeKey;
  timeControl: string;
  result: "win" | "loss" | "draw";
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  opponentName: string;
  accuracy?: number;
  onPlayAgain?: () => void;
  onAnalyze?: () => void;
  onDownloadScoresheet?: () => void;
  onGoToDashboard?: () => void;
}

export const RatingChangeModal: React.FC<RatingChangeModalProps> = ({
  isOpen,
  onClose,
  gameMode,
  timeControl,
  result,
  ratingBefore,
  ratingAfter,
  ratingChange,
  opponentName,
  accuracy = 85.0,
  onPlayAgain,
  onAnalyze,
  onDownloadScoresheet,
  onGoToDashboard
}) => {
  const modeConfig = GAME_MODES.find((m) => m.key === gameMode) || GAME_MODES[1];

  useEffect(() => {
    if (isOpen && result === "win") {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  const isWin = result === "win";
  const isLoss = result === "loss";
  const isDraw = result === "draw";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 text-white text-center font-sans max-h-[90vh] overflow-y-auto"
        >
          {/* Close / Review Board button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Review Final Board"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Top Banner Graphic */}
          <div className="space-y-2 pt-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 border border-slate-800 shadow-xl mb-1">
              {isWin ? (
                <Trophy className="h-8 w-8 text-amber-400 animate-bounce" />
              ) : isLoss ? (
                <ShieldAlert className="h-8 w-8 text-rose-500" />
              ) : (
                <Handshake className="h-8 w-8 text-blue-400" />
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-400">
              <span>{modeConfig.icon} {modeConfig.name}</span>
              <span>•</span>
              <span>{timeControl}</span>
            </div>

            <h2 className="text-2xl font-black font-display tracking-tight text-white">
              {isWin ? "Victory! 🎉" : isLoss ? "Defeat" : "Draw Match 🤝"}
            </h2>

            <p className="text-xs text-slate-400 font-mono">
              vs {opponentName}
            </p>
          </div>

          {/* Animated Rating Change Card */}
          <div className="my-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              {modeConfig.name} Rating Update
            </div>

            <div className="flex items-center justify-center gap-4">
              {/* Rating Before */}
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-mono">BEFORE</div>
                <div className="text-xl font-mono font-bold text-slate-400">{ratingBefore}</div>
              </div>

              {/* Arrow Indicator */}
              <div className="text-slate-600 font-bold text-lg">→</div>

              {/* Rating After */}
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-mono">NEW RATING</div>
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-3xl font-black font-mono text-white"
                >
                  {ratingAfter}
                </motion.div>
              </div>
            </div>

            {/* Rating Delta Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="pt-2 flex justify-center"
            >
              <div
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-black font-mono shadow-lg ${
                  ratingChange > 0
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10"
                    : ratingChange < 0
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                }`}
              >
                {ratingChange > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : ratingChange < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span>
                  {ratingChange > 0 ? `+${ratingChange}` : ratingChange} Rating
                </span>
              </div>
            </motion.div>

            {/* Match Accuracy Indicator */}
            {accuracy > 0 && (
              <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 flex justify-between">
                <span>Game Accuracy:</span>
                <span className="font-bold text-emerald-400">{accuracy}%</span>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="space-y-2">
            {onGoToDashboard && (
              <button
                onClick={onGoToDashboard}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black font-display text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
              >
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                <span>Back to Dashboard</span>
              </button>
            )}

            {onPlayAgain && (
              <button
                onClick={onPlayAgain}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCw className="h-4 w-4 text-emerald-400" />
                <span>Play Again ({modeConfig.name})</span>
              </button>
            )}

            {onAnalyze && (
              <button
                onClick={onAnalyze}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <BarChart2 className="h-4 w-4 text-teal-400" />
                <span>Analyze Match with AI</span>
              </button>
            )}

            {onDownloadScoresheet && (
              <button
                onClick={onDownloadScoresheet}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="h-4 w-4 text-amber-400" />
                <span>Download Score Sheet (PDF)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>Review Final Position & Moves</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
