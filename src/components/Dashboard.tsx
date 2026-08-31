import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, Zap, Award, Sparkles, BookOpen, Clock, PlayCircle, ChevronRight, 
  CheckCircle2, TrendingUp, Cpu, Volume2, RefreshCw, Calendar, Target, Swords, ShieldAlert, Users
} from "lucide-react";
import { UserProfile, Achievement, GameModeKey, DEFAULT_RATINGS } from "../types";
import { RatingCardsSection } from "./RatingCardsSection";

interface DashboardProps {
  profile: UserProfile;
  achievements: Achievement[];
  onNavigate: (tab: any, extraData?: any) => void;
  onClaimDailyReward: () => void;
  dailyRewardClaimed: boolean;
  onSelectModePlay?: (mode: GameModeKey) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  achievements,
  onNavigate,
  onClaimDailyReward,
  dailyRewardClaimed,
  onSelectModePlay
}) => {
  useEffect(() => {
    console.log("[GoogleAuth] Dashboard mounted");
  }, []);

  const [loadingCoachTip, setLoadingCoachTip] = useState(false);
  const [coachTip, setCoachTip] = useState<string>(
    "Develop your knights and bishops toward the center before launching a wing attack. Castling early is the best way to safeguard your King!"
  );

  const fetchNewCoachTip = async () => {
    setLoadingCoachTip(true);
    try {
      const response = await fetch("/api/coach/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 3",
          move: "Nf3",
          history: ["e4", "e5", "Nf3"],
          rating: profile.elo
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setCoachTip(data.explanation);
      }
    } catch (err) {
      console.error("Error fetching coach tip", err);
    } finally {
      setLoadingCoachTip(false);
    }
  };

  const nextLevelXp = profile.level * 500;
  const progressPercent = Math.min(100, Math.floor((profile.xp / nextLevelXp) * 100));
  const completedCount = achievements.filter(a => a.completed).length;

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100 pb-16">
      
      {/* SECTION 1: Daily Learning & Quick Statistics */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-[#0e1626] to-slate-900 p-6 text-white shadow-xl border border-slate-800/80">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                Level {profile.level}
              </span>
              <span className="text-slate-400 font-bold text-xs font-mono">• Daily Learning Focus</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3.5xl font-display text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{profile.username}</span>!
            </h1>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Experience personalized daily lessons, tactical exercises, and tailored AI suggestions designed to unlock grandmaster foresight.
            </p>

            {/* XP progress bar */}
            <div className="pt-2 w-full max-w-sm">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono font-bold">
                <span>XP PROGRESS: {profile.xp} / {nextLevelXp} XP</span>
                <span>{progressPercent}% TO LVL {profile.level + 1}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800/80 p-[2px] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/60 shrink-0">
            <div className="text-center px-2 py-1">
              <div className="flex justify-center text-amber-400 mb-1">
                <Swords className="h-5 w-5" />
              </div>
              <div className="text-lg font-black font-mono text-slate-50">{profile.gamesPlayed || 0}</div>
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Matches</div>
            </div>
            <div className="text-center px-2 py-1">
              <div className="flex justify-center text-yellow-500 mb-1">
                <Trophy className="h-5 w-5 fill-current" />
              </div>
              <div className="text-lg font-black font-mono text-slate-50">{profile.elo}</div>
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Coach ELO</div>
            </div>
            <div className="text-center px-2 py-1">
              <div className="flex justify-center text-emerald-400 mb-1">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="text-lg font-black font-mono text-slate-50">{profile.puzzleElo}</div>
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Puzzle ELO</div>
            </div>
            <div className="text-center px-2 py-1">
              <div className="flex justify-center text-indigo-400 mb-1">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-lg font-black font-mono text-slate-50">{profile.coins}</div>
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Gold Coins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Game Mode Ratings Cards Section */}
      <RatingCardsSection
        ratings={profile.ratings || DEFAULT_RATINGS}
        modeStats={profile.modeStats}
        onSelectModePlay={(mode) => {
          if (onSelectModePlay) {
            onSelectModePlay(mode);
          } else {
            onNavigate("play", { mode });
          }
        }}
      />

      {/* Daily Reward claim row */}
      {!dailyRewardClaimed && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 dark:text-emerald-200 gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald-400 fill-current animate-bounce" />
            <div className="text-center sm:text-left">
              <div className="text-sm font-bold text-white">Daily Learning Chest Available!</div>
              <div className="text-xs text-slate-400">Claim your active scholar gold coins bonus and XP multipliers.</div>
            </div>
          </div>
          <button 
            onClick={onClaimDailyReward}
            className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-slate-900 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
          >
            Claim Reward
          </button>
        </div>
      )}

      {/* SECTION 2: Continue Learning, Today's Puzzle, Tournament Arena, and Play with Friends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card A: Continue Learning */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Interactive Curriculum</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-display">Continue Learning</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step back into your chess training path. Next up: <strong>Tactical Pins & Back Rank Defenses</strong>.
            </p>
          </div>
          <button 
            onClick={() => onNavigate("learning_path")}
            className="mt-4 w-full rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            Resume Lesson <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card B: Today's Tactical Puzzle */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tactical Exercise</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-display">Today's Daily Puzzle</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Spot the devastating double-threat knight jump to compromise the back row in 1 move.
            </p>
          </div>
          <button 
            onClick={() => onNavigate("puzzles")}
            className="mt-4 w-full rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            Solve Puzzle <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card C: Tournament Banner (Arena) */}
        <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-950 p-5 shadow-sm dark:border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Live Competitive Arena</span>
            </div>
            <h3 className="text-base font-extrabold text-white font-display">Tournament Arena</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Join active rapid tournaments against real-time local chess software bots and gain arena points!
            </p>
          </div>
          <button 
            onClick={() => onNavigate("arena")}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            Enter Arena <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card D: Play with Friends */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#0F1222] to-[#14182E] p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Multiplayer Mode</span>
            </div>
            <h3 className="text-base font-extrabold text-white font-display">Play with Friends</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Search friends by username, send challenge requests, and play real-time matches!
            </p>
          </div>
          <button 
            onClick={() => onNavigate("play_with_friends")}
            className="mt-4 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
          >
            Challenge Friends <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* SECTION 3: AI Coach & Performance Progress charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column A: AI Coach advice panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">AI Coach Advisor</h2>
              </div>
              <button 
                onClick={fetchNewCoachTip}
                disabled={loadingCoachTip}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-900 border border-emerald-200 dark:border-emerald-800/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${loadingCoachTip ? "animate-spin" : ""}`} />
                {loadingCoachTip ? "Thinking..." : "New Tip"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/40 dark:border-slate-800/60 relative">
              <div className="absolute top-2 right-2 flex gap-1">
                <Volume2 
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(coachTip.replace(/[#*`-]/g, ""));
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" 
                />
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic whitespace-pre-line">
                "{coachTip}"
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono">
                <span>Grandmaster Chess AI Coach</span>
                <span>•</span>
                <span className="text-emerald-500">Active</span>
              </div>
            </div>

            {/* Direct Repertoire Shortcut row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <button 
                onClick={() => onNavigate("chessboard")} 
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 hover:border-emerald-500/20 text-center transition-all cursor-pointer group"
              >
                <PlayCircle className="h-6 w-6 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Play Against AI</span>
              </button>
              <button 
                onClick={() => onNavigate("openings")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 hover:border-indigo-500/20 text-center transition-all cursor-pointer group"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform leading-none">📖</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Opening Explorer</span>
              </button>
              <button 
                onClick={() => onNavigate("gambits")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 hover:border-rose-500/20 text-center transition-all cursor-pointer group"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform leading-none">⚔️</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gambits Library</span>
              </button>
              <button 
                onClick={() => onNavigate("traps")}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 hover:border-amber-500/20 text-center transition-all cursor-pointer group"
              >
                <span className="text-xl mb-1 group-hover:scale-110 transition-transform leading-none">🎯</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tactical Traps</span>
              </button>
            </div>
          </div>

          {/* Performance chart dynamically rendered with SVGs */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white font-display">Rating & Practice Progress</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold font-mono">
                  <span>ELO PERFORMANCE RATING HISTORIC</span>
                  <span className="text-emerald-500 font-bold font-mono">+45 ELO THIS WEEK</span>
                </div>
                {/* SVG Graph */}
                <div className="h-32 w-full bg-slate-50 dark:bg-slate-950/80 rounded-xl p-2 relative border border-slate-200/50 dark:border-slate-800/60 flex items-end justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute left-0 right-0 top-1/4 border-t border-slate-200/40 dark:border-slate-800/30 text-[8px] pl-1 text-slate-400 font-mono">1300</div>
                  <div className="absolute left-0 right-0 top-2/4 border-t border-slate-200/40 dark:border-slate-800/30 text-[8px] pl-1 text-slate-400 font-mono">1200</div>
                  <div className="absolute left-0 right-0 top-3/4 border-t border-slate-200/40 dark:border-slate-800/30 text-[8px] pl-1 text-slate-400 font-mono">1100</div>

                  <svg className="absolute inset-x-0 bottom-0 w-full h-[70%]" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path 
                      d="M 5,90 Q 20,75 35,80 T 65,40 T 95,20" 
                      fill="none" 
                      stroke="url(#chart-glow-dash)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 5,90 Q 20,75 35,80 T 65,40 T 95,20 L 95,100 L 5,100 Z" 
                      fill="url(#chart-gradient-dash)" 
                      opacity="0.1" 
                    />
                    <defs>
                      <linearGradient id="chart-glow-dash" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="chart-gradient-dash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="w-full flex justify-between px-4 relative z-10 text-[9px] text-slate-400 font-mono pt-4 font-semibold">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Skill indices */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">Skill Index</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                      <span>Tactical Vision</span>
                      <span className="text-emerald-500 font-bold">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                      <span>Opening Tactics</span>
                      <span className="text-amber-500 font-bold">54%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "54%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                      <span>Midgame Evaluation</span>
                      <span className="text-indigo-500 font-bold">70%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column B: Objectives & Achievements Shelf */}
        <div className="space-y-6">
          {/* Daily Objectives checklists */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4.5 w-4.5 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase font-mono">Daily Objectives</h2>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <input type="checkbox" checked={(profile.lastActivityDate || profile.lastActiveDate) === new Date().toISOString().split("T")[0]} readOnly className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Daily Attendance Chest</div>
                  <div className="text-[10px] text-slate-400">Claim gold coins and daily XP bonus</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" checked={false} readOnly className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Defeat AI Coach (1 Game)</div>
                  <div className="text-[10px] text-slate-400">Apply tactical opening principles against AI</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <input type="checkbox" checked={false} readOnly className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Explore Chess Gambits</div>
                  <div className="text-[10px] text-slate-400">Master Evans, King's, or Queen's Gambit lines</div>
                </div>
              </div>
            </div>
          </div>

          {/* Unlocked Badges Shelf */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:bg-[#0e1626]/60 dark:backdrop-blur-md dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase font-mono">Recent Activity Badges</h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500">Active</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/40">
                <span className="text-2xl block mb-1">🏆</span>
                <span className="text-[9px] font-bold text-slate-800 dark:text-slate-100 leading-none">First Win</span>
              </div>
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/40 ${(profile.puzzlesSolved || profile.puzzleStats?.solved || 0) > 0 ? '' : 'opacity-40'}`}>
                <span className="text-2xl block mb-1">🎯</span>
                <span className="text-[9px] font-bold text-slate-800 dark:text-slate-100 leading-none">
                  {(profile.puzzlesSolved || profile.puzzleStats?.solved || 0) > 0 ? `${profile.puzzlesSolved || profile.puzzleStats?.solved} Tactics` : 'Tactician'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/40 opacity-40">
                <span className="text-2xl block mb-1 grayscale">♟️</span>
                <span className="text-[9px] font-bold text-slate-800 dark:text-slate-100 leading-none">Grandmaster</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: Recommended Lessons (Bento-Style Cards) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black tracking-tight font-display text-slate-900 dark:text-white">Recommended Lesson Curriculums</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => onNavigate("learning_path")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-850 hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center font-bold font-mono text-xs">01</div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-emerald-400 transition-colors">Beginner Foundations</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Master standard piece values, checks, checkmates, and early structural safety.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("learning_path")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-100/50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center font-bold font-mono text-xs">02</div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-indigo-400 transition-colors">Intermediate Strategy</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Analyze pins, skewers, forks, structural pawn weak points, and open-file controls.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate("learning_path")}
            className="p-5 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-850 hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-100/50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center font-bold font-mono text-xs">03</div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white group-hover:text-purple-400 transition-colors">Advanced Foresight</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Deep dive endgame key square control, complex sacrifices, and grandmaster openings.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
