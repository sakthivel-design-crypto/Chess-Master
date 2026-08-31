import React, { useState, useEffect } from "react";
import { 
  User, Mail, Shield, Award, Sparkles, LogOut, Check, RefreshCw, KeyRound, Globe, 
  ChevronDown, Bell, Eye, HelpCircle, Info, Heart, Trophy, Flame, Zap, ShieldAlert,
  Swords, BarChart2, Clock, CheckCircle2, Camera, Palette, Layers, Image as ImageIcon,
  Target
} from "lucide-react";
import { UserProfile, Achievement, DEFAULT_RATINGS } from "../types";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { RatingCardsSection } from "./RatingCardsSection";
import { MatchHistorySection } from "./MatchHistorySection";
import { UserAvatar } from "./UserAvatar";
import { ProfilePictureModal } from "./ProfilePictureModal";
import { BoardThemeSelector } from "./BoardThemeSelector";
import { navigationManager } from "../utils/navigationManager";

interface ProfileAuthProps {
  profile: UserProfile;
  achievements: Achievement[];
  onUpdateUsername: (newName: string) => void;
  onUpdateProfilePicture?: (newImageUrl: string | null) => void;
  onUpdateThemeSettings?: (boardTheme: string, pieceStyle: string) => void;
  onLogout: () => void;
  onSelectModePlay?: (mode: any) => void;
  onAnalyzeMatch?: (match: any) => void;
}

export const ProfileAuth: React.FC<ProfileAuthProps> = ({
  profile,
  achievements,
  onUpdateUsername,
  onUpdateProfilePicture,
  onUpdateThemeSettings,
  onLogout,
  onSelectModePlay,
  onAnalyzeMatch
}) => {
  const [editingName, setEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // Profile Picture Modal state
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);

  // Profile accordion states
  const [activeAccordion, setActiveAccordion] = useState<string | null>("personalization");

  // Settings mock states
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyLessons, setNotifyLessons] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [language, setLanguage] = useState("English");

  // State for Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Register Back Handler for Profile modals & editing
  useEffect(() => {
    const unregister = navigationManager.registerHandler({
      id: "profile-auth-modals",
      priority: 95,
      handleBack: () => {
        if (isPicModalOpen) {
          setIsPicModalOpen(false);
          return true;
        }
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false);
          return true;
        }
        if (editingName) {
          setEditingName(false);
          return true;
        }
        return false;
      }
    });
    return unregister;
  }, [isPicModalOpen, showLogoutConfirm, editingName]);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleSaveUsername = () => {
    if (!usernameInput.trim()) return;
    onUpdateUsername(usernameInput.trim());
    setEditingName(false);
    confetti({ particleCount: 20, spread: 20 });
  };

  const handleTriggerSync = () => {
    setSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      setSyncing(false);
      setSyncDone(true);
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ["#10b981", "#6366f1"]
      });
      setTimeout(() => setSyncDone(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-slate-900 dark:text-slate-100">
      
      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isPicModalOpen}
        onClose={() => setIsPicModalOpen(false)}
        currentImage={profile.profileImageUrl || profile.profilePicture}
        username={profile.username}
        onSaveImage={(newUrl) => {
          if (onUpdateProfilePicture) {
            onUpdateProfilePicture(newUrl);
          }
        }}
      />

      {/* 1. Header Profile Picture and Name card */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 shadow-xl border border-amber-500/20">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-32 w-32 rounded-full bg-yellow-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Avatar Picture with Change Button */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              <UserAvatar
                src={profile.profileImageUrl || profile.profilePicture}
                username={profile.username}
                size="2xl"
                showBadge
                onClick={() => setIsPicModalOpen(true)}
              />
              <button
                onClick={() => setIsPicModalOpen(true)}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-300 font-bold text-xs gap-1 cursor-pointer"
              >
                <Camera className="h-4 w-4" /> Edit
              </button>
            </div>

            <button
              onClick={() => setIsPicModalOpen(true)}
              className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30"
            >
              <Camera className="h-3 w-3" /> Change Profile Picture
            </button>
          </div>

          {/* Details Block */}
          <div className="space-y-3 flex-1 text-center md:text-left min-w-0">
            <div className="space-y-1">
              {editingName ? (
                <div className="flex gap-2 items-center justify-center md:justify-start">
                  <input 
                    type="text" 
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="rounded-xl border border-amber-500/30 px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-[#0B0D17] text-white max-w-[200px]"
                  />
                  <button 
                    onClick={handleSaveUsername}
                    className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white font-serif">
                    {profile.username}
                  </h2>
                  <button 
                    onClick={() => setEditingName(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-xs text-amber-200/60 font-semibold font-mono">{profile.email}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                ⭐ Verified Player
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-0.5 text-xs font-bold text-yellow-300 font-serif">
                LVL {profile.level}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 text-slate-950 text-xs font-bold font-serif rounded-xl inline-flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : syncDone ? "✓ Cloud Synced!" : "Backup Progress"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Official Mode Ratings Section */}
      <RatingCardsSection
        ratings={profile.ratings || DEFAULT_RATINGS}
        modeStats={profile.modeStats}
        onSelectModePlay={onSelectModePlay}
      />

      {/* Auxiliary Stats Block (Games Played, Win Rate, Streaks) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <Swords className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-50">
            {profile.gamesPlayed || profile.matchHistory?.length || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matches Played</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <Trophy className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-xl font-black font-mono text-emerald-400">
            {profile.wins || profile.matchHistory?.filter(m => m.result === "win").length || 0}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Victories</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <Target className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-50">{profile.puzzlesSolved || profile.puzzleStats?.solved || 0}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tactics Solved</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1626]/40 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-50">{profile.coins}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Zen Gold Coins</div>
        </div>
      </div>

      {/* Match History Section */}
      <MatchHistorySection 
        matchHistory={profile.matchHistory || []} 
        onAnalyzeMatch={onAnalyzeMatch}
      />

      {/* 3. Favorite Openings / Gambits / Traps Panel */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1626]/50 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Heart className="h-5 w-5 text-rose-500 fill-current" />
          <h3 className="font-extrabold text-slate-800 dark:text-white font-display">Favorite Strategy Repertoire</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 space-y-1">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">FAVORITE OPENING</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">Sicilian Defense</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Sharp counter-attacking tactical weapon.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 space-y-1">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">FAVORITE GAMBIT</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">Evans Gambit</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Sacrifice queenside pawn to command center.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">FAVORITE TRAP</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">Siberian Trap</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Punish early Nf3 in the Queen's Gambit.</p>
          </div>
        </div>
      </div>

      {/* 4. Collapsible Personalization & Account Settings / Notifications / Privacy / Help / About panels */}
      <div className="space-y-4">
        
        {/* Accordion 0: PERSONALIZATION STUDIO (Chess Board Themes & Piece Styles) */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0e1626]/80 to-[#0B0D17] overflow-hidden shadow-2xl">
          <button 
            onClick={() => toggleAccordion("personalization")}
            className="w-full flex items-center justify-between p-5 font-bold text-base text-amber-300 cursor-pointer hover:bg-amber-500/5 transition-colors"
          >
            <div className="flex items-center gap-3 font-serif">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Palette className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-white font-extrabold">PERSONALIZATION STUDIO</div>
                <div className="text-xs text-amber-200/60 font-sans font-normal">Chess Board Themes, Piece Styles & Avatars</div>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-amber-400 transition-transform duration-300 ${activeAccordion === "personalization" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "personalization" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-amber-500/20 p-5 space-y-6 bg-slate-950/40"
              >
                {/* Profile Picture Quick Action */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={profile.profileImageUrl || profile.profilePicture}
                      username={profile.username}
                      size="lg"
                    />
                    <div>
                      <div className="font-bold text-sm text-white font-serif">Personal Avatar</div>
                      <div className="text-xs text-slate-400">Upload JPG/PNG, take photo, or pick preset avatar</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPicModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:brightness-110 flex items-center gap-1.5"
                  >
                    <Camera className="h-4 w-4" /> Change Profile Picture
                  </button>
                </div>

                {/* Board Theme Selector */}
                <BoardThemeSelector
                  currentBoardTheme={profile.settings?.boardTheme}
                  currentPieceStyle={profile.settings?.pieceStyle}
                  onSelectTheme={(boardThemeId, pieceStyleId) => {
                    if (onUpdateThemeSettings) {
                      onUpdateThemeSettings(boardThemeId, pieceStyleId || "classic");
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 1: Account Settings */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/40 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleAccordion("account")}
            className="w-full flex items-center justify-between p-4 font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="h-4 w-4 text-emerald-500" />
              <span>Account Settings & Personalization</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "account" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "account" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/20"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Select App Language</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="English">English (US)</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Chessboard Theme Quick-Select</label>
                    <select 
                      value={profile.settings?.boardTheme || "classic_wood"}
                      onChange={(e) => {
                        if (onUpdateThemeSettings) {
                          onUpdateThemeSettings(e.target.value, profile.settings?.pieceStyle || "classic");
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="classic_wood">Classic Wood</option>
                      <option value="midnight_blue">Midnight Blue</option>
                      <option value="emerald_forest">Emerald Forest</option>
                      <option value="royal_gold">Royal Gold</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Notifications */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/40 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleAccordion("notifications")}
            className="w-full flex items-center justify-between p-4 font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-amber-500" />
              <span>Notifications Preferences</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "notifications" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "notifications" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/20"
              >
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Daily Training Objectives</div>
                    <div className="text-[10px] text-slate-400">Receive reminders for daily tactical puzzles & objectives.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifyLessons} 
                    onChange={(e) => setNotifyLessons(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Weekly Tournament Match Alerts</div>
                    <div className="text-[10px] text-slate-400">Notify me when rapid tournament pairings open.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifyMatches} 
                    onChange={(e) => setNotifyMatches(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Privacy */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/40 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleAccordion("privacy")}
            className="w-full flex items-center justify-between p-4 font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Eye className="h-4 w-4 text-indigo-400" />
              <span>Privacy & Security Boundaries</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "privacy" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "privacy" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/20"
              >
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Incognito Profile Setting</div>
                    <div className="text-[10px] text-slate-400">Hide my weekly puzzle ratings from public tournament leaderboards.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isPrivate} 
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 4: Help & Support */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/40 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleAccordion("help")}
            className="w-full flex items-center justify-between p-4 font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-rose-400" />
              <span>Help & Support Center</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "help" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "help" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 dark:text-white">Frequently Answered Questions:</div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Q: How is my rating updated?</span><br />
                    <span>A: Solving tactical puzzles updates your Puzzle ELO. Practicing against the AI Engine adjusts your Coach ELO.</span>
                  </div>
                  <div className="border-t border-slate-150 dark:border-slate-800/60 pt-2">
                    <span className="font-semibold text-slate-900 dark:text-white">Q: What happens to my progress when logging out?</span><br />
                    <span>A: Your profile, study planner logs, and gold coin history are cached locally in this secure sandboxed environment.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 5: About ChessZen */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/40 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleAccordion("about")}
            className="w-full flex items-center justify-between p-4 font-bold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Info className="h-4 w-4 text-blue-400" />
              <span>About ChessZen Platform</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeAccordion === "about" ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence initial={false}>
            {activeAccordion === "about" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-2 text-xs bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 leading-relaxed"
              >
                <p>
                  <strong>ChessZen v2.5.0</strong> is an intelligent virtual training arena designed to accelerate positional evaluation, opening theory proficiency, and sharp tactical foresight.
                </p>
                <p>
                  Powered by customized deep analysis models and client-side chess heuristics to deliver responsive, seamless play on any screen size.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 5. Danger Settings - LARGE RED Logout BUTTON */}
      <div className="rounded-3xl border border-red-200 bg-red-500/5 p-6 dark:border-red-950/30 dark:bg-red-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-red-500 font-display">Sign Out of Session</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exit ChessZen AI player dashboard. Your local practice progress remains safely stored in this sandbox!
          </p>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/10"
        >
          <LogOut className="h-4 w-4" /> 🚪 Logout
        </button>
      </div>

      {/* Logout Confirmation Dialog Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-5 shadow-2xl relative"
            >
              <div className="flex gap-3 items-start">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-display">Confirm Logout</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Are you sure you want to logout? This will sign out from the current local session.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-xs font-bold pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/15"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
