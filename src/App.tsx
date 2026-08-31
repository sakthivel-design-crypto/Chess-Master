import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { 
  Trophy, Flame, Zap, Award, BookOpen, Clock, PlayCircle, Cpu, Calendar, User, LayoutDashboard, Sparkles, BookOpenCheck, Volume2, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw, Swords,
  Menu, X, Bell, Heart, Download, Settings, Target, TrendingUp, Printer, FileText, Users, LogOut, Crown
} from "lucide-react";

import { 
  GameTab, UserProfile, Achievement, DEFAULT_ACHIEVEMENTS, ChessTheme, FAMOUS_GM_GAMES, GMGame, GameModeKey, CompletedGameData, MatchRecord
} from "./types";

// Import Modular Components
import { Chessboard } from "./components/Chessboard";
import { Dashboard } from "./components/Dashboard";
import { LearningPath } from "./components/LearningPath";
import { OpeningExplorer } from "./components/OpeningExplorer";
import { TacticalPuzzles } from "./components/TacticalPuzzles";
import { GameAnalyzer } from "./components/GameAnalyzer";
import { VoiceCoach } from "./components/VoiceCoach";
import { ProfileAuth } from "./components/ProfileAuth";
import { LoginPage } from "./components/LoginPage";
import { Gambits } from "./components/Gambits";
import { Scoresheet } from "./components/Scoresheet";
import { PlayAiArena } from "./components/PlayAiArena";
import { PlayWithFriends } from "./components/PlayWithFriends";
import { SplashScreen } from "./components/SplashScreen";
import { ChessZenLogo } from "./components/ChessZenLogo";

import { UserAvatar } from "./components/UserAvatar";
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from "./services/firestoreService";
import { subscribeToUserGameRequests } from "./services/multiplayerService";
import { logoutUser, getCurrentAuthSession, extractUsernameFromEmail } from "./services/authService";
import { recordDailyActivity, checkAndSyncActiveStreak, getLocalTodayString } from "./utils/streakManager";
import { motion, AnimatePresence } from "motion/react";
import { navigationManager } from "./utils/navigationManager";

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>(GameTab.DASHBOARD);
  const [theme, setTheme] = useState<ChessTheme>(ChessTheme.TOURNAMENT);
  const [analyzingGameData, setAnalyzingGameData] = useState<CompletedGameData | null>(null);
  const [previousTabForAnalyzer, setPreviousTabForAnalyzer] = useState<GameTab | null>(null);
  const [showExitToast, setShowExitToast] = useState<boolean>(false);

  // Helper for centralized route and tab navigation supporting push and replace
  const navigate = (to: string | GameTab, options?: { replace?: boolean; extraData?: any }) => {
    let targetTab = GameTab.DASHBOARD;
    if (typeof to === "string") {
      const clean = to.toLowerCase().replace(/^\//, "");
      if (clean === "dashboard" || clean === "") targetTab = GameTab.DASHBOARD;
      else if (clean === "play" || clean === "chessboard") targetTab = GameTab.CHESSBOARD;
      else if (clean === "learn" || clean === "learning_path") targetTab = GameTab.LEARNING_PATH;
      else if (clean === "puzzles") targetTab = GameTab.PUZZLES;
      else if (clean === "openings") targetTab = GameTab.OPENINGS;
      else if (clean === "traps") targetTab = GameTab.TRAPS;
      else if (clean === "gambits") targetTab = GameTab.GAMBITS;
      else if (clean === "settings") targetTab = GameTab.SETTINGS;
      else if (clean === "profile") targetTab = GameTab.PROFILE;
      else if (clean === "analyzer") targetTab = GameTab.ANALYZER;
      else if (clean === "arena") targetTab = GameTab.ARENA;
      else if (clean === "progress") targetTab = GameTab.PROGRESS;
      else if (clean === "favorites") targetTab = GameTab.FAVORITES;
      else if (clean === "study_planner") targetTab = GameTab.STUDY_PLANNER;
      else if (clean === "scoresheet") targetTab = GameTab.SCORESHEET;
      else if (clean === "play_with_friends" || clean === "multiplayer") targetTab = GameTab.PLAY_WITH_FRIENDS;
    } else {
      targetTab = to;
    }

    if (options?.replace) {
      navigationManager.resetHistory(targetTab);
      if (typeof window !== "undefined") {
        try {
          window.history.replaceState({ chesszen: true, tab: targetTab, depth: 1 }, "", `/${targetTab === GameTab.DASHBOARD ? "dashboard" : targetTab}`);
        } catch {
          // ignore
        }
      }
    } else {
      navigationManager.pushTab(targetTab, options?.extraData);
    }
    setActiveTab(targetTab);
  };

  // Helper for centralized tab navigation pushing to history stack
  const navigateTab = (tab: GameTab, extraData?: any) => {
    navigate(tab, { extraData });
  };

  // Initialize navigation manager and listeners on mount
  useEffect(() => {
    navigationManager.init();
    const unsubTab = navigationManager.onTabChange((newTab) => {
      setActiveTab(newTab);
    });
    const unsubToast = navigationManager.onExitToast((show) => {
      setShowExitToast(show);
    });
    return () => {
      unsubTab();
      unsubToast();
    };
  }, []);

  // 0. Splash & Auth Session State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("chessmaster_logged_in") === "true";
  });
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(() => {
    return localStorage.getItem("chessmaster_logged_in") === "true";
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [pendingGameRequestsCount, setPendingGameRequestsCount] = useState<number>(0);

  // Back handler for navigation drawer
  useEffect(() => {
    if (isDrawerOpen) {
      const unregister = navigationManager.registerHandler({
        id: "app-drawer-menu",
        priority: 90,
        handleBack: () => {
          setIsDrawerOpen(false);
          return true;
        }
      });
      return unregister;
    }
  }, [isDrawerOpen]);

  const handleLogout = () => {
    logoutUser();
    localStorage.setItem("chessmaster_logged_in", "false");
    localStorage.removeItem("chessmaster_user_profile");
    setIsLoggedIn(false);
    setIsDrawerOpen(false);
    navigationManager.resetHistory(GameTab.DASHBOARD);
    setActiveTab(GameTab.DASHBOARD);
  };

  // 1. Core Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("chessmaster_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          rating: parsed.rating ?? parsed.elo ?? 1200,
          elo: parsed.elo ?? parsed.rating ?? 1200,
          puzzleElo: parsed.puzzleElo ?? 1200,
          ratings: parsed.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 }
        };
      } catch {
        // Fallback
      }
    }
    const defaultEmail = "user@chesszen.com";
    return {
      username: extractUsernameFromEmail(defaultEmail),
      email: defaultEmail,
      isGuest: false,
      elo: 1200,
      rating: 1200,
      puzzleElo: 1200,
      ratings: {
        bullet: 1200,
        blitz: 1200,
        rapid: 1200,
        classical: 1200
      },
      modeStats: {
        bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
      },
      matchHistory: [],
      highestRating: 1200,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      level: 1,
      xp: 0,
      coins: 0,
      streak: 0,
      longestStreak: 0,
      bestStreak: 0,
      lastActivityDate: null,
      streakStartedAt: null,
      unlockedBadges: [],
      lastActiveDate: null
    };
  });

  const handleOpenAnalyzer = (gameData?: CompletedGameData | string | MatchRecord | any, fromTab?: GameTab) => {
    if (fromTab) {
      setPreviousTabForAnalyzer(fromTab);
    } else {
      setPreviousTabForAnalyzer(activeTab);
    }

    if (gameData) {
      if (typeof gameData === "string") {
        const cleanMoves = gameData
          .replace(/\[.*?\]/g, "")
          .replace(/\d+\./g, "")
          .replace(/(1-0|0-1|1\/2-1\/2|\*)/g, "")
          .trim()
          .split(/\s+/)
          .filter((m) => m.length > 0);
        setAnalyzingGameData({
          gameId: "custom_" + Date.now(),
          whitePlayer: "White",
          blackPlayer: "Black",
          sanMoves: cleanMoves,
          playerColor: "w",
          initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          pgn: gameData
        });
      } else if (gameData && "sanMoves" in gameData && Array.isArray(gameData.sanMoves)) {
        setAnalyzingGameData(gameData as CompletedGameData);
      } else if (gameData && "opponent" in gameData) {
        const isUserWhite = gameData.playerColor !== "b" && gameData.playerColor !== "black";
        let sanMoves: string[] = gameData.sanMoves || [];
        if (sanMoves.length === 0 && gameData.pgn) {
          sanMoves = gameData.pgn
            .replace(/\[.*?\]/g, "")
            .replace(/\d+\./g, "")
            .replace(/(1-0|0-1|1\/2-1\/2|\*)/g, "")
            .trim()
            .split(/\s+/)
            .filter((m: string) => m.length > 0);
        }
        setAnalyzingGameData({
          gameId: gameData.id,
          whitePlayer: gameData.whitePlayer || (isUserWhite ? (profile.username || "You") : gameData.opponent),
          blackPlayer: gameData.blackPlayer || (isUserWhite ? gameData.opponent : (profile.username || "You")),
          whiteRating: gameData.whiteRating || (isUserWhite ? gameData.ratingAfter : gameData.opponentRating),
          blackRating: gameData.blackRating || (isUserWhite ? gameData.opponentRating : gameData.ratingAfter),
          playerColor: isUserWhite ? "w" : "b",
          result: gameData.result,
          resultScore: gameData.resultScore,
          terminationReason: gameData.terminationReason,
          sanMoves: sanMoves,
          finalFen: gameData.finalFen,
          initialFen: gameData.initialFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          pgn: gameData.pgn || sanMoves.join(" "),
          gameMode: gameData.gameMode,
          timeControl: gameData.timeControl,
          date: gameData.date,
          accuracy: gameData.accuracy,
          evalHistory: gameData.evalHistory
        });
      } else {
        setAnalyzingGameData(gameData);
      }
    }
    navigateTab(GameTab.ANALYZER);
  };

  // 2. Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem("chessmaster_achievements");
    if (saved) return JSON.parse(saved);
    return DEFAULT_ACHIEVEMENTS;
  });

  // Save states to local storage on update
  useEffect(() => {
    localStorage.setItem("chessmaster_user_profile", JSON.stringify(profile));

    // Sync non-guest profile edits back to the registered users collection
    if (!profile.isGuest && isLoggedIn) {
      const registeredUsersRaw = localStorage.getItem("chessmaster_registered_users");
      if (registeredUsersRaw) {
        const registeredUsers = JSON.parse(registeredUsersRaw);
        const updatedUsers = registeredUsers.map((u: any) => {
          if (u.email?.toLowerCase() === profile.email?.toLowerCase() || (u.id && u.id === profile.id)) {
            return { ...u, username: profile.username, profile };
          }
          return u;
        });
        localStorage.setItem("chessmaster_registered_users", JSON.stringify(updatedUsers));
      }
    }
  }, [profile, isLoggedIn]);

  // Real-time listener for incoming game requests
  useEffect(() => {
    if (!profile?.username) return;
    const unsub = subscribeToUserGameRequests(profile.username, (reqs) => {
      const pending = reqs.filter(
        (r) => r.receiverUsername.toLowerCase() === profile.username.toLowerCase() && r.status === "pending"
      );
      setPendingGameRequestsCount(pending.length);
    });
    return () => unsub();
  }, [profile?.username]);

  // Sync profile from Firestore on mount or login to prevent race conditions
  useEffect(() => {
    if (isLoggedIn) {
      const session = getCurrentAuthSession();
      const userId = session?.user?.id || profile.id || profile.uid || (profile.email ? "usr_" + profile.email.replace(/[^a-zA-Z0-9]/g, "_") : "");
      
      const fetchAndRestore = async () => {
        try {
          setIsProfileLoading(true);
          let fsUser = userId ? await getUserProfileFromFirestore(userId) : null;
          if (!fsUser && profile.email) {
            fsUser = await getUserProfileFromFirestore(profile.email);
          }

          if (fsUser) {
            const currentRating = fsUser.rating ?? fsUser.elo ?? 1200;
            const fullProfile: UserProfile = {
              id: fsUser.id || userId || profile.id,
              uid: fsUser.id || userId || profile.uid,
              username: fsUser.username || profile.username,
              email: fsUser.email || profile.email,
              isGuest: false,
              elo: currentRating,
              rating: currentRating,
              puzzleElo: fsUser.puzzleElo ?? 1200,
              ratings: fsUser.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
              modeStats: fsUser.modeStats || profile.modeStats,
              matchHistory: fsUser.matchHistory || profile.matchHistory || [],
              puzzleProgress: fsUser.puzzleProgress || profile.puzzleProgress || {},
              gambitProgress: fsUser.gambitProgress || profile.gambitProgress || {},
              boardTheme: fsUser.boardTheme || fsUser.settings?.boardTheme || profile.boardTheme || "tournament",
              profilePicture: fsUser.profilePicture || profile.profilePicture,
              profileImageUrl: fsUser.profilePicture || profile.profileImageUrl,
              highestRating: fsUser.highestRating || currentRating,
              gamesPlayed: fsUser.gamesPlayed ?? profile.gamesPlayed ?? 0,
              wins: fsUser.wins ?? (fsUser as any).gamesWon ?? profile.wins ?? 0,
              losses: fsUser.losses ?? (fsUser as any).gamesLost ?? profile.losses ?? 0,
              draws: fsUser.draws ?? profile.draws ?? 0,
              level: fsUser.level || profile.level || 1,
              xp: fsUser.xp ?? profile.xp ?? 0,
              coins: fsUser.coins ?? profile.coins ?? 0,
              streak: fsUser.streak ?? profile.streak ?? 0,
              longestStreak: fsUser.longestStreak ?? fsUser.bestStreak ?? profile.longestStreak ?? 0,
              bestStreak: fsUser.bestStreak ?? fsUser.longestStreak ?? profile.bestStreak ?? 0,
              lastActivityDate: fsUser.lastActivityDate || profile.lastActivityDate || null,
              streakStartedAt: fsUser.streakStartedAt || profile.streakStartedAt || null,
              unlockedBadges: fsUser.unlockedBadges || profile.unlockedBadges || [],
              lastActiveDate: fsUser.lastActiveDate || profile.lastActiveDate || null,
              settings: fsUser.settings || profile.settings
            };

            setProfile(fullProfile);
            localStorage.setItem("chessmaster_user_profile", JSON.stringify(fullProfile));
            
            if (fullProfile.gambitProgress && Object.keys(fullProfile.gambitProgress).length > 0) {
              localStorage.setItem("gambits_progress", JSON.stringify(fullProfile.gambitProgress));
            }
          }
        } catch (err) {
          console.warn("Failed loading profile from Firestore on mount:", err);
        } finally {
          setIsProfileLoading(false);
        }
      };

      fetchAndRestore();
    } else {
      setIsProfileLoading(false);
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = async (email: string, username: string, isGuest: boolean) => {
    localStorage.setItem("chessmaster_logged_in", "true");
    setIsLoggedIn(true);
    setIsProfileLoading(true);

    try {
      // Look up persistent profile from Firestore
      const session = getCurrentAuthSession();
      const userId = session?.user?.id || (email ? "usr_" + email.replace(/[^a-zA-Z0-9]/g, "_") : "");

      let fsProfile = userId ? await getUserProfileFromFirestore(userId) : null;
      if (!fsProfile && email) {
        fsProfile = await getUserProfileFromFirestore(email);
      }

      if (fsProfile) {
        const savedRating = fsProfile.rating ?? fsProfile.elo ?? 1200;
        const loadedProfile: UserProfile = {
          id: fsProfile.id || userId,
          uid: fsProfile.id || userId,
          username: fsProfile.username || username || extractUsernameFromEmail(email || fsProfile.email || ""),
          email: fsProfile.email || email,
          isGuest: false,
          elo: savedRating,
          rating: savedRating,
          puzzleElo: fsProfile.puzzleElo ?? 1200,
          ratings: fsProfile.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
          modeStats: fsProfile.modeStats || {
            bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
            blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
            rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
            classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
          },
          matchHistory: fsProfile.matchHistory || [],
          puzzleProgress: fsProfile.puzzleProgress || {},
          gambitProgress: fsProfile.gambitProgress || {},
          boardTheme: fsProfile.boardTheme || fsProfile.settings?.boardTheme || "tournament",
          profilePicture: fsProfile.profilePicture,
          profileImageUrl: fsProfile.profilePicture,
          highestRating: fsProfile.highestRating || savedRating,
          gamesPlayed: fsProfile.gamesPlayed || 0,
          wins: fsProfile.wins || (fsProfile as any).gamesWon || 0,
          losses: fsProfile.losses || (fsProfile as any).gamesLost || 0,
          draws: fsProfile.draws || 0,
          level: fsProfile.level || 1,
          xp: fsProfile.xp || 0,
          coins: fsProfile.coins || 0,
          streak: fsProfile.streak ?? 0,
          longestStreak: fsProfile.longestStreak ?? fsProfile.bestStreak ?? 0,
          bestStreak: fsProfile.bestStreak ?? fsProfile.longestStreak ?? 0,
          lastActivityDate: fsProfile.lastActivityDate || null,
          streakStartedAt: fsProfile.streakStartedAt || null,
          unlockedBadges: fsProfile.unlockedBadges || [],
          lastActiveDate: fsProfile.lastActiveDate || null,
          settings: fsProfile.settings
        };
        setProfile(loadedProfile);
        localStorage.setItem("chessmaster_user_profile", JSON.stringify(loadedProfile));

        if (loadedProfile.gambitProgress && Object.keys(loadedProfile.gambitProgress).length > 0) {
          localStorage.setItem("gambits_progress", JSON.stringify(loadedProfile.gambitProgress));
        }
      } else {
        // Look up registered user's custom profile from localStorage fallback
        const registeredUsersRaw = localStorage.getItem("chessmaster_registered_users");
        const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
        const foundUser = registeredUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

        if (foundUser && foundUser.profile) {
          const profileWithId = {
            ...foundUser.profile,
            id: foundUser.profile.id || userId,
            uid: foundUser.profile.uid || userId,
            rating: foundUser.profile.rating ?? foundUser.profile.elo ?? 1200,
            elo: foundUser.profile.elo ?? foundUser.profile.rating ?? 1200
          };
          setProfile(profileWithId);
          saveUserProfileToFirestore(profileWithId).catch(console.warn);
        } else {
          const newProf: UserProfile = {
            id: userId,
            uid: userId,
            username: username || extractUsernameFromEmail(email || ""),
            email: email,
            isGuest: isGuest,
            elo: 1200,
            rating: 1200,
            puzzleElo: 1200,
            ratings: { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
            modeStats: {
              bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
              blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
              rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
              classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
            },
            matchHistory: [],
            highestRating: 1200,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            level: 1,
            xp: 0,
            coins: 0,
            streak: 0,
            longestStreak: 0,
            bestStreak: 0,
            lastActivityDate: null,
            streakStartedAt: null,
            unlockedBadges: [],
            lastActiveDate: null
          };
          setProfile(newProf);
          if (!isGuest) {
            saveUserProfileToFirestore(newProf).catch(console.warn);
          }
        }
      }
    } catch (err) {
      console.warn("Login profile resolution error:", err);
    } finally {
      setIsLoggedIn(true);
      setIsProfileLoading(false);
      navigate('/dashboard', { replace: true });
      console.log("[GoogleAuth] Navigating to Dashboard");
    }
  };

  useEffect(() => {
    localStorage.setItem("chessmaster_achievements", JSON.stringify(achievements));
  }, [achievements]);

  // Gamification progress rewards - records daily activity & updates streak
  const handleAwardProgress = (xpAward: number, coinsAward: number, badgeId?: string, isPuzzleWin?: boolean) => {
    setProfile((prev) => {
      const { updatedProfile: activityProfile } = recordDailyActivity(prev);
      const newXp = activityProfile.xp + xpAward;
      const nextLevelXp = activityProfile.level * 500;
      let newLevel = activityProfile.level;
      let finalXp = newXp;

      if (finalXp >= nextLevelXp) {
        finalXp = finalXp - nextLevelXp;
        newLevel = activityProfile.level + 1;
      }

      const updatedBadges = [...activityProfile.unlockedBadges];
      if (badgeId && !updatedBadges.includes(badgeId)) {
        updatedBadges.push(badgeId);
      }

      return {
        ...activityProfile,
        xp: finalXp,
        level: newLevel,
        coins: activityProfile.coins + coinsAward,
        unlockedBadges: updatedBadges,
        puzzleElo: isPuzzleWin ? activityProfile.puzzleElo + 15 : activityProfile.puzzleElo,
        elo: !isPuzzleWin ? activityProfile.elo + 8 : activityProfile.elo
      };
    });

    // Mark associated achievement as completed
    if (badgeId) {
      setAchievements((prev) => 
        prev.map((ach) => ach.id === badgeId ? { ...ach, completed: true } : ach)
      );
    }
  };

  const handleClaimDailyReward = () => {
    setProfile((prev) => {
      const { updatedProfile } = recordDailyActivity(prev);
      return {
        ...updatedProfile,
        coins: updatedProfile.coins + 150,
        xp: updatedProfile.xp + 100
      };
    });
  };

  const isDailyRewardClaimed = (profile.lastActivityDate || profile.lastActiveDate) === getLocalTodayString();

  const handleUpdateProfilePicture = (newUrl: string | null) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        profileImageUrl: newUrl || undefined,
        profilePicture: newUrl || undefined
      };
      try {
        localStorage.setItem("chessmaster_user_profile", JSON.stringify(updated));
      } catch (err) {
        console.warn("Error saving profile picture to localStorage:", err);
      }
      const userId = updated.id || updated.uid || (updated.email ? "usr_" + updated.email.replace(/[^a-zA-Z0-9]/g, "_") : "user_local");
      saveUserProfileToFirestore({
        ...updated,
        id: userId,
        uid: userId,
        createdAt: (updated as any).createdAt || new Date().toISOString()
      }).catch(console.warn);
      return updated;
    });
  };

  const handleUpdateThemeSettings = (boardTheme: string, pieceStyle: string) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        boardTheme,
        settings: {
          ...(prev.settings || {
            soundEnabled: true,
            boardHaptics: true,
            boardTheme: "tournament",
            pieceStyle: "classic",
            moveMethod: "click"
          }),
          boardTheme,
          pieceStyle
        }
      };
      try {
        localStorage.setItem("chessmaster_user_profile", JSON.stringify(updated));
      } catch (err) {
        console.warn("Error saving theme settings to localStorage:", err);
      }
      const userId = updated.id || updated.uid || (updated.email ? "usr_" + updated.email.replace(/[^a-zA-Z0-9]/g, "_") : "user_local");
      saveUserProfileToFirestore({
        ...updated,
        id: userId,
        uid: userId,
        createdAt: (updated as any).createdAt || new Date().toISOString()
      }).catch(console.warn);
      return updated;
    });
  };

  // 3. Play Against AI State variables
  const [selectedGameModeInfo, setSelectedGameModeInfo] = useState<{ mode: GameModeKey; timestamp: number } | null>(null);

  const handleSelectModePlay = (modeKey?: GameModeKey) => {
    if (modeKey) {
      setSelectedGameModeInfo({ mode: modeKey, timestamp: Date.now() });
    }
    navigateTab(GameTab.CHESSBOARD);
    setPlayGame(new Chess());
    setPlayArrows([]);
    setPlayHighlights([]);
  };

  const [playGame, setPlayGame] = useState<Chess>(new Chess());
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Expert">("Intermediate");
  const [coachMode, setCoachMode] = useState(true);
  const [playArrows, setPlayArrows] = useState<string[]>([]);
  const [playHighlights, setPlayHighlights] = useState<string[]>([]);
  const [coachingText, setCoachingText] = useState<string>(
    "Develop your knights and bishops early. Press the board squares to test your lines, and I'll explain each response!"
  );
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Trigger AI opponent's response and explanation
  const handlePlayerMove = async (from: string, to: string) => {
    try {
      const moveResult = playGame.move({ from, to, promotion: "q" });
      if (moveResult) {
        setPlayGame(new Chess(playGame.fen()));
        setPlayArrows([]);
        setPlayHighlights([to]);

        if (playGame.isGameOver()) {
          setCoachingText("Incredible match! The game is officially over. Run deep AI analysis to review the coordinates!");
          return;
        }

        // Trigger AI Response with delay
        setLoadingSuggestion(true);
        setTimeout(async () => {
          try {
            const legalMoves = playGame.moves();
            if (legalMoves.length > 0) {
              // Fetch recommendation from server
              const response = await fetch("/api/coach/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fen: playGame.fen(),
                  history: playGame.history(),
                  rating: profile.elo,
                  legalMoves: legalMoves
                })
              });

              const data = await response.json();
              if (data.bestMove) {
                playGame.move(data.bestMove);
                setPlayGame(new Chess(playGame.fen()));

                // Set graphical annotations
                setPlayArrows([]);
                if (data.highlights) setPlayHighlights(data.highlights);

                if (coachMode) {
                  setCoachingText(data.explanation || "Developing active coordinates is standard.");
                }
              } else {
                // Client-side fallback move
                const fallbackMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
                playGame.move(fallbackMove);
                setPlayGame(new Chess(playGame.fen()));
              }
            }
          } catch (err) {
            console.error("AI turn error", err);
            // Quick random legal fallback
            const legals = playGame.moves();
            if (legals.length > 0) {
              playGame.move(legals[0]);
              setPlayGame(new Chess(playGame.fen()));
            }
          } finally {
            setLoadingSuggestion(false);
          }
        }, 800);
      }
    } catch (e) {
      setCoachingText("That move is illegal. Re-examine standard chess coordinates!");
    }
  };

  // 4. Personalized Study Planner state variables
  const [weeklyPlanner, setWeeklyPlanner] = useState<any>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerInputs, setPlannerInputs] = useState({
    rating: profile.elo,
    weaknesses: "pawn structure, endgame, tactical forks",
    hours: 5,
    goals: "Reach 1500 ELO rating"
  });

  const handleGenerateStudyPlan = async () => {
    setPlannerLoading(true);
    setWeeklyPlanner(null);
    try {
      const response = await fetch("/api/coach/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: plannerInputs.rating,
          weaknesses: plannerInputs.weaknesses,
          studyHours: plannerInputs.hours,
          goals: plannerInputs.goals
        })
      });

      const data = await response.json();
      if (data.title) {
        setWeeklyPlanner(data);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setWeeklyPlanner({
        title: "Personalized Grandmaster Curriculum Plan",
        focusAreas: ["Endgame Rook Coordination", "Tactical Forks & Pins", "Castling Security"],
        dailySchedule: [
          { day: "Day 1", topic: "Center Board Control", durationMin: 45, description: "Review e4/d4 opening structures and establish active central outposts.", practicePositionsCount: 5 },
          { day: "Day 2", topic: "Forks & Double Targets", durationMin: 45, description: "Calculate knight leaps targeting both King and major rook/queen pieces.", practicePositionsCount: 10 },
          { day: "Day 3", topic: "Endgame Rook Technique", durationMin: 60, description: "Master king alignment and rook positioning on open 7th files.", practicePositionsCount: 8 }
        ],
        generalAdvice: "Stay disciplined. Spend 15 minutes reviewing active Grandmaster games before attempting tactical puzzles. Focus heavily on check-avoidance lines."
      });
    } finally {
      setPlannerLoading(false);
    }
  };

  // 5. Grandmaster Games Viewer state variables
  const [selectedGmGame, setSelectedGmGame] = useState<GMGame | null>(null);
  const [gmBoard, setGmBoard] = useState<Chess | null>(null);
  const [gmMoveIdx, setGmMoveIdx] = useState(0);

  const startGmGameViewer = (game: GMGame) => {
    setSelectedGmGame(game);
    const freshChess = new Chess();
    setGmBoard(freshChess);
    setGmMoveIdx(0);
  };

  const handleGmStepForward = () => {
    if (!selectedGmGame || !gmBoard) return;
    if (gmMoveIdx >= selectedGmGame.moves.length) return;

    try {
      gmBoard.move(selectedGmGame.moves[gmMoveIdx]);
      setGmBoard(new Chess(gmBoard.fen()));
      setGmMoveIdx(gmMoveIdx + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGmStepBackward = () => {
    if (!selectedGmGame || !gmBoard) return;
    if (gmMoveIdx <= 0) return;

    try {
      gmBoard.undo();
      setGmBoard(new Chess(gmBoard.fen()));
      setGmMoveIdx(gmMoveIdx - 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation structures
  const drawerItems = [
    { id: GameTab.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
    { id: GameTab.PLAY_WITH_FRIENDS, label: "Play with Friends", icon: Users },
    { id: GameTab.LEARNING_PATH, label: "Learn Chess", icon: BookOpen },
    { id: GameTab.OPENINGS, label: "Openings Explorer", icon: BookOpenCheck },
    { id: GameTab.GAMBITS, label: "Gambits Learning", icon: Swords },
    { id: GameTab.TRAPS, label: "Tactical Traps", icon: Target },
    { id: GameTab.PUZZLES, label: "Puzzle Trainer", icon: Zap },
    { id: GameTab.CHESSBOARD, label: "AI Coach", icon: Cpu },
    { id: GameTab.ANALYZER, label: "Game Analyzer", icon: RefreshCw },
    { id: GameTab.ARENA, label: "Tournament Arena", icon: Trophy },
    { id: GameTab.STUDY_PLANNER, label: "Personalized Study Plan", icon: Calendar },
    { id: GameTab.PROGRESS, label: "Progress Dashboard", icon: TrendingUp },
    { id: GameTab.FAVORITES, label: "Favorites", icon: Heart },
    { id: GameTab.SCORESHEET, label: "Download Scoresheet", icon: FileText },
    { id: GameTab.SETTINGS, label: "Settings", icon: Settings },
    { id: GameTab.PROFILE, label: "Profile", icon: User }
  ];

  const bottomNavItems = [
    { id: GameTab.DASHBOARD, label: "Home", icon: LayoutDashboard },
    { id: GameTab.CHESSBOARD, label: "Play", icon: PlayCircle },
    { id: GameTab.LEARNING_PATH, label: "Learn", icon: BookOpen },
    { id: GameTab.ARENA, label: "Arena", icon: Trophy },
    { id: GameTab.PROFILE, label: "Profile", icon: User }
  ];

  // Tournament Arena states
  const [arenaJoinLoading, setArenaJoinLoading] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const handleJoinTournament = (tName: string, botElo: number) => {
    setArenaJoinLoading(tName);
    setTimeout(() => {
      setArenaJoinLoading(null);
      setActiveNotification(`Paired successfully! Opponent Found: ArenaChessBot (${botElo} ELO)`);
      
      // Setup AI opponent game
      setPlayGame(new Chess());
      setPlayArrows([]);
      setPlayHighlights([]);
      setCoachingText(`Tournament Match Initiated: playing as White in the ${tName}! Good luck!`);
      setDifficulty(botElo > 1800 ? "Expert" : botElo > 1200 ? "Intermediate" : "Beginner");
      setActiveTab(GameTab.CHESSBOARD);
    }, 1800);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    console.log("[AuthGuard] Why Login was rendered: user is not authenticated");
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onReplaySplash={() => setShowSplash(true)}
      />
    );
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/5">
            <Crown className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 font-display">Restoring ChessZen Profile</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Syncing your ratings, game history, and tactical progress from the cloud database...
          </p>
        </div>
      </div>
    );
  }

  // Dedicated Fullscreen Chess Gameplay Mode
  if (activeTab === GameTab.CHESSBOARD) {
    return (
      <PlayAiArena
        profile={profile}
        theme={theme}
        setTheme={setTheme}
        initialModeInfo={selectedGameModeInfo}
        onNavigateToAnalyzer={(gameData) => handleOpenAnalyzer(gameData, GameTab.CHESSBOARD)}
        onAwardProgress={handleAwardProgress}
        onUpdateProfile={(updatedProfile) => setProfile(updatedProfile)}
        onGoToArena={() => navigateTab(GameTab.ARENA)}
        onGoToDashboard={() => navigateTab(GameTab.DASHBOARD)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col transition-colors font-sans antialiased pb-20 md:pb-0">
      
      {/* TOP APP BAR */}
      <header className="sticky top-0 bg-[#0B0D17]/80 backdrop-blur-xl border-b border-amber-500/15 h-16 flex items-center justify-between px-4 sm:px-6 z-40 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Trigger Button */}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-amber-200/80 hover:text-white rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* ChessZen Brand Title */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTab(GameTab.DASHBOARD)}>
            <ChessZenLogo variant="full" size="sm" theme="dark" />
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Notification dropdown icon */}
          <button 
            onClick={() => {
              if (pendingGameRequestsCount > 0) {
                navigateTab(GameTab.PLAY_WITH_FRIENDS);
              } else {
                setActiveNotification(activeNotification ? null : "Daily reward claimed and achievements synchronized successfully!");
              }
            }}
            className="p-2 text-amber-200/80 hover:text-white rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors cursor-pointer relative"
            title={pendingGameRequestsCount > 0 ? `${pendingGameRequestsCount} Pending Game Challenges` : "Notifications"}
          >
            <Bell className="h-5 w-5" />
            {pendingGameRequestsCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full animate-bounce">
                {pendingGameRequestsCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* User Profile Avatar & Logout */}
          <div className="flex items-center gap-2">
            <UserAvatar
              src={profile.profileImageUrl || profile.profilePicture}
              username={profile.username}
              size="sm"
              onClick={() => navigateTab(GameTab.PROFILE)}
            />
            <button
              onClick={handleLogout}
              title="Logout / Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MATCH NOTIFICATION OVERLAY BANNER */}
      {activeNotification && (
        <div className="relative z-50 bg-[#151922]/95 border-b border-amber-500/30 text-amber-200 p-3 text-xs font-bold flex items-center justify-between px-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 animate-bounce" />
            <span>{activeNotification}</span>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="p-1 text-amber-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* BACKDROP FOR SLIDING LEFT DRAWER */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* SLIDING LEFT NAVIGATION DRAWER */}
      <div className={`fixed top-0 bottom-0 left-0 w-72 bg-[#0B0D17]/95 backdrop-blur-2xl text-white z-50 transform transition-transform duration-300 ease-out flex flex-col justify-between border-r border-amber-500/20 shadow-2xl ${
        isDrawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 flex flex-col h-full justify-between">
          <div>
            {/* Header / Brand in Drawer */}
            <div className="flex items-center justify-between pb-5 border-b border-amber-500/15 mb-5">
              <div className="flex items-center gap-3">
                <ChessZenLogo variant="full" size="md" theme="dark" />
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-amber-500/10 rounded-lg text-slate-400 hover:text-amber-300 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List of items in Drawer */}
            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {drawerItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTab(item.id);
                      setIsDrawerOpen(false);
                      if (item.id === GameTab.CHESSBOARD) {
                        setPlayGame(new Chess());
                        setPlayArrows([]);
                        setPlayHighlights([]);
                        setCoachingText("New custom training match against the AI Coach initiated!");
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 shadow-sm" 
                        : "text-slate-400 hover:text-white hover:bg-amber-500/10"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? "text-amber-400 scale-110" : ""}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick theme setup & Sign Out */}
          <div className="border-t border-amber-500/15 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigateTab(GameTab.PROFILE); setIsDrawerOpen(false); }}>
                <UserAvatar
                  src={profile.profileImageUrl || profile.profilePicture}
                  username={profile.username}
                  size="xs"
                />
                <span className="text-[10px] font-bold text-amber-200/80 truncate max-w-[120px]">{profile.username}</span>
              </div>
              
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value as ChessTheme)}
                className="bg-[#151922] border border-amber-500/30 text-[9px] rounded-lg py-1 px-2 font-bold text-amber-300 cursor-pointer"
              >
                <option value={ChessTheme.TOURNAMENT}>Tournament Wood</option>
                <option value={ChessTheme.NEON_SPACE}>Neon Space</option>
                <option value={ChessTheme.GLASS_SLATE}>Glass Slate</option>
              </select>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out / Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT PANEL */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* TAB 1: Dashboard View */}
          {activeTab === GameTab.DASHBOARD && (
            <Dashboard 
              profile={profile} 
              achievements={achievements} 
              onNavigate={(tab, extraData) => {
                if (tab === "play" || tab === GameTab.CHESSBOARD) {
                  handleSelectModePlay(extraData?.mode || extraData);
                } else {
                  navigateTab(tab as GameTab);
                }
              }} 
              onSelectModePlay={(mode) => handleSelectModePlay(mode)}
              onClaimDailyReward={handleClaimDailyReward}
              dailyRewardClaimed={isDailyRewardClaimed}
            />
          )}

          {/* TAB: Play With Friends View */}
          {activeTab === GameTab.PLAY_WITH_FRIENDS && (
            <PlayWithFriends
              currentUsername={profile.username}
              currentUserId={profile.email || profile.username}
              userProfile={profile}
              savedBoardTheme={theme}
              onGoToDashboard={() => navigateTab(GameTab.DASHBOARD)}
              onUpdateProfile={(updatedProfile) => setProfile(updatedProfile)}
              onAnalyzeGame={(gameData) => {
                handleOpenAnalyzer(gameData, GameTab.PLAY_WITH_FRIENDS);
              }}
            />
          )}

          {/* TAB 3: Beginner to GM path */}
          {activeTab === GameTab.LEARNING_PATH && (
            <LearningPath profile={profile} onAwardProgress={handleAwardProgress} />
          )}

          {/* TAB 4: Openings */}
          {activeTab === GameTab.OPENINGS && (
            <OpeningExplorer profile={profile} initialSubTab="openings" />
          )}

          {/* TAB 4b: Tactical Traps */}
          {activeTab === GameTab.TRAPS && (
            <OpeningExplorer profile={profile} initialSubTab="traps" />
          )}

          {/* TAB 4c: Master Chess Gambits */}
          {activeTab === GameTab.GAMBITS && (
            <Gambits profile={profile} theme={theme} onAwardProgress={handleAwardProgress} />
          )}

          {/* TAB 5: Unlimited Tactical Puzzles */}
          {activeTab === GameTab.PUZZLES && (
            <TacticalPuzzles 
              profile={profile} 
              onAwardProgress={handleAwardProgress}
              onUpdateProfile={(updatedProfile) => setProfile(updatedProfile)}
              onNavigateToAnalyzer={(fen) => navigateTab(GameTab.ANALYZER)}
            />
          )}

          {/* TAB 6: AI Game Analyzer */}
          {activeTab === GameTab.ANALYZER && (
            <GameAnalyzer 
              completedGame={analyzingGameData}
              matchHistory={profile.matchHistory || []}
              onSelectGame={(game) => setAnalyzingGameData(game)}
              onBack={() => {
                if (previousTabForAnalyzer) {
                  navigateTab(previousTabForAnalyzer);
                } else {
                  navigationManager.triggerBack();
                }
              }}
              onAwardProgress={handleAwardProgress}
              theme={theme}
              boardTheme={theme}
            />
          )}

          {/* TAB 7: Personalized AI Study Planner */}
          {activeTab === GameTab.STUDY_PLANNER && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white">Personalized Weekly Study Planner</h1>
                <p className="text-sm text-slate-400">
                  Input your ELO rating, weaknesses, available hours, and goals to construct a customized 7-day training syllabus via Gemini.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono pb-2 border-b border-slate-900">
                    Study Questionnaire
                  </h3>

                  <div className="space-y-3 text-xs font-bold text-slate-400">
                    <div className="space-y-1">
                      <label>ELO Rating:</label>
                      <input 
                        type="number"
                        value={plannerInputs.rating}
                        onChange={(e) => setPlannerInputs({ ...plannerInputs, rating: parseInt(e.target.value, 10) || 1200 })}
                        className="w-full rounded-lg border border-slate-800 p-2 text-xs bg-slate-950 dark:text-white font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Key weaknesses (comma-separated):</label>
                      <input 
                        type="text"
                        value={plannerInputs.weaknesses}
                        onChange={(e) => setPlannerInputs({ ...plannerInputs, weaknesses: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 p-2 text-xs bg-slate-950 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Available study hours per week:</label>
                      <input 
                        type="number"
                        value={plannerInputs.hours}
                        onChange={(e) => setPlannerInputs({ ...plannerInputs, hours: parseInt(e.target.value, 10) || 5 })}
                        className="w-full rounded-lg border border-slate-800 p-2 text-xs bg-slate-950 dark:text-white font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label>Target Goals:</label>
                      <input 
                        type="text"
                        value={plannerInputs.goals}
                        onChange={(e) => setPlannerInputs({ ...plannerInputs, goals: e.target.value })}
                        className="w-full rounded-lg border border-slate-800 p-2 text-xs bg-slate-950 dark:text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateStudyPlan}
                    disabled={plannerLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white py-3 font-bold text-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                  >
                    {plannerLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Generating Plan...
                      </>
                    ) : (
                      "Generate Study Plan"
                    )}
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  {plannerLoading ? (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950 p-12 text-center space-y-4">
                      <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
                      <div>
                        <h3 className="font-bold text-sm text-white font-display">Formulating custom study tracks...</h3>
                        <p className="text-xs text-slate-400 mt-1">Our AI Coach is mapping out your weekly bento practice slots based on weaknesses.</p>
                      </div>
                    </div>
                  ) : weeklyPlanner ? (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                        <Sparkles className="h-5 w-5 text-emerald-500 fill-current animate-pulse" />
                        <h2 className="text-lg font-bold text-white font-display">{weeklyPlanner.title}</h2>
                      </div>

                      {/* Focus Areas */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Key Focus areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {weeklyPlanner.focusAreas.map((area: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Schedule cards list */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Daily Schedule lanes</h4>
                        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                          {weeklyPlanner.dailySchedule.map((sched: any, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-400">{sched.day}:</span>
                                  <span className="font-bold text-slate-100 font-display">{sched.topic}</span>
                                </div>
                                <p className="text-slate-400 leading-relaxed max-w-md">{sched.description}</p>
                              </div>
                              <div className="flex items-center gap-2 font-mono font-bold">
                                <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-400 text-[10px]">
                                  {sched.durationMin} MIN
                                </span>
                                {sched.practicePositionsCount && (
                                  <span className="bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                                    {sched.practicePositionsCount} POS
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General coach advice */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-900 text-xs italic leading-relaxed text-slate-300">
                        "{weeklyPlanner.generalAdvice}"
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-400 space-y-2">
                      <Calendar className="h-8 w-8 text-slate-500 mx-auto" />
                      <div className="text-xs font-bold uppercase tracking-wider font-mono">No Active Study Plan</div>
                      <p className="text-xs text-slate-500">Fill in the questionnaire to generate your custom weekly study targets!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Profile View */}
          {activeTab === GameTab.PROFILE && (
            <div className="space-y-8">
              <VoiceCoach profile={profile} />

              <ProfileAuth 
                profile={profile} 
                achievements={achievements} 
                onUpdateUsername={(newName) => setProfile((prev) => ({ ...prev, username: newName }))}
                onUpdateProfilePicture={handleUpdateProfilePicture}
                onUpdateThemeSettings={handleUpdateThemeSettings}
                onLogout={handleLogout}
                onSelectModePlay={(mode) => handleSelectModePlay(mode)}
                onAnalyzeMatch={(match) => handleOpenAnalyzer(match, GameTab.PROFILE)}
              />
            </div>
          )}

          {/* TAB 9: Tournament Arena View (Custom Screen) */}
          {activeTab === GameTab.ARENA && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                    <Swords className="h-6 w-6 text-emerald-400" /> Tournament Arena
                  </h1>
                  <p className="text-sm text-slate-400">
                    Join online chess bracket cups to score grandmaster status points.
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  3 Active Arenas Open
                </div>
              </div>

              {/* Arenas Grid list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "rapid", name: "Zen Rapid Grand Open", players: 124, duration: "10m + 5s", rating: "All Ratings", botElo: 1400 },
                  { id: "blitz", name: "Google AI Blitz Brawl", players: 86, duration: "3m + 2s", rating: "Under 1600 ELO", botElo: 1100 },
                  { id: "masters", name: "DeepMind Masters Cup", players: 240, duration: "5m + 3s", rating: "Open Championship", botElo: 2600 }
                ].map((arena) => (
                  <div key={arena.id} className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                          {arena.duration}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          ● {arena.players} Joined
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white font-display group-hover:text-emerald-400 transition-colors">
                        {arena.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Class category: <strong>{arena.rating}</strong>. Defeat pairings to secure the Champion's crown!
                      </p>
                    </div>

                    <button
                      onClick={() => handleJoinTournament(arena.name, arena.botElo)}
                      disabled={arenaJoinLoading !== null}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-95 text-white py-2.5 text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10"
                    >
                      {arenaJoinLoading === arena.name ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Matching...
                        </>
                      ) : (
                        "Join Arena Bracket"
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Leaderboard shelf in Arena */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h3 className="font-bold text-white font-display flex items-center gap-1.5">
                    🏆 Global Tournament Leaderboard
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-400">Week 3 Standing</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: "Magnus Carlsen", score: "2,420 pts", title: "GM" },
                    { rank: 2, name: "Hikaru Nakamura", score: "2,180 pts", title: "GM" },
                    { rank: 3, name: "Sathish Kumar", score: "1,850 pts", title: "Master" },
                    { rank: 4, name: `${profile.username} (You)`, score: `${profile.elo + 120} pts`, title: "Local", isUser: true }
                  ].map((player, idx) => (
                    <div key={idx} className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                      player.isUser 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "border border-slate-900 bg-slate-950/60"
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-slate-500 min-w-[20px]">#{player.rank}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{player.name}</span>
                          <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-900 text-slate-400">
                            {player.title}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold">{player.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: Progress View (Custom Dashboard) */}
          {activeTab === GameTab.PROGRESS && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-indigo-400" /> Progress Dashboard
                </h1>
                <p className="text-sm text-slate-400">
                  Visualize rating gains, objectives completeness, and unlocked achievements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Radar indices card */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
                  <h3 className="font-bold text-white font-display">Tactical Proficiency index</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-bold mb-1">
                        <span>Pawn Structures</span>
                        <span>64%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: "64%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 font-bold mb-1">
                        <span>Endgame King Squares</span>
                        <span>78%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: "78%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 font-bold mb-1">
                        <span>Forks & Pins Detection</span>
                        <span>90%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: "90%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Progress chart box */}
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
                  <h3 className="font-bold text-white font-display">Weekly Rating Progress</h3>
                  <div className="h-32 w-full bg-slate-950 rounded-xl relative border border-slate-900 flex items-end justify-between overflow-hidden p-2">
                    <svg className="absolute inset-x-0 bottom-0 w-full h-[70%]" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M 5,90 Q 20,75 35,80 T 65,40 T 95,20" fill="none" stroke="#10b981" strokeWidth="3" />
                    </svg>
                    <div className="w-full flex justify-between px-2 text-[8px] font-mono text-slate-500">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: Repertoire Favorites View */}
          {activeTab === GameTab.FAVORITES && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                  <Heart className="h-6 w-6 text-rose-500 fill-current" /> My Repertoire Favorites
                </h1>
                <p className="text-sm text-slate-400">
                  Bookmarked chess openings, tactical traps, and master gambits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "Sicilian Defense", type: "Opening Setup", desc: "Sharp tactical response to 1. e4", rating: "4.9/5", category: "Openings" },
                  { name: "Evans Gambit", type: "Aggressive Gambit", desc: "Offer b4 pawn to capture the center quickly", rating: "4.8/5", category: "Gambits" },
                  { name: "Siberian Trap", type: "Opening Trap", desc: "Punish over-eager development in the Sicilian", rating: "4.7/5", category: "Traps" }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{item.type}</span>
                        <h4 className="font-extrabold text-sm text-white font-display mt-0.5">{item.name}</h4>
                      </div>
                      <span className="text-xs text-yellow-500">⭐ {item.rating}</span>
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                    <button 
                      onClick={() => {
                        navigateTab(item.category === "Openings" ? GameTab.OPENINGS : item.category === "Gambits" ? GameTab.GAMBITS : GameTab.TRAPS);
                      }}
                      className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Study Setup →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12b: Scoresheet Generator / Download */}
          {activeTab === GameTab.SCORESHEET && (
            <Scoresheet />
          )}

          {/* TAB 13: Settings View */}
          {activeTab === GameTab.SETTINGS && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                  <Settings className="h-6 w-6 text-slate-400" /> System Settings
                </h1>
                <p className="text-sm text-slate-400">
                  Fine-tune your chess engines, sound preferences, and user interfaces.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-1 border-b border-slate-900/60 pb-3">
                    <div>
                      <div className="font-bold text-sm text-white">Enable Board Haptics</div>
                      <div className="text-[11px] text-slate-400">Vibrate mobile frames upon piece locks.</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900/60 pb-3">
                    <div>
                      <div className="font-bold text-sm text-white">Sound Effects Toggles</div>
                      <div className="text-[11px] text-slate-400">Play standard woody lock pairing sounds.</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-900/60 pb-3">
                    <div>
                      <div className="font-bold text-sm text-white">Coordinates Training Markers</div>
                      <div className="text-[11px] text-slate-400">Annotate square indices explicitly.</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between py-1 pt-1">
                    <div>
                      <div className="font-bold text-sm text-white">Replay ChessZen Splash Animation</div>
                      <div className="text-[11px] text-amber-200/80">Experience the 3D Golden Eye Black Knight intro animation.</div>
                    </div>
                    <button
                      onClick={() => setShowSplash(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Play Animation</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0B0D17]/90 backdrop-blur-xl border-t border-amber-500/20 text-white p-1.5 flex justify-around md:hidden z-30 shadow-2xl">
        {bottomNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigateTab(item.id);
                if (item.id === GameTab.CHESSBOARD) {
                  setPlayGame(new Chess());
                  setPlayArrows([]);
                  setPlayHighlights([]);
                }
              }}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-[9px] transition-all cursor-pointer ${
                isActive 
                  ? "text-amber-300 bg-amber-500/15 border border-amber-500/30 font-bold shadow-sm" 
                  : "text-slate-400 hover:text-amber-200"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-amber-400" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* DOUBLE BACK TO EXIT NOTIFICATION TOAST */}
      <AnimatePresence>
        {showExitToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-[#0B0D17]/95 border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Press Back again to exit ChessZen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
