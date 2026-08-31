import jsPDF from "jspdf";

export interface ScoreSheetMove {
  moveNumber: number;
  white: string;
  black: string;
  annotation?: string;
}

export interface ScoreSheetData {
  gameId?: string;
  date?: string;
  timeGenerated?: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteRating?: string | number;
  blackRating?: string | number;
  opponentInfo?: string;
  gameType?: string; // e.g. Blitz, Rapid, Bullet, Classical
  timeControl?: string; // e.g. 3+2
  duration?: string;
  result?: string; // e.g. "1-0", "0-1", "1/2-1/2"
  resultReason?: string; // e.g. "Checkmate", "Resignation", "Timeout", "Stalemate"
  winner?: string;
  openingName?: string;
  ecoCode?: string;
  accuracyScore?: number;
  whiteAccuracy?: number;
  blackAccuracy?: number;
  moves: ScoreSheetMove[];
  stats?: {
    bestMoves?: number;
    excellentMoves?: number;
    goodMoves?: number;
    inaccuracies?: number;
    mistakes?: number;
    blunders?: number;
    acpl?: number;
  };
  aiAnalysis?: {
    openingReview?: string;
    middleGameAnalysis?: string;
    endgameAnalysis?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    coachSummary?: string;
  };
  notes?: string;
}

/**
 * Renders a single 50-move official classic Chess Score Sheet page.
 */
function renderClassicPage(
  doc: jsPDF,
  data: ScoreSheetData,
  startMoveIndex: number,
  pageNumber: number,
  totalPages: number
) {
  if (pageNumber > 1) {
    doc.addPage();
  }

  // 1. Double Border Outline around page
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 194, 281);

  doc.setLineWidth(0.3);
  doc.rect(9.5, 9.5, 191, 278);

  // 2. Centered Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("CHESS SCORE SHEET", 105, 20, { align: "center" });

  // 3. Top Metadata Fields
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  const startYMeta = 26;
  const lineGap = 6.5;

  // EVENT
  doc.text("EVENT:", 15, startYMeta);
  doc.setLineWidth(0.25);
  doc.line(32, startYMeta + 0.5, 125, startYMeta + 0.5);
  
  const eventVal = data.gameType || data.openingName || "";
  const dateVal = data.date ? ` (${data.date})` : "";
  doc.setFont("helvetica", "normal");
  if (eventVal || dateVal) {
    doc.text(`${eventVal}${dateVal}`, 34, startYMeta - 0.5);
  }

  // WHITE PLAYER
  doc.setFont("helvetica", "bold");
  doc.text("WHITE PLAYER:", 15, startYMeta + lineGap);
  doc.line(45, startYMeta + lineGap + 0.5, 125, startYMeta + lineGap + 0.5);
  
  const whiteVal = data.whitePlayer ? `${data.whitePlayer}${data.whiteRating ? ` (${data.whiteRating})` : ""}` : "";
  doc.setFont("helvetica", "normal");
  if (whiteVal) {
    doc.text(whiteVal, 47, startYMeta + lineGap - 0.5);
  }

  // BLACK PLAYER
  doc.setFont("helvetica", "bold");
  doc.text("BLACK PLAYER:", 15, startYMeta + lineGap * 2);
  doc.line(45, startYMeta + lineGap * 2 + 0.5, 125, startYMeta + lineGap * 2 + 0.5);
  
  const blackVal = data.blackPlayer ? `${data.blackPlayer}${data.blackRating ? ` (${data.blackRating})` : ""}` : "";
  doc.setFont("helvetica", "normal");
  if (blackVal) {
    doc.text(blackVal, 47, startYMeta + lineGap * 2 - 0.5);
  }

  // 4. Move History Grid Table (Moves 1..25 on left, 26..50 on right)
  const tableTop = 46;
  const tableLeft = 14;
  const colWidths = [14, 38, 38, 14, 38, 38]; // MOVE, WHITE, BLACK, MOVE, WHITE, BLACK -> Total = 180mm
  const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
  const numRows = 25;
  const rowHeight = 6.8;
  const headerHeight = 7;

  // Draw Table Header
  let currentX = tableLeft;
  const headerTitles = ["MOVE", "WHITE", "BLACK", "MOVE", "WHITE", "BLACK"];

  doc.setLineWidth(0.35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  // Draw header outer box
  doc.rect(tableLeft, tableTop, totalTableWidth, headerHeight);

  headerTitles.forEach((title, idx) => {
    const w = colWidths[idx];
    if (idx > 0) {
      doc.line(currentX, tableTop, currentX, tableTop + headerHeight);
    }
    doc.text(title, currentX + w / 2, tableTop + 4.8, { align: "center" });
    currentX += w;
  });

  // Draw Table Rows (25 rows)
  let y = tableTop + headerHeight;

  for (let r = 0; r < numRows; r++) {
    const leftMoveNum = startMoveIndex + r + 1;
    const rightMoveNum = startMoveIndex + r + 26;

    const leftMoveData = data.moves[startMoveIndex + r];
    const rightMoveData = data.moves[startMoveIndex + r + 25];

    // Draw row horizontal box
    doc.rect(tableLeft, y, totalTableWidth, rowHeight);

    let x = tableLeft;

    // Col 0: Left Move Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${leftMoveNum}`, x + colWidths[0] / 2, y + 4.6, { align: "center" });

    // Col 1: Left White Move
    x += colWidths[0];
    doc.line(x, y, x, y + rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (leftMoveData?.white) {
      doc.text(leftMoveData.white, x + colWidths[1] / 2, y + 4.6, { align: "center" });
    }

    // Col 2: Left Black Move
    x += colWidths[1];
    doc.line(x, y, x, y + rowHeight);
    if (leftMoveData?.black) {
      doc.text(leftMoveData.black, x + colWidths[2] / 2, y + 4.6, { align: "center" });
    }

    // Col 3: Right Move Number
    x += colWidths[2];
    doc.line(x, y, x, y + rowHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${rightMoveNum}`, x + colWidths[3] / 2, y + 4.6, { align: "center" });

    // Col 4: Right White Move
    x += colWidths[3];
    doc.line(x, y, x, y + rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (rightMoveData?.white) {
      doc.text(rightMoveData.white, x + colWidths[4] / 2, y + 4.6, { align: "center" });
    }

    // Col 5: Right Black Move
    x += colWidths[4];
    doc.line(x, y, x, y + rowHeight);
    if (rightMoveData?.black) {
      doc.text(rightMoveData.black, x + colWidths[5] / 2, y + 4.6, { align: "center" });
    }

    y += rowHeight;
  }

  // 5. Result Section
  const resultY = y + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("RESULT:", 62, resultY);

  const rawResult = (data.result || "").trim();
  const isWhiteWin = rawResult === "1-0" || data.winner === "white";
  const isBlackWin = rawResult === "0-1" || data.winner === "black";
  const isDraw = rawResult === "1/2-1/2" || rawResult === "½-½" || rawResult === "0.5-0.5" || data.winner === "draw";

  // Checkbox 1: 1-0
  const cb1X = 85;
  doc.rect(cb1X, resultY - 3.5, 3.8, 3.8);
  if (isWhiteWin) {
    doc.text("X", cb1X + 0.8, resultY - 0.6);
  }
  doc.text("1–0", cb1X + 5.5, resultY);

  // Checkbox 2: 0-1
  const cb2X = 112;
  doc.rect(cb2X, resultY - 3.5, 3.8, 3.8);
  if (isBlackWin) {
    doc.text("X", cb2X + 0.8, resultY - 0.6);
  }
  doc.text("0–1", cb2X + 5.5, resultY);

  // Checkbox 3: 1/2-1/2
  const cb3X = 138;
  doc.rect(cb3X, resultY - 3.5, 3.8, 3.8);
  if (isDraw) {
    doc.text("X", cb3X + 0.8, resultY - 0.6);
  }
  doc.text("½–½", cb3X + 5.5, resultY);

  // 6. Signatures Section
  const sigY = resultY + 12;

  // Vertical center dividing line in signature section
  doc.setLineWidth(0.4);
  doc.line(105, sigY - 2, 105, sigY + 18);

  // Left Signature: White
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("WHITE PLAYER SIGNATURE", 22, sigY);
  doc.setLineWidth(0.25);
  doc.line(18, sigY + 14, 92, sigY + 14);

  // Right Signature: Black
  doc.text("BLACK PLAYER SIGNATURE", 118, sigY);
  doc.line(118, sigY + 14, 192, sigY + 14);
}

/**
 * Generates an official, publication-quality Chess Score Sheet matching the classic paper template.
 */
export function generateScoreSheetPdf(data: ScoreSheetData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const totalMoves = data.moves.length;
  const numPages = Math.max(1, Math.ceil(totalMoves / 50));

  for (let p = 0; p < numPages; p++) {
    renderClassicPage(doc, data, p * 50, p + 1, numPages);
  }

  return doc;
}

/**
 * Downloads the generated PDF to the user's device.
 */
export function downloadScoreSheetPdf(data: ScoreSheetData, customFilename?: string): string {
  const doc = generateScoreSheetPdf(data);
  const dateStr = data.date || new Date().toISOString().split("T")[0];
  const timeStr = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
  const fileName = customFilename || `ChessZen_ScoreSheet_${dateStr}_${timeStr}.pdf`;

  doc.save(fileName);
  return fileName;
}
