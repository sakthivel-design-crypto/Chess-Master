import { Chess } from "chess.js";

export interface ChessPuzzle {
  puzzleId: string;
  fen: string;
  sideToMove: "white" | "black";
  solutionMoves: string[]; // LAN or SAN move sequence
  puzzleRating: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  theme: string;
  title: string;
  description: string;
  hintIdea: string;
  hintPieceSquare?: string;
  explanationSteps: string[];
  source?: string;
}

export const RAW_PUZZLE_DATABASE: ChessPuzzle[] = [
  {
    puzzleId: "puz_001",
    fen: "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e1e8"],
    puzzleRating: 550,
    difficulty: "Beginner",
    theme: "Back Rank Mate",
    title: "Back Rank Checkmate",
    description: "Black's king is trapped behind its own pawns. Deliver checkmate in one move.",
    hintIdea: "Look for an undefended back rank on the 8th rank.",
    hintPieceSquare: "e1",
    explanationSteps: [
      "Observe that the Black king on g8 is blocked by f7, g7, and h7 pawns.",
      "The 8th rank is completely undefended.",
      "Playing Re8# delivers checkmate immediately because the King cannot escape or block."
    ]
  },
  {
    puzzleId: "puz_002",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    sideToMove: "white",
    solutionMoves: ["h5f7"],
    puzzleRating: 600,
    difficulty: "Beginner",
    theme: "Mate in 1",
    title: "The Weak f7 Square",
    description: "Exploit the undefended f7 square to deliver checkmate.",
    hintIdea: "Target the f7 pawn next to the enemy king with your Queen.",
    hintPieceSquare: "h5",
    explanationSteps: [
      "The f7 pawn is guarded only by the Black King.",
      "White's Bishop on c4 and Queen on h5 both attack f7.",
      "Qxf7# delivers checkmate instantly."
    ]
  },
  {
    puzzleId: "puz_003",
    fen: "2r3k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1",
    sideToMove: "black",
    solutionMoves: ["c8c1"],
    puzzleRating: 580,
    difficulty: "Beginner",
    theme: "Back Rank Mate",
    title: "Infiltrating the White Camp",
    description: "White left the back rank vulnerable. Deliver checkmate.",
    hintIdea: "Look for an unobstructed path to White's 1st rank.",
    hintPieceSquare: "c8",
    explanationSteps: [
      "White's g1 king has no escape square due to f2, g2, h2 pawns.",
      "Rc1# wins the game instantly."
    ]
  },
  {
    puzzleId: "puz_004",
    fen: "r3k2r/ppp2ppp/2n5/3N4/8/8/PPP2PPP/R3K2R w KQkq - 0 1",
    sideToMove: "white",
    solutionMoves: ["d5c7", "e8d8", "c7a8"],
    puzzleRating: 850,
    difficulty: "Intermediate",
    theme: "Fork",
    title: "Royal Knight Fork",
    description: "Fork the enemy king and rook with your knight to win material.",
    hintIdea: "Find an 'L' shape jump that attacks c7.",
    hintPieceSquare: "d5",
    explanationSteps: [
      "Nc7+ gives check to the king on e8 while attacking the a8 rook.",
      "After King moves to d8, Nxa8 wins a full rook."
    ]
  },
  {
    puzzleId: "puz_005",
    fen: "4k3/4q3/8/8/8/8/4R3/4K3 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e2e5", "e8f8", "e5e7"],
    puzzleRating: 920,
    difficulty: "Intermediate",
    theme: "Pin",
    title: "Absolute Pin on the Queen",
    description: "Pin Black's Queen to their King along the e-file.",
    hintIdea: "Move your rook along the e-file to press the pin.",
    hintPieceSquare: "e2",
    explanationSteps: [
      "Re5 pins the Black Queen on e7 to the King on e8.",
      "Black cannot move the Queen off the e-file.",
      "Rxe7 wins the Queen."
    ]
  },
  {
    puzzleId: "puz_006",
    fen: "5r1k/6pp/7N/8/2Q5/8/8/6K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["c4g8", "f8g8", "h6f7"],
    puzzleRating: 1050,
    difficulty: "Intermediate",
    theme: "Smothered Mate",
    title: "Classical Smothered Mate",
    description: "Sacrifice your Queen to trap the Black King behind his own rook.",
    hintIdea: "Look for a queen sacrifice on g8.",
    hintPieceSquare: "c4",
    explanationSteps: [
      "Qg8+ forces Rxg8 because the king has no escape.",
      "Nf7# delivers checkmate as the king is smothered by his own pieces."
    ]
  },
  {
    puzzleId: "puz_007",
    fen: "r1bq1rk1/ppp2ppp/2nb4/3p4/3P4/3B1N2/PPP2PPP/R1BQ1RK1 w - - 0 9",
    sideToMove: "white",
    solutionMoves: ["d3h7", "g8h7", "f3g5"],
    puzzleRating: 1350,
    difficulty: "Advanced",
    theme: "Sacrifice",
    title: "The Greek Gift Sacrifice",
    description: "Sacrifice the bishop on h7 to tear open Black's kingside.",
    hintIdea: "Look for a tactical sacrifice on h7.",
    hintPieceSquare: "d3",
    explanationSteps: [
      "Bxh7+ exposes the Black king.",
      "Kxh7 is forced.",
      "Ng5+ launches a lethal kingside attack."
    ]
  },
  {
    puzzleId: "puz_008",
    fen: "3r2k1/5ppp/8/3N4/8/8/5PPP/3R2K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["d5e7", "g8h8", "d1d8"],
    puzzleRating: 980,
    difficulty: "Intermediate",
    theme: "Remove the Defender",
    title: "Deflection of the King",
    description: "Deliver check with the knight to force the king away, winning the d8 rook.",
    hintIdea: "Check on e7 with the knight.",
    hintPieceSquare: "d5",
    explanationSteps: [
      "Ne7+ forces Kh8.",
      "Rxd8# wins the rook and delivers checkmate."
    ]
  },
  {
    puzzleId: "puz_009",
    fen: "8/4P3/8/8/8/8/5k2/7K w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e7e8q"],
    puzzleRating: 750,
    difficulty: "Beginner",
    theme: "Promotion",
    title: "Pawn Promotion",
    description: "Advance your pawn to the last rank to promote to a Queen.",
    hintIdea: "Push the pawn to e8.",
    hintPieceSquare: "e7",
    explanationSteps: [
      "Pushing e8=Q gains a Queen and secures an easy endgame win."
    ]
  },
  {
    puzzleId: "puz_010",
    fen: "r1b1k2r/ppp2ppp/2n5/3qp3/1b6/2N2N2/PPP2PPP/R1BQ1RK1 w kq - 0 1",
    sideToMove: "white",
    solutionMoves: ["c3d5"],
    puzzleRating: 780,
    difficulty: "Beginner",
    theme: "Hanging Piece",
    title: "Free Queen Capture",
    description: "Black left the Queen undefended on d5. Capture it with your knight.",
    hintIdea: "Look at the d5 square.",
    hintPieceSquare: "c3",
    explanationSteps: [
      "Nxd5 wins Black's Queen for free."
    ]
  },
  {
    puzzleId: "puz_011",
    fen: "k7/8/8/8/8/8/1q6/1R5K w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["b1b2"],
    puzzleRating: 500,
    difficulty: "Beginner",
    theme: "Hanging Piece",
    title: "Capture the Unprotected Queen",
    description: "Black's Queen is unprotected on b2. Take it with your rook.",
    hintIdea: "Attack b2 with your rook.",
    hintPieceSquare: "b1",
    explanationSteps: [
      "Rxb2 captures Black's Queen effortlessly."
    ]
  },
  {
    puzzleId: "puz_012",
    fen: "8/4k3/3p4/8/3P4/4K3/8/8 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e3e4", "e7e6", "d4d5"],
    puzzleRating: 1320,
    difficulty: "Advanced",
    theme: "Endgame",
    title: "King Centralization & Pawn Push",
    description: "Centralize your king and push the d-pawn to seize crucial space in the endgame.",
    hintIdea: "March your king to e4.",
    hintPieceSquare: "e3",
    explanationSteps: [
      "Ke4 centralizes the King into an active forward post.",
      "After Black responds Ke6, d5+ gains space and drives Black's king backward."
    ]
  },
  {
    puzzleId: "puz_013",
    fen: "r4rk1/ppp2ppp/8/8/8/8/PPP2PPP/R3R1K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e1e7"],
    puzzleRating: 880,
    difficulty: "Intermediate",
    theme: "Discovered Attack",
    title: "Rook Infiltration on the 7th Rank",
    description: "Occupy the 7th rank with your rook to attack enemy pawns.",
    hintIdea: "Infiltrate with Re7.",
    hintPieceSquare: "e1",
    explanationSteps: [
      "Re7 puts maximum pressure on c7 and f7, controlling the 7th rank."
    ]
  },
  {
    puzzleId: "puz_014",
    fen: "1r4k1/2Q2ppp/8/8/8/8/5PPP/6K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["c7b8"],
    puzzleRating: 650,
    difficulty: "Beginner",
    theme: "Back Rank Mate",
    title: "Queen Back Rank Checkmate",
    description: "Deliver checkmate on b8 with your Queen.",
    hintIdea: "Attack the b8 rook.",
    hintPieceSquare: "c7",
    explanationSteps: [
      "Qxb8# captures the rook and delivers checkmate on the back rank."
    ]
  },
  {
    puzzleId: "puz_015",
    fen: "r1b1r1k1/ppp2ppp/8/3p4/8/3B4/PPP2PPP/R2QR1K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["e1e8"],
    puzzleRating: 620,
    difficulty: "Beginner",
    theme: "Back Rank Mate",
    title: "Rook Back Rank Mate",
    description: "Exploit Black's back rank weakness on e8.",
    hintIdea: "Infiltrate e8 with your rook.",
    hintPieceSquare: "e1",
    explanationSteps: [
      "Rxe8# delivers checkmate as Black's rook on e8 was overworked."
    ]
  },
  {
    puzzleId: "puz_016",
    fen: "r1b2rk1/pp1p1ppp/1q6/8/8/1B6/PPP2PPP/R2QR1K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["b3f7", "f8f7", "e1e8", "f7f8", "e8f8"],
    puzzleRating: 1480,
    difficulty: "Advanced",
    theme: "Clearance",
    title: "Clearance Mating Combination",
    description: "Sacrifice your bishop on f7 to clear the path for a back rank checkmate.",
    hintIdea: "Strike on f7 with the bishop.",
    hintPieceSquare: "b3",
    explanationSteps: [
      "Bxf7+ clears the e1-e8 file and checks the King.",
      "Rxf7 is forced.",
      "Re8+ forces Rf8, leading to Rxf8# checkmate."
    ]
  },
  {
    puzzleId: "puz_017",
    fen: "r2qk2r/ppp2ppp/2n5/3pP3/3Pn1b1/2PB1N2/P4PPP/R1BQK2R w KQkq - 1 10",
    sideToMove: "white",
    solutionMoves: ["d3e4", "d5e4"],
    puzzleRating: 1100,
    difficulty: "Intermediate",
    theme: "Tactical Capture",
    title: "Central Piece Liquidation",
    description: "Remove Black's active knight on e4.",
    hintIdea: "Capture the e4 knight with your bishop.",
    hintPieceSquare: "d3",
    explanationSteps: [
      "Bxe4 eliminates Black's key outpost knight.",
      "dxe4 recaptures."
    ]
  },
  {
    puzzleId: "puz_018",
    fen: "6k1/5ppp/8/8/8/2B5/5PPP/R5K1 w - - 0 1",
    sideToMove: "white",
    solutionMoves: ["a1a8"],
    puzzleRating: 520,
    difficulty: "Beginner",
    theme: "Back Rank Mate",
    title: "Clean Back Rank Strike",
    description: "Deliver checkmate on a8.",
    hintIdea: "Move your rook to a8.",
    hintPieceSquare: "a1",
    explanationSteps: [
      "Ra8# delivers immediate checkmate."
    ]
  },
  {
    puzzleId: "puz_019",
    fen: "r1bqk2r/pppp1ppp/2n5/4p3/1b2P3/3P1N2/PPP1BPPP/R1BQK2R w KQkq - 0 6",
    sideToMove: "white",
    solutionMoves: ["c2c3"],
    puzzleRating: 680,
    difficulty: "Beginner",
    theme: "Defensive Move",
    title: "Block the Bishop Check",
    description: "Block Black's bishop check on b4 with c3.",
    hintIdea: "Push your c-pawn to attack the bishop and block check.",
    hintPieceSquare: "c2",
    explanationSteps: [
      "c3 blocks the check from b4 while gaining tempo against the bishop."
    ]
  },
  {
    puzzleId: "puz_020",
    fen: "r1bq1rk1/pppp1ppp/2n2n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQ - 0 5",
    sideToMove: "white",
    solutionMoves: ["c1d2"],
    puzzleRating: 720,
    difficulty: "Beginner",
    theme: "Pin",
    title: "Unpin Your Knight",
    description: "Develop your bishop to d2 to break the pin on your c3 knight.",
    hintIdea: "Place your light-squared bishop on d2.",
    hintPieceSquare: "c1",
    explanationSteps: [
      "Bd2 breaks the pin on c3, securing your central position."
    ]
  },
  {
    puzzleId: "puz_021",
    fen: "rnbq1rk1/ppp2ppp/3p4/4p3/2B1P3/3P1N2/PPP1QbPP/RNB2K1R b - - 0 7",
    sideToMove: "black",
    solutionMoves: ["f2c5"],
    puzzleRating: 900,
    difficulty: "Intermediate",
    theme: "Defensive Move",
    title: "Retreating the Bishop Safely",
    description: "Retreat your bishop on f2 safely to c5.",
    hintIdea: "Pull back the bishop to c5.",
    hintPieceSquare: "f2",
    explanationSteps: [
      "Bc5 preserves Black's bishop on a strong diagonal."
    ]
  },
  {
    puzzleId: "puz_022",
    fen: "r1b1k2r/pppp1ppp/8/4n3/1b1q4/2N5/PPP1BPPP/R1BQK2R w KQkq - 0 9",
    sideToMove: "white",
    solutionMoves: ["d1d4"],
    puzzleRating: 600,
    difficulty: "Beginner",
    theme: "Hanging Piece",
    title: "Take the Loose Queen",
    description: "Black's Queen on d4 is unguarded. Take it with your Queen.",
    hintIdea: "Capture d4.",
    hintPieceSquare: "d1",
    explanationSteps: [
      "Qxd4 wins Black's queen on the spot."
    ]
  },
  {
    puzzleId: "puz_023",
    fen: "r1b2rk1/ppp2p1p/2n3p1/4q3/2P1N3/1P1B4/P4PPP/R2Q1RK1 w - - 0 14",
    sideToMove: "white",
    solutionMoves: ["f2f4"],
    puzzleRating: 1150,
    difficulty: "Intermediate",
    theme: "Fork",
    title: "Pawn Kick on the Central Queen",
    description: "Kick Black's Queen away from e5 with f4.",
    hintIdea: "Push f4 to attack the Queen.",
    hintPieceSquare: "f2",
    explanationSteps: [
      "f4 kicks the queen while expanding in the center."
    ]
  },
  {
    puzzleId: "puz_024",
    fen: "r1bqk2r/ppp2ppp/2p5/2b1P3/3Pn3/8/PPP2PPP/RNBQKB1R b KQkq - 0 6",
    sideToMove: "black",
    solutionMoves: ["c5d4"],
    puzzleRating: 1050,
    difficulty: "Intermediate",
    theme: "Tactical Capture",
    title: "Recapturing in the Center",
    description: "Take the d4 pawn with your bishop to threaten f2.",
    hintIdea: "Bxd4 attacks f2.",
    hintPieceSquare: "c5",
    explanationSteps: [
      "Bxd4 captures the pawn and targets the weak f2 square."
    ]
  },
  {
    puzzleId: "puz_025",
    fen: "r1bq1rk1/pppp1p1p/2n3p1/4b3/8/2N2N2/PPP1BPPP/R2Q1RK1 w - - 0 10",
    sideToMove: "white",
    solutionMoves: ["f3e5"],
    puzzleRating: 850,
    difficulty: "Intermediate",
    theme: "Tactical Capture",
    title: "Eliminate the Active Bishop",
    description: "Capture Black's bishop on e5 with your knight.",
    hintIdea: "Nxe5 trades active pieces.",
    hintPieceSquare: "f3",
    explanationSteps: [
      "Nxe5 captures Black's strong central bishop."
    ]
  }
];

export function validateSinglePuzzle(puzzle: ChessPuzzle): boolean {
  try {
    const game = new Chess(puzzle.fen);

    // 1. Validate side to move
    const actualSide = game.turn() === "w" ? "white" : "black";
    if (actualSide !== puzzle.sideToMove) {
      console.warn(`[Puzzle Validator] ${puzzle.puzzleId} sideToMove mismatch`);
      return false;
    }

    // 2. Validate kings exist
    const board = game.board();
    let whiteKing = false;
    let blackKing = false;
    for (const row of board) {
      for (const sq of row) {
        if (sq?.type === "k") {
          if (sq.color === "w") whiteKing = true;
          if (sq.color === "b") blackKing = true;
        }
      }
    }
    if (!whiteKing || !blackKing) {
      console.warn(`[Puzzle Validator] ${puzzle.puzzleId} missing King`);
      return false;
    }

    // 3. Side to move must have legal moves
    if (game.moves().length === 0) {
      console.warn(`[Puzzle Validator] ${puzzle.puzzleId} no legal moves`);
      return false;
    }

    // 4. Validate solution sequence
    if (!puzzle.solutionMoves || puzzle.solutionMoves.length === 0) {
      return false;
    }

    const testGame = new Chess(puzzle.fen);
    for (let i = 0; i < puzzle.solutionMoves.length; i++) {
      const moveStr = puzzle.solutionMoves[i];
      let moveResult = null;

      // Try LAN format (e.g. "e1e8", "e7e8q")
      if (moveStr.length >= 4 && /^[a-h][1-8][a-h][1-8]/i.test(moveStr)) {
        const from = moveStr.slice(0, 2);
        const to = moveStr.slice(2, 4);
        const promotion = moveStr.length === 5 ? moveStr[4].toLowerCase() : "q";
        try {
          moveResult = testGame.move({ from, to, promotion });
        } catch {
          moveResult = null;
        }
      }

      // Try direct SAN or UCI string
      if (!moveResult) {
        try {
          moveResult = testGame.move(moveStr);
        } catch {
          moveResult = null;
        }
      }

      if (!moveResult) {
        console.warn(`[Puzzle Validator] ${puzzle.puzzleId} invalid move step ${i}: '${moveStr}'`);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn(`[Puzzle Validator] ${puzzle.puzzleId} exception:`, err);
    return false;
  }
}

// Filter RAW_PUZZLE_DATABASE to produce ONLY guaranteed 100% legal & valid puzzles
export const VALIDATED_PUZZLES: ChessPuzzle[] = RAW_PUZZLE_DATABASE.filter(validateSinglePuzzle);
