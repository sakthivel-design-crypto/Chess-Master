import React, { useState } from "react";
import { X, LogIn, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

interface JoinTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomId: string) => Promise<void>;
  isLoading?: boolean;
}

export const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setRoomId(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomId.trim().toUpperCase();
    if (!clean) {
      setError("Please enter a Room ID.");
      return;
    }

    try {
      await onSubmit(clean);
    } catch (err: any) {
      setError(err.message || "Unable to join tournament.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-white">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-wide text-white">
                JOIN TOURNAMENT
              </h2>
              <p className="text-xs text-slate-400">
                Enter your friend's Room ID
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
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ENTER ROOM ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={handleInputChange}
              placeholder="e.g. CZ-8K4P2Q"
              maxLength={12}
              autoFocus
              className="w-full bg-slate-900/90 border-2 border-slate-700/80 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-center font-mono text-xl tracking-widest text-amber-300 placeholder:text-slate-600 outline-none uppercase font-black transition-all"
            />
            <p className="text-[11px] text-slate-400 text-center">
              Room IDs usually begin with <span className="font-mono text-amber-400 font-bold">CZ-</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !roomId.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>JOINING ROOM...</span>
            ) : (
              <>
                <span>JOIN ROOM</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
