import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Plus, 
  LogIn, 
  ArrowLeft, 
  Users, 
  Clock, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  Share2, 
  BarChart3, 
  Swords, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Filter,
  Calendar,
  Layers
} from "lucide-react";
import { 
  Tournament, 
  TournamentPlayer, 
  TournamentMatch, 
  TournamentRound, 
  TournamentFormat, 
  TournamentTiebreak, 
  TournamentTimeControlConfig,
  UserProfile,
  CompletedGameData
} from "../../types";
import { 
  createFriendsTournament, 
  joinTournamentByRoomId, 
  subscribeToTournament, 
  subscribeToTournamentPlayers, 
  subscribeToTournamentRounds, 
  subscribeToTournamentMatches, 
  startTournament, 
  advanceTournamentRound, 
  finalizeTournament, 
  leaveTournament, 
  removePlayerFromTournament, 
  cancelTournament,
  fetchUserTournaments
} from "../../services/tournamentService";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { JoinTournamentModal } from "./JoinTournamentModal";
import { TournamentCreatedModal } from "./TournamentCreatedModal";
import { TournamentLobby } from "./TournamentLobby";
import { TournamentPairings } from "./TournamentPairings";
import { TournamentStandings } from "./TournamentStandings";
import { FriendChessMatch, TournamentMatchContext } from "../FriendChessMatch";

interface FriendsTournamentProps {
  currentUserId: string;
  currentUsername: string;
  currentUserPhoto?: string;
  currentUserRating?: number;
  userProfile?: UserProfile;
  onBackToDashboard: () => void;
  onAnalyzeGame: (gameData: CompletedGameData | string) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  userBoardTheme?: string;
}

type TournamentSubTab = "lobby" | "pairings" | "standings" | "info";

export const FriendsTournament: React.FC<FriendsTournamentProps> = ({
  currentUserId,
  currentUsername,
  currentUserPhoto,
  currentUserRating = 1200,
  userProfile,
  onBackToDashboard,
  onAnalyzeGame,
  onUpdateProfile,
  userBoardTheme = "classic_wood"
}) => {
  // Navigation / View State
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [rounds, setRounds] = useState<TournamentRound[]>([]);
  const [matchesByRound, setMatchesByRound] = useState<Record<number, TournamentMatch[]>>({});
  const [activeSubTab, setActiveSubTab] = useState<TournamentSubTab>("lobby");

  // User's tournaments list (home screen)
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [listFilter, setListFilter] = useState<"all" | "waiting" | "in_progress" | "completed">("all");
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createdTournament, setCreatedTournament] = useState<Tournament | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Active Chess Match state (when user clicks "Play Match")
  const [activeMatchToPlay, setActiveMatchToPlay] = useState<{
    match: TournamentMatch;
    context: TournamentMatchContext;
  } | null>(null);

  // Quick Room ID copy
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  // 1. Load user's tournament history on mount
  const refreshUserTournaments = async () => {
    if (!currentUserId) return;
    setIsLoadingList(true);
    try {
      const list = await fetchUserTournaments(currentUserId);
      setMyTournaments(list);
    } catch (err) {
      console.warn("Error fetching user tournaments:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    refreshUserTournaments();
  }, [currentUserId]);

  // 2. Real-time subscriptions when activeTournamentId is set
  useEffect(() => {
    if (!activeTournamentId) {
      setActiveTournament(null);
      setPlayers([]);
      setRounds([]);
      setMatchesByRound({});
      return;
    }

    const unsubTournament = subscribeToTournament(activeTournamentId, (t) => {
      setActiveTournament(t);
      if (t) {
        // Auto-switch tabs based on status
        if (t.status === "waiting") {
          setActiveSubTab("lobby");
        } else if (t.status === "in_progress" || t.status === "completed") {
          setActiveSubTab((prev) => (prev === "lobby" ? "pairings" : prev));
        }
      }
    });

    const unsubPlayers = subscribeToTournamentPlayers(activeTournamentId, (pList) => {
      setPlayers(pList);
    });

    const unsubRounds = subscribeToTournamentRounds(activeTournamentId, (rList) => {
      setRounds(rList);
    });

    return () => {
      unsubTournament();
      unsubPlayers();
      unsubRounds();
    };
  }, [activeTournamentId]);

  // 3. Subscribe to matches for current round
  useEffect(() => {
    if (!activeTournamentId || !activeTournament) return;
    const currentRound = activeTournament.currentRound || 1;

    // Listen to rounds 1 through currentRound
    const unsubs: (() => void)[] = [];
    for (let r = 1; r <= (activeTournament.totalRounds || currentRound); r++) {
      const unsub = subscribeToTournamentMatches(activeTournamentId, r, (matches) => {
        setMatchesByRound((prev) => ({
          ...prev,
          [r]: matches
        }));
      });
      unsubs.push(unsub);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [activeTournamentId, activeTournament?.currentRound, activeTournament?.totalRounds]);

  // Handle Create Tournament
  const handleCreateTournament = async (options: {
    name: string;
    format: TournamentFormat;
    maxPlayers: number;
    timeControl: TournamentTimeControlConfig;
    tiebreakMethod: TournamentTiebreak;
  }) => {
    setIsActionLoading(true);
    setGeneralError(null);
    try {
      const res = await createFriendsTournament({
        uid: currentUserId,
        username: currentUsername,
        rating: currentUserRating,
        profilePicture: currentUserPhoto
      }, {
        name: options.name,
        format: options.format,
        maxPlayers: options.maxPlayers,
        timeControl: options.timeControl,
        tiebreakMethod: options.tiebreakMethod
      });
      if (!res.success || !res.tournament) {
        throw new Error(res.error || "Failed to create tournament.");
      }
      setShowCreateModal(false);
      setCreatedTournament(res.tournament);
      refreshUserTournaments();
    } catch (err: any) {
      setGeneralError(err.message || "Failed to create tournament.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Join Tournament
  const handleJoinTournament = async (roomId: string) => {
    setIsActionLoading(true);
    setGeneralError(null);
    try {
      const res = await joinTournamentByRoomId(roomId, {
        uid: currentUserId,
        username: currentUsername,
        rating: currentUserRating,
        profilePicture: currentUserPhoto
      });
      if (!res.success || !res.tournament) {
        throw new Error(res.error || "Failed to join tournament.");
      }
      setShowJoinModal(false);
      setActiveTournamentId(res.tournament.tournamentId);
      refreshUserTournaments();
    } catch (err: any) {
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Start Tournament
  const handleStartTournament = async () => {
    if (!activeTournament) return;
    setIsActionLoading(true);
    try {
      await startTournament(activeTournament.tournamentId);
      setActiveSubTab("pairings");
    } catch (err: any) {
      setGeneralError(err.message || "Failed to start tournament.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Advance Round
  const handleAdvanceRound = async () => {
    if (!activeTournament) return;
    setIsActionLoading(true);
    try {
      await advanceTournamentRound(activeTournament.tournamentId);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to advance round.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Finalize Tournament
  const handleFinalizeTournament = async () => {
    if (!activeTournament) return;
    setIsActionLoading(true);
    try {
      await finalizeTournament(activeTournament.tournamentId);
      setActiveSubTab("standings");
    } catch (err: any) {
      setGeneralError(err.message || "Failed to finalize tournament.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Remove Player
  const handleRemovePlayer = async (playerUid: string) => {
    if (!activeTournament) return;
    try {
      await removePlayerFromTournament(activeTournament.tournamentId, currentUserId, playerUid);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to remove player.");
    }
  };

  // Handle Leave Tournament
  const handleLeaveTournament = async () => {
    if (!activeTournament) return;
    try {
      await leaveTournament(activeTournament.tournamentId, currentUserId);
      setActiveTournamentId(null);
      refreshUserTournaments();
    } catch (err: any) {
      setGeneralError(err.message || "Failed to leave tournament.");
    }
  };

  // Handle Cancel Tournament
  const handleCancelTournament = async () => {
    if (!activeTournament) return;
    try {
      await cancelTournament(activeTournament.tournamentId);
      setActiveTournamentId(null);
      refreshUserTournaments();
    } catch (err: any) {
      setGeneralError(err.message || "Failed to cancel tournament.");
    }
  };

  // Launch a game from Pairings
  const handlePlayMatch = (match: TournamentMatch) => {
    if (!activeTournament) return;
    const context: TournamentMatchContext = {
      tournamentId: activeTournament.tournamentId,
      tournamentName: activeTournament.name,
      roundNumber: match.roundNumber,
      boardNumber: match.boardNumber,
      matchId: match.matchId,
      onReturnToTournament: () => {
        setActiveMatchToPlay(null);
      }
    };
    setActiveMatchToPlay({
      match,
      context
    });
  };

  const handleCopyRoomId = async (roomId: string) => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    } catch {
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    }
  };

  // --------------------------------------------------------------------------
  // RENDER: ACTIVE MATCH (CHESSBOARD SCREEN)
  // --------------------------------------------------------------------------
  if (activeMatchToPlay) {
    return (
      <FriendChessMatch
        gameId={activeMatchToPlay.match.gameId}
        currentUsername={currentUsername}
        currentUserId={currentUserId}
        userProfile={userProfile}
        onBack={() => setActiveMatchToPlay(null)}
        onFinishGoToDashboard={() => setActiveMatchToPlay(null)}
        onAnalyzeGame={onAnalyzeGame}
        onUpdateProfile={onUpdateProfile}
        userBoardTheme={userBoardTheme}
        tournamentContext={activeMatchToPlay.context}
      />
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: TOURNAMENT ROOM VIEW
  // --------------------------------------------------------------------------
  if (activeTournament) {
    const isHost = activeTournament.hostUid === currentUserId;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 pt-2 px-3 sm:px-4">
        {/* Top Room Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F1324]/90 border border-amber-500/20 p-4 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTournamentId(null)}
              className="p-2.5 bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-white rounded-2xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Tournaments</span>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-black font-display text-white truncate max-w-[240px] sm:max-w-md">
                {activeTournament.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>{activeTournament.format === "swiss" ? "Swiss" : "Round Robin"}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{activeTournament.timeControl}</span>
              </div>
            </div>
          </div>

          {/* Room ID Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl">
              <span className="text-[10px] text-slate-500 font-mono">ROOM:</span>
              <span className="font-mono font-black text-amber-300 text-xs tracking-wider">
                {activeTournament.roomId}
              </span>
              <button
                onClick={() => handleCopyRoomId(activeTournament.roomId)}
                className="p-1 hover:text-amber-400 text-slate-400 transition-colors cursor-pointer"
                title="Copy Room ID"
              >
                {copiedRoomId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border ${
              activeTournament.status === "completed"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : activeTournament.status === "in_progress"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}>
              {activeTournament.status === "completed" ? "FINISHED" : activeTournament.status === "in_progress" ? "IN PROGRESS" : "WAITING"}
            </span>
          </div>
        </div>

        {generalError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold">
            {generalError}
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
          {activeTournament.status === "waiting" && (
            <button
              onClick={() => setActiveSubTab("lobby")}
              className={`py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeSubTab === "lobby"
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>LOBBY ({players.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab("pairings")}
            className={`py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeSubTab === "pairings"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>
              PAIRINGS & MATCHES {activeTournament.status !== "waiting" && `(R${activeTournament.currentRound})`}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("standings")}
            className={`py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeSubTab === "standings"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>LIVE STANDINGS</span>
          </button>

          <button
            onClick={() => setActiveSubTab("info")}
            className={`py-2 px-4 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeSubTab === "info"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Info className="h-4 w-4" />
            <span>RULES & INFO</span>
          </button>
        </div>

        {/* Tab View Contents */}
        {activeSubTab === "lobby" && activeTournament.status === "waiting" && (
          <TournamentLobby
            tournament={activeTournament}
            players={players}
            currentUserId={currentUserId}
            isHost={isHost}
            onStartTournament={handleStartTournament}
            onLeaveTournament={handleLeaveTournament}
            onRemovePlayer={handleRemovePlayer}
            onCancelTournament={handleCancelTournament}
            isLoading={isActionLoading}
          />
        )}

        {activeSubTab === "pairings" && (
          <TournamentPairings
            tournament={activeTournament}
            rounds={rounds}
            matchesByRound={matchesByRound}
            players={players}
            currentUserId={currentUserId}
            isHost={isHost}
            onPlayMatch={handlePlayMatch}
            onAdvanceRound={handleAdvanceRound}
            onFinalizeTournament={handleFinalizeTournament}
            isLoading={isActionLoading}
          />
        )}

        {activeSubTab === "standings" && (
          <TournamentStandings
            tournament={activeTournament}
            players={players}
            currentUserId={currentUserId}
          />
        )}

        {activeSubTab === "info" && (
          <div className="bg-[#0F1324] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 text-white text-xs leading-relaxed">
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase text-amber-400 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> TOURNAMENT SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ORGANIZER / HOST</span>
                  <span className="font-bold text-white text-sm">{activeTournament.hostUsername}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">FORMAT</span>
                  <span className="font-bold text-white text-sm capitalize">{activeTournament.format === "swiss" ? "Swiss System" : "Round Robin"}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">TIME CONTROL</span>
                  <span className="font-bold text-amber-300 text-sm">{activeTournament.timeControl}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">TIEBREAK</span>
                  <span className="font-bold text-emerald-400 text-sm capitalize">{activeTournament.tiebreakMethod || "Buchholz"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="font-bold text-sm text-slate-200">PAIRING & SCORING RULES</h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Score per game:</strong> 1.0 point for a Win, 0.5 points for a Draw, 0 points for a Loss.</li>
                <li><strong className="text-slate-200">Swiss System:</strong> In every round, players with identical or similar scores are paired against each other. Players will never play the same opponent twice. Color alternation (White/Black) is balanced automatically.</li>
                <li><strong className="text-slate-200">Odd Player Byes:</strong> If there is an odd number of players, one player receives a bye (1.0 point awarded). No player receives more than one bye.</li>
                <li><strong className="text-slate-200">Tiebreaks:</strong> Tied scores are broken using {activeTournament.tiebreakMethod === "buchholz" ? "Buchholz (sum of all opponents' scores)" : "Sonneborn-Berger / Most Wins"}.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: HOME SCREEN (HUB)
  // --------------------------------------------------------------------------
  const filteredTournaments = myTournaments.filter((t) => {
    if (listFilter === "all") return true;
    return t.status === listFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 pt-2 px-3 sm:px-4">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0E1328] via-[#121935] to-[#0E1328] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToDashboard}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                CHESSZEN MULTIPLAYER
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-wide uppercase">
              FRIENDS TOURNAMENT
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Host private chess tournaments with friends. Share a Room ID, support up to 50 players, with automated Swiss and Round Robin pairings.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="tournament-create-btn"
              onClick={() => setShowCreateModal(true)}
              className="py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>CREATE TOURNAMENT</span>
            </button>

            <button
              id="tournament-join-btn"
              onClick={() => setShowJoinModal(true)}
              className="py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <LogIn className="h-4 w-4 stroke-[2.5]" />
              <span>JOIN ROOM ID</span>
            </button>
          </div>
        </div>
      </div>

      {generalError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold">
          {generalError}
        </div>
      )}

      {/* 2. My Tournaments Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wide">
              MY TOURNAMENTS
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono">
            {(["all", "waiting", "in_progress", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setListFilter(filter)}
                className={`py-1.5 px-3 rounded-xl capitalize font-bold transition-all cursor-pointer ${
                  listFilter === filter
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter === "in_progress" ? "Active" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Tournaments Grid / List */}
        {isLoadingList ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
            Loading your tournaments...
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="bg-[#0F1324]/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-white uppercase">No Tournaments Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {listFilter === "all"
                  ? "You haven't joined or created any tournaments yet. Create your first tournament room and invite your friends!"
                  : `No tournaments matching "${listFilter}" status.`}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Tournament</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTournaments.map((t) => {
              const isHost = t.hostUid === currentUserId;

              return (
                <div
                  key={t.tournamentId}
                  onClick={() => setActiveTournamentId(t.tournamentId)}
                  className="p-5 bg-[#0F1324] hover:bg-[#131933] border border-slate-800 hover:border-amber-500/40 rounded-3xl shadow-xl transition-all cursor-pointer space-y-4 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          t.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : t.status === "in_progress"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}>
                          {t.status === "completed" ? "FINISHED" : t.status === "in_progress" ? `ROUND ${t.currentRound}` : "WAITING"}
                        </span>
                        {isHost && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                            HOST
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-base text-white truncate group-hover:text-amber-300 transition-colors">
                        {t.name}
                      </h3>
                    </div>

                    {/* Room ID Pill */}
                    <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-amber-300 text-xs shrink-0">
                      {t.roomId}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Players</span>
                      <span className="font-bold text-white">{t.playersCount || 1} / {t.maxPlayers}</span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Format</span>
                      <span className="font-bold text-amber-300 capitalize">{t.format === "swiss" ? "Swiss" : "Round Robin"}</span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Time</span>
                      <span className="font-bold text-slate-300">{t.timeControl}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400 font-mono">
                    <span>Host: <strong className="text-white">{t.hostUsername}</strong></span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      Enter Room <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODALS */}
      <CreateTournamentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTournament}
        isLoading={isActionLoading}
      />

      <JoinTournamentModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinTournament}
        isLoading={isActionLoading}
      />

      {createdTournament && (
        <TournamentCreatedModal
          tournament={createdTournament}
          onEnterRoom={() => {
            const id = createdTournament.tournamentId;
            setCreatedTournament(null);
            setActiveTournamentId(id);
          }}
        />
      )}
    </div>
  );
};
