import React, { useEffect, useRef } from "react";
import { MoveQualityBadge, MoveQuality } from "./MoveQualityBadge";
import { SkipBack, ChevronLeft, ChevronRight, SkipForward, Play, Pause, Layers } from "lucide-react";

export interface MoveHistoryItem {
  moveNumber: number;
  whiteSan: string;
  whiteQuality?: MoveQuality;
  whiteEval?: number;
  blackSan?: string;
  blackQuality?: MoveQuality;
  blackEval?: number;
}

interface MoveHistoryPanelProps {
  history: MoveHistoryItem[];
  currentMoveIndex: number; // -1 for starting position, 0 for 1. White, 1 for 1. Black, etc.
  onSelectMove: (index: number) => void;
  isPlayingAuto?: boolean;
  onToggleAutoPlay?: () => void;
  className?: string;
}

export const MoveHistoryPanel: React.FC<MoveHistoryPanelProps> = ({
  history,
  currentMoveIndex,
  onSelectMove,
  isPlayingAuto = false,
  onToggleAutoPlay,
  className = ""
}) => {
  const activeMoveRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalPly = history.reduce((acc, h) => acc + (h.blackSan ? 2 : 1), 0);

  // Auto-scroll move history table internally without scrolling the outer page
  useEffect(() => {
    if (activeMoveRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = activeMoveRef.current;
      const elemTop = element.offsetTop;
      const elemBottom = elemTop + element.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;

      if (elemTop < containerTop) {
        container.scrollTop = elemTop - 8;
      } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight + 8;
      }
    }
  }, [currentMoveIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSelectMove(Math.max(-1, currentMoveIndex - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onSelectMove(Math.min(totalPly - 1, currentMoveIndex + 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        onSelectMove(-1);
      } else if (e.key === "End") {
        e.preventDefault();
        onSelectMove(totalPly - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIndex, totalPly, onSelectMove]);

  return (
    <div className={`flex flex-col bg-slate-950/90 rounded-2xl border border-slate-800/80 overflow-hidden text-xs ${className}`}>
      {/* Panel Header */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500" />
          <h3 className="font-extrabold text-white text-xs font-display">Move History</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
          {totalPly} Moves
        </span>
      </div>

      {/* Move History Table Scroll Box */}
      <div ref={scrollContainerRef} className="flex-grow overflow-y-auto max-h-[220px] p-2 space-y-1 font-mono">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic text-[11px]">
            No moves played yet. Make your opening move on the board!
          </div>
        ) : (
          history.map((item, idx) => {
            const whitePlyIndex = (item.moveNumber - 1) * 2;
            const blackPlyIndex = whitePlyIndex + 1;

            const isWhiteActive = currentMoveIndex === whitePlyIndex;
            const isBlackActive = currentMoveIndex === blackPlyIndex;

            return (
              <div 
                key={`move-${item.moveNumber}-${idx}`} 
                className="grid grid-cols-12 items-center text-[11px] hover:bg-slate-900/50 rounded-lg p-1 transition-colors"
              >
                {/* Move Number */}
                <div className="col-span-2 text-slate-500 font-bold pl-2">
                  {item.moveNumber}.
                </div>

                {/* White Move */}
                <div className="col-span-5 pr-1">
                  <button
                    ref={isWhiteActive ? activeMoveRef : null}
                    onClick={() => onSelectMove(whitePlyIndex)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-all cursor-pointer text-left font-bold ${
                      isWhiteActive
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    <span>{item.whiteSan}</span>
                    {item.whiteQuality && (
                      <MoveQualityBadge quality={item.whiteQuality} showIconOnly size="sm" />
                    )}
                  </button>
                </div>

                {/* Black Move */}
                <div className="col-span-5 pl-1">
                  {item.blackSan ? (
                    <button
                      ref={isBlackActive ? activeMoveRef : null}
                      onClick={() => onSelectMove(blackPlyIndex)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-all cursor-pointer text-left font-bold ${
                        isBlackActive
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-slate-200 hover:bg-slate-800/80"
                      }`}
                    >
                      <span>{item.blackSan}</span>
                      {item.blackQuality && (
                        <MoveQualityBadge quality={item.blackQuality} showIconOnly size="sm" />
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-700 px-2">-</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Controls Bar */}
      <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-1.5">
        <button
          onClick={() => onSelectMove(-1)}
          disabled={currentMoveIndex <= -1}
          title="First Position (Home)"
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer border border-slate-800"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex <= -1}
          title="Previous Move (←)"
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer border border-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {onToggleAutoPlay && (
          <button
            onClick={onToggleAutoPlay}
            title={isPlayingAuto ? "Pause Replay" : "Auto Play Replay"}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
          >
            {isPlayingAuto ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          </button>
        )}

        <button
          onClick={() => onSelectMove(Math.min(totalPly - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= totalPly - 1}
          title="Next Move (→)"
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer border border-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onSelectMove(totalPly - 1)}
          disabled={currentMoveIndex >= totalPly - 1}
          title="Latest Position (End)"
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer border border-slate-800"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
