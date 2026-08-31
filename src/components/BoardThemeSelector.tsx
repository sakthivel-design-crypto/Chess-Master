import React, { useState } from "react";
import { BOARD_THEMES, PIECE_STYLES, BoardThemeConfig, PieceStyleConfig } from "../config/boardThemes";
import { Check, Sparkles, Sliders, Palette, Crown, Shield, Layers } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

interface BoardThemeSelectorProps {
  currentBoardTheme?: string;
  currentPieceStyle?: string;
  onSelectTheme: (themeId: string, pieceStyleId?: string) => void;
}

// Mini 8x8 Chessboard Preview Component
const MiniBoardPreview: React.FC<{ theme: BoardThemeConfig; pieceStyleId?: string }> = ({
  theme,
  pieceStyleId = "classic"
}) => {
  // 8x8 layout with a representative position
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Sample piece placement for rich preview
  const pieceMap: Record<string, { type: string; color: "w" | "b" }> = {
    a8: { type: "r", color: "b" },
    b8: { type: "n", color: "b" },
    c8: { type: "b", color: "b" },
    d8: { type: "q", color: "b" },
    e8: { type: "k", color: "b" },
    f8: { type: "b", color: "b" },
    g8: { type: "n", color: "b" },
    h8: { type: "r", color: "b" },
    a7: { type: "p", color: "b" },
    b7: { type: "p", color: "b" },
    c7: { type: "p", color: "b" },
    d7: { type: "p", color: "b" },
    e7: { type: "p", color: "b" },
    f7: { type: "p", color: "b" },
    g7: { type: "p", color: "b" },
    h7: { type: "p", color: "b" },
    e4: { type: "p", color: "w" },
    d5: { type: "p", color: "b" },
    c4: { type: "p", color: "w" },
    f3: { type: "n", color: "w" },
    c6: { type: "n", color: "b" },
    a2: { type: "p", color: "w" },
    b2: { type: "p", color: "w" },
    d2: { type: "p", color: "w" },
    f2: { type: "p", color: "w" },
    g2: { type: "p", color: "w" },
    h2: { type: "p", color: "w" },
    a1: { type: "r", color: "w" },
    c1: { type: "b", color: "w" },
    d1: { type: "q", color: "w" },
    e1: { type: "k", color: "w" },
    f1: { type: "b", color: "w" },
    h1: { type: "r", color: "w" }
  };

  const renderPieceSymbol = (type: string, color: "w" | "b") => {
    const symbols: Record<string, { w: string; b: string }> = {
      k: { w: "♔", b: "♚" },
      q: { w: "♕", b: "♛" },
      r: { w: "♖", b: "♜" },
      b: { w: "♗", b: "♝" },
      n: { w: "♘", b: "♞" },
      p: { w: "♙", b: "♟" }
    };
    const symbol = symbols[type]?.[color] || "";
    const colorClass = color === "w" ? "text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]";
    return <span className={`text-xs md:text-sm font-bold select-none ${colorClass}`}>{symbol}</span>;
  };

  return (
    <div
      className={`relative w-full aspect-square rounded-xl overflow-hidden p-1.5 shadow-xl border bg-gradient-to-br ${theme.frameGradient} ${theme.frameBorder}`}
    >
      <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden shadow-inner">
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const isLight = (rIdx + fIdx) % 2 === 0;
            const sqName = `${file}${rank}`;
            const piece = pieceMap[sqName];

            return (
              <div
                key={sqName}
                style={{ backgroundColor: isLight ? theme.lightSquare : theme.darkSquare }}
                className="flex items-center justify-center relative select-none"
              >
                {piece && renderPieceSymbol(piece.type, piece.color)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const BoardThemeSelector: React.FC<BoardThemeSelectorProps> = ({
  currentBoardTheme = "classic_wood",
  currentPieceStyle = "classic",
  onSelectTheme
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentBoardTheme);
  const [selectedPieceStyleId, setSelectedPieceStyleId] = useState<string>(currentPieceStyle);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  const handleApplyTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    onSelectTheme(themeId, selectedPieceStyleId);
    setAppliedToast(`✓ ${BOARD_THEMES.find((t) => t.id === themeId)?.name || "Theme"} Applied`);
    confetti({ particleCount: 15, spread: 30, colors: ["#f59e0b", "#10b981"] });
    setTimeout(() => setAppliedToast(null), 2500);
  };

  const handleApplyPieceStyle = (pieceStyleId: string) => {
    setSelectedPieceStyleId(pieceStyleId);
    onSelectTheme(selectedThemeId, pieceStyleId);
    setAppliedToast(`✓ ${PIECE_STYLES.find((s) => s.id === pieceStyleId)?.name || "Piece Style"} Applied`);
    confetti({ particleCount: 15, spread: 30, colors: ["#38bdf8", "#f59e0b"] });
    setTimeout(() => setAppliedToast(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-slate-100">
      
      {/* Toast Notification */}
      {appliedToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-amber-300"
        >
          <Sparkles className="h-4 w-4" />
          <span>{appliedToast}</span>
        </motion.div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 shadow-2xl border border-amber-500/20">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
            <Palette className="h-3.5 w-3.5" /> PERSONALIZATION STUDIO
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-white tracking-tight">
            Choose Your Chess Board
          </h2>
          <p className="text-xs md:text-sm text-amber-200/70 max-w-2xl font-sans">
            Customize your board colors, square contrasts, and piece designs for a comfortable, luxury playing experience across all AI matches and puzzles.
          </p>
        </div>
      </div>

      {/* SECTION 1: CHESS BOARD THEMES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold font-serif text-white">Board Themes (10 Designs)</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-400">
            Active: {BOARD_THEMES.find((t) => t.id === selectedThemeId)?.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BOARD_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;

            return (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApplyTheme(theme.id)}
                className={`relative rounded-3xl p-4 cursor-pointer transition-all duration-200 border flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-slate-900/90 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/50"
                    : "bg-[#0d121f]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#111728]"
                }`}
              >
                {/* Board 8x8 Mini Preview */}
                <MiniBoardPreview theme={theme} pieceStyleId={selectedPieceStyleId} />

                {/* Theme Description & Title */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm font-serif text-white flex items-center gap-1.5">
                      {theme.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {theme.styleTag}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[32px]">
                    {theme.description}
                  </p>

                  {/* Square color swatches */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-md border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.lightSquare }}
                        />
                        <span
                          className="w-4 h-4 rounded-md border border-slate-700 shadow-sm"
                          style={{ backgroundColor: theme.darkSquare }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Swatches</span>
                    </div>

                    {isSelected ? (
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black inline-flex items-center gap-1 shadow-md animate-pulse">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all">
                        Apply Theme
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PIECE STYLES SELECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold font-serif text-white">Piece Style (6 Styles)</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-400">
            Active: {PIECE_STYLES.find((s) => s.id === selectedPieceStyleId)?.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIECE_STYLES.map((style) => {
            const isSelected = selectedPieceStyleId === style.id;

            return (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleApplyPieceStyle(style.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-lg"
                    : "bg-[#0d121f]/60 border-slate-800 hover:bg-[#111728] text-slate-300"
                }`}
              >
                {/* Piece Icon Preview Box */}
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                  {style.id === "elegant"
                    ? "♚"
                    : style.id === "modern"
                    ? "♛"
                    : style.id === "3d"
                    ? "♜"
                    : style.id === "minimal"
                    ? "♝"
                    : style.id === "tournament"
                    ? "♞"
                    : "♟"}
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-xs font-serif">{style.name}</div>
                  <div className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {style.description}
                  </div>
                </div>

                {isSelected && (
                  <span className="mt-auto px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black inline-flex items-center gap-1">
                    <Check className="h-2.5 w-2.5" /> Applied
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
