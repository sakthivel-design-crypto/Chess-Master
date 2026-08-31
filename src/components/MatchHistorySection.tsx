import React, { useState } from "react";
import { MatchRecord, GameModeKey, GAME_MODES } from "../types";
import { TrendingUp, TrendingDown, Clock, Swords, Award, ChevronRight, BarChart2 } from "lucide-react";

interface MatchHistorySectionProps {
  matchHistory?: MatchRecord[];
  onAnalyzeMatch?: (match: MatchRecord) => void;
  className?: string;
}

export const MatchHistorySection: React.FC<MatchHistorySectionProps> = ({
  matchHistory = [],
  onAnalyzeMatch,
  className = ""
}) => {
  const [selectedFilter, setSelectedFilter] = useState<GameModeKey | "all">("all");

  const filteredHistory = selectedFilter === "all"
    ? matchHistory
    : matchHistory.filter((m) => m.gameMode === selectedFilter);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Mode Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Competitive Match History
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Detailed logs of rating adjustments, accuracy, and moves
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === "all"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Matches
          </button>

          {GAME_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setSelectedFilter(mode.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === mode.key
                  ? `${mode.bgClass} ${mode.textClass} border ${mode.borderClass} shadow-md`
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Match List */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center space-y-2">
          <Swords className="h-8 w-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Match Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {selectedFilter === "all"
              ? "Start playing in the Arena to record official rating history!"
              : `No matches played in ${selectedFilter.toUpperCase()} mode yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredHistory.map((match) => {
            const modeConfig = GAME_MODES.find((m) => m.key === match.gameMode) || GAME_MODES[1];
            const isWin = match.result === "win";
            const isLoss = match.result === "loss";

            return (
              <div
                key={match.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left: Mode, Opponent, Date */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${modeConfig.bgClass} ${modeConfig.textClass} border ${modeConfig.borderClass}`}>
                    {modeConfig.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold font-display text-white">
                        vs {match.opponent}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {match.timeControl}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span>{match.date}</span>
                      <span>•</span>
                      <span>{match.moves} moves</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{match.accuracy}% Acc</span>
                    </div>
                  </div>
                </div>

                {/* Right: Result & Rating Change */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-900">
                  {/* Result Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black font-mono uppercase tracking-wider ${
                      isWin
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : isLoss
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {match.result}
                  </div>

                  {/* Rating Change Display */}
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {match.ratingBefore} → {match.ratingAfter}
                    </div>
                    <div
                      className={`text-xs font-mono font-extrabold flex items-center justify-end gap-0.5 ${
                        match.ratingChange > 0
                          ? "text-emerald-400"
                          : match.ratingChange < 0
                          ? "text-rose-400"
                          : "text-blue-300"
                      }`}
                    >
                      {match.ratingChange > 0 ? "+" : ""}
                      {match.ratingChange} Rating
                    </div>
                  </div>

                  {onAnalyzeMatch && (
                    <button
                      onClick={() => onAnalyzeMatch(match)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white transition-colors cursor-pointer border border-slate-800 shrink-0"
                      title="Analyze with AI"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
