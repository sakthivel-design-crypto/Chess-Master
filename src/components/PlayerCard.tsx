import React from "react";
import { User, Cpu, Clock, Award } from "lucide-react";
import { motion } from "motion/react";

interface PlayerCardProps {
  name: string;
  rating: number;
  color: "w" | "b";
  title?: string;
  avatarUrl?: string;
  isAi?: boolean;
  isActiveTurn?: boolean;
  timeRemaining?: number; // seconds
  capturedPieces?: string[]; // Array of piece types captured by this player, e.g. ["p", "p", "n"]
  materialLead?: number; // Material advantage score over opponent
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  rating,
  color,
  title,
  avatarUrl,
  isAi = false,
  isActiveTurn = false,
  timeRemaining = 600,
  capturedPieces = [],
  materialLead = 0,
  className = ""
}) => {
  // Format timer seconds -> mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(Math.max(0, secs) / 60);
    const remainderSecs = Math.floor(Math.max(0, secs) % 60);
    return `${mins}:${remainderSecs < 10 ? "0" : ""}${remainderSecs}`;
  };

  // Group captured pieces by type
  const pieceCounts: Record<string, number> = {};
  capturedPieces.forEach((p) => {
    const lower = p.toLowerCase();
    pieceCounts[lower] = (pieceCounts[lower] || 0) + 1;
  });

  const pieceSymbols: Record<string, string> = {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕"
  };

  return (
    <div className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
      isActiveTurn 
        ? "bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" 
        : "bg-slate-950/80 border-slate-800/80"
    } ${className}`}>
      {/* Player info left */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden border ${
            color === "w" ? "bg-slate-200 text-slate-900 border-white/80" : "bg-slate-900 text-white border-slate-700"
          }`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : isAi ? (
              <Cpu className="h-5 w-5 text-indigo-400" />
            ) : (
              <User className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          {isActiveTurn && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Details & Captured pieces */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            {title && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black rounded-md uppercase font-mono">
                {title}
              </span>
            )}
            <span className="font-bold text-xs text-white truncate max-w-[130px] font-display">
              {name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              ({rating})
            </span>
          </div>

          {/* Captured Pieces list */}
          <div className="flex items-center gap-1 text-slate-300 text-xs font-mono min-h-[18px]">
            {Object.entries(pieceCounts).map(([type, count]) => (
              <span key={type} className="inline-flex items-center tracking-tight">
                {pieceSymbols[type] || type}
                {count > 1 && <sub className="text-[9px] text-amber-400 font-bold ml-0.5">{count}</sub>}
              </span>
            ))}
            {materialLead > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-black font-mono">
                +{materialLead}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timer clock right */}
      <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-sm font-black transition-colors ${
        isActiveTurn
          ? timeRemaining < 30
            ? "bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse"
            : "bg-slate-900 text-amber-400 border-amber-500/40"
          : "bg-slate-900/60 text-slate-400 border-slate-800"
      }`}>
        <Clock className="h-3.5 w-3.5 opacity-80" />
        <span>{formatTime(timeRemaining)}</span>
      </div>
    </div>
  );
};
