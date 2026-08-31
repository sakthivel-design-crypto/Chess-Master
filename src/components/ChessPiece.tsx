import React from "react";
import { motion } from "motion/react";

interface ChessPieceProps {
  type: string; // "p", "r", "n", "b", "q", "k"
  color: "w" | "b";
  isDragging?: boolean;
  isSelected?: boolean;
  pieceStyle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  isDragging = false,
  isSelected = false,
  pieceStyle = "classic",
  className = "w-full h-full",
  style = {}
}) => {
  const isWhite = color === "w";

  // Dynamic styling based on pieceStyle selection
  let fillPrimary = isWhite ? "#ffffff" : "#282422";
  let fillSecondary = isWhite ? "#f0f0f0" : "#1a1817";
  let strokeColor = isWhite ? "#3a3431" : "#000000";
  let accentColor = isWhite ? "#e0e0e0" : "#423b37";
  let filterClass = "drop-shadow-md";

  if (pieceStyle === "modern") {
    fillPrimary = isWhite ? "#f8fafc" : "#0f172a";
    fillSecondary = isWhite ? "#cbd5e1" : "#020617";
    strokeColor = isWhite ? "#1e293b" : "#38bdf8";
    accentColor = isWhite ? "#94a3b8" : "#1e293b";
  } else if (pieceStyle === "tournament") {
    fillPrimary = isWhite ? "#ffffff" : "#18181b";
    fillSecondary = isWhite ? "#e4e4e7" : "#09090b";
    strokeColor = isWhite ? "#000000" : "#f59e0b";
    filterClass = "drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]";
  } else if (pieceStyle === "minimal") {
    fillPrimary = isWhite ? "rgba(255,255,255,0.95)" : "rgba(30,27,24,0.95)";
    fillSecondary = isWhite ? "rgba(240,240,240,0.85)" : "rgba(20,18,16,0.85)";
    strokeColor = isWhite ? "#475569" : "#94a3b8";
  } else if (pieceStyle === "elegant") {
    fillPrimary = isWhite ? "#fdfbf7" : "#261a15";
    fillSecondary = isWhite ? "#f3ece1" : "#19100d";
    strokeColor = "#D4AF37"; // Gold border trim!
    accentColor = "#E5A93C";
    filterClass = "drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]";
  } else if (pieceStyle === "3d") {
    fillPrimary = isWhite ? "#ffffff" : "#333333";
    fillSecondary = isWhite ? "#d1d5db" : "#111111";
    strokeColor = isWhite ? "#1f2937" : "#000000";
    filterClass = "drop-shadow-[0_6px_8px_rgba(0,0,0,0.8)]";
  }

  const renderSvgContent = () => {
    switch (type.toLowerCase()) {
      case "p": // PAWN
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`pawn-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#pawn-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5 9 C 20.1 9 18.2 10.9 18.2 13.2 C 18.2 14.1 18.5 15 19 15.7 C 17.1 16.5 15.8 18.3 15.8 20.5 C 15.8 22.4 16.7 24.1 18.1 25.1 C 17.3 25.6 16.7 26.5 16.7 27.5 C 16.7 29 17.9 30.2 19.4 30.2 L 25.6 30.2 C 27.1 30.2 28.3 29 28.3 27.5 C 28.3 26.5 27.7 25.6 26.9 25.1 C 28.3 24.1 29.2 22.4 29.2 20.5 C 29.2 18.3 27.9 16.5 26 15.7 C 26.5 15 26.8 14.1 26.8 13.2 C 26.8 10.9 24.9 9 22.5 9 Z" />
              <path d="M 15 34.5 L 30 34.5 L 30 32 L 15 32 Z" fill={accentColor} />
              <path d="M 12 39 L 33 39 L 33 35 L 12 35 Z" />
            </g>
          </svg>
        );

      case "r": // ROOK
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`rook-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#rook-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9 39 L 36 39 L 36 36 L 9 36 Z" />
              <path d="M 12 36 L 33 36 L 33 32 L 12 32 Z" fill={accentColor} />
              <path d="M 14 32 L 31 32 L 29.5 20 L 15.5 20 Z" />
              <path d="M 13 20 L 32 20 L 32 17 L 13 17 Z" />
              <path d="M 12 17 L 12 9 L 16 9 L 16 12 L 20 12 L 20 9 L 25 9 L 25 12 L 29 12 L 29 9 L 33 9 L 33 17 Z" />
            </g>
          </svg>
        );

      case "n": // KNIGHT
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`knight-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#knight-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22 10 C 22 10 19 11 16 15 C 13 19 13 23 13 23 C 13 23 14 21 16 20 C 16 20 16 24 18 26 C 18 26 19 23 20 22 C 20 22 21 27 25 27 C 29 27 31 23 31 21 C 31 19 32 18 31 16 C 30 14 28 12 26 11 C 24 10 22 10 22 10 Z" />
              <circle cx="20.5" cy="18.5" r="1.5" fill={isWhite ? "#222" : "#fff"} stroke="none" />
              <path d="M 9.5 39 L 35.5 39 L 35.5 36 L 9.5 36 Z" />
              <path d="M 11.5 36 L 33.5 36 L 30.5 28 L 14.5 28 Z" />
            </g>
          </svg>
        );

      case "b": // BISHOP
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`bishop-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#bishop-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="22.5" cy="8" r="2.5" fill={fillPrimary} />
              <path d="M 9 39 L 36 39 L 36 36 L 9 36 Z" />
              <path d="M 12 36 L 33 36 L 30 29 L 15 29 Z" fill={accentColor} />
              <path d="M 15 29 C 12.5 23 13.5 16 22.5 11 C 31.5 16 32.5 23 30 29 Z" />
              <path d="M 17.5 18 L 27.5 18 M 22.5 13 L 22.5 23" stroke={strokeColor} strokeWidth="1.8" />
            </g>
          </svg>
        );

      case "q": // QUEEN
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`queen-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#queen-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2" />
              <circle cx="14" cy="9" r="2" />
              <circle cx="22.5" cy="7.5" r="2.2" />
              <circle cx="31" cy="9" r="2" />
              <circle cx="39" cy="12" r="2" />
              <path d="M 9 39 L 36 39 L 36 36 L 9 36 Z" />
              <path d="M 12 36 L 33 36 L 34.5 32 L 10.5 32 Z" fill={accentColor} />
              <path d="M 6 14 L 12 32 L 33 32 L 39 14 L 30 26 L 22.5 11 L 15 26 Z" />
            </g>
          </svg>
        );

      case "k": // KING
        return (
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`king-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillPrimary} />
                <stop offset="100%" stopColor={fillSecondary} />
              </linearGradient>
            </defs>
            <g fill={`url(#king-grad-${color})`} stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {/* Crown cross */}
              <path d="M 22.5 4 L 22.5 12 M 18.5 8 L 26.5 8" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
              <path d="M 9 39 L 36 39 L 36 36 L 9 36 Z" />
              <path d="M 11.5 36 L 33.5 36 L 31.5 31.5 L 13.5 31.5 Z" fill={accentColor} />
              <path d="M 13.5 31.5 L 31.5 31.5 L 33.5 21 C 33.5 21 28 23 22.5 16 C 17 23 11.5 21 11.5 21 Z" />
              <path d="M 16.5 16 C 18.5 14 20.5 13 22.5 13 C 24.5 13 26.5 14 28.5 16" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isDragging ? 1.15 : isSelected ? 1.05 : 1, 
        opacity: isDragging ? 0.85 : 1,
        filter: isDragging ? "drop-shadow(0 10px 10px rgba(0,0,0,0.5))" : "none"
      }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      style={style}
    >
      {renderSvgContent()}
    </motion.div>
  );
};
