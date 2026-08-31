import React from "react";
import { motion } from "motion/react";

interface EngineEvalBarProps {
  score: number; // Positive = White advantage, Negative = Black advantage (e.g., +1.5, -2.0)
  isMate?: boolean; // If true, score is move count to mate (e.g., 3 means #3)
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export const EngineEvalBar: React.FC<EngineEvalBarProps> = ({
  score,
  isMate = false,
  orientation = "vertical",
  className = ""
}) => {
  // Convert evaluation score to percentage fill for White (0% to 100%)
  // Using a smooth sigmoid transformation so extreme values don't overflow
  let whitePercent = 50;

  if (isMate) {
    whitePercent = score > 0 ? 98 : 2;
  } else {
    // Sigmoid function mapping pawn score (-10 to +10) to percentage (5% to 95%)
    const clampedScore = Math.max(-12, Math.min(12, score));
    whitePercent = 50 + (clampedScore / 12) * 45;
  }

  const formattedDisplay = isMate
    ? `M${Math.abs(score)}`
    : `${score > 0 ? "+" : ""}${score.toFixed(1)}`;

  const isWhiteAdvantage = score >= 0;

  if (orientation === "horizontal") {
    return (
      <div className={`relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 flex items-center ${className}`}>
        <motion.div
          initial={{ width: "50%" }}
          animate={{ width: `${whitePercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="h-full bg-slate-100 font-extrabold text-[9px] text-slate-900 flex items-center justify-end pr-1.5"
        />
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-black font-mono">
          <span className={isWhiteAdvantage ? "text-slate-900" : "text-white"}>
            {formattedDisplay}
          </span>
        </div>
      </div>
    );
  }

  // Vertical Bar for Desktop
  return (
    <div className={`relative w-7 h-full min-h-[380px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between ${className}`}>
      {/* Top Black Portion */}
      <div className="relative w-full flex-grow bg-slate-900 flex items-start justify-center pt-2">
        {!isWhiteAdvantage && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-[10px] font-black font-mono text-white tracking-tighter"
          >
            {formattedDisplay}
          </motion.span>
        )}
      </div>

      {/* Animated White Portion at Bottom */}
      <motion.div
        initial={{ height: "50%" }}
        animate={{ height: `${whitePercent}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 22 }}
        className="relative w-full bg-slate-100 flex items-end justify-center pb-2 shadow-md"
      >
        {isWhiteAdvantage && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-[10px] font-black font-mono text-slate-950 tracking-tighter"
          >
            {formattedDisplay}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};
