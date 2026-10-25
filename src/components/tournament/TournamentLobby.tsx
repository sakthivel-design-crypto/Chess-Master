import React, { useState } from "react";
import { 
  Users, 
  Crown, 
  Copy, 
  Check, 
  Share2, 
  Play, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  Clock,
  Trophy,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { Tournament, TournamentPlayer } from "../../types";
import { calculateTotalRounds } from "../../utils/tournamentPairing";

interface TournamentLobbyProps {
  tournament: Tournament;
  players: TournamentPlayer[];
  currentUserId: string;
  isHost: boolean;
  onStartTournament: () => Promise<void>;
  onLeaveTournament: () => Promise<void>;
  onRemovePlayer: (playerUid: string) => Promise<void>;
  onCancelTournament: () => Promise<void>;
  isLoading?: boolean;
}

export const TournamentLobby: React.FC<TournamentLobbyProps> = ({
  tournament,
  players,
  currentUserId,
  isHost,
  onStartTournament,
  onLeaveTournament,
  onRemovePlayer,
  onCancelTournament,
  isLoading = false
}) => {
  const [copied, setCopied] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<TournamentPlayer | null>(null);

  const calculatedRounds = calculateTotalRounds(players.length, tournament.format);

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(tournament.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = `Join my ChessZen tournament "${tournament.name}"!\nRoom ID: ${tournament.roomId}\nTime Control: ${tournament.timeControl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: tournament.name, text });
      } catch {
        handleCopyRoomId();
      }
    } else {
      handleCopyRoomId();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* 1. Lobby Top Banner */}
      <div className="bg-[#0F1324] border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                WAITING FOR PLAYERS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {tournament.format === "swiss" ? "Swiss System" : "Round Robin"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
              {tournament.name}
            </h2>
          </div>

          {/* Room ID Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 px-3 self-start sm:self-center">
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-mono uppercase">ROOM ID</div>
              <div className="text-base font-mono font-black text-amber-300 tracking-wider">
                {tournament.roomId}
              </div>
            </div>
            <button
              onClick={handleCopyRoomId}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
              title="Copy Room ID"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Share Invite"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-slate-400 text-[10px] block">PLAYERS</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {players.length} / {tournament.maxPlayers}
            </span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-slate-400 text-[10px] block">TIME CONTROL</span>
            <span className="font-mono font-bold text-white text-sm">
              {tournament.timeControl}
            </span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-slate-400 text-[10px] block">ESTIMATED ROUNDS</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {calculatedRounds} {calculatedRounds === 1 ? "Round" : "Rounds"}
            </span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <span className="text-slate-400 text-[10px] block">TIEBREAK</span>
            <span className="font-mono font-bold text-slate-300 text-sm capitalize">
              {tournament.tiebreakMethod || "Buchholz"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Players Section */}
      <div className="bg-[#0F1324] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <h3 className="font-black text-base text-white tracking-wide uppercase">
              JOINED PLAYERS ({players.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Min 2 required to start
          </span>
        </div>

        {/* Player Cards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p, idx) => {
            const isMe = p.uid === currentUserId;
            return (
              <div
                key={p.uid}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  isMe
                    ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-500 w-5 text-right">
                    #{idx + 1}
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-amber-300 text-sm">
                      {p.profilePicture ? (
                        <img src={p.profilePicture} alt={p.username} className="w-full h-full object-cover" />
                      ) : (
                        p.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate max-w-[130px]">
                        {p.username}
                      </span>
                      {p.isHost && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] tracking-wider uppercase">
                          <Crown className="h-2.5 w-2.5 fill-current" /> HOST
                        </span>
                      )}
                      {isMe && !p.isHost && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[9px] font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Rating: <span className="text-amber-400 font-bold">{p.rating || 1200}</span>
                    </span>
                  </div>
                </div>

                {/* Host remove action (cannot remove self) */}
                {isHost && !p.isHost && (
                  <button
                    onClick={() => setPlayerToRemove(p)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title={`Remove ${p.username}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Action Controls */}
      <div className="space-y-3">
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowStartConfirm(true)}
              disabled={players.length < 2 || isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>
                {players.length < 2
                  ? "WAITING FOR AT LEAST 2 PLAYERS..."
                  : `START TOURNAMENT (${players.length} PLAYERS)`}
              </span>
            </button>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-rose-400 transition-colors font-bold cursor-pointer"
            >
              Cancel Tournament
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-medium">
              Waiting for tournament host (<strong className="text-white">{tournament.hostUsername}</strong>) to start the games...
            </div>

            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Leave Tournament</span>
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODALS */}

      {/* Start Tournament Confirm */}
      {showStartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center text-white">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Play className="h-7 w-7 fill-current ml-0.5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black font-display uppercase tracking-wide">
                START TOURNAMENT?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Starting will lock registrations and automatically generate Round 1 pairings for all {players.length} players.
              </p>
              <div className="p-2.5 mt-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400">
                Format: {tournament.format === "swiss" ? "Swiss" : "Round Robin"} • {calculatedRounds} Rounds
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowStartConfirm(false);
                  await onStartTournament();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                START NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Player Confirm */}
      {playerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black font-display uppercase">Remove Player</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong className="text-white">{playerToRemove.username}</strong> from this tournament?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPlayerToRemove(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const uid = playerToRemove.uid;
                  setPlayerToRemove(null);
                  await onRemovePlayer(uid);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Tournament Confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black font-display uppercase">Cancel Tournament</h3>
            <p className="text-xs text-slate-300">
              This will permanently cancel the tournament room for all joined players.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Keep Room
              </button>
              <button
                onClick={async () => {
                  setShowCancelConfirm(false);
                  await onCancelTournament();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Cancel Tournament
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Tournament Confirm */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B0E1B] border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white">
            <h3 className="text-lg font-black font-display uppercase">Leave Tournament?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to leave this tournament lobby?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Stay
              </button>
              <button
                onClick={async () => {
                  setShowLeaveConfirm(false);
                  await onLeaveTournament();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
