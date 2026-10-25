import React, { useState } from "react";
import { 
  CheckCircle2, 
  Copy, 
  Share2, 
  ArrowRight, 
  Check, 
  Trophy, 
  Users, 
  Clock,
  Sparkles
} from "lucide-react";
import { Tournament } from "../../types";

interface TournamentCreatedModalProps {
  tournament: Tournament;
  onEnterRoom: () => void;
}

export const TournamentCreatedModal: React.FC<TournamentCreatedModalProps> = ({
  tournament,
  onEnterRoom
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tournament.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const inviteText = `Join my ChessZen Friends Tournament "${tournament.name}"!\nRoom ID: ${tournament.roomId}\nTime Control: ${tournament.timeControl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ChessZen Tournament: ${tournament.name}`,
          text: inviteText
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden text-white">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
          <CheckCircle2 className="h-9 w-9 text-amber-400" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-black font-mono uppercase tracking-widest text-amber-400">
            SUCCESSFULLY CREATED
          </span>
          <h2 className="text-2xl font-black font-display uppercase tracking-wide text-white">
            TOURNAMENT CREATED!
          </h2>
          <p className="text-sm font-bold text-slate-300">
            {tournament.name}
          </p>
        </div>

        {/* Room ID Box */}
        <div className="p-4 bg-slate-900/90 border-2 border-amber-500/30 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SHARE ROOM ID WITH FRIENDS
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-wider select-all">
            {tournament.roomId}
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "COPIED!" : "COPY ID"}</span>
            </button>
            <button
              onClick={handleShare}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>SHARE INVITE</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] font-sans uppercase">Format</div>
            <div className="font-bold text-white uppercase text-[11px] mt-0.5">
              {tournament.format === "swiss" ? "Swiss" : "Round Robin"}
            </div>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] font-sans uppercase">Time</div>
            <div className="font-bold text-amber-400 text-[11px] mt-0.5">
              {tournament.timeControl}
            </div>
          </div>
          <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] font-sans uppercase">Players</div>
            <div className="font-bold text-emerald-400 text-[11px] mt-0.5">
              1 / {tournament.maxPlayers}
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={onEnterRoom}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>ENTER TOURNAMENT ROOM</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
