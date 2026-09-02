var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_chess = require("chess.js");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var geminiClient = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    geminiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
app.post("/api/coach/explain", async (req, res) => {
  try {
    const { fen, move, history, rating } = req.body;
    const client = getGeminiClient();
    const prompt = `You are an elite Grandmaster Chess Coach. Explain the strategic and tactical meaning of the move "${move}" in the following position:
FEN: ${fen}
Game move history: ${history ? history.join(", ") : "None"}
Player Rating: ${rating || 1200} ELO (Adapt your explanation level to this rating).

Your response must include:
1. Tactical ideas (forks, pins, skewers, defense, or attacks created/threatened).
2. Positional and strategic ideas (pawn structure, piece activity, center control, king safety, development).
3. A simple, encouraging summary that is direct and clear.
Avoid overly long explanations, keep it clear, human, and highly professional. Do not use markdown titles; use standard bullet points.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ explanation: response.text });
  } catch (error) {
    console.warn("Gemini Explain Fallback activated due to:", error.message || error);
    const moveStr = String(req.body.move || "").trim();
    const isCheck = moveStr.includes("+");
    const isCheckmate = moveStr.includes("#");
    const isCapture = moveStr.includes("x");
    let pieceType = "pawn";
    if (moveStr.startsWith("N")) pieceType = "knight";
    else if (moveStr.startsWith("B")) pieceType = "bishop";
    else if (moveStr.startsWith("R")) pieceType = "rook";
    else if (moveStr.startsWith("Q")) pieceType = "queen";
    else if (moveStr.startsWith("K")) pieceType = "king";
    else if (moveStr === "O-O" || moveStr === "O-O-O") pieceType = "castling";
    const bullet1 = isCheckmate ? "\u2022 Tactical checkmate trapping the enemy King." : isCheck ? "\u2022 Forcing check that restricts the opponent's king coordinate options and breaks their piece synergy." : isCapture ? "\u2022 Sharp capturing sequence removing an active defender or contesting space on a critical outpost." : `\u2022 Active ${pieceType} placement aiming to secure positional influence over the center squares.`;
    let bullet2 = "";
    if (pieceType === "knight") {
      bullet2 = "\u2022 Initiates a strong knight maneuver toward active central outposts or weak enemy color complexes.";
    } else if (pieceType === "bishop") {
      bullet2 = "\u2022 Activates the long-range bishop along open diagonals, aiming to pin, skew, or control key avenues.";
    } else if (pieceType === "rook") {
      bullet2 = "\u2022 Rooks excel on open ranks/files; this aligns the rook to back up central lines or press on the 7th rank.";
    } else if (pieceType === "queen") {
      bullet2 = "\u2022 Queen coordinates with active minor pieces, establishing mating patterns or multi-pronged double attacks.";
    } else if (pieceType === "castling") {
      bullet2 = "\u2022 Completes king safety and connects the rooks, completing a textbook transition into the middlegame.";
    } else {
      bullet2 = "\u2022 Shapes your pawn structure and prepares space for your minor pieces to develop naturally.";
    }
    const explanation = `**Offline Chess Coach (Heuristic Mode)**

Here is a tactical and strategic review of your move **${moveStr || "played"}**:

${bullet1}
${bullet2}
\u2022 **Encouraging Summary**: You are playing with solid fundamental intentions. Keep seeking central control, coordinating your piece actions, and ensuring your King remains fully shielded!`;
    res.json({ explanation });
  }
});
app.post("/api/coach/suggest", async (req, res) => {
  try {
    const { fen, history, rating, legalMoves } = req.body;
    const client = getGeminiClient();
    const prompt = `You are ChessMaster AI, an elite Grandmaster coach. 
We have a position with FEN: "${fen}".
Game History: ${history ? history.join(", ") : "None"}.
Player Rating: ${rating || 1200}.
List of legal moves available in this position: ${legalMoves ? legalMoves.join(", ") : "All legal moves"}.

Identify the single BEST move for the side whose turn it is. 
You MUST respond with a JSON object containing:
- bestMove: The algebraic notation of the best move (e.g., "Nf3", "e4", "O-O", "Bxf7+"). Ensure it is legal in standard chess!
- explanation: A structured, beginner-friendly strategic explanation of why this move is best, what it attacks, what it defends, and how it prepares future plans.
- arrows: An array of strings representing graphic arrows to draw on the board (format: "e2e4" or "g1f3" to show the move, or "d1h5" to show threats). Limit to 1-2 key arrows.
- highlights: An array of square names to highlight (e.g., ["e4", "f7"]). Limit to 1-2 critical squares.

Analyze deeply, then return ONLY the valid JSON object. Do not wrap in markdown code blocks other than standard JSON, or just return raw JSON text.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            bestMove: { type: import_genai.Type.STRING },
            explanation: { type: import_genai.Type.STRING },
            arrows: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            highlights: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: ["bestMove", "explanation", "arrows", "highlights"]
        }
      }
    });
    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error) {
    console.warn("Gemini Suggest Fallback activated due to:", error.message || error);
    try {
      const { fen } = req.body;
      const chess = new import_chess.Chess(fen);
      const movesList = chess.moves({ verbose: true });
      if (movesList.length === 0) {
        return res.json({
          bestMove: "",
          explanation: "There are no legal moves available. The game has concluded.",
          arrows: [],
          highlights: []
        });
      }
      let bestMoveObj = movesList[0];
      let maxScore = -1e3;
      for (const m of movesList) {
        let score = 0;
        if (m.captured) {
          const valMap = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
          score += (valMap[m.captured] || 1) * 10;
        }
        if (m.san.includes("+")) {
          score += 5;
        }
        if (m.san === "O-O" || m.san === "O-O-O") {
          score += 8;
        }
        if (m.piece === "n" || m.piece === "b") {
          score += 3;
        }
        const centerSquares = ["d4", "d5", "e4", "e5", "c4", "f4", "c5", "f5"];
        if (centerSquares.includes(m.to)) {
          score += 2;
        }
        if (m.piece === "k" && m.san !== "O-O" && m.san !== "O-O-O") {
          score -= 4;
        }
        if (score > maxScore) {
          maxScore = score;
          bestMoveObj = m;
        }
      }
      const bestMoveSan = bestMoveObj.san;
      const bestMoveLan = bestMoveObj.from + bestMoveObj.to;
      const pieceTypeNames = {
        p: "Pawn",
        n: "Knight",
        b: "Bishop",
        r: "Rook",
        q: "Queen",
        k: "King"
      };
      const pieceName = pieceTypeNames[bestMoveObj.piece] || "Piece";
      let explanationStr = `I suggest playing **${bestMoveSan}**. This ${pieceName.toLowerCase()} move `;
      if (bestMoveObj.captured) {
        explanationStr += `actively captures the opponent's defender on ${bestMoveObj.to}, gaining a material/tactical advantage.`;
      } else if (bestMoveObj.san === "O-O" || bestMoveObj.san === "O-O-O") {
        explanationStr += `secures your King into safety while activating your Rook toward the center files.`;
      } else if (bestMoveObj.piece === "n" || bestMoveObj.piece === "b") {
        explanationStr += `develops a minor piece toward the center, claiming spatial influence and preparing future castle safety.`;
      } else {
        explanationStr += `improves your positional presence, controlling key files and preparing coordinating avenues for your other pieces.`;
      }
      res.json({
        bestMove: bestMoveSan,
        explanation: `${explanationStr} (Offline Rules Engine)`,
        arrows: [bestMoveLan],
        highlights: [bestMoveObj.to]
      });
    } catch (fallbackErr) {
      console.error("Critical fallback failure in Suggest route:", fallbackErr);
      res.status(500).json({ error: "Failed to generate move suggestion" });
    }
  }
});
app.post("/api/coach/analyze", async (req, res) => {
  try {
    const { moves, rating } = req.body;
    const client = getGeminiClient();
    const prompt = `You are the chief Game Reviewer at ChessMaster AI.
Analyze this sequence of chess moves played in a game: ${moves ? moves.join(", ") : "e4 e5 Nf3 Nc6 Bc4"}.
Player ELO rating: ${rating || 1200}.

Provide a comprehensive, high-quality game analysis report in JSON format containing:
- accuracyScore: An integer between 0 and 100 indicating general move quality.
- brilliantMovesCount: Number of brilliant moves found.
- blundersCount: Number of blunders found.
- mistakesCount: Number of mistakes found.
- classificationList: An array of objects for each of the last 6 moves (or as many as provided), classifying them. Format: { moveNum: number, whiteMove: string, whiteClass: "Brilliant"|"Best"|"Excellent"|"Good"|"Inaccuracy"|"Mistake"|"Blunder", blackMove?: string, blackClass?: "Brilliant"|"Best"|"Excellent"|"Good"|"Inaccuracy"|"Mistake"|"Blunder", explanation: string }
- openingReview: A brief summary of how well the opening was played.
- tacticalReview: A summary of the tactical awareness.
- positionalReview: A summary of positional play (piece activity, structures).
- endgameReview: A brief summary of endgame technique if applicable, or general advice.
- improvementPlan: An actionable list of 3 bullet points to help this player improve based on the errors in this game.

Return ONLY the valid JSON object.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            accuracyScore: { type: import_genai.Type.INTEGER },
            brilliantMovesCount: { type: import_genai.Type.INTEGER },
            blundersCount: { type: import_genai.Type.INTEGER },
            mistakesCount: { type: import_genai.Type.INTEGER },
            classificationList: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  moveNum: { type: import_genai.Type.INTEGER },
                  whiteMove: { type: import_genai.Type.STRING },
                  whiteClass: { type: import_genai.Type.STRING },
                  blackMove: { type: import_genai.Type.STRING },
                  blackClass: { type: import_genai.Type.STRING },
                  explanation: { type: import_genai.Type.STRING }
                },
                required: ["moveNum", "whiteMove", "whiteClass", "explanation"]
              }
            },
            openingReview: { type: import_genai.Type.STRING },
            tacticalReview: { type: import_genai.Type.STRING },
            positionalReview: { type: import_genai.Type.STRING },
            endgameReview: { type: import_genai.Type.STRING },
            improvementPlan: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: [
            "accuracyScore",
            "brilliantMovesCount",
            "blundersCount",
            "mistakesCount",
            "classificationList",
            "openingReview",
            "tacticalReview",
            "positionalReview",
            "endgameReview",
            "improvementPlan"
          ]
        }
      }
    });
    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error) {
    console.warn("Gemini Game Analysis Fallback activated due to:", error.message || error);
    const gameMoves = Array.isArray(req.body.moves) ? req.body.moves : ["e4", "e5", "Nf3", "Nc6", "Bc4"];
    const classificationList = [];
    const pairs = [];
    for (let i = 0; i < gameMoves.length; i += 2) {
      pairs.push({
        white: gameMoves[i],
        black: gameMoves[i + 1]
      });
    }
    const lastPairs = pairs.slice(-6);
    lastPairs.forEach((pair) => {
      const idxInMoves = gameMoves.indexOf(pair.white);
      const moveNum = Math.floor(idxInMoves / 2) + 1;
      let wClass = "Excellent";
      if (pair.white === "e4" || pair.white === "d4" || pair.white === "Nf3" || pair.white === "Nc3") wClass = "Best";
      else if (pair.white.includes("+")) wClass = "Brilliant";
      else if (pair.white.includes("x")) wClass = "Excellent";
      let bClass = void 0;
      if (pair.black) {
        bClass = "Excellent";
        if (pair.black === "e5" || pair.black === "d5" || pair.black === "Nf6" || pair.black === "Nc6") bClass = "Best";
        else if (pair.black.includes("+")) bClass = "Brilliant";
        else if (pair.black.includes("x")) bClass = "Excellent";
      }
      classificationList.push({
        moveNum,
        whiteMove: pair.white,
        whiteClass: wClass,
        blackMove: pair.black,
        blackClass: bClass,
        explanation: `Both players coordinates are highly active. White's ${pair.white} and Black's ${pair.black || ""} developed key control lines.`
      });
    });
    res.json({
      accuracyScore: 82,
      brilliantMovesCount: gameMoves.filter((m) => m.includes("+")).length || 1,
      blundersCount: 0,
      mistakesCount: 1,
      classificationList,
      openingReview: "Solid opening development from both players, focused on capturing space in the center and castle preparations. (Offline Heuristics)",
      tacticalReview: "Strong tactical awareness. Checked and defended vulnerable files appropriately throughout the sequence.",
      positionalReview: "Active minor piece structures. Controlled major files and avoided locking in active bishops.",
      endgameReview: "Transition to middlegame structures is highly active; keep king safety as a primary metric before starting endgame marches.",
      improvementPlan: [
        "Prioritize early castling: Keep your King secure by castling before starting aggressive minor piece advances.",
        "Develop minor pieces first: Ensure both knights and bishops are active before moving major pieces (Queen & Rooks).",
        "Pawn chain structure: Be mindful of backward pawns and avoid creating isolated pawn weaknesses in the center."
      ]
    });
  }
});
app.post("/api/coach/voice", async (req, res) => {
  try {
    const { question, fen, history, rating } = req.body;
    const client = getGeminiClient();
    const prompt = `You are the Voice AI Chess Coach. The user is playing a game and asks you a question.
User question: "${question}"
Current Position FEN: ${fen}
Move History: ${history ? history.join(", ") : "None"}
User Rating: ${rating || 1200} ELO.

Answer the user's question directly, clearly, and concisely, as if you are speaking to them.
Include tactical or strategic advice for the current board state.
You MUST respond with a JSON object containing:
- spokenResponse: The direct spoken answer (simple, clean text, ideal for text-to-speech, maximum 3-4 sentences).
- arrows: An array of strings of moves/lines to draw (e.g., ["d8h4", "e4f5"]).
- highlights: An array of squares to highlight (e.g., ["f7", "g5"]).

Return ONLY the valid JSON object.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            spokenResponse: { type: import_genai.Type.STRING },
            arrows: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            highlights: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: ["spokenResponse", "arrows", "highlights"]
        }
      }
    });
    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error) {
    console.warn("Gemini Voice Coach Fallback activated due to:", error.message || error);
    try {
      const { question, fen } = req.body;
      const chess = new import_chess.Chess(fen);
      const movesList = chess.moves({ verbose: true });
      let spokenResponse = "Focus on maintaining solid pawn structures, developing minor pieces to active center outposts, and scanning the entire board for tactical opportunities like pins and forks.";
      const q = String(question || "").toLowerCase();
      if (q.includes("plan") || q.includes("strategy") || q.includes("what do") || q.includes("how to")) {
        spokenResponse = "Your best strategic plan is to activate your minor pieces towards the center and prepare to castle to connect your rooks. Look for open files to double your rooks and press the opponent's backward pawns.";
      } else if (q.includes("king") || q.includes("vulnerable") || q.includes("safety") || q.includes("attack")) {
        spokenResponse = "To ensure maximum king safety, avoid pushing the pawns directly in front of your castled king. If you are preparing an attack, make sure your own center is secure first.";
      } else if (q.includes("threat") || q.includes("danger") || q.includes("protect")) {
        spokenResponse = "Before making your move, examine your opponent's last move. Check if it attacks any undefended pieces or creates forcing check lines. Safety first!";
      } else if (q.includes("center") || q.includes("space")) {
        spokenResponse = "Controlling the center is the key to chess. Use your pawns to contest d4 and e4, and position your knights on active squares like f3 or c3 to guard these zones.";
      }
      spokenResponse += " (Offline Voice Coach mode enabled)";
      const arrows = movesList.length > 0 ? [movesList[0].from + movesList[0].to] : [];
      const highlights = movesList.length > 0 ? [movesList[0].to] : [];
      res.json({
        spokenResponse,
        arrows,
        highlights
      });
    } catch (fallbackErr) {
      console.error("Critical fallback failure in Voice Coach route:", fallbackErr);
      res.status(500).json({ error: "Failed to answer voice query" });
    }
  }
});
app.post("/api/coach/plan", async (req, res) => {
  try {
    const { rating, weaknesses, studyHours, goals } = req.body;
    const client = getGeminiClient();
    const prompt = `You are ChessMaster AI Study Planner. Create a weekly personalized study plan for a chess player with:
Rating: ${rating || 1e3} ELO
Weaknesses: ${weaknesses || "tactics, endgames"}
Weekly Study Hours: ${studyHours || 5} hours
Goals: ${goals || "Reach 1500 ELO"}

You MUST return a JSON object containing:
- title: A custom, motivating title.
- focusAreas: An array of 3 key focus areas.
- dailySchedule: An array of objects for 7 days. Each object: { day: "Day 1" | ... | "Day 7", topic: string, durationMin: number, description: string, practicePositionsCount: number }
- generalAdvice: A paragraph of expert coaching advice.

Return ONLY the valid JSON object.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING },
            focusAreas: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            dailySchedule: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  day: { type: import_genai.Type.STRING },
                  topic: { type: import_genai.Type.STRING },
                  durationMin: { type: import_genai.Type.INTEGER },
                  description: { type: import_genai.Type.STRING },
                  practicePositionsCount: { type: import_genai.Type.INTEGER }
                },
                required: ["day", "topic", "durationMin", "description"]
              }
            },
            generalAdvice: { type: import_genai.Type.STRING }
          },
          required: ["title", "focusAreas", "dailySchedule", "generalAdvice"]
        }
      }
    });
    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error) {
    console.warn("Gemini Study Plan Fallback activated due to:", error.message || error);
    const targetRating = req.body.rating || 1e3;
    const targetWeaknesses = req.body.weaknesses || "tactics, endgames";
    const targetGoals = req.body.goals || "Reach 1500 ELO";
    const title = `${targetGoals} Study Plan`;
    const focusAreas = [
      "Strategic Opening Guidelines & Center Domination",
      "Tactical Vision & Scanning for Forcing Moves",
      "Endgame Essentials & King/Pawn Coordination"
    ];
    const dailySchedule = [
      { day: "Day 1", topic: "Opening Principles & Space Control", durationMin: 45, description: "Review standard opening structures and learn to control the central squares with pawns and minor pieces.", practicePositionsCount: 5 },
      { day: "Day 2", topic: "Tactics: Pins, Forks & Skewers", durationMin: 60, description: "Train on solving tactical puzzles focusing on double attacks (forks) and line attacks (pins/skewers).", practicePositionsCount: 15 },
      { day: "Day 3", topic: "Middlegame Pawn Structures", durationMin: 45, description: "Study weak squares, outposts for knights, and how to avoid creating isolated or doubled pawns.", practicePositionsCount: 5 },
      { day: "Day 4", topic: "King Safety & Castling timing", durationMin: 30, description: "Analyze your own games to check if you castled early enough, and practice defending against kingside pawn attacks.", practicePositionsCount: 3 },
      { day: "Day 5", topic: "Endgame: King & Pawn coordination", durationMin: 60, description: "Learn the rule of the square, opposition, and how to promote a passed pawn when only kings and pawns remain.", practicePositionsCount: 10 },
      { day: "Day 6", topic: "Full Game Analysis Review", durationMin: 60, description: "Play one slow game (10+5 or longer) and review every move to identify blunders and mistake-points.", practicePositionsCount: 1 },
      { day: "Day 7", topic: "Rest & Casual Puzzle Solving", durationMin: 30, description: "Solve a few casual chess puzzles to keep your tactical vision sharp without high-intensity stress.", practicePositionsCount: 5 }
    ];
    const generalAdvice = `To achieve your goal of "${targetGoals}", consistency is key. At your current rating level of ${targetRating} ELO, the fastest way to gain ELO is by reducing unforced blunders (hanging pieces) and spotting simple tactical forks. Spend 70% of your study hours on tactics (focusing on ${targetWeaknesses}), and always analyze your losses first! (Offline Planner fallback activated).`;
    res.json({
      title,
      focusAreas,
      dailySchedule,
      generalAdvice
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ChessMaster AI server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
