import React, { useState } from "react";
import { Download, Printer, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { downloadScoreSheetPdf, ScoreSheetData } from "../utils/pdfScoresheetGenerator";

export const Scoresheet: React.FC = () => {
  // State for scoresheet fields
  const [event, setEvent] = useState("");
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<"1-0" | "0-1" | "1/2-1/2" | "">("");

  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // 50 Move rows for classic score sheet
  const [moves, setMoves] = useState<{ white: string; black: string }[]>(
    Array.from({ length: 50 }, () => ({ white: "", black: "" }))
  );

  const handleMoveChange = (index: number, field: "white" | "black", value: string) => {
    setMoves((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const clearSheet = () => {
    setEvent("");
    setWhitePlayer("");
    setBlackPlayer("");
    setDate("");
    setResult("");
    setMoves(Array.from({ length: 50 }, () => ({ white: "", black: "" })));
  };

  const handleDownloadPdf = () => {
    const formattedMoves = moves
      .map((m, idx) => ({
        moveNumber: idx + 1,
        white: m.white,
        black: m.black
      }))
      .filter((m) => m.white.trim() !== "" || m.black.trim() !== "");

    const payload: ScoreSheetData = {
      gameType: event,
      whitePlayer: whitePlayer,
      blackPlayer: blackPlayer,
      date: date,
      result: result,
      moves: formattedMoves
    };

    const fileName = downloadScoreSheetPdf(payload);
    setPdfSuccessMessage(`Downloaded: ${fileName}`);
    setTimeout(() => setPdfSuccessMessage(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* ACTION CONTROLS HEADER */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white">Classic Chess Score Sheet</h2>
            <p className="text-xs text-slate-400">Official 50-move tournament score sheet template</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={clearSheet}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear Sheet
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST BANNER */}
      {pdfSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold flex items-center justify-between shadow-lg">
          <span>{pdfSuccessMessage}</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
      )}

      {/* PRINT STYLES SHEET */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background-color: white !important;
            color: black !important;
          }
          @page {
            size: portrait;
            margin: 0.5cm;
          }
        }
      `}} />

      {/* CLASSIC SCORESHEET CANVAS (#print-area) */}
      <div 
        id="print-area" 
        className="bg-white text-slate-950 p-3 sm:p-6 max-w-3xl mx-auto shadow-2xl border-4 border-slate-950 font-serif print:shadow-none print:p-2"
      >
        {/* INNER DOUBLE BORDER FRAME */}
        <div className="border border-slate-950 p-4 sm:p-6 space-y-5">
          
          {/* HEADER TITLE */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-950 font-serif">
              CHESS SCORE SHEET
            </h1>
          </div>

          {/* TOP EVENT & PLAYERS METADATA */}
          <div className="space-y-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide max-w-xl">
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-32 font-serif font-black">EVENT:</span>
              <input 
                type="text" 
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="_____________________________________________"
                className="flex-grow bg-transparent border-b border-slate-950 focus:outline-none font-sans text-xs sm:text-sm px-1 py-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0 w-32 font-serif font-black">WHITE PLAYER:</span>
              <input 
                type="text" 
                value={whitePlayer}
                onChange={(e) => setWhitePlayer(e.target.value)}
                placeholder="_____________________________________________"
                className="flex-grow bg-transparent border-b border-slate-950 focus:outline-none font-sans text-xs sm:text-sm px-1 py-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="shrink-0 w-32 font-serif font-black">BLACK PLAYER:</span>
              <input 
                type="text" 
                value={blackPlayer}
                onChange={(e) => setBlackPlayer(e.target.value)}
                placeholder="_____________________________________________"
                className="flex-grow bg-transparent border-b border-slate-950 focus:outline-none font-sans text-xs sm:text-sm px-1 py-0.5"
              />
            </div>
          </div>

          {/* 50-MOVE 2-COLUMN GRID TABLE */}
          <div className="border-2 border-slate-950 text-xs font-sans">
            <div className="grid grid-cols-2 divide-x-2 divide-slate-950">
              
              {/* LEFT COLUMN HEADER (Moves 1-25) */}
              <div className="grid grid-cols-12 border-b-2 border-slate-950 bg-slate-50 font-bold text-center uppercase py-1.5 font-serif text-[11px] tracking-wider">
                <div className="col-span-3 border-r border-slate-950">MOVE</div>
                <div className="col-span-4 border-r border-slate-950">WHITE</div>
                <div className="col-span-5">BLACK</div>
              </div>

              {/* RIGHT COLUMN HEADER (Moves 26-50) */}
              <div className="grid grid-cols-12 border-b-2 border-slate-950 bg-slate-50 font-bold text-center uppercase py-1.5 font-serif text-[11px] tracking-wider">
                <div className="col-span-3 border-r border-slate-950">MOVE</div>
                <div className="col-span-4 border-r border-slate-950">WHITE</div>
                <div className="col-span-5">BLACK</div>
              </div>

            </div>

            {/* 25 ROWS */}
            <div className="grid grid-cols-2 divide-x-2 divide-slate-950">
              
              {/* LEFT HALF (1-25) */}
              <div className="divide-y divide-slate-950">
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center text-center h-6">
                    <div className="col-span-3 border-r border-slate-950 font-bold font-serif text-[11px] h-full flex items-center justify-center bg-slate-50">
                      {idx + 1}
                    </div>
                    <div className="col-span-4 border-r border-slate-950 h-full">
                      <input 
                        type="text"
                        value={moves[idx].white}
                        onChange={(e) => handleMoveChange(idx, "white", e.target.value)}
                        className="w-full h-full text-center bg-transparent border-none p-0 focus:outline-none uppercase font-semibold text-xs"
                      />
                    </div>
                    <div className="col-span-5 h-full">
                      <input 
                        type="text"
                        value={moves[idx].black}
                        onChange={(e) => handleMoveChange(idx, "black", e.target.value)}
                        className="w-full h-full text-center bg-transparent border-none p-0 focus:outline-none uppercase font-semibold text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT HALF (26-50) */}
              <div className="divide-y divide-slate-950">
                {Array.from({ length: 25 }).map((_, i) => {
                  const idx = i + 25;
                  return (
                    <div key={idx} className="grid grid-cols-12 items-center text-center h-6">
                      <div className="col-span-3 border-r border-slate-950 font-bold font-serif text-[11px] h-full flex items-center justify-center bg-slate-50">
                        {idx + 1}
                      </div>
                      <div className="col-span-4 border-r border-slate-950 h-full">
                        <input 
                          type="text"
                          value={moves[idx].white}
                          onChange={(e) => handleMoveChange(idx, "white", e.target.value)}
                          className="w-full h-full text-center bg-transparent border-none p-0 focus:outline-none uppercase font-semibold text-xs"
                        />
                      </div>
                      <div className="col-span-5 h-full">
                        <input 
                          type="text"
                          value={moves[idx].black}
                          onChange={(e) => handleMoveChange(idx, "black", e.target.value)}
                          className="w-full h-full text-center bg-transparent border-none p-0 focus:outline-none uppercase font-semibold text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* BOTTOM RESULT SECTION */}
          <div className="flex items-center justify-center gap-6 text-xs sm:text-sm font-bold font-serif pt-2">
            <span className="font-black">RESULT:</span>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={result === "1-0"}
                onChange={(e) => setResult(e.target.checked ? "1-0" : "")}
                className="w-4 h-4 rounded-none border border-slate-950 accent-slate-900"
              />
              <span>1–0</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={result === "0-1"}
                onChange={(e) => setResult(e.target.checked ? "0-1" : "")}
                className="w-4 h-4 rounded-none border border-slate-950 accent-slate-900"
              />
              <span>0–1</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={result === "1/2-1/2"}
                onChange={(e) => setResult(e.target.checked ? "1/2-1/2" : "")}
                className="w-4 h-4 rounded-none border border-slate-950 accent-slate-900"
              />
              <span>½–½</span>
            </label>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="grid grid-cols-2 gap-8 pt-6 relative font-serif text-xs font-bold text-center">
            {/* Divider line */}
            <div className="absolute left-1/2 top-4 bottom-0 w-px bg-slate-950 -translate-x-1/2" />

            {/* WHITE SIGNATURE */}
            <div className="space-y-8 pr-2">
              <div className="uppercase">WHITE PLAYER SIGNATURE</div>
              <div className="border-b border-slate-950 w-3/4 mx-auto" />
            </div>

            {/* BLACK SIGNATURE */}
            <div className="space-y-8 pl-2">
              <div className="uppercase">BLACK PLAYER SIGNATURE</div>
              <div className="border-b border-slate-950 w-3/4 mx-auto" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
