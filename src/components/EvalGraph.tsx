import React from "react";
import { TrendingUp } from "lucide-react";

interface EvalGraphProps {
  evalHistory: number[]; // Array of evaluation scores over turns
  currentMoveIndex: number;
  onSelectMove?: (index: number) => void;
  className?: string;
}

export const EvalGraph: React.FC<EvalGraphProps> = ({
  evalHistory,
  currentMoveIndex,
  onSelectMove,
  className = ""
}) => {
  if (evalHistory.length < 2) {
    return (
      <div className={`p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 flex flex-col justify-center items-center text-center ${className}`}>
        <TrendingUp className="h-5 w-5 text-slate-600 mb-1" />
        <span className="text-[11px] font-mono text-slate-500 italic">Evaluation graph will plot as game progresses...</span>
      </div>
    );
  }

  const height = 64;
  const width = 300;
  const padding = 8;

  // Convert scores (-10 to +10) into Y coordinates
  const getY = (val: number) => {
    const clamped = Math.max(-10, Math.min(10, val));
    // 0 is middle
    const percent = (clamped + 10) / 20; // 0 to 1
    return height - padding - percent * (height - 2 * padding);
  };

  const stepX = (width - 2 * padding) / (evalHistory.length - 1);

  // Build SVG path string
  const points = evalHistory.map((val, idx) => {
    const x = padding + idx * stepX;
    const y = getY(val);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${padding},${height / 2} L ${points.join(" L ")} L ${padding + (evalHistory.length - 1) * stepX},${height / 2} Z`;

  // Find active node X, Y
  const activeIdx = Math.max(0, Math.min(evalHistory.length - 1, currentMoveIndex));
  const activeX = padding + activeIdx * stepX;
  const activeY = getY(evalHistory[activeIdx] || 0);

  return (
    <div className={`p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Game Evaluation Trajectory
        </span>
        <span className="text-slate-300">
          Current: {evalHistory[activeIdx] > 0 ? `+${evalHistory[activeIdx].toFixed(1)}` : (evalHistory[activeIdx] || 0).toFixed(1)}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/80 p-1 border border-slate-850">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
          {/* Zero balance midline */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#475569"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Fill Area under curve */}
          <path d={areaD} fill="rgba(16, 185, 129, 0.15)" />

          {/* Main Trajectory Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Dots for moves */}
          {evalHistory.map((val, idx) => {
            const x = padding + idx * stepX;
            const y = getY(val);
            const isActive = idx === activeIdx;

            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={isActive ? "4" : "2"}
                fill={isActive ? "#fbbf24" : "#10b981"}
                stroke={isActive ? "#000" : "none"}
                strokeWidth={isActive ? "1.5" : "0"}
                className="cursor-pointer hover:r-4 transition-all"
                onClick={() => onSelectMove && onSelectMove(idx)}
              >
                <title>{`Move ${idx + 1}: ${val > 0 ? "+" : ""}${val.toFixed(1)}`}</title>
              </circle>
            );
          })}

          {/* Active Highlight Marker Ring */}
          <circle
            cx={activeX}
            cy={activeY}
            r="6"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            className="animate-ping"
          />
        </svg>
      </div>
    </div>
  );
};
