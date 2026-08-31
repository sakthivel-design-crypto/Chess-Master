import { VALIDATED_PUZZLES, ChessPuzzle } from "./data/puzzleData";

export enum GameTab {
  DASHBOARD = "dashboard",
  CHESSBOARD = "chessboard",
  PLAY_WITH_FRIENDS = "play_with_friends",
  LEARNING_PATH = "learning_path",
  OPENINGS = "openings",
  TRAPS = "traps",
  GAMBITS = "gambits",
  PUZZLES = "puzzles",
  ANALYZER = "analyzer",
  STUDY_PLANNER = "study_planner",
  PROFILE = "profile",
  ARENA = "arena",
  PROGRESS = "progress",
  FAVORITES = "favorites",
  SETTINGS = "settings",
  SCORESHEET = "scoresheet"
}

export enum ChessTheme {
  COSMIC_WOOD = "cosmic_wood",
  NEON_SPACE = "neon_space",
  GLASS_SLATE = "glass_slate",
  TOURNAMENT = "tournament"
}

export type GameModeKey = "bullet" | "blitz" | "rapid" | "classical";

export interface ModeRatings {
  bullet: number;
  blitz: number;
  rapid: number;
  classical: number;
}

export const DEFAULT_RATINGS: ModeRatings = {
  bullet: 1200,
  blitz: 1200,
  rapid: 1200,
  classical: 1200
};

export interface ModeStats {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  highest: number;
}

export interface MatchRecord {
  id: string;
  gameMode: GameModeKey | string;
  timeControl: string;
  baseTimeSeconds?: number;
  incrementSeconds?: number;
  opponent: string;
  opponentRating: number;
  result: "win" | "loss" | "draw";
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  moves: number; // or SAN moves count
  accuracy: number;
  date: string;
  pgn?: string;
  finalFen?: string;
  initialFen?: string;
  sanMoves?: string[];
  playerColor?: "w" | "b" | "white" | "black";
  whitePlayer?: string;
  blackPlayer?: string;
  whiteRating?: number;
  blackRating?: number;
  terminationReason?: string;
  resultScore?: string;
  evalHistory?: number[];
}

export interface CompletedGameData {
  gameId: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteRating?: number;
  blackRating?: number;
  playerColor?: "w" | "b" | "white" | "black";
  result?: "win" | "loss" | "draw" | "1-0" | "0-1" | "1/2-1/2" | string;
  resultScore?: string;
  terminationReason?: string;
  sanMoves: string[];
  moveHistory?: { from?: string; to?: string; san: string; piece?: string }[];
  finalFen?: string;
  initialFen?: string;
  pgn?: string;
  gameMode?: GameModeKey | string;
  timeControl?: string;
  baseTimeSeconds?: number;
  incrementSeconds?: number;
  date?: string;
  accuracy?: number;
  evalHistory?: number[];
}

export interface TimeControlConfig {
  label: string;
  initialSeconds: number;
  incrementSeconds: number;
  description?: string;
  tag?: string;
}

export interface GameModeConfig {
  key: GameModeKey;
  name: string;
  icon: string; // ⚡, 🔥, ♟, ♜
  lucideIconName: string;
  description: string;
  gradient: string;
  accentColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  timeControls: TimeControlConfig[];
}

export const GAME_MODES: GameModeConfig[] = [
  {
    key: "bullet",
    name: "Bullet",
    icon: "⚡",
    lucideIconName: "Zap",
    description: "Fastest chess",
    gradient: "from-amber-500 to-orange-600",
    accentColor: "amber",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-400",
    timeControls: [
      { label: "1+0", initialSeconds: 60, incrementSeconds: 0, description: "1 min • 0s increment", tag: "Ultra Fast" },
      { label: "1+1", initialSeconds: 60, incrementSeconds: 1, description: "1 min • 1s increment", tag: "Increment" },
      { label: "2+1", initialSeconds: 120, incrementSeconds: 1, description: "2 min • 1s increment", tag: "Balanced" }
    ]
  },
  {
    key: "blitz",
    name: "Blitz",
    icon: "🔥",
    lucideIconName: "Flame",
    description: "Fast tactical chess",
    gradient: "from-yellow-400 to-amber-500",
    accentColor: "yellow",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
    textClass: "text-yellow-400",
    timeControls: [
      { label: "3+0", initialSeconds: 180, incrementSeconds: 0, description: "3 min • No increment", tag: "Fast" },
      { label: "3+2", initialSeconds: 180, incrementSeconds: 2, description: "3 min • 2s increment", tag: "Popular" },
      { label: "5+0", initialSeconds: 300, incrementSeconds: 0, description: "5 min • No increment", tag: "Standard" },
      { label: "5+3", initialSeconds: 300, incrementSeconds: 3, description: "5 min • 3s increment", tag: "Tactical" }
    ]
  },
  {
    key: "rapid",
    name: "Rapid",
    icon: "♟",
    lucideIconName: "Clock",
    description: "Balanced chess",
    gradient: "from-emerald-400 to-teal-500",
    accentColor: "emerald",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-400",
    timeControls: [
      { label: "10+0", initialSeconds: 600, incrementSeconds: 0, description: "10 min • No increment", tag: "Standard" },
      { label: "10+5", initialSeconds: 600, incrementSeconds: 5, description: "10 min • 5s increment", tag: "Balanced" },
      { label: "15+10", initialSeconds: 900, incrementSeconds: 10, description: "15 min • 10s increment", tag: "Strategic" }
    ]
  },
  {
    key: "classical",
    name: "Classical",
    icon: "♜",
    lucideIconName: "Crown",
    description: "Deep strategic chess",
    gradient: "from-indigo-400 to-purple-600",
    accentColor: "indigo",
    bgClass: "bg-indigo-500/10",
    borderClass: "border-indigo-500/30",
    textClass: "text-indigo-400",
    timeControls: [
      { label: "30+0", initialSeconds: 1800, incrementSeconds: 0, description: "30 min • No increment", tag: "Tournament" },
      { label: "30+20", initialSeconds: 1800, incrementSeconds: 20, description: "30 min • 20s increment", tag: "Grandmaster" },
      { label: "45+15", initialSeconds: 2700, incrementSeconds: 15, description: "45 min • 15s increment", tag: "Deep Calculation" }
    ]
  }
];

export interface PuzzleStats {
  attempted: number;
  solved: number;
  accuracy: number;
  currentRating: number;
  bestRating: number;
  correctStreak: number;
  averageTimeSeconds: number;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  username: string;
  email: string;
  isGuest: boolean;
  profileImageUrl?: string;
  profilePicture?: string;
  elo: number; // General or peak rating
  rating?: number; // General user rating
  puzzleElo: number;
  puzzleStats?: PuzzleStats;
  puzzlesSolved?: number;
  themePreference?: string;
  puzzleProgress?: any;
  gambitProgress?: any;
  boardTheme?: string;
  friends?: string[];
  ratings: ModeRatings;
  modeStats?: Record<GameModeKey, ModeStats>;
  matchHistory?: MatchRecord[];
  highestRating?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  streak: number;
  longestStreak?: number;
  bestStreak?: number;
  lastActivityDate?: string | null;
  lastActiveDate?: string | null;
  streakStartedAt?: string | null;
  level?: number;
  xp?: number;
  coins?: number;
  unlockedBadges?: string[];
  settings?: {
    soundEnabled?: boolean;
    boardHaptics?: boolean;
    boardTheme?: string;
    pieceStyle?: string;
    moveMethod?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  icon: string;
  completed: boolean;
}

export interface ChessLesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Master";
  description: string;
  longDescription: string;
  fen: string; // FEN of the initial practice position
  goal: string; // What the user has to do, e.g., "Find the fork with the knight" or "Deliver checkmate in 1"
  solution: string[]; // List of coordinates, e.g., ["d2d4", "e5e4"] or algebraic moves
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string; // Option index or text
}

export interface OpeningDetail {
  id: string;
  name: string;
  moves: string[];
  side: "White" | "Black";
  history: string;
  mainIdeas: string;
  commonMistakes: string;
  fen: string;
}

export interface TrapDetail {
  id: string;
  name: string;
  moves: string[];
  description: string;
  avoidance: string;
  fen: string;
}

export interface GambitDetail {
  id: string;
  name: string;
  moves: string[];
  strategicIdeas: string;
  risks: string;
  refutation: string;
  fen: string;
}

export interface GMGame {
  id: string;
  white: string;
  black: string;
  result: string;
  event: string;
  year: string;
  moves: string[]; // Algebraic moves
  startingFen?: string;
  commentary: Record<number, string>; // Move index -> Coach commentary
}

export interface PuzzleDetail {
  id: string;
  puzzleId: string;
  title: string;
  category: string;
  theme: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  puzzleRating: number;
  sideToMove: "white" | "black";
  fen: string;
  solution: string[];
  solutionMoves: string[];
  description: string;
  hintIdea: string;
  hintPieceSquare?: string;
  explanationSteps: string[];
}

// Curriculum / Chess Lessons Database
export const CHESS_LESSONS: ChessLesson[] = [
  // Beginner
  {
    id: "beg_rules",
    title: "Piece Movement & Rules",
    level: "Beginner",
    description: "Learn how the rook, bishop, knight, and queen control the board.",
    longDescription: "In chess, the board consists of 64 squares. The Rook moves in straight vertical or horizontal lines. The Bishop moves diagonally. The Queen combines both, moving in any straight direction. The Knight moves in an 'L' shape (two squares in one straight direction, then one square sideways). Knights are the only pieces that can jump over other pieces!",
    fen: "8/8/8/8/4Q3/8/8/8 w - - 0 1",
    goal: "Move your Queen to capture the imaginary pawn on e8 (coordinates e4e8)",
    solution: ["e4e8"],
    quizQuestion: "Which piece is the only one capable of jumping over other pieces?",
    quizOptions: ["The Bishop", "The Rook", "The Knight", "The Queen"],
    quizAnswer: "The Knight"
  },
  {
    id: "beg_check",
    title: "Delivering Check",
    level: "Beginner",
    description: "Learn how to put the enemy King under direct threat.",
    longDescription: "A 'Check' occurs when an opponent's piece directly threatens the King. When in check, a player MUST get out of check immediately by: moving the King, blocking the check with another piece, or capturing the checking piece.",
    fen: "4k3/8/8/8/4R3/8/8/4K3 b - - 0 1",
    goal: "The Black King is in check by the White Rook on e4. Escape check by moving the King to f8 (coordinates e8f8)",
    solution: ["e8f8"],
    quizQuestion: "Which of the following is NOT a legal way to escape check?",
    quizOptions: ["Moving the King to an unthreatened square", "Blocking the checking path", "Capturing the checking piece", "Castling your King"],
    quizAnswer: "Castling your King"
  },
  {
    id: "beg_checkmate",
    title: "Checkmate Mechanics",
    level: "Beginner",
    description: "Learn how to trap the king to win the game.",
    longDescription: "Checkmate is the ultimate goal in chess. It occurs when the King is in check and has absolutely no legal moves to escape, block, or capture the threat. The game ends immediately.",
    fen: "R1k5/8/8/8/8/8/8/4K3 w - - 0 1",
    goal: "Deliver Checkmate in 1 move by moving the Rook from a8 to c8 (coordinates a8c8)",
    solution: ["a8c8"],
    quizQuestion: "Does checkmate require the King to be currently in check?",
    quizOptions: ["Yes, absolutely", "No, if they can't move it's always checkmate", "Only if the Queen is delivering it", "Only in the endgame"],
    quizAnswer: "Yes, absolutely"
  },
  // Intermediate
  {
    id: "int_fork",
    title: "The Fork",
    level: "Intermediate",
    description: "Attack two enemy pieces at once with a single move.",
    longDescription: "A fork occurs when a single piece attacks two or more enemy pieces simultaneously. Knights are legendary for forks, but pawns, rooks, bishops, and queens can fork too!",
    fen: "3r2k1/3q4/8/3N4/8/8/8/4K3 w - - 0 1",
    goal: "Execute a Knight fork on d5 to attack the King and Queen simultaneously (Knight to f6 - d5f6+)",
    solution: ["d5f6"],
    quizQuestion: "Why is the Knight a particularly dangerous piece for creating forks?",
    quizOptions: ["Because it has the highest value", "Because it can leap over other pieces and attack in unusual angles", "Because it can move diagonally", "Because it can deliver checkmate on its own"],
    quizAnswer: "Because it can leap over other pieces and attack in unusual angles"
  },
  {
    id: "int_pin",
    title: "The Pin",
    level: "Intermediate",
    description: "Immobilize enemy pieces by trapping them in front of valuable targets.",
    longDescription: "A pin occurs when an attacking piece threatens a defensive piece, which cannot move without exposing a more valuable piece behind it. An 'Absolute Pin' is when the valuable piece is the King (the pinned piece cannot legally move at all).",
    fen: "3r4/8/1b6/8/3R2k1/8/8/4K3 w - - 0 1",
    goal: "The White Rook on d4 is absolutely pinned by the Black Bishop on b6. Find the King move to escape (King to f2 - e1f2)",
    solution: ["e1f2"],
    quizQuestion: "What is an 'Absolute Pin' in chess?",
    quizOptions: [
      "A pin on the Queen, winning it immediately",
      "A pin against the King, making it illegal for the pinned piece to move",
      "A pin using two pieces at the same time",
      "A pin that cannot be broken by any means"
    ],
    quizAnswer: "A pin against the King, making it illegal for the pinned piece to move"
  },
  // Advanced
  {
    id: "adv_positional",
    title: "Positional Play & Outposts",
    level: "Advanced",
    description: "Establish strong outposts and place your pieces on active squares.",
    longDescription: "An 'outpost' is a square (usually on the 4th, 5th, or 6th rank) that cannot be attacked by enemy pawns, ideally supported by one of your own pawns. Knights are extremely powerful on outposts, controlling key entry squares.",
    fen: "r1bqk2r/pp1n1ppp/2p1pn2/3p4/2PP4/1PN1P3/P4PPP/R1BQKB1R w KQkq - 0 1",
    goal: "Begin planning your queenside expansion. Move your pawn from c4 to c5 to restrict black's pieces (coordinates c4c5)",
    solution: ["c4c5"],
    quizQuestion: "What defines an ideal 'Outpost' square for a Knight?",
    quizOptions: [
      "Any square on the opponent's back rank",
      "A square on the side of the board away from any activity",
      "A square on the 4th-6th rank that cannot be evicted by an opponent's pawn",
      "A central square heavily guarded by enemy pieces"
    ],
    quizAnswer: "A square on the 4th-6th rank that cannot be evicted by an opponent's pawn"
  },
  // Master
  {
    id: "mas_calculation",
    title: "Deep Tactical Calculation",
    level: "Master",
    description: "Calculate multi-move forcing lines to break open the enemy king's defense.",
    longDescription: "At the master level, calculations depend on recognizing forcing moves: Checks, Captures, and Threats (C-C-T). You must calculate several moves ahead, evaluating candidate variations and visualizing final positions with 100% accuracy.",
    fen: "r1b2rk1/pp1p1ppp/2n1pn2/q5B1/1b1NP3/2N5/PPPQ1PPP/2KR1B1R w - - 0 1",
    goal: "Double check your defenses and prepare an attack. Capture the bishop with the knight on b4 (coordinates c3b4)",
    solution: ["c3b4"],
    quizQuestion: "Which three factors should you ALWAYS prioritize first when calculating a candidate line?",
    quizOptions: [
      "Pawn structure, king side pawns, rook files",
      "Checks, Captures, and direct Threats",
      "Castling rights, queen moves, defensive structures",
      "Material count, bishop pairs, pawn storms"
    ],
    quizAnswer: "Checks, Captures, and direct Threats"
  }
];

// Openings Database
export const CHESS_OPENINGS: OpeningDetail[] = [
  {
    id: "ruy_lopez",
    name: "Ruy Lopez (Spanish Game)",
    side: "White",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3",
    history: "Named after the 16th-century Spanish priest Ruy López de Segura, this is one of the oldest and most thoroughly analyzed chess openings in history.",
    mainIdeas: "White places pressure on the Black knight defending the e5 pawn, threatening to remove the defender and capture central space.",
    commonMistakes: "Allowing Black's queenside expansion with early a6 and b5 without maintaining bishop activity, or prematurely sacrificing pieces on e5."
  },
  {
    id: "queen_gambit",
    name: "Queen's Gambit",
    side: "White",
    moves: ["d4", "d5", "c4"],
    fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
    history: "Gained massive global popularity recently. White offers a flank pawn (c4) in exchange for securing complete control over the board center.",
    mainIdeas: "White temporarily sacrifices a wing pawn to gain superior control of the center with e2-e4 after d5xc4.",
    commonMistakes: "Trying too hard to win back the c4 pawn quickly, or blocking the c-pawn with Nc3 before playing c4."
  },
  {
    id: "london_system",
    name: "London System",
    side: "White",
    moves: ["d4", "d5", "Bf4", "Nf6", "e3"],
    fen: "rnbqkb1r/ppp1pppp/5n2/3p4/5B2/3PP3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
    history: "A highly resilient opening setup for White that can be played against almost any Black setup, popularized in early 20th century London tournaments.",
    mainIdeas: "Establish a solid triangle of pawns (c3-d4-e3) and develop the dark-squared bishop to f4 before locking it in.",
    commonMistakes: "Playing too passively without dynamic counter-strikes when Black attacks White's center."
  },
  {
    id: "sicilian_defense",
    name: "Sicilian Defense",
    side: "Black",
    moves: ["e4", "c5"],
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    history: "The most popular and high-scoring response to e4 in all of chess, creating immediate asymmetrical, complex, and double-edged play.",
    mainIdeas: "Black fights for the d4 square from the flank (c5), creating asymmetric pawn structures and aggressive counterplay on the c-file.",
    commonMistakes: "Overextending the central pawns too early or playing slow positional chess in a highly tactical razor-sharp position."
  },
  {
    id: "caro_kann",
    name: "Caro-Kann Defense",
    side: "Black",
    moves: ["e4", "c6", "d4", "d5"],
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    history: "First analyzed by Horatio Caro and Marcus Kann in 1886. Celebrated as an incredibly solid, defensive fortress for black.",
    mainIdeas: "Prepare d7-d5 with pawn support on c6, allowing Black to contest the center and develop the light-squared bishop cleanly.",
    commonMistakes: "Blocking the development of the light-squared bishop with an early e6 before moving Bf5."
  }
];

// Chess Traps Database
export const CHESS_TRAPS: TrapDetail[] = [
  {
    id: "legal_mate",
    name: "Légal's Mate",
    moves: ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#"],
    fen: "r2q1bnr/ppp1kBpp/2np2p1/3Np3/4P1b1/8/PPPP1PPP/R1BQK2R w - - 0 1",
    description: "A gorgeous tactical sequence involving a massive Queen sacrifice to deliver mate in the center of the board with knights and a bishop.",
    avoidance: "Black must not play passively with d6 and must be wary of pinning White's knight when White's bishop already commands the f7 diagonal."
  },
  {
    id: "blackburne_shilling",
    name: "Blackburne Shilling Trap",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nd4", "Nxe5", "Qg5", "Nxf7", "Qxg2", "Rf1", "Qxe4+", "Be2", "Nf3#"],
    fen: "r1b1kb1r/pppp1Npp/8/4P3/2Bnq3/5n2/PPPPQPPP/RNBK1R2 w - - 0 1",
    description: "An infamous trap played by Joseph Henry Blackburne to win shillings from amateur players. Black sacrifices a pawn on e5 to trap the white king side.",
    avoidance: "White should avoid greedy pawn grabs with Nxe5, and instead capture the knight on d4 or simply castle safely."
  }
];

// Gambit Library Database
export const CHESS_GAMBITS: GambitDetail[] = [
  {
    id: "kings_gambit",
    name: "King's Gambit",
    moves: ["e4", "e5", "f4"],
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2",
    strategicIdeas: "White immediately offers the f4 pawn on move 2 to distract Black's central e5 pawn and clear the f-file for kingside attacks.",
    risks: "Slightly weakens the White king side diagonal (h4-e1), making White susceptible to early counterchecks and aggressive mating attacks.",
    refutation: "The Falkbeer Countergambit (d5) or simply accepting the pawn (exf4) followed by solid development with Nf6 and d6."
  },
  {
    id: "evans_gambit",
    name: "Evans Gambit",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4",
    strategicIdeas: "White sacrifices the b4 pawn on move 4 to gain critical tempos, expanding in the center with c3 and d4, and trapping the black bishop.",
    risks: "If Black defends precisely and maintains control of the d5 square, White's queenside structural weakness is exposed.",
    refutation: "Declining the gambit with Bb6 or accepting and defending with Be7, keeping the center heavily guarded."
  }
];

// Curated Tactical Puzzles (Mapped from verified legal puzzle dataset)
export const CURATED_PUZZLES: PuzzleDetail[] = VALIDATED_PUZZLES.map((p) => ({
  id: p.puzzleId,
  puzzleId: p.puzzleId,
  title: p.title,
  category: p.theme,
  theme: p.theme,
  difficulty: p.difficulty,
  puzzleRating: p.puzzleRating,
  sideToMove: p.sideToMove,
  fen: p.fen,
  solution: p.solutionMoves,
  solutionMoves: p.solutionMoves,
  description: p.description,
  hintIdea: p.hintIdea,
  hintPieceSquare: p.hintPieceSquare,
  explanationSteps: p.explanationSteps
}));

// Famous Grandmaster Games
export const FAMOUS_GM_GAMES: GMGame[] = [
  {
    id: "fischer_spassky_1972",
    white: "Robert James Fischer",
    black: "Boris Spassky",
    result: "1-0",
    event: "World Chess Championship",
    year: "1972",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "Be7", "Bg5", "O-O", "e3", "h6", "Bh4", "b6"],
    commentary: {
      0: "Fischer shocks the world by playing 1. d4 instead of his beloved 1. e4!",
      4: "Transposing into a classic Queen's Gambit Declined. Fischer wants a slow, maneuvering positional game.",
      8: "Fischer immediately pins the f6 Knight, putting early positional pressure on Spassky's kingside defender.",
      11: "Spassky plays h6 to force the bishop to commit. Bobby drops back to h4, maintaining the pin."
    }
  },
  {
    id: "tal_fischer_1959",
    white: "Mikhail Tal",
    black: "Bobby Fischer",
    result: "1-0",
    event: "Candidates Tournament",
    year: "1959",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bc4"],
    commentary: {
      1: "Fischer enters his favorite weapon, the Sicilian Najdorf. Tal, the 'Magician from Riga', is ready to sacrifice everything.",
      6: "Fischer prepares his standard defensive setup. Tal plays Bc4, an aggressive piece placement targeting f7.",
      10: "The classical tactical duel has begun. Both players are aiming for maximum, sharp double-edged complexity."
    }
  }
];

// User Achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    title: "First Steps",
    description: "Beat the AI Coach at Beginner level",
    xpReward: 100,
    coinsReward: 50,
    icon: "Trophy",
    completed: false
  },
  {
    id: "tactical_sharpness",
    title: "Tactical Sharpness",
    description: "Solve 5 chess tactics in the puzzle arena",
    xpReward: 250,
    coinsReward: 100,
    icon: "Target",
    completed: false
  },
  {
    id: "puzzle_master",
    title: "Tactician",
    description: "Solve 10 tactical puzzles correctly",
    xpReward: 300,
    coinsReward: 150,
    icon: "Zap",
    completed: false
  },
  {
    id: "opening_master",
    title: "Opening Master",
    description: "Explore 3 popular chess openings",
    xpReward: 150,
    coinsReward: 75,
    icon: "BookOpen",
    completed: false
  },
  {
    id: "analysis_pro",
    title: "Grandmaster Brain",
    description: "Run a full game analysis report using Gemini",
    xpReward: 500,
    coinsReward: 250,
    icon: "Cpu",
    completed: false
  }
];

export interface GameRequest {
  id: string;
  requestId: string;
  senderId: string;
  senderUsername: string;
  senderRating: number;
  senderLevel: number;
  senderProfilePicture?: string;
  receiverId: string;
  receiverUsername: string;
  status: "pending" | "accepted" | "declined" | "expired";
  type: string;
  createdAt: string;
  updatedAt?: string;
  gameId?: string;
  gameModeConfig?: {
    mode: string;
    timeControlLabel: string;
    initialTimeSeconds: number;
    incrementSeconds: number;
    senderColorChoice?: "white" | "black" | "random";
    receiverColorChoice?: "white" | "black" | "random";
  };
}

export interface GameMoveRecord {
  moveNumber: number;
  color: "w" | "b";
  from: string;
  to: string;
  san: string;
  fenAfter: string;
  timestamp: number;
}

export interface MultiplayerGame {
  id: string;
  gameId: string;
  whitePlayerId: string;
  whiteUsername: string;
  whiteRating: number;
  whiteProfilePicture?: string;
  blackPlayerId: string;
  blackUsername: string;
  blackRating: number;
  blackProfilePicture?: string;
  timeControl: string;
  gameMode: string;
  initialTimeSeconds: number;
  incrementSeconds: number;
  status: "lobby" | "active" | "completed" | "resigned" | "draw" | "timeout";
  whiteReady?: boolean;
  blackReady?: boolean;
  currentTurn: "w" | "b";
  fen: string;
  currentFen?: string;
  moveHistory?: GameMoveRecord[];
  whiteTimeLeft: number;
  blackTimeLeft: number;
  lastMoveTimestamp: number;
  winner?: "white" | "black" | "draw" | null;
  finishReason?: "checkmate" | "timeout" | "resignation" | "draw_agreement" | "stalemate" | "threefold" | "insufficient" | null;
  terminationReason?: string;
  drawOfferedBy?: string | null;
  rematchRequestedBy?: string | null;
  rematchGameId?: string | null;
  whiteBoardTheme?: string;
  blackBoardTheme?: string;
  createdAt: string;
  updatedAt: string;
}

