import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Flame,
  Clock,
  Crown,
  Swords,
  Shield,
  Target,
  Trophy,
  Settings,
  X,
  Play,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Bot,
  Sliders,
  Check,
  Info,
  AlertCircle
} from "lucide-react";
import { GameModeKey, ModeRatings, TimeControlConfig, GAME_MODES, GameModeConfig } from "../types";
import { AI_PROFILES, AiRatingLevel } from "../utils/aiMoveEngine";
import { getCurrentPlayerColor, getGameColorSequenceIndex } from "../utils/gameColorManager";
import { navigationManager } from "../utils/navigationManager";

interface GameModeSelectorProps {
  ratings: ModeRatings;
  defaultMode?: GameModeKey;
  initialStep?: "format" | "time_control";
  onStartGame: (
    mode: GameModeKey,
    timeControl: TimeControlConfig,
    difficulty: string,
    botElo: number,
    chosenColor?: "w" | "b" | "random" | "alternate",
    personality?: string
  ) => void;
  onCancel?: () => void;
  isStandalone?: boolean;
}

export type AiPersonalityType =
  | "Aggressive"
  | "Defensive"
  | "Positional"
  | "Tactical"
  | "Endgame Expert";

const PERSONALITIES: { type: AiPersonalityType; icon: any; label: string; desc: string }[] = [
  { type: "Tactical", icon: Swords, label: "Tactical", desc: "Calculates sharp tactics, forks, and mating combinations" },
  { type: "Aggressive", icon: Zap, label: "Aggressive", desc: "Pushes pawns and sacrifices for sharp king attacks" },
  { type: "Defensive", icon: Shield, label: "Defensive", desc: "Solid, impenetrable pawn structure and stubborn defense" },
  { type: "Positional", icon: Target, label: "Positional", desc: "Squeeze out small edges, piece activity, and pawn control" },
  { type: "Endgame Expert", icon: Trophy, label: "Endgame Expert", desc: "Flawless endgame technique, king activity, and pawn promotion" }
];

const RECENT_TC_STORAGE_KEY = "chesszen_recent_time_control";

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  ratings,
  defaultMode = "blitz",
  initialStep = "format",
  onStartGame,
  onCancel,
  isStandalone = false
}) => {
  // Step 1: Format Selection ("format") -> Step 2: Time Control Selection ("time_control")
  const [currentStep, setCurrentStep] = useState<"format" | "time_control">(initialStep);
  const [selectedModeKey, setSelectedModeKey] = useState<GameModeKey>(defaultMode);

  // Selected time control (index or "custom")
  const [selectedTcIndex, setSelectedTcIndex] = useState<number | "custom">(0);

  // Custom Time Control state
  const [customMinutes, setCustomMinutes] = useState<number>(7);
  const [customIncrement, setCustomIncrement] = useState<number>(5);
  const [customError, setCustomError] = useState<string | null>(null);

  // AI & Match settings
  const [selectedBotRating, setSelectedBotRating] = useState<AiRatingLevel>(1200);
  const [selectedColor, setSelectedColor] = useState<"w" | "b" | "random" | "alternate">("alternate");
  const [selectedPersonality, setSelectedPersonality] = useState<AiPersonalityType>("Tactical");

  // Read recently used time control from localStorage
  const [recentTimeControl, setRecentTimeControl] = useState<{ mode: GameModeKey; label: string } | null>(() => {
    try {
      const saved = localStorage.getItem(RECENT_TC_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const activeModeConfig: GameModeConfig = GAME_MODES.find((m) => m.key === selectedModeKey) || GAME_MODES[1];
  const upcomingColor = getCurrentPlayerColor();
  const sequenceGameNum = getGameColorSequenceIndex() + 1;
  const selectedBotProfile = AI_PROFILES[selectedBotRating] || AI_PROFILES[1200];

  // If defaultMode changes from outside (e.g. from Dashboard click), switch to it
  useEffect(() => {
    if (defaultMode) {
      setSelectedModeKey(defaultMode);
      if (initialStep === "time_control") {
        setCurrentStep("time_control");
      }
    }
  }, [defaultMode, initialStep]);

  // Validate custom time controls
  useEffect(() => {
    if (selectedTcIndex === "custom") {
      if (isNaN(customMinutes) || customMinutes <= 0) {
        setCustomError("Base time must be at least 1 minute.");
      } else if (customMinutes > 180) {
        setCustomError("Base time cannot exceed 180 minutes.");
      } else if (isNaN(customIncrement) || customIncrement < 0) {
        setCustomError("Increment cannot be negative.");
      } else if (customIncrement > 60) {
        setCustomError("Increment cannot exceed 60 seconds.");
      } else {
        setCustomError(null);
      }
    } else {
      setCustomError(null);
    }
  }, [customMinutes, customIncrement, selectedTcIndex]);

  // Back button registration with centralized navigation manager
  useEffect(() => {
    const unregister = navigationManager.registerHandler({
      id: "game-mode-selector-back",
      priority: 85,
      handleBack: () => {
        if (currentStep === "time_control") {
          // If on time control screen, go back to format selection
          setCurrentStep("format");
          return true;
        }
        if (onCancel) {
          onCancel();
          return true;
        }
        return false;
      }
    });
    return unregister;
  }, [currentStep, onCancel]);

  // Determine active time control configuration
  const getActiveTimeControl = (): TimeControlConfig | null => {
    if (selectedTcIndex === "custom") {
      if (customError || customMinutes <= 0) return null;
      return {
        label: `${customMinutes}+${customIncrement}`,
        initialSeconds: customMinutes * 60,
        incrementSeconds: customIncrement,
        description: `${customMinutes} min • ${customIncrement}s increment`,
        tag: "Custom"
      };
    }
    return activeModeConfig.timeControls[selectedTcIndex] || null;
  };

  const activeTc = getActiveTimeControl();
  const isStartGameDisabled = !activeTc || (selectedTcIndex === "custom" && !!customError);

  // Handle format tap: do NOT start game directly, transition to time control selection!
  const handleFormatSelect = (modeKey: GameModeKey) => {
    setSelectedModeKey(modeKey);
    const modeConfig = GAME_MODES.find((m) => m.key === modeKey) || GAME_MODES[1];

    // If recently used matches this mode, highlight that TC index, else default to index 0 (or index 1 for Blitz 3+2)
    if (recentTimeControl && recentTimeControl.mode === modeKey) {
      const matchIdx = modeConfig.timeControls.findIndex((tc) => tc.label === recentTimeControl.label);
      if (matchIdx >= 0) {
        setSelectedTcIndex(matchIdx);
      } else {
        setSelectedTcIndex(0);
      }
    } else {
      // Default to index 0 or popular index
      const popularIdx = modeConfig.timeControls.findIndex((tc) => tc.tag === "Popular" || tc.tag === "Balanced");
      setSelectedTcIndex(popularIdx >= 0 ? popularIdx : 0);
    }

    setCurrentStep("time_control");
  };

  // Launch the game with verified parameters
  const handleConfirmStart = () => {
    const finalTc = getActiveTimeControl();
    if (!finalTc) return;

    // Persist user's recently selected time control
    try {
      const recentData = { mode: selectedModeKey, label: finalTc.label };
      localStorage.setItem(RECENT_TC_STORAGE_KEY, JSON.stringify(recentData));
      setRecentTimeControl(recentData);
    } catch {
      // ignore
    }

    onStartGame(
      selectedModeKey,
      finalTc,
      selectedBotProfile.title,
      selectedBotRating,
      selectedColor,
      selectedPersonality
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-5 text-slate-100 font-sans select-none ${isStandalone ? "py-2" : "pb-6"}`}>
      {/* ─────────────────────────────────────────────────────────────
          STAGE 1: GAME FORMAT SELECTION (Bullet, Blitz, Rapid, Classical)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === "format" && (
        <motion.div
          key="step-format"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 p-5 md:p-6 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                  Play Against AI
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Step 1 of 2: Select Format
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
                Choose Game Format
              </h2>
              <p className="text-xs md:text-sm text-slate-300">
                Select a game mode to view available time controls.
              </p>
            </div>

            {onCancel && (
              <button
                id="format-selector-close-btn"
                onClick={onCancel}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-md relative z-10"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* 4 MAIN FORMAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GAME_MODES.map((mode) => {
              const currentRating = ratings ? ratings[mode.key] || 1200 : 1200;
              const isRecentMode = recentTimeControl?.mode === mode.key;

              return (
                <motion.div
                  key={mode.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFormatSelect(mode.key)}
                  id={`mode-card-${mode.key}`}
                  className={`group relative overflow-hidden rounded-3xl p-5 md:p-6 transition-all duration-300 border bg-slate-900/80 backdrop-blur-xl hover:bg-slate-900 cursor-pointer shadow-xl hover:shadow-2xl ${mode.borderClass}`}
                >
                  {/* Subtle Background Glow */}
                  <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${mode.bgClass} blur-2xl group-hover:scale-150 transition-transform pointer-events-none`} />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    {/* Header: Icon, Badge & Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${mode.bgClass} ${mode.textClass} border ${mode.borderClass} shadow-inner group-hover:scale-105 transition-transform`}>
                          <span>{mode.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                              {mode.key.toUpperCase()}
                            </span>
                            {isRecentMode && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300">
                                Recently Used
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-extrabold font-display text-white group-hover:text-amber-300 transition-colors">
                            {mode.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 font-medium">
                      {mode.description}
                    </p>

                    {/* Time Controls Preview Pills */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mode.timeControls.map((tc) => (
                          <span
                            key={tc.label}
                            className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono font-bold text-slate-300 group-hover:border-amber-500/30 transition-colors"
                          >
                            {tc.label}
                          </span>
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block leading-none">Rating</span>
                        <span className="text-sm font-black font-mono text-amber-400">{currentRating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 2: TIME CONTROL SELECTION & CONFIRMATION
          ───────────────────────────────────────────────────────────── */}
      {currentStep === "time_control" && (
        <motion.div
          key="step-time-control"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Top Bar with Back button & Format Title */}
          <div className="bg-slate-900/90 border border-amber-500/30 p-4 md:p-5 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-3">
              <button
                id="tc-back-to-format-btn"
                onClick={() => setCurrentStep("format")}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Formats</span>
              </button>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1">
                    <span>{activeModeConfig.icon}</span>
                    <span>{activeModeConfig.name}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Rating: <strong className="text-amber-400">{ratings[activeModeConfig.key] || 1200} Elo</strong>
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white font-display tracking-tight uppercase">
                  Choose {activeModeConfig.name} Time Control
                </h2>
              </div>
            </div>

            {onCancel && (
              <button
                id="tc-selector-close-btn"
                onClick={onCancel}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* TIME CONTROL SELECTABLE CARDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Available Time Settings</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Tap card to select
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeModeConfig.timeControls.map((tc, idx) => {
                const isSelected = selectedTcIndex === idx;
                const isRecentlyUsed = recentTimeControl?.mode === activeModeConfig.key && recentTimeControl.label === tc.label;

                return (
                  <motion.button
                    key={tc.label}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTcIndex(idx)}
                    id={`tc-card-${tc.label}`}
                    className={`relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer border backdrop-blur-md overflow-hidden ${
                      isSelected
                        ? "bg-slate-900 border-emerald-400/80 ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-500/10"
                        : "bg-slate-900/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-850"
                    }`}
                  >
                    {/* Header of TC card */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xl font-mono font-black text-white tracking-wide">
                        {tc.label}
                      </span>

                      {isSelected ? (
                        <div className="p-1 rounded-full bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/40">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      ) : isRecentlyUsed ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-300">
                          Recent
                        </span>
                      ) : tc.tag ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
                          {tc.tag}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      {tc.description || `${tc.initialSeconds / 60} min + ${tc.incrementSeconds}s increment`}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Base: {tc.initialSeconds / 60}m</span>
                      <span>Inc: +{tc.incrementSeconds}s</span>
                    </div>
                  </motion.button>
                );
              })}

              {/* ⚙ CUSTOM TIME CONTROL CARD */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTcIndex("custom")}
                id="tc-card-custom"
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer border backdrop-blur-md overflow-hidden ${
                  selectedTcIndex === "custom"
                    ? "bg-slate-900 border-cyan-400/80 ring-2 ring-cyan-400/60 shadow-xl shadow-cyan-500/10"
                    : "bg-slate-900/70 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <span className="text-lg font-mono font-black text-cyan-300">
                      CUSTOM
                    </span>
                  </div>

                  {selectedTcIndex === "custom" && (
                    <div className="p-1 rounded-full bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/40">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {selectedTcIndex === "custom" ? `${customMinutes}m + ${customIncrement}s setup` : "Set base time & increment"}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>Custom Clocks</span>
                  <span>⚙ Config</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* CUSTOM TIME CONTROL INPUTS (Only visible when Custom is selected) */}
          <AnimatePresence>
            {selectedTcIndex === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-950/80 border border-cyan-500/30 p-5 rounded-2xl space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span>Configure Custom Time Control</span>
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Preview: <strong className="text-cyan-300 font-black">{customMinutes} + {customIncrement}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Base Time Minutes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                      <span>Base Time (Minutes):</span>
                      <span className="text-cyan-400 font-black">{customMinutes} min</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                        id="custom-minutes-input"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="e.g. 7"
                      />
                      <div className="flex gap-1">
                        {[1, 3, 5, 10, 15, 30].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCustomMinutes(m)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300"
                          >
                            {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Increment Seconds */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                      <span>Increment per move (Seconds):</span>
                      <span className="text-cyan-400 font-black">{customIncrement} sec</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customIncrement}
                        onChange={(e) => setCustomIncrement(parseInt(e.target.value) || 0)}
                        id="custom-increment-input"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="e.g. 5"
                      />
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 5, 10].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCustomIncrement(s)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300"
                          >
                            +{s}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {customError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{customError}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI OPPONENT & MATCH CONFIGURATION */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-5">
            {/* AI Opponent Rating */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-amber-400" />
                  <span>AI Opponent Strength</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {selectedBotProfile.rating} Elo • {selectedBotProfile.name} ({selectedBotProfile.title})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {([200, 400, 800, 1200, 1600, 2000, 2400] as AiRatingLevel[]).map((ratingNum) => {
                  const bot = AI_PROFILES[ratingNum];
                  const isBotSelected = selectedBotRating === ratingNum;

                  return (
                    <button
                      key={ratingNum}
                      type="button"
                      onClick={() => setSelectedBotRating(ratingNum)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isBotSelected
                          ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400 shadow-md font-bold"
                          : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-base mb-0.5">{bot.avatar}</div>
                      <div className="text-[11px] font-bold font-display truncate text-white">{bot.name}</div>
                      <div className="text-[10px] font-mono text-amber-400">{bot.rating}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player Color & AI Personality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Color Selection */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Your Color:
                  </label>
                  <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Next: {upcomingColor === "w" ? "White ♔" : "Black ♚"} (Match #{sequenceGameNum})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedColor("alternate")}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedColor === "alternate"
                        ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 font-bold shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />
                      <span className="text-[10px] text-amber-400">⇄</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
                    </div>
                    <span className="text-[10px] font-bold">Alternate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedColor("w")}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedColor === "w"
                        ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 font-bold shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-300" />
                    <span className="text-[10px] font-bold">White</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedColor("b")}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedColor === "b"
                        ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 font-bold shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700" />
                    <span className="text-[10px] font-bold">Black</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedColor("random")}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedColor === "random"
                        ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 font-bold shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold">Random</span>
                  </button>
                </div>
              </div>

              {/* Bot Personality */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Bot Personality:
                </label>
                <select
                  value={selectedPersonality}
                  onChange={(e) => setSelectedPersonality(e.target.value as AiPersonalityType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {PERSONALITIES.map((p) => (
                    <option key={p.type} value={p.type}>
                      {p.label} ({p.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              MATCH DETAILS CONFIRMATION SUMMARY & START BUTTON
              ───────────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-b from-[#13192B] to-[#0D111F] border-2 border-amber-500/40 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                  GAME DETAILS
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Ready to Launch
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Mode:</span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <span>{activeModeConfig.icon}</span>
                  <span>{activeModeConfig.name}</span>
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Time Control:</span>
                <span className="font-bold text-amber-300 font-mono text-sm mt-0.5 block">
                  {activeTc ? activeTc.label : "None selected"}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Your Color:</span>
                <span className="font-bold text-white capitalize mt-0.5 block">
                  {selectedColor === "alternate" ? `Alternate (${upcomingColor === "w" ? "White" : "Black"})` : selectedColor === "w" ? "White ♔" : selectedColor === "b" ? "Black ♚" : "Random 🎲"}
                </span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Opponent:</span>
                <span className="font-bold text-slate-200 truncate mt-0.5 block">
                  {selectedBotProfile.name} ({selectedBotRating})
                </span>
              </div>
            </div>

            {/* START GAME BUTTON */}
            <motion.button
              type="button"
              id="start-game-btn"
              disabled={isStartGameDisabled}
              whileHover={!isStartGameDisabled ? { scale: 1.01 } : {}}
              whileTap={!isStartGameDisabled ? { scale: 0.98 } : {}}
              onClick={handleConfirmStart}
              className={`w-full py-4 px-6 rounded-2xl font-black font-display text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all ${
                isStartGameDisabled
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 shadow-emerald-500/20 border border-amber-300/60"
              }`}
            >
              <Play className="h-5 w-5 fill-slate-950" />
              <span>
                {activeTc
                  ? `START ${activeModeConfig.name.toUpperCase()} GAME (${activeTc.label})`
                  : "Select a Time Control to Start"}
              </span>
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
