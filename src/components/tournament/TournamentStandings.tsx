import React from "react";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Award, 
  Users, 
  BarChart3, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Tournament, TournamentPlayer } from "../../types";

interface TournamentStandingsProps {
  tournament: Tournament;
  players: TournamentPlayer[];
  currentUserId: string;
}

export const TournamentStandings: React.FC<TournamentStandingsProps> = ({
  tournament,
  players,
  currentUserId
}) => {
  // Sort players by rank
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (b.score !== a.score) return b.score - a.score;
    const tiebreakB = b.buchholzScore ?? b.sonnebornBergerScore ?? 0;
    const tiebreakA = a.buchholzScore ?? a.sonnebornBergerScore ?? 0;
    return tiebreakB - tiebreakA;
  });

  const isCompleted = tournament.status === "completed";
  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* 1. Champion Podium / Top 3 Showcase */}
      {sortedPlayers.length >= 2 && (
        <div className="bg-gradient-to-b from-[#131934] to-[#0A0D1B] border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              {isCompleted ? "FINAL RESULTS • TOURNAMENT CHAMPION" : "LIVE LEADERBOARD PODIUM"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display uppercase tracking-wide text-white">
              {isCompleted ? "🏆 TOURNAMENT PODIUM" : "CURRENT LEADERS"}
            </h2>
          </div>

          <div className="flex items-end justify-center gap-3 sm:gap-6 pt-2 pb-2">
            {/* 2nd Place */}
            {top2 && (
              <div className="flex-1 max-w-[140px] flex flex-col items-center space-y-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border-2 border-slate-400/60 p-0.5 relative shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[12px] overflow-hidden flex items-center justify-center font-bold text-slate-300 text-sm">
                    {top2.profilePicture ? (
                      <img src={top2.profilePicture} alt={top2.username} className="w-full h-full object-cover" />
                    ) : (
                      top2.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-xs sm:text-sm text-white truncate">{top2.username}</p>
                  <p className="text-[11px] font-mono font-bold text-slate-300">{top2.score} pts</p>
                </div>
                <div className="w-full h-16 sm:h-20 bg-slate-800/80 rounded-t-2xl border-t-2 border-slate-400/40 flex items-center justify-center">
                  <span className="text-2xl">🥈</span>
                </div>
              </div>
            )}

            {/* 1st Place (Champion) */}
            {top1 && (
              <div className="flex-1 max-w-[160px] flex flex-col items-center space-y-2 relative -top-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 relative shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden flex items-center justify-center font-bold text-amber-300 text-lg">
                    {top1.profilePicture ? (
                      <img src={top1.profilePicture} alt={top1.username} className="w-full h-full object-cover" />
                    ) : (
                      top1.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg border-2 border-slate-950">
                    1
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 text-xl animate-bounce">
                    👑
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="font-black text-sm sm:text-base text-white truncate">{top1.username}</p>
                  <p className="text-xs font-mono font-black text-amber-400">{top1.score} pts</p>
                </div>
                <div className="w-full h-24 sm:h-28 bg-gradient-to-b from-amber-500/20 to-amber-500/5 rounded-t-2xl border-t-2 border-amber-400 flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="flex-1 max-w-[140px] flex flex-col items-center space-y-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-900/60 border-2 border-amber-700/60 p-0.5 relative shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[12px] overflow-hidden flex items-center justify-center font-bold text-amber-600 text-sm">
                    {top3.profilePicture ? (
                      <img src={top3.profilePicture} alt={top3.username} className="w-full h-full object-cover" />
                    ) : (
                      top3.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-xs sm:text-sm text-white truncate">{top3.username}</p>
                  <p className="text-[11px] font-mono font-bold text-amber-600">{top3.score} pts</p>
                </div>
                <div className="w-full h-12 sm:h-16 bg-amber-950/40 rounded-t-2xl border-t-2 border-amber-700/40 flex items-center justify-center">
                  <span className="text-xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Standings Table */}
      <div className="bg-[#0F1324] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <h3 className="font-black text-base text-white uppercase tracking-wide">
              LIVE STANDINGS ({sortedPlayers.length} PLAYERS)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Win: 1.0 • Draw: 0.5 • Loss: 0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">RANK</th>
                <th className="py-3 px-3">PLAYER</th>
                <th className="py-3 px-2 text-center">PLAYED</th>
                <th className="py-3 px-2 text-center text-emerald-400">W</th>
                <th className="py-3 px-2 text-center text-amber-400">D</th>
                <th className="py-3 px-2 text-center text-rose-400">L</th>
                <th className="py-3 px-3 text-center text-amber-300 font-bold">PTS</th>
                <th className="py-3 px-3 text-center text-slate-400">TIEBREAK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedPlayers.map((player, idx) => {
                const rankNum = player.rank || idx + 1;
                const isMe = player.uid === currentUserId;

                return (
                  <tr
                    key={player.uid}
                    className={`transition-colors ${
                      isMe
                        ? "bg-amber-500/10 hover:bg-amber-500/15"
                        : "hover:bg-slate-900/60"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 text-center font-bold text-sm">
                      {rankNum === 1 ? (
                        <span className="text-amber-400">🥇 1</span>
                      ) : rankNum === 2 ? (
                        <span className="text-slate-300">🥈 2</span>
                      ) : rankNum === 3 ? (
                        <span className="text-amber-600">🥉 3</span>
                      ) : (
                        <span className="text-slate-500">#{rankNum}</span>
                      )}
                    </td>

                    {/* Player Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5 font-sans">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                          {player.profilePicture ? (
                            <img src={player.profilePicture} alt={player.username} className="w-full h-full object-cover" />
                          ) : (
                            player.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-white truncate max-w-[140px]">
                              {player.username}
                            </span>
                            {player.isHost && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold uppercase border border-amber-500/30">
                                HOST
                              </span>
                            )}
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Rating: <strong className="text-amber-400">{player.rating || 1200}</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-2 text-center text-slate-300">
                      {player.gamesPlayed}
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-emerald-400">
                      {player.wins}
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-amber-400">
                      {player.draws}
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-rose-400">
                      {player.losses}
                    </td>

                    {/* Total Points */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-500/30">
                        {player.score.toFixed(1)}
                      </span>
                    </td>

                    {/* Tiebreak score */}
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                      {((player.buchholzScore ?? player.sonnebornBergerScore ?? 0)).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
