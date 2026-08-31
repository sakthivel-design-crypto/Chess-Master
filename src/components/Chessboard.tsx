import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { ChessPiece } from "./ChessPiece";
import { ChessTheme } from "../types";
import { getBoardThemeConfig, getPieceStyleConfig, BOARD_THEMES } from "../config/boardThemes";

interface ChessboardProps {
  game: Chess;
  onMove: (from: string, to: string, promotion?: string) => void;
  lastMove?: { from: string; to: string } | null;
  arrows?: string[]; // E.g. ["e2e4", "g1f3"]
  highlights?: string[]; // Array of square names
  isFlipped?: boolean;
  orientation?: "white" | "black";
  playerColor?: "w" | "b" | "both";
  theme?: ChessTheme | string;
  boardTheme?: string;
  pieceStyle?: string;
  interactive?: boolean;
  disabled?: boolean;
  onSquareRightClick?: (square: string) => void;
  className?: string;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  game,
  onMove,
  lastMove = null,
  arrows = [],
  highlights = [],
  isFlipped = false,
  orientation,
  playerColor = "both",
  theme,
  boardTheme,
  pieceStyle,
  interactive = true,
  disabled = false,
  onSquareRightClick,
  className = ""
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [invalidSquare, setInvalidSquare] = useState<string | null>(null);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: "w" | "b";
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const lastInteractionTimeRef = useRef<number>(0);
  const invalidTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive board rotation: Black player orientation flips board so Black is at bottom
  const isBoardFlipped = isFlipped || orientation === "black";

  // Retrieve active user board theme & piece style from localStorage as fallback
  const getActiveUserTheme = (): { boardThemeId: string; pieceStyleId: string } => {
    try {
      const saved = localStorage.getItem("chessmaster_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings?.boardTheme) {
          return {
            boardThemeId: parsed.settings.boardTheme,
            pieceStyleId: parsed.settings.pieceStyle || "classic"
          };
        }
      }
    } catch {
      // fallback
    }
    return { boardThemeId: "classic_wood", pieceStyleId: "classic" };
  };

  const userTheme = getActiveUserTheme();

  // Resolve theme ID
  let activeThemeId = boardTheme || (typeof theme === "string" ? theme : undefined) || userTheme.boardThemeId;
  
  // Legacy enum compatibility
  if (theme === ChessTheme.NEON_SPACE) activeThemeId = "carbon";
  if (theme === ChessTheme.GLASS_SLATE) activeThemeId = "ocean";
  if (theme === ChessTheme.TOURNAMENT) activeThemeId = "classic_wood";

  const themeConfig = getBoardThemeConfig(activeThemeId);
  const activePieceStyle = pieceStyle || userTheme.pieceStyleId;

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const orderedFiles = isBoardFlipped ? [...files].reverse() : files;
  const orderedRanks = isBoardFlipped ? [...ranks].reverse() : ranks;

  // Clear selection on external game state change
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
  }, [game]);

  // Translate chess coordinates to percentage positions for Arrow overlay
  const getSquareCoords = (squareName: string) => {
    const fileIndex = files.indexOf(squareName[0]);
    const rankIndex = 8 - parseInt(squareName[1], 10);

    if (fileIndex === -1 || isNaN(rankIndex)) return null;

    const finalFile = isBoardFlipped ? 7 - fileIndex : fileIndex;
    const finalRank = isBoardFlipped ? 7 - rankIndex : rankIndex;

    return {
      x: (finalFile + 0.5) * 12.5,
      y: (finalRank + 0.5) * 12.5
    };
  };

  // Helper to trigger brief invalid feedback
  const triggerInvalidFeedback = (square: string, message: string = "Illegal Move") => {
    setInvalidSquare(square);
    setInvalidMessage(message);
    if (invalidTimerRef.current) clearTimeout(invalidTimerRef.current);
    invalidTimerRef.current = setTimeout(() => {
      setInvalidSquare(null);
      setInvalidMessage(null);
    }, 1000);
  };

  // Core Selection Processor: Immediate 0ms single-tap logic
  const processSquareSelection = (square: string) => {
    if (!interactive || disabled) return;

    if (pendingPromotion) {
      // Dismiss promotion modal if tapping outside
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square as Square);
    const currentTurn = game.turn();
    const isRestrictedColor = playerColor && playerColor !== "both";

    // 1. If player color is restricted and it's NOT the player's turn, deny interaction
    if (isRestrictedColor && currentTurn !== playerColor) {
      if (piece) {
        triggerInvalidFeedback(square, "Opponent's turn");
      }
      return;
    }

    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect immediately when tapping the same selected square
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Execute move if target is a legal destination (single-tap move execution)
      if (legalMoves.includes(square)) {
        const movingPiece = game.get(selectedSquare as Square);
        const isPawn = movingPiece && movingPiece.type === "p";
        const targetRank = square[1];
        const isPromotion =
          isPawn &&
          ((movingPiece.color === "w" && targetRank === "8") ||
            (movingPiece.color === "b" && targetRank === "1"));

        if (isPromotion) {
          setPendingPromotion({
            from: selectedSquare,
            to: square,
            color: movingPiece.color
          });
        } else {
          onMove(selectedSquare, square);
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else if (piece && piece.color === currentTurn && (!isRestrictedColor || piece.color === playerColor)) {
        // Switch selection immediately to another own piece belonging to current player
        setSelectedSquare(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      } else {
        // Tapped illegal destination square -> flash invalid feedback, keep piece selected
        triggerInvalidFeedback(square, "Illegal Move");
      }
    } else {
      // First single-tap: select piece immediately if it belongs to current player turn and allowed player color
      if (piece && piece.color === currentTurn && (!isRestrictedColor || piece.color === playerColor)) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as Square, verbose: true });
        setLegalMoves(moves.map((m) => m.to));
      } else if (piece) {
        // Tapped opponent piece when no piece is selected -> flash informative feedback
        if (isRestrictedColor && piece.color !== playerColor) {
          triggerInvalidFeedback(square, `You are playing ${playerColor === "w" ? "White" : "Black"}`);
        } else {
          const turnLabel = currentTurn === "w" ? "White's turn" : "Black's turn";
          triggerInvalidFeedback(square, turnLabel);
        }
      }
    }
  };

  // Immediate Unified Pointer / Tap Handler for Mobile Touch & Mouse Click
  const handlePointerDown = (square: string, e: React.PointerEvent) => {
    // Only handle primary pointer (left mouse button 0, or touch / pen)
    if (e.button !== 0 && e.pointerType === "mouse") return;

    // Prevent default browser long-press behavior, text selection, and ghost clicks
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();

    lastInteractionTimeRef.current = Date.now();
    processSquareSelection(square);
  };

  // Fallback click handler with debounce guard to prevent duplicate executions
  const handleClick = (square: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastInteractionTimeRef.current < 350) {
      return;
    }
    lastInteractionTimeRef.current = now;
    processSquareSelection(square);
  };

  // Handle Pawn Promotion Selection
  const handleSelectPromotion = (promo: "q" | "r" | "b" | "n") => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, promo);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Drag and Drop handlers for Desktop Mouse
  const handleDragStart = (square: string, e: React.DragEvent) => {
    if (!interactive || disabled) return;
    const piece = game.get(square as Square);
    const isRestrictedColor = playerColor && playerColor !== "both";
    if (!piece || piece.color !== game.turn() || (isRestrictedColor && (piece.color !== playerColor || game.turn() !== playerColor))) {
      e.preventDefault();
      return;
    }
    setSelectedSquare(square);
    const moves = game.moves({ square: square as Square, verbose: true });
    setLegalMoves(moves.map((m) => m.to));
    e.dataTransfer.setData("text/plain", square);
  };

  const handleDrop = (square: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!interactive || disabled) return;
    const fromSq = e.dataTransfer.getData("text/plain");
    if (fromSq && fromSq !== square) {
      const moves = game.moves({ square: fromSq as Square, verbose: true });
      if (moves.some((m) => m.to === square)) {
        const movingPiece = game.get(fromSq as Square);
        const isPawn = movingPiece && movingPiece.type === "p";
        const targetRank = square[1];
        const isPromotion =
          isPawn &&
          ((movingPiece.color === "w" && targetRank === "8") ||
            (movingPiece.color === "b" && targetRank === "1"));

        if (isPromotion) {
          setPendingPromotion({
            from: fromSq,
            to: square,
            color: movingPiece.color
          });
        } else {
          onMove(fromSq, square);
        }
      } else {
        triggerInvalidFeedback(square, "Illegal Move");
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Color Palettes
  const getSquareBgColor = (fileIdx: number, rankIdx: number) => {
    const isLight = (fileIdx + rankIdx) % 2 === 0;
    return isLight ? themeConfig.lightSquare : themeConfig.darkSquare;
  };

  // Identify check and checkmate king squares
  let checkSquare: string | null = null;
  const isCheckmate = game.isCheckmate();

  if (game.inCheck()) {
    const turn = game.turn();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sqName = `${files[f]}${ranks[r]}` as Square;
        const p = game.get(sqName);
        if (p && p.type === "k" && p.color === turn) {
          checkSquare = sqName;
          break;
        }
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative w-full aspect-square max-w-[540px] mx-auto select-none p-3.5 md:p-4 rounded-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-4 ${themeConfig.frameBorder} bg-gradient-to-br ${themeConfig.frameGradient} ${className}`}
    >
      {/* Wooden Bezel / Beveled Frame Effect */}
      <div
        ref={boardRef}
        className="w-full h-full relative rounded-[12px] overflow-hidden border border-amber-900/40 shadow-inner bg-[#311b18] select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
        style={{ touchAction: "manipulation" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Subtle Floating Feedback Pill for Illegal Moves or Turn Notices */}
        <AnimatePresence>
          {invalidMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-bold rounded-full shadow-lg backdrop-blur-md pointer-events-none flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>{invalidMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 8x8 Board Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {orderedRanks.map((rank, rankIdx) => (
            <React.Fragment key={rank}>
              {orderedFiles.map((file, fileIdx) => {
                const squareName = `${file}${rank}`;
                const piece = game.get(squareName as Square);

                const isSelected = selectedSquare === squareName;
                const isLegal = legalMoves.includes(squareName);
                const isInvalid = invalidSquare === squareName;
                const isPreviousMove =
                  lastMove && (lastMove.from === squareName || lastMove.to === squareName);
                const isCheck = checkSquare === squareName;
                const isHighlighted = highlights.includes(squareName);

                return (
                  <div
                    id={`square-${squareName}`}
                    key={squareName}
                    style={{ 
                      backgroundColor: getSquareBgColor(fileIdx, rankIdx),
                      touchAction: "manipulation"
                    }}
                    className="relative flex items-center justify-center cursor-pointer transition-colors duration-150 select-none [-webkit-tap-highlight-color:transparent]"
                    onPointerDown={(e) => handlePointerDown(squareName, e)}
                    onClick={(e) => handleClick(squareName, e)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(squareName, e)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (onSquareRightClick) onSquareRightClick(squareName);
                    }}
                  >
                    {/* Previous move soft yellow highlight */}
                    {isPreviousMove && (
                      <div className="absolute inset-0 bg-[#f7ec59]/40 z-0 pointer-events-none transition-opacity" />
                    )}

                    {/* Selected square golden highlight */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#f7ec59]/60 ring-2 ring-amber-400 z-10 pointer-events-none animate-pulse" />
                    )}

                    {/* Invalid move red flash */}
                    {isInvalid && (
                      <div className="absolute inset-0 bg-rose-600/75 ring-2 ring-rose-500 z-30 pointer-events-none animate-ping" />
                    )}

                    {/* Custom highlights overlay */}
                    {isHighlighted && (
                      <div className="absolute inset-0 bg-red-500/35 ring-2 ring-red-500 z-10 pointer-events-none" />
                    )}

                    {/* Check & Checkmate Glowing Aura */}
                    {isCheck && (
                      <div
                        className={`absolute inset-0 z-10 pointer-events-none rounded-sm ${
                          isCheckmate
                            ? "bg-gradient-to-r from-red-600/80 via-rose-600/90 to-amber-500/80 ring-4 ring-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.9)] animate-pulse"
                            : "bg-red-600/50 ring-2 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.7)]"
                        }`}
                      />
                    )}

                    {/* Render Piece */}
                    <AnimatePresence>
                      {piece && (
                        <div
                          key={`${piece.type}-${piece.color}-${squareName}`}
                          draggable={interactive && !disabled && piece.color === game.turn()}
                          onDragStart={(e) => handleDragStart(squareName, e)}
                          className="relative w-[86%] h-[86%] flex items-center justify-center z-20 transition-transform duration-150 cursor-pointer pointer-events-none"
                        >
                          <ChessPiece
                            type={piece.type}
                            color={piece.color}
                            isSelected={isSelected}
                            pieceStyle={activePieceStyle}
                          />
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Legal move indicator dots / capture rings */}
                    {isLegal && (
                      <div
                        className={`absolute z-30 pointer-events-none transition-all ${
                          piece
                            ? "w-[88%] h-[88%] border-4 border-emerald-500/90 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                            : "w-3.5 h-3.5 md:w-4 md:h-4 bg-emerald-500/90 rounded-full shadow-md shadow-emerald-900/60"
                        }`}
                      />
                    )}

                    {/* Rank Coordinate Labels (Left column) */}
                    {fileIdx === 0 && (
                      <span
                        className="absolute top-0.5 left-1 text-[9px] md:text-[10px] font-black select-none font-mono opacity-80 mix-blend-difference text-white pointer-events-none"
                      >
                        {rank}
                      </span>
                    )}

                    {/* File Coordinate Labels (Bottom row) */}
                    {rankIdx === 7 && (
                      <span
                        className="absolute bottom-0.5 right-1 text-[9px] md:text-[10px] font-black select-none font-mono opacity-80 mix-blend-difference text-white pointer-events-none"
                      >
                        {file}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Pawn Promotion Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 rounded-[12px] animate-fade-in">
            <div className="bg-slate-900 border-2 border-amber-400/70 p-5 rounded-2xl shadow-2xl text-center max-w-[280px] w-full">
              <h4 className="text-amber-400 font-bold text-base mb-1 tracking-wide">Pawn Promotion</h4>
              <p className="text-slate-300 text-xs mb-4">Select piece to promote to:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "q", name: "Queen", symbol: pendingPromotion.color === "w" ? "♕" : "♛" },
                  { key: "r", name: "Rook", symbol: pendingPromotion.color === "w" ? "♖" : "♜" },
                  { key: "b", name: "Bishop", symbol: pendingPromotion.color === "w" ? "♗" : "♝" },
                  { key: "n", name: "Knight", symbol: pendingPromotion.color === "w" ? "♘" : "♞" }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSelectPromotion(opt.key as any);
                    }}
                    onClick={() => handleSelectPromotion(opt.key as any)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-amber-500/25 active:scale-95 border border-slate-700 hover:border-amber-400 transition-all cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
                  >
                    <span className="text-3xl mb-1 text-white pointer-events-none">{opt.symbol}</span>
                    <span className="text-[11px] font-bold text-amber-300 pointer-events-none">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Graphical Arrows Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" viewBox="0 0 100 100">
          <defs>
            <marker
              id="arrow-head-ai"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker
              id="arrow-head-user"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {arrows.map((arrowStr, index) => {
            if (arrowStr.length < 4) return null;
            const fromSq = arrowStr.substring(0, 2);
            const toSq = arrowStr.substring(2, 4);

            const fromCoords = getSquareCoords(fromSq);
            const toCoords = getSquareCoords(toSq);

            if (!fromCoords || !toCoords) return null;

            const dx = toCoords.x - fromCoords.x;
            const dy = toCoords.y - fromCoords.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length === 0) return null;

            const shortenOffset = 4.5;
            const targetX = toCoords.x - (dx / length) * shortenOffset;
            const targetY = toCoords.y - (dy / length) * shortenOffset;

            const isAi = index === 0;

            return (
              <line
                key={`${arrowStr}-${index}`}
                x1={fromCoords.x}
                y1={fromCoords.y}
                x2={targetX}
                y2={targetY}
                stroke={isAi ? "#f43f5e" : "#10b981"}
                strokeWidth="1.8"
                strokeOpacity="0.85"
                markerEnd={isAi ? "url(#arrow-head-ai)" : "url(#arrow-head-user)"}
                className="animate-fade-in"
              />
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
};
