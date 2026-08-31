import React, { useState, useEffect } from "react";
import { 
  GameRequest, 
  MultiplayerGame 
} from "../types";
import { 
  searchUserByUsername, 
  sendGameRequest, 
  subscribeToUserGameRequests, 
  subscribeToUserActiveGames, 
  updateGameRequestStatus, 
  createMultiplayerGame 
} from "../services/multiplayerService";
import FriendChessMatch from "./FriendChessMatch";
import { soundEngine } from "../utils/chessSound";
import { 
  Swords, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trophy, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  UserPlus, 
  Play, 
  RotateCcw, 
  Settings, 
  Check, 
  X,
  MessageSquare,
  Users
} from "lucide-react";

import { CompletedGameData } from "../types";
import { navigationManager } from "../utils/navigationManager";

interface PlayWithFriendsProps {
  currentUsername: string;
  currentUserId: string;
  userProfile: any;
  onAnalyzeGame: (gameData: CompletedGameData | string) => void;
  onGoToDashboard?: () => void;
  onUpdateProfile?: (updatedProfile: any) => void;
  savedBoardTheme?: string;
}

interface FriendItem {
  username: string;
  rating?: number;
  profilePicture?: string;
  level?: number;
  acceptedAt?: string;
  totalGames: number;
}

export const PlayWithFriends: React.FC<PlayWithFriendsProps> = ({
  currentUsername,
  currentUserId,
  userProfile,
  onAnalyzeGame,
  onGoToDashboard,
  onUpdateProfile,
  savedBoardTheme = "classic_wood"
}) => {
  // Navigation Tabs inside Play With Friends
  const [activeTab, setActiveTab] = useState<"friends" | "find" | "requests" | "active" | "completed">("friends");
  const [requestTab, setRequestTab] = useState<"received" | "sent">("received");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Request sending state
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSentUsernames, setRequestSentUsernames] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Real-time collections
  const [gameRequests, setGameRequests] = useState<GameRequest[]>([]);
  const [activeGames, setActiveGames] = useState<MultiplayerGame[]>([]);

  // Active playing session
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Game Mode Setup Modal / Flow state
  const [selectedRequestToAccept, setSelectedRequestToAccept] = useState<GameRequest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"bullet" | "blitz" | "rapid" | "classical" | "custom">("rapid");
  const [selectedTimeControl, setSelectedTimeControl] = useState({ label: "10+5 Rapid", initialTime: 600, increment: 5, mode: "rapid" });
  const [customMinutes, setCustomMinutes] = useState(10);
  const [customIncrement, setCustomIncrement] = useState(5);
  const [selectedColor, setSelectedColor] = useState<"white" | "black" | "random">("random");
  const [selectedBoardTheme, setSelectedBoardTheme] = useState(savedBoardTheme);

  // Match Lobby state
  const [inLobbyGameId, setInLobbyGameId] = useState<string | null>(null);
  const [lobbyGame, setLobbyGame] = useState<MultiplayerGame | null>(null);

  // Subscribe to real-time requests & games
  useEffect(() => {
    if (!currentUsername) return;

    const unsubRequests = subscribeToUserGameRequests(currentUsername, (reqs) => {
      setGameRequests(reqs);
    });

    const unsubGames = subscribeToUserActiveGames(currentUsername, (games) => {
      setActiveGames(games);
    });

    return () => {
      unsubRequests();
      unsubGames();
    };
  }, [currentUsername]);

  // Register Back Handler for PlayWithFriends sub-states
  useEffect(() => {
    if (!activeGameId) {
      const unregister = navigationManager.registerHandler({
        id: "play-with-friends-subviews",
        priority: 70,
        handleBack: () => {
          if (inLobbyGameId) {
            setInLobbyGameId(null);
            setLobbyGame(null);
            return true;
          }
          if (selectedRequestToAccept) {
            setSelectedRequestToAccept(null);
            return true;
          }
          if (searchedUser) {
            setSearchedUser(null);
            return true;
          }
          if (activeTab !== "friends") {
            setActiveTab("friends");
            return true;
          }
          if (onGoToDashboard) {
            onGoToDashboard();
            return true;
          }
          return false;
        }
      });
      return unregister;
    }
  }, [activeGameId, inLobbyGameId, selectedRequestToAccept, searchedUser, activeTab, onGoToDashboard]);

  // Handle Search submit
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchedUser(null);
    setActionMessage(null);

    const result = await searchUserByUsername(searchQuery.trim());
    setIsSearching(false);

    if (result) {
      setSearchedUser(result);
    } else {
      setSearchError("User not found. Please check the username and try again.");
    }
  };

  // Handle sending a challenge request
  const handleSendRequest = async (userToChallenge: any) => {
    if (!userToChallenge) return;

    setSendingRequest(true);
    setActionMessage(null);

    const response = await sendGameRequest(
      {
        id: currentUserId || currentUsername,
        username: currentUsername,
        elo: userProfile?.elo || 1200,
        level: userProfile?.level || 1,
        profilePicture: userProfile?.profilePicture || ""
      },
      {
        id: userToChallenge.id,
        username: userToChallenge.username
      }
    );

    setSendingRequest(false);

    if (response.success) {
      setRequestSentUsernames((prev) => new Set(prev).add(userToChallenge.username.toLowerCase()));
      setActionMessage({ type: "success", text: "Game request sent successfully!" });
    } else {
      setActionMessage({ type: "error", text: response.message || "Could not send game request." });
    }
  };

  // Handle accepting a game request -> open configuration modal
  const handleInitiateAccept = (req: GameRequest) => {
    setSelectedRequestToAccept(req);
  };

  // Confirm game mode & launch match lobby/game
  const handleConfirmAndStartGame = async () => {
    if (!selectedRequestToAccept) return;

    let timeControlLabel = selectedTimeControl.label;
    let initialTimeSeconds = selectedTimeControl.initialTime;
    let incrementSeconds = selectedTimeControl.increment;
    let modeKey = selectedTimeControl.mode;

    if (selectedCategory === "custom") {
      initialTimeSeconds = customMinutes * 60;
      incrementSeconds = customIncrement;
      timeControlLabel = `${customMinutes}+${customIncrement} Custom`;
      modeKey = "custom";
    }

    try {
      const createdGameId = await createMultiplayerGame(selectedRequestToAccept, {
        mode: modeKey,
        timeControlLabel,
        initialTimeSeconds,
        incrementSeconds,
        colorPreference: selectedColor,
        senderBoardTheme: savedBoardTheme,
        receiverBoardTheme: selectedBoardTheme
      });

      setSelectedRequestToAccept(null);
      soundEngine.playGameStart();
      setActiveGameId(createdGameId);
    } catch (e) {
      console.error("Failed to create match:", e);
    }
  };

  // Filter requests
  const receivedRequests = gameRequests.filter(
    (r) => r.receiverUsername.toLowerCase() === currentUsername.toLowerCase()
  );
  const sentRequests = gameRequests.filter(
    (r) => r.senderUsername.toLowerCase() === currentUsername.toLowerCase()
  );

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === "pending").length;

  // Filter active vs completed games
  const ongoingGames = activeGames.filter((g) => g.status === "active" || g.status === "lobby");
  const completedGames = activeGames.filter((g) => g.status !== "active" && g.status !== "lobby");

  // Derive accepted friends list for both users
  const friendsList: FriendItem[] = React.useMemo(() => {
    const map = new Map<string, FriendItem>();

    // 1. Process accepted game requests
    gameRequests.forEach((req) => {
      if (req.status === "accepted") {
        const isSender = req.senderUsername.toLowerCase() === currentUsername.toLowerCase();
        const friendName = isSender ? req.receiverUsername : req.senderUsername;
        if (!friendName || friendName.toLowerCase() === currentUsername.toLowerCase()) return;

        const key = friendName.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            username: friendName,
            rating: isSender ? undefined : req.senderRating,
            profilePicture: isSender ? undefined : req.senderProfilePicture,
            level: isSender ? undefined : req.senderLevel,
            acceptedAt: req.createdAt,
            totalGames: 0
          });
        }
      }
    });

    // 2. Process active and completed games to include match partners
    activeGames.forEach((g) => {
      const isWhite = g.whiteUsername.toLowerCase() === currentUsername.toLowerCase();
      const friendName = isWhite ? g.blackUsername : g.whiteUsername;
      if (!friendName || friendName.toLowerCase() === currentUsername.toLowerCase()) return;

      const key = friendName.toLowerCase();
      const oppRating = isWhite ? g.blackRating : g.whiteRating;
      const oppPic = isWhite ? g.blackProfilePicture : g.whiteProfilePicture;
      const existing = map.get(key);

      if (existing) {
        existing.totalGames += 1;
        if (!existing.rating && oppRating) existing.rating = oppRating;
        if (!existing.profilePicture && oppPic) existing.profilePicture = oppPic;
      } else {
        map.set(key, {
          username: friendName,
          rating: oppRating,
          profilePicture: oppPic,
          totalGames: 1
        });
      }
    });

    return Array.from(map.values());
  }, [gameRequests, activeGames, currentUsername]);

  // If in active live match board view, render FriendChessMatch
  if (activeGameId) {
    return (
      <FriendChessMatch
        gameId={activeGameId}
        currentUsername={currentUsername}
        currentUserId={currentUserId}
        userProfile={userProfile}
        onBack={() => setActiveGameId(null)}
        onFinishGoToDashboard={() => {
          setActiveGameId(null);
          if (onGoToDashboard) {
            onGoToDashboard();
          }
        }}
        onAnalyzeGame={(pgn) => {
          setActiveGameId(null);
          onAnalyzeGame(pgn);
        }}
        onUpdateProfile={onUpdateProfile}
        userBoardTheme={selectedBoardTheme}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F1222] via-[#14182E] to-[#0F1222] border border-amber-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Swords className="h-3.5 w-3.5 text-amber-400" />
              <span>Real-Time Multiplayer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              PLAY WITH FRIENDS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg">
              Challenge your friends and prove who is the better player.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-slate-900/80 border border-amber-500/20 rounded-2xl flex items-center gap-3 shadow-lg">
              <Users className="h-5 w-5 text-amber-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400">Your Identity</p>
                <p className="text-xs font-black text-white">{currentUsername}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE GAME RESUME BANNER */}
      {ongoingGames.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black">
                Your game with {ongoingGames[0].whiteUsername.toLowerCase() === currentUsername.toLowerCase() ? ongoingGames[0].blackUsername : ongoingGames[0].whiteUsername} is still in progress.
              </p>
              <p className="text-[11px] text-amber-200/80">Time control: {ongoingGames[0].timeControl}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveGameId(ongoingGames[0].gameId)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume Game</span>
          </button>
        </div>
      )}

      {/* SEARCH SECTION */}
      <div className="p-6 rounded-3xl bg-[#0F121E]/90 border border-amber-500/20 shadow-xl space-y-4">
        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Search className="h-4 w-4 text-amber-400" />
          <span>FIND A FRIEND</span>
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Search by username
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter ChessZen username..."
              className="w-full bg-slate-950/80 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Search className="h-4 w-4" />
              <span>{isSearching ? "Searching..." : "Search"}</span>
            </button>
          </div>
        </form>

        {/* SEARCH ERROR */}
        {searchError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* SEARCHED FRIEND PROFILE CARD */}
        {searchedUser && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-fade-in">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden flex items-center justify-center font-bold text-xl text-amber-300">
                  {searchedUser.profilePicture ? (
                    <img src={searchedUser.profilePicture} alt={searchedUser.username} className="w-full h-full object-cover" />
                  ) : (
                    searchedUser.username.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-white">{searchedUser.username}</h3>
                <p className="text-xs text-amber-400 font-bold">Rating: {searchedUser.elo || 850}</p>
                <p className="text-[11px] text-slate-400">Level {searchedUser.level || 5}</p>
              </div>
            </div>

            {/* Request Button */}
            <div>
              {requestSentUsernames.has(searchedUser.username.toLowerCase()) ? (
                <div className="px-5 py-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>✓ Request Sent</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSendRequest(searchedUser)}
                  disabled={sendingRequest}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{sendingRequest ? "Sending..." : "Send Request"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACTION MESSAGE */}
        {actionMessage && (
          <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fade-in ${
            actionMessage.type === "success" 
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-amber-950/60 border-amber-500/40 text-amber-200"
          }`}>
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* REQUEST HISTORY & ACTIVE GAMES MAIN NAVIGATION TABS */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "friends"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4 text-amber-400" />
            <span>Friends ({friendsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("find")}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "find"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Find Friends</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === "requests"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Requests</span>
            {pendingReceivedCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "active"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Active Games ({ongoingGames.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "completed"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Completed Games ({completedGames.length})</span>
          </button>
        </div>

        {/* FRIENDS LIST PANEL */}
        {activeTab === "friends" && (
          <div className="p-6 rounded-3xl bg-[#0F121E]/90 border border-amber-500/20 shadow-xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-400" />
                  <span>CONNECTED FRIENDS ({friendsList.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  When a request is accepted, both players appear in each other's friend list for instant challenges!
                </p>
              </div>

              <button
                onClick={() => setActiveTab("find")}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4 text-amber-400" />
                <span>Find & Add Friends</span>
              </button>
            </div>

            {friendsList.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
                  <Users className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">No Friends Connected Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Search for players by username under 'Find Friends' or accept incoming challenges to connect!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("find")}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Players Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendsList.map((friend) => (
                  <div
                    key={friend.username}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md">
                          <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden flex items-center justify-center font-bold text-lg text-amber-300">
                            {friend.profilePicture ? (
                              <img src={friend.profilePicture} alt={friend.username} className="w-full h-full object-cover" />
                            ) : (
                              friend.username.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" title="Connected Friend" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white">{friend.username}</h3>
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                            Friend
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-bold mt-0.5">
                          Rating: {friend.rating || 1200} Elo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {friend.totalGames > 0 ? `${friend.totalGames} match(es) played` : "Connected Friend"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendRequest({ id: friend.username, username: friend.username, elo: friend.rating || 1200 })}
                      disabled={sendingRequest || requestSentUsernames.has(friend.username.toLowerCase())}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Swords className="h-3.5 w-3.5" />
                      <span>
                        {requestSentUsernames.has(friend.username.toLowerCase()) ? "Challenged ✓" : "Challenge"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-PANEL CONTENT */}
        {activeTab === "requests" && (
          <div className="p-6 rounded-3xl bg-[#0F121E]/90 border border-amber-500/20 shadow-xl space-y-4">
            <div className="flex gap-2 pb-2 border-b border-slate-800">
              <button
                onClick={() => setRequestTab("received")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  requestTab === "received" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setRequestTab("sent")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  requestTab === "sent" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </div>

            {/* RECEIVED REQUESTS LIST */}
            {requestTab === "received" && (
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No incoming game challenges right now.</p>
                ) : (
                  receivedRequests.map((req) => (
                    <div key={req.requestId} className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300">
                          {req.senderUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-amber-300">New Chess Challenge</p>
                          <p className="text-xs text-white font-bold">{req.senderUsername} <span className="text-[10px] text-slate-400">({req.senderRating || 850})</span></p>
                          <p className="text-[11px] text-slate-400 mt-0.5">"{req.senderUsername} has challenged you to a chess game."</p>
                        </div>
                      </div>

                      {req.status === "pending" ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleInitiateAccept(req)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateGameRequestStatus(req.requestId, "declined")}
                            className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase">{req.status}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SENT REQUESTS LIST */}
            {requestTab === "sent" && (
              <div className="space-y-3">
                {sentRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">You haven't sent any game requests yet.</p>
                ) : (
                  sentRequests.map((req) => (
                    <div key={req.requestId} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">To: {req.receiverUsername}</p>
                        <p className="text-[10px] text-slate-400">Sent on {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                        req.status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        req.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE GAMES PANEL */}
        {activeTab === "active" && (
          <div className="p-6 rounded-3xl bg-[#0F121E]/90 border border-amber-500/20 shadow-xl space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>ACTIVE GAMES IN PROGRESS</span>
            </h2>

            {ongoingGames.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No active friend games right now. Find a friend to challenge!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingGames.map((game) => {
                  const opponent = game.whiteUsername.toLowerCase() === currentUsername.toLowerCase() ? game.blackUsername : game.whiteUsername;
                  return (
                    <div key={game.gameId} className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between shadow-lg">
                      <div>
                        <p className="text-xs font-black text-white">vs {opponent}</p>
                        <p className="text-[11px] text-amber-400 font-bold">{game.timeControl}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Turn: {game.currentTurn === "w" ? "White" : "Black"}</p>
                      </div>
                      <button
                        onClick={() => setActiveGameId(game.gameId)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Resume Game</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COMPLETED GAMES PANEL */}
        {activeTab === "completed" && (
          <div className="p-6 rounded-3xl bg-[#0F121E]/90 border border-amber-500/20 shadow-xl space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>COMPLETED FRIEND MATCHES</span>
            </h2>

            {completedGames.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No completed friend matches recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {completedGames.map((game) => {
                  const opponent = game.whiteUsername.toLowerCase() === currentUsername.toLowerCase() ? game.blackUsername : game.whiteUsername;
                  const isWon = game.winner === (game.whiteUsername.toLowerCase() === currentUsername.toLowerCase() ? "white" : "black");
                  return (
                    <div key={game.gameId} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">vs {opponent}</p>
                        <p className="text-[10px] text-slate-400">{game.timeControl} • {new Date(game.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black uppercase ${isWon ? "text-emerald-400" : "text-rose-400"}`}>
                          {isWon ? "WIN" : "LOSS"} ({game.finishReason || "Ended"})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHOOSE GAME MODE MODAL (STEP 6, 7, 8, 9) */}
      {selectedRequestToAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0F121E] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 relative">
            <button
              onClick={() => setSelectedRequestToAccept(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">CHOOSE YOUR GAME MODE</h2>
              <p className="text-xs text-amber-300/80">
                Configure match settings for challenge with {selectedRequestToAccept.senderUsername}
              </p>
            </div>

            {/* MODE CATEGORIES */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "bullet", label: "⚡ Bullet" },
                { id: "blitz", label: "⚡ Blitz" },
                { id: "rapid", label: "♟ Rapid" },
                { id: "classical", label: "♜ Classical" },
                { id: "custom", label: "⚙ Custom" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    if (cat.id === "bullet") setSelectedTimeControl({ label: "1+0 Bullet", initialTime: 60, increment: 0, mode: "bullet" });
                    if (cat.id === "blitz") setSelectedTimeControl({ label: "3+2 Blitz", initialTime: 180, increment: 2, mode: "blitz" });
                    if (cat.id === "rapid") setSelectedTimeControl({ label: "10+5 Rapid", initialTime: 600, increment: 5, mode: "rapid" });
                    if (cat.id === "classical") setSelectedTimeControl({ label: "30+0 Classical", initialTime: 1800, increment: 0, mode: "classical" });
                  }}
                  className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* TIME CONTROLS PRESETS */}
            {selectedCategory !== "custom" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedCategory === "bullet" && [
                  { label: "1+0 Bullet", initialTime: 60, increment: 0, mode: "bullet" },
                  { label: "1+1 Bullet", initialTime: 60, increment: 1, mode: "bullet" },
                  { label: "2+1 Bullet", initialTime: 120, increment: 1, mode: "bullet" }
                ].map((tc) => (
                  <button
                    key={tc.label}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedTimeControl.label === tc.label
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-black text-white">{tc.label}</p>
                    <p className="text-[10px] text-slate-400">Very fast games</p>
                  </button>
                ))}

                {selectedCategory === "blitz" && [
                  { label: "3+0 Blitz", initialTime: 180, increment: 0, mode: "blitz" },
                  { label: "3+2 Blitz", initialTime: 180, increment: 2, mode: "blitz" },
                  { label: "5+0 Blitz", initialTime: 300, increment: 0, mode: "blitz" },
                  { label: "5+3 Blitz", initialTime: 300, increment: 3, mode: "blitz" }
                ].map((tc) => (
                  <button
                    key={tc.label}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedTimeControl.label === tc.label
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-black text-white">{tc.label}</p>
                    <p className="text-[10px] text-slate-400">Fast tactical games</p>
                  </button>
                ))}

                {selectedCategory === "rapid" && [
                  { label: "10+0 Rapid", initialTime: 600, increment: 0, mode: "rapid" },
                  { label: "10+5 Rapid", initialTime: 600, increment: 5, mode: "rapid" },
                  { label: "15+10 Rapid", initialTime: 900, increment: 10, mode: "rapid" }
                ].map((tc) => (
                  <button
                    key={tc.label}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedTimeControl.label === tc.label
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-black text-white">{tc.label}</p>
                    <p className="text-[10px] text-slate-400">Balanced strategic games</p>
                  </button>
                ))}

                {selectedCategory === "classical" && [
                  { label: "30+0 Classical", initialTime: 1800, increment: 0, mode: "classical" },
                  { label: "30+20 Classical", initialTime: 1800, increment: 20, mode: "classical" }
                ].map((tc) => (
                  <button
                    key={tc.label}
                    onClick={() => setSelectedTimeControl(tc)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      selectedTimeControl.label === tc.label
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-black text-white">{tc.label}</p>
                    <p className="text-[10px] text-slate-400">Long strategic games</p>
                  </button>
                ))}
              </div>
            ) : (
              /* CUSTOM TIME CONTROL */
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Minutes per player
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Increment per move (sec)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={customIncrement}
                      onChange={(e) => setCustomIncrement(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-amber-300 font-bold">
                  Selected: {customMinutes} minutes + {customIncrement} seconds
                </p>
              </div>
            )}

            {/* COLOR SELECTION */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Color
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "white", label: "White ♙" },
                  { id: "black", label: "Black ♟" },
                  { id: "random", label: "Random 🎲" }
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col.id as any)}
                    className={`py-3 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedColor === col.id
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-black"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* START / PROCEED BUTTON */}
            <button
              onClick={handleConfirmAndStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>PROCEED TO MATCH LOBBY</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayWithFriends;
