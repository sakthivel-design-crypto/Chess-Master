import React, { useState } from "react";
import { 
  Swords, 
  Trophy, 
  Clock, 
  Eye, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Award, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { 
  Tournament, 
  TournamentMatch, 
  TournamentPlayer, 
  TournamentRound 
} from "../../types";

interface TournamentPairingsProps {
  tournament: Tournament;
  rounds: TournamentRound[];
  matchesByRound: Record<number, TournamentMatch[]>;
  players: TournamentPlayer[];
  currentUserId: string;
  isHost: boolean;
  onPlayMatch: (match: TournamentMatch) => void;
  onAdvanceRound?: () => Promise<void>;
  onFinalizeTournament?: () => Promise<void>;
  isLoading?: boolean;
}

export const TournamentPairings: React.FC<TournamentPairingsProps> = ({
  tournament,
  rounds,
  matchesByRound,
  players,
  currentUserId,
  isHost,
  onPlayMatch,
  onAdvanceRound,
  onFinalizeTournament,
  isLoading = false
}) => {
  const currentRoundNum = tournament.currentRound || 1;
  const [selectedRound, setSelectedRound] = useState<number>(currentRoundNum);

  const activeMatches = matchesByRound[selectedRound] || [];
  const currentRoundData = rounds.find((r) => r.roundNumber === selectedRound);

  // Find user's match in this round
  const myMatch = activeMatches.find(
    (m) => m.whiteUid === currentUserId || m.blackUid === currentUserId
  );

  // Check if all matches in the current round are completed
  const currentRoundMatches = matchesByRound[currentRoundNum] || [];
  const allCurrentRoundFinished =
    currentRoundMatches.length > 0 &&
    currentRoundMatches.every((m) => m.status === "completed" || m.result !== null);

  const isFinalRound = currentRoundNum >= tournament.totalRounds;

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* 1. Round Navigation Selector */}
      <div className="bg-[#0F1324] border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
            ROUNDS:
          </span>
          {Array.from({ length: tournament.totalRounds }, (_, i) => i + 1).map((rNum) => {
            const isSelected = selectedRound === rNum;
            const isPast = rNum < currentRoundNum;
            const isCurrent = rNum === currentRoundNum;
            const isFuture = rNum > currentRoundNum;

            return (
              <button
                key={rNum}
                onClick={() => !isFuture && setSelectedRound(rNum)}
                disabled={isFuture}
                className={`py-2 px-3.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : isCurrent
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                    : isPast
                    ? "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed"
                }`}
              >
                <span>Round {rNum}</span>
                {isPast && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}
                {isCurrent && !isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono font-bold text-amber-400 shrink-0 pr-1">
          {tournament.status === "completed" ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" /> FINISHED
            </span>
          ) : (
            <span>Current: Round {currentRoundNum} of {tournament.totalRounds}</span>
          )}
        </div>
      </div>

      {/* 2. User's Match Highlight Card */}
      {myMatch ? (
        <div className="bg-gradient-to-br from-[#121730] to-[#0A0D1B] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Swords className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-white">
                  YOUR MATCH • ROUND {selectedRound} (BOARD {myMatch.boardNumber})
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Time Control: <strong className="text-amber-300">{tournament.timeControl}</strong>
                </span>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
              myMatch.status === "completed"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : myMatch.status === "playing"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}>
              {myMatch.status === "completed" ? "MATCH FINISHED" : myMatch.status === "playing" ? "IN PROGRESS" : "READY TO PLAY"}
            </span>
          </div>

          {/* Match Versus Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2">
            {/* White Player */}
            <div className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
              myMatch.whiteUid === currentUserId
                ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                : "bg-slate-900/70 border-slate-800"
            }`}>
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-base shadow-md">
                {myMatch.whitePhoto ? (
                  <img src={myMatch.whitePhoto} alt={myMatch.whiteName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  myMatch.whiteName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-black text-sm text-white truncate">{myMatch.whiteName}</p>
                <p className="text-xs font-mono text-amber-400">Rating: {myMatch.whiteRating || 1200}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-white font-bold text-[10px] tracking-wide">
                  WHITE ♙ {myMatch.whiteUid === currentUserId && "(YOU)"}
                </span>
              </div>
            </div>

            {/* Middle Result / VS */}
            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-amber-300">
                {myMatch.result || "VS"}
              </div>
              {myMatch.result && (
                <div className="text-[11px] font-bold text-slate-300">
                  {myMatch.winnerUid === currentUserId ? (
                    <span className="text-emerald-400">You Won! 🎉 (+1.0 pt)</span>
                  ) : myMatch.winnerUid === "draw" ? (
                    <span className="text-amber-400">Draw 🤝 (+0.5 pt)</span>
                  ) : (
                    <span className="text-rose-400">Opponent Won</span>
                  )}
                </div>
              )}
            </div>

            {/* Black Player */}
            <div className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
              myMatch.blackUid === currentUserId
                ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                : "bg-slate-900/70 border-slate-800"
            }`}>
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-base shadow-md">
                {myMatch.blackPhoto ? (
                  <img src={myMatch.blackPhoto} alt={myMatch.blackName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  myMatch.blackName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-black text-sm text-white truncate">{myMatch.blackName}</p>
                <p className="text-xs font-mono text-amber-400">Rating: {myMatch.blackRating || 1200}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-300 font-bold text-[10px] tracking-wide border border-slate-800">
                  BLACK ♟ {myMatch.blackUid === currentUserId && "(YOU)"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Play match */}
          {myMatch.status !== "completed" ? (
            <button
              onClick={() => onPlayMatch(myMatch)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>{myMatch.status === "playing" ? "RESUME MATCH" : "PLAY MATCH NOW"}</span>
            </button>
          ) : (
            <button
              onClick={() => onPlayMatch(myMatch)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span>Review Completed Game</span>
            </button>
          )}
        </div>
      ) : (
        /* If no match found for user (Bye or Spectator) */
        <div className="bg-[#0F1324] border border-amber-500/20 rounded-3xl p-5 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-white uppercase">ROUND {selectedRound} BYE</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            You have received a bye for this round! You automatically receive <strong className="text-amber-400">1.0 point</strong> in the standings.
          </p>
        </div>
      )}

      {/* 3. Host Round Advancement Banner */}
      {isHost && selectedRound === currentRoundNum && tournament.status === "in_progress" && (
        <div className="p-5 bg-[#0F1324] border-2 border-emerald-500/30 rounded-3xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="font-black text-sm text-white uppercase tracking-wider">
                HOST TOURNAMENT CONTROLS
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {allCurrentRoundFinished
                ? "All board matches finished ✓"
                : "Waiting for all boards to complete"}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {allCurrentRoundFinished
              ? isFinalRound
                ? "All matches in the final round are completed! You can now finalize the tournament and crown the champion."
                : `Round ${currentRoundNum} is complete! Click below to automatically generate Round ${currentRoundNum + 1} pairings based on the latest standings.`
              : `Matches are currently in progress. Once all games on all boards conclude, you can advance to the next round.`}
          </p>

          <div className="pt-1">
            {isFinalRound ? (
              <button
                onClick={onFinalizeTournament}
                disabled={!allCurrentRoundFinished || isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trophy className="h-4 w-4 fill-current" />
                <span>FINALIZE TOURNAMENT & CROWN CHAMPION</span>
              </button>
            ) : (
              <button
                onClick={onAdvanceRound}
                disabled={!allCurrentRoundFinished || isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                <span>GENERATE ROUND {currentRoundNum + 1} PAIRINGS</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. All Boards List */}
      <div className="bg-[#0F1324] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base text-white uppercase tracking-wide flex items-center gap-2">
            <Swords className="h-5 w-5 text-amber-400" />
            <span>ALL BOARDS • ROUND {selectedRound} ({activeMatches.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {activeMatches.filter((m) => m.status === "completed").length} / {activeMatches.length} Finished
          </span>
        </div>

        {activeMatches.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No pairings generated for this round yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeMatches.map((m) => {
              const isUserBoard = m.whiteUid === currentUserId || m.blackUid === currentUserId;

              return (
                <div
                  key={m.matchId}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isUserBoard
                      ? "bg-amber-500/10 border-amber-500/30 shadow-sm"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Board Number Badge */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                      B{m.boardNumber}
                    </span>

                    {/* Players Summary */}
                    <div className="flex items-center gap-2 font-mono text-xs text-white">
                      {/* White */}
                      <span className="font-bold flex items-center gap-1">
                        <span className="text-slate-400">♙</span> {m.whiteName}
                        <span className="text-slate-500 text-[10px]">({m.whiteRating || 1200})</span>
                      </span>

                      <span className="text-slate-500 font-bold px-1">vs</span>

                      {/* Black */}
                      <span className="font-bold flex items-center gap-1">
                        <span className="text-slate-400">♟</span> {m.blackName}
                        <span className="text-slate-500 text-[10px]">({m.blackRating || 1200})</span>
                      </span>
                    </div>
                  </div>

                  {/* Result & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="font-mono font-black text-xs text-amber-300 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                      {m.result || (m.status === "playing" ? "Playing..." : "Pending")}
                    </div>

                    <button
                      onClick={() => onPlayMatch(m)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isUserBoard && m.status !== "completed"
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isUserBoard && m.status !== "completed" ? (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Play</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
