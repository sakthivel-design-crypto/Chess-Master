import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  Share2,
  Printer,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  Edit3,
  Award,
  ChevronRight
} from "lucide-react";
import {
  ScoreSheetData,
  downloadScoreSheetPdf,
  generateScoreSheetPdf
} from "../utils/pdfScoresheetGenerator";

interface ScoreSheetDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData?: Partial<ScoreSheetData>;
  onSuccessToast?: (msg: string) => void;
}

export const ScoreSheetDownloadModal: React.FC<ScoreSheetDownloadModalProps> = ({
  isOpen,
  onClose,
  gameData,
  onSuccessToast
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [lastFileName, setLastFileName] = useState("");
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState<string | null>(null);

  // Editable Form Fields
  const [whitePlayer, setWhitePlayer] = useState(gameData?.whitePlayer || "");
  const [blackPlayer, setBlackPlayer] = useState(gameData?.blackPlayer || "");
  const [whiteRating, setWhiteRating] = useState(gameData?.whiteRating?.toString() || "");
  const [blackRating, setBlackRating] = useState(gameData?.blackRating?.toString() || "");
  const [gameType, setGameType] = useState(gameData?.gameType || "");
  const [timeControl, setTimeControl] = useState(gameData?.timeControl || "");
  const [openingName, setOpeningName] = useState(gameData?.openingName || "");
  const [ecoCode, setEcoCode] = useState(gameData?.ecoCode || "");
  const [result, setResult] = useState(gameData?.result || "");
  const [resultReason, setResultReason] = useState(gameData?.resultReason || "");
  const [notes, setNotes] = useState(gameData?.notes || "");

  if (!isOpen) return null;

  const handleClearAll = () => {
    setWhitePlayer("");
    setBlackPlayer("");
    setWhiteRating("");
    setBlackRating("");
    setGameType("");
    setTimeControl("");
    setOpeningName("");
    setEcoCode("");
    setResult("");
    setResultReason("");
    setNotes("");
  };

  // Build complete score sheet payload
  const buildPayload = (): ScoreSheetData => {
    return {
      gameId: gameData?.gameId || "",
      date: gameData?.date || "",
      timeGenerated: new Date().toLocaleTimeString(),
      whitePlayer,
      blackPlayer,
      whiteRating,
      blackRating,
      opponentInfo: gameData?.opponentInfo || "",
      gameType: gameType ? (timeControl ? `${gameType} (${timeControl})` : gameType) : "",
      timeControl,
      duration: gameData?.duration || "",
      result,
      resultReason,
      openingName,
      ecoCode,
      accuracyScore: gameData?.accuracyScore,
      whiteAccuracy: gameData?.whiteAccuracy,
      blackAccuracy: gameData?.blackAccuracy,
      moves: gameData?.moves || [],
      notes
    };
  };

  const handleStartDownload = async () => {
    setIsGenerating(true);
    setProgress(15);

    try {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(45);

      const payload = buildPayload();
      await new Promise((r) => setTimeout(r, 200));
      setProgress(85);

      const fileName = downloadScoreSheetPdf(payload);
      setLastFileName(fileName);

      // Generate blob for preview / print / share
      const pdfDoc = generateScoreSheetPdf(payload);
      const blob = pdfDoc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      setActivePdfBlobUrl(blobUrl);

      setProgress(100);
      setIsGenerating(false);
      setDownloadSuccess(true);

      if (onSuccessToast) {
        onSuccessToast(`✅ Score sheet downloaded: ${fileName}`);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setIsGenerating(false);
    }
  };

  const handleOpenPreview = () => {
    if (activePdfBlobUrl) {
      window.open(activePdfBlobUrl, "_blank");
    } else {
      const payload = buildPayload();
      const pdfDoc = generateScoreSheetPdf(payload);
      const blob = pdfDoc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    }
  };

  const handlePrintPdf = () => {
    if (activePdfBlobUrl) {
      const printWindow = window.open(activePdfBlobUrl);
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    } else {
      const payload = buildPayload();
      const pdfDoc = generateScoreSheetPdf(payload);
      pdfDoc.autoPrint();
      const blobUrl = URL.createObjectURL(pdfDoc.output("blob"));
      window.open(blobUrl, "_blank");
    }
  };

  const handleSharePdf = async () => {
    const payload = buildPayload();
    const pdfDoc = generateScoreSheetPdf(payload);
    const blob = pdfDoc.output("blob");
    const file = new File([blob], lastFileName || "ChessZen_ScoreSheet.pdf", {
      type: "application/pdf"
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "ChessZen Game Score Sheet",
          text: `Check out my chess game score sheet on ChessZen!`
        });
      } catch (e) {
        console.log("Share cancelled or not supported");
      }
    } else {
      // Fallback: download
      handleStartDownload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-[28px] shadow-2xl p-6 md:p-8 text-white space-y-6 overflow-hidden"
        >
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Official Document Export
              </span>
              <h2 className="text-2xl font-black font-display tracking-tight text-white">
                Download PDF Score Sheet
              </h2>
            </div>
          </div>

          {/* SUCCESS BANNER */}
          {downloadSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-2 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-base font-bold text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Score sheet downloaded successfully!</span>
              </div>
              <p className="text-xs font-mono text-emerald-300/80">
                File saved: <strong className="text-white">{lastFileName}</strong>
              </p>
            </motion.div>
          ) : (
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Export an official tournament-style PDF score sheet complete with full move notation, AI move evaluations, opening statistics, and AI Coach notes.
            </p>
          )}

          {/* PROGRESS BAR OVERLAY WHEN GENERATING */}
          {isGenerating && (
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-amber-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF Score Sheet...
                </span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* EDITABLE FIELDS DETAILS */}
          <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-xs">
            <div className="flex items-center justify-between font-mono text-slate-400 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Edit3 className="h-3.5 w-3.5" /> Score Sheet Details
              </span>
              <button
                onClick={handleClearAll}
                className="text-[10px] text-slate-400 hover:text-amber-400 underline cursor-pointer"
              >
                Clear / Download Blank
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">White Player</label>
                <input
                  type="text"
                  value={whitePlayer}
                  onChange={(e) => setWhitePlayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Black Player</label>
                <input
                  type="text"
                  value={blackPlayer}
                  onChange={(e) => setBlackPlayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Format & Time</label>
                <input
                  type="text"
                  value={`${gameType} (${timeControl})`}
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Opening Played</label>
                <input
                  type="text"
                  value={openingName}
                  onChange={(e) => setOpeningName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS GRID */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Download Button */}
            <button
              onClick={handleStartDownload}
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black font-display text-base flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 transition-all border border-amber-300/50 disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>📄 Download Score Sheet (PDF)</span>
            </button>

            {/* Additional Options: Preview, Share, Print */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleOpenPreview}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-amber-400" />
                <span>📂 Preview</span>
              </button>

              <button
                onClick={handleSharePdf}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 className="h-4 w-4 text-emerald-400" />
                <span>📤 Share</span>
              </button>

              <button
                onClick={handlePrintPdf}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="h-4 w-4 text-cyan-400" />
                <span>🖨 Print</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
