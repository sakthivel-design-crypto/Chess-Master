import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, FastForward } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  autoStartSound?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Timeline Phases:
  // Phase 1 (0.0s - 1.5s): Tracing thin black sketch outline from bottom base upward to crown.
  // Phase 2 (1.5s - 2.5s): Smoothly morph sketch outline into refined, luxury brand queen silhouette.
  // Phase 3 (2.5s - 3.5s): Deep matte black fill, glossy curved highlights, gold accent trim, soft shadow.
  // Phase 4 (3.5s - 4.5s): Soft light sweep passes left-to-right, gentle 3% scale bounce.
  // Phase 5 (4.5s - 5.0s): Fade in CHESSZEN serif title with gold "Z" and "Play • Learn • Master" subtitle.
  // Phase 6 (5.0s - 5.5s): Hold & dissolve seamlessly into Login Screen.

  const [phase, setPhase] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem("chesszen_splash_muted") === "true";
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Subtle luxury ambient audio chime
  const playSoundEffect = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // High-end warm chime chord
      const freqs = [220, 440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.035 / (idx + 1), now + idx * 0.1 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 2.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 2.1);
      });
    } catch {
      // Ignore audio context errors
    }
  };

  useEffect(() => {
    playSoundEffect();

    // 0.0s: Start Outline Tracing
    setPhase(1);

    // 1.5s: Morph into Refined Luxury Queen Design
    const t1 = setTimeout(() => setPhase(2), 1500);

    // 2.5s: Matte Black Fill, Glossy Highlights & Gold Accent
    const t2 = setTimeout(() => setPhase(3), 2500);

    // 3.5s: Light Sweep Shine & 3% Scale Pulse
    const t3 = setTimeout(() => setPhase(4), 3500);

    // 4.5s: Fade in CHESSZEN Logo & Subtitle
    const t4 = setTimeout(() => setPhase(5), 4500);

    // 5.0s: Start dissolve exit transition
    const t5 = setTimeout(() => {
      setPhase(6);
      setIsExiting(true);
    }, 5000);

    // 5.5s: Complete and hand over to Login Screen
    const t6 = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    localStorage.setItem("chesszen_splash_muted", String(nextState));
  };

  // Path 1: Initial Sketch Outline Path (Reference queen outline, drawn base upward to crown)
  const sketchQueenD = `
    M 60 360
    C 60 365, 240 365, 240 360
    C 245 360, 248 352, 242 348
    C 238 344, 230 344, 226 344
    C 232 344, 235 338, 228 334
    C 222 328, 216 328, 212 322
    C 212 280, 186 250, 184 218
    C 190 218, 194 212, 188 208
    C 184 204, 186 202, 182 200
    C 192 178, 202 160, 205 145
    C 220 128, 238 112, 235 95
    A 7 7 0 1 0 222 95
    C 218 112, 206 122, 195 88
    A 7 7 0 1 0 181 88
    C 172 108, 162 108, 150 42
    C 138 108, 128 108, 119 88
    A 7 7 0 1 0 105 88
    C 94 122, 82 112, 78 95
    A 7 7 0 1 0 65 95
    C 62 112, 80 128, 95 145
    C 98 160, 108 178, 118 200
    C 114 202, 116 204, 112 208
    C 106 212, 110 218, 116 218
    C 114 250, 88 280, 88 322
    C 84 328, 78 328, 72 334
    C 65 338, 68 344, 74 344
    C 70 344, 62 344, 58 348
    C 52 352, 55 360, 60 360
    Z
  `.replace(/\s+/g, " ").trim();

  // Path 2: Refined Luxury Brand Queen Silhouette (Wider graceful base, slimmer neck, modern crown, perfect symmetry & clean curves)
  const refinedQueenD = `
    M 42 360
    C 42 368, 258 368, 258 360
    C 262 355, 252 344, 236 344
    C 240 338, 232 328, 222 324
    C 212 270, 172 235, 166 195
    C 174 195, 176 186, 170 182
    C 166 178, 172 152, 186 138
    C 208 116, 228 102, 222 84
    A 6.5 6.5 0 1 0 210 84
    C 204 100, 192 110, 180 80
    A 6.5 6.5 0 1 0 168 80
    C 160 98, 154 98, 150 36
    C 146 98, 140 98, 132 80
    A 6.5 6.5 0 1 0 120 80
    C 108 110, 96 100, 90 84
    A 6.5 6.5 0 1 0 78 84
    C 72 102, 92 116, 114 138
    C 128 152, 134 178, 130 182
    C 124 186, 126 195, 134 195
    C 128 235, 88 270, 78 324
    C 68 328, 60 338, 64 344
    C 48 344, 38 355, 42 360
    Z
  `.replace(/\s+/g, " ").trim();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-950 overflow-hidden select-none font-sans"
      >
        {/* Subtle Luxury Controls (Top Right) */}
        <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:border-slate-400 transition-all cursor-pointer shadow-sm"
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:border-slate-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span>Skip</span>
            <FastForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* CENTER STAGE */}
        <div className="relative flex flex-col items-center justify-center z-30 px-4">

          {/* 3.5s - 4.5s (Phase 4): Gentle 3% Scale Pulse */}
          <motion.div
            initial={{ scale: 1 }}
            animate={
              phase === 4
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
            }
            transition={{
              duration: 1.0,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="relative flex items-center justify-center"
          >
            <svg
              viewBox="0 0 300 400"
              className="w-[240px] h-[320px] sm:w-[280px] sm:h-[370px] overflow-visible"
            >
              <defs>
                {/* Gold Gradient for Accents */}
                <linearGradient id="gold-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>

                {/* 3.5s - 4.5s Soft Light Shine Sweep Clip Path Gradient */}
                <linearGradient id="light-sweep-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>

                <clipPath id="refined-queen-clip">
                  <path d={refinedQueenD} />
                </clipPath>

                {/* Delicate Shadow Filter */}
                <filter id="soft-queen-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* OUTLINE & MORPHING SVG PATH */}
              <motion.path
                d={phase >= 2 ? refinedQueenD : sketchQueenD}
                fill={phase >= 3 ? "#0A0A0A" : "none"}
                stroke={phase >= 3 ? "#18181B" : "#000000"}
                strokeWidth={phase >= 3 ? "1" : "2.5"}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={phase >= 3 ? "url(#soft-queen-shadow)" : undefined}
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{
                  pathLength: phase >= 1 ? 1 : 0,
                  d: phase >= 2 ? refinedQueenD : sketchQueenD,
                  fill: phase >= 3 ? "#0A0A0A" : "none"
                }}
                transition={{
                  pathLength: { duration: 1.5, ease: [0.4, 0, 0.2, 1] },
                  d: { duration: 1.0, ease: [0.25, 1, 0.5, 1] },
                  fill: { duration: 0.8, ease: "easeOut" }
                }}
              />

              {/* PHASE 3 (2.5s - 3.5s): GLOSSY REFLECTIONS & HIGH-PRECISION HIGHLIGHTS */}
              <g clipPath="url(#refined-queen-clip)">
                {/* Curved Metallic Body Highlight */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 3 ? 0.35 : 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  d="M 172 170 C 148 220 144 280 170 318 C 174 322 168 322 164 320 C 138 280 142 220 166 168 Z"
                  fill="#FFFFFF"
                />

                {/* Graceful Collar Ring Highlight */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 3 ? 0.45 : 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  d="M 115 190 C 138 185 162 190 162 193 C 138 188 115 193 115 190 Z"
                  fill="#FFFFFF"
                />

                {/* Crown Jewel Top Glint */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 3 ? 0.6 : 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  d="M 148 48 L 150 40 L 152 48 L 150 56 Z"
                  fill="#FFFFFF"
                />

                {/* PHASE 4 (3.5s - 4.5s): LIGHT SWEEP SHINE PASSING LEFT-TO-RIGHT */}
                {phase >= 4 && (
                  <motion.rect
                    x="-100%"
                    y="0"
                    width="300%"
                    height="100%"
                    fill="url(#light-sweep-gradient)"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                  />
                )}
              </g>

              {/* PHASE 3: THIN GOLD ACCENT LINE AROUND SELECTED EDGES */}
              <motion.path
                d="M 115 195 C 138 190 162 195 185 195"
                fill="none"
                stroke="url(#gold-accent-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{
                  opacity: phase >= 3 ? 0.9 : 0,
                  pathLength: phase >= 3 ? 1 : 0
                }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />

              <motion.path
                d="M 64 344 C 120 348 180 348 236 344"
                fill="none"
                stroke="url(#gold-accent-grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{
                  opacity: phase >= 3 ? 0.8 : 0,
                  pathLength: phase >= 3 ? 1 : 0
                }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* SOFT SHADOW UNDERNEATH (2.5s - 3.5s) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={
              phase >= 3
                ? { opacity: 0.18, scale: 1 }
                : { opacity: 0, scale: 0.7 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-44 h-3.5 rounded-full bg-black blur-md -mt-5 pointer-events-none"
          />

          {/* PHASE 5: 4.5s - 5.0s LOGO TYPOGRAPHY & SUBTITLE */}
          <div className="mt-6 text-center flex flex-col items-center justify-center">
            {/* Title: ChessZen */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={
                phase >= 5
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-slate-950"
            >
              <span>Chess</span>
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                Zen
              </span>
            </motion.div>

            {/* Divider with Gold Diamond Ornament Motif */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.5 }}
              animate={
                phase >= 5
                  ? { opacity: 1, scaleX: 1 }
                  : { opacity: 0, scaleX: 0.5 }
              }
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex items-center justify-center gap-2 mt-2 w-48"
            >
              <div className="h-[1px] flex-1 bg-slate-950/80" />
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rotate-45 bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-sm" />
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              <div className="h-[1px] flex-1 bg-slate-950/80" />
            </motion.div>

            {/* Subtitle: "Play • Learn • Master" */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={
                phase >= 5
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 6 }
              }
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm font-sans font-semibold tracking-[0.25em] text-slate-500 uppercase mt-3"
            >
              Play • Learn • Master
            </motion.p>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
