import React, { useState } from "react";
import { 
  X, 
  Trophy, 
  Users, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Info,
  HelpCircle
} from "lucide-react";
import { 
  TournamentFormat, 
  TournamentTiebreak, 
  TournamentTimeControlConfig 
} from "../../types";
import { TOURNAMENT_TIME_CONTROLS } from "../../services/tournamentService";

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: {
    name: string;
    format: TournamentFormat;
    maxPlayers: number;
    timeControl: TournamentTimeControlConfig;
    tiebreakMethod: TournamentTiebreak;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [name, setName] = useState("ChessZen Friends Championship");
  const [format, setFormat] = useState<TournamentFormat>("swiss");
  const [maxPlayers, setMaxPlayers] = useState<number>(50);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TournamentTimeControlConfig>(
    TOURNAMENT_TIME_CONTROLS.find((t) => t.label === "10+0") || TOURNAMENT_TIME_CONTROLS[7]
  );
  const [tiebreakMethod, setTiebreakMethod] = useState<TournamentTiebreak>("buchholz");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a tournament name.");
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      format,
      maxPlayers,
      timeControl: selectedTimeControl,
      tiebreakMethod
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0B0E1B] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8 text-white">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-wide text-white">
                CREATE TOURNAMENT
              </h2>
              <p className="text-xs text-slate-400">
                Private room with automatic pairings for up to 50 players
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Tournament Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Tournament Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ChessZen Friends Cup"
              maxLength={40}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* 2. Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Tournament Format</span>
              <span className="text-[11px] text-amber-400 lowercase font-normal">
                {format === "swiss" ? "Best for 5-50 players" : "Best for 2-10 players"}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("swiss")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  format === "swiss"
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-white">Swiss System</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    Default
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Players paired against opponents with similar scores. Fair, fast, no elimination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormat("round_robin")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  format === "round_robin"
                    ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-white">Round Robin</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  All-play-all. Every player plays every other player once.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Max Players */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Maximum Players</span>
              <span className="text-amber-400 font-mono text-sm">{maxPlayers} Players</span>
            </div>
            <input
              type="range"
              min={2}
              max={50}
              step={1}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Min: 2</span>
              <span>10</span>
              <span>25</span>
              <span>Max: 50</span>
            </div>
          </div>

          {/* 4. Time Control Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Time Control</span>
              <span className="text-amber-400 font-mono text-xs">
                {selectedTimeControl.label} ({selectedTimeControl.category.toUpperCase()})
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {TOURNAMENT_TIME_CONTROLS.map((tc) => {
                const isSelected = selectedTimeControl.label === tc.label && selectedTimeControl.category === tc.category;
                return (
                  <button
                    key={`${tc.category}_${tc.label}`}
                    type="button"
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center border ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div>{tc.label}</div>
                    <div className={`text-[9px] uppercase tracking-wider font-sans ${isSelected ? "text-slate-900 font-extrabold" : "text-slate-500"}`}>
                      {tc.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tiebreak & Visibility Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3 w-3 text-amber-400" /> Tiebreak Method
              </span>
              <select
                value={tiebreakMethod}
                onChange={(e) => setTiebreakMethod(e.target.value as TournamentTiebreak)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-medium outline-none cursor-pointer"
              >
                <option value="buchholz">Buchholz (Opponent Strength)</option>
                <option value="sonneborn_berger">Sonneborn-Berger</option>
                <option value="wins">Most Wins</option>
              </select>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Visibility
              </span>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 py-1">
                <span>Private (Room ID Required)</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>CREATING TOURNAMENT...</span>
              ) : (
                <>
                  <span>CREATE TOURNAMENT</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
