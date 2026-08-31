import React from "react";
import { motion } from "motion/react";
import { Zap, Flame, Clock, Crown, TrendingUp, ChevronRight, PlayCircle } from "lucide-react";
import { GameModeKey, ModeRatings, GAME_MODES } from "../types";

interface RatingCardsSectionProps {
  ratings: ModeRatings;
  modeStats?: Record<GameModeKey, { games: number; wins: number; losses: number; draws: number; highest: number }>;
  onSelectModePlay?: (mode: GameModeKey) => void;
  className?: string;
}

export const RatingCardsSection: React.FC<RatingCardsSectionProps> = ({
  ratings,
  modeStats,
  onSelectModePlay,
  className = ""
}) => {
  const getLucideIcon = (name: string, classStr: string) => {
    switch (name) {
      case "Zap":
        return <Zap className={classStr} />;
      case "Flame":
        return <Flame className={classStr} />;
      case "Clock":
        return <Clock className={classStr} />;
      case "Crown":
      default:
        return <Crown className={classStr} />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/10">
            ★
          </div>
          <div>
            <h2 className="text-lg font-extrabold font-display text-white tracking-tight">
              Official Game Mode Ratings
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Independent ratings updated live after every match
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex text-[10px] font-mono uppercase font-bold text-slate-400 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
          Standard Elo System
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {GAME_MODES.map((mode, index) => {
          const currentRating = ratings ? ratings[mode.key] : 200;
          const stats = modeStats ? modeStats[mode.key] : null;
          const highest = stats ? Math.max(stats.highest || 200, currentRating) : currentRating;
          const totalGames = stats ? stats.games : 0;

          return (
            <motion.div
              key={mode.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              onClick={() => onSelectModePlay && onSelectModePlay(mode.key)}
              className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border bg-slate-950/80 backdrop-blur-md hover:bg-slate-900/90 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-2xl ${mode.borderClass}`}
            >
              {/* Subtle Background Glow */}
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${mode.bgClass} blur-2xl group-hover:scale-150 transition-transform pointer-events-none`} />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                {/* Header: Mode Icon & Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg ${mode.bgClass} ${mode.textClass} border ${mode.borderClass} shadow-inner`}>
                      <span>{mode.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold font-display text-white group-hover:text-amber-400 transition-colors">
                        {mode.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {mode.timeControls.map(tc => tc.label).join(" • ")}
                      </p>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${mode.bgClass} ${mode.textClass}`}>
                    <PlayCircle className="h-4 w-4" />
                  </div>
                </div>

                {/* Rating Value */}
                <div className="pt-1 flex items-baseline justify-between border-t border-slate-900">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                      Current Rating
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-2xl font-black font-mono tracking-tight text-white ${mode.textClass}`}>
                        {currentRating}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">
                        Elo
                      </span>
                    </div>
                  </div>

                  {/* Peak Rating / Games */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono">
                      Peak: <span className="text-slate-300 font-bold">{highest}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {totalGames} {totalGames === 1 ? "game" : "games"}
                    </div>
                  </div>
                </div>

                {/* Quick Play CTA on Hover */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold font-mono text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span>Quick Play</span>
                  <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
