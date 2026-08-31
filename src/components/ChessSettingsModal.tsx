import React from "react";
import { X, Volume2, VolumeX, Eye, Sparkles, Layers, Sliders, Check } from "lucide-react";
import { ChessTheme } from "../types";

interface ChessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ChessTheme;
  setTheme: (theme: ChessTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  showEvalBar: boolean;
  setShowEvalBar: (show: boolean) => void;
  showQualityBadges: boolean;
  setShowQualityBadges: (show: boolean) => void;
  autoQueen: boolean;
  setAutoQueen: (auto: boolean) => void;
}

export const ChessSettingsModal: React.FC<ChessSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  showEvalBar,
  setShowEvalBar,
  showQualityBadges,
  setShowQualityBadges,
  autoQueen,
  setAutoQueen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold font-display">Game Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4 text-xs font-sans">
          {/* Board Theme */}
          <div className="space-y-2">
            <label className="text-slate-400 font-mono font-bold uppercase text-[10px] block">
              Board Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: ChessTheme.TOURNAMENT, label: "Wood Classic", colors: "bg-[#F0D9B5] border-[#B58863]" },
                { id: ChessTheme.NEON_SPACE, label: "Neon Cyber", colors: "bg-cyan-900 border-cyan-500" },
                { id: ChessTheme.GLASS_SLATE, label: "Glass Slate", colors: "bg-slate-700 border-slate-400" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ChessTheme)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    theme === t.id
                      ? "border-amber-500 bg-slate-900 text-amber-400 shadow-sm"
                      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md border ${t.colors}`} />
                  <span className="font-bold text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
              <div>
                <div className="font-bold text-white">Audio & Move Sound FX</div>
                <div className="text-[10px] text-slate-400">Synthesize realistic wooden click and check chimes.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Engine Evaluation Bar Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Eye className="h-4 w-4 text-indigo-400" />
              <div>
                <div className="font-bold text-white">Real-time Evaluation Bar</div>
                <div className="text-[10px] text-slate-400">Display vertical engine evaluation gauge alongside board.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showEvalBar}
              onChange={(e) => setShowEvalBar(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Move Quality Badges Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <div className="font-bold text-white">Move Quality Annotations</div>
                <div className="text-[10px] text-slate-400">Tag moves with Brilliant, Best, or Blunder indicators.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={showQualityBadges}
              onChange={(e) => setShowQualityBadges(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Auto-Queen promotion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Auto-Promote to Queen</div>
                <div className="text-[10px] text-slate-400">Automatically promote pawns reaching 8th rank to Queen.</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoQueen}
              onChange={(e) => setAutoQueen(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
