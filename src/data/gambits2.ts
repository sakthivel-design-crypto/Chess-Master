import { Gambit } from "../gambitData";

export const gambits2: Gambit[] = [
  {
    id: "urusov-gambit",
    name: "Urusov Gambit",
    eco: "C24",
    category: "Bishop's Opening",
    difficulty: "Beginner",
    side: "White",
    shortDesc: "In the Bishop's Opening, White sacrifices a d-pawn (3.d4 exd4 4.Nf3) for rapid development and active bishops pointing at the kingside.",
    estimatedTime: "10 mins",
    popularity: 78,
    successRate: 51,
    history: "Named after Russian Prince Sergey Semyonovich Urusov. A respected weapon at amateur and master levels to avoid dry Petroff lines.",
    inventor: "Prince Sergey Semyonovich Urusov",
    playingStyle: "Open lines, active bishop play, kingside target",
    whenToUse: "To steer away from standard theoretical Petroff lines and establish a rapid bishop attack.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Rapid development lead over Black.",
      "Dark-squared bishop on c4 aims squarely at f7.",
      "Prepares fast kingside castling."
    ],
    disadvantages: [
      "Black can equalize with 4...Nxe4 5.Qxd4 Nf6."
    ],
    commonTraps: [
      "4...Nxe4 5.Qxd4 Nf6 6.Bg5 Be7 7.Nc3 c6 8.O-O-O d5 9.Rhe1! with a massive central attack."
    ],
    moves: ["e4", "e5", "Bc4", "Nf6", "d4", "exd4", "Nf3"],
    explanations: [
      "e4 e5 open game.",
      "Bc4 Bishop's Opening.",
      "Nf6 Petroff-style response.",
      "3.d4 exd4 White offers the d-pawn.",
      "THE URUSOV GAMBIT! White plays 4.Nf3!, developing the knight instead of recapturing on d4."
    ],
    acceptedVariation: {
      name: "Urusov Accepted (4...Nxe4 5.Qxd4)",
      moves: ["e4", "e5", "Bc4", "Nf6", "d4", "exd4", "Nf3", "Nxe4", "Qxd4"],
      explanation: "Black captures on e4. White plays 5.Qxd4, centralizing the queen with great piece mobility."
    },
    declinedVariation: {
      name: "Urusov Declined (4...d5)",
      moves: ["e4", "e5", "Bc4", "Nf6", "d4", "exd4", "Nf3", "d5"],
      explanation: "Black strikes back in the center with 4...d5, opening lines for equal development."
    },
    popularVariations: [
      "Accepted: 4...Nxe4 5.Qxd4 Nf6",
      "Transposition to Keidansky Gambit: 4...Nc6"
    ],
    strategicIdeas: [
      "Using Qxd4 to centralize the queen safely.",
      "Developing Nc3 and Bg5 to pin Black's f6 knight.",
      "Castling queenside (O-O-O) to launch a kingside pawn storm."
    ],
    tacticalMotifs: [
      "Pins along the d-file and e-file.",
      "Sacrifices on f7 with Bxf7+.",
      "Rhe1 pins against uncastled Black king."
    ],
    commonMistakes: [
      "Playing 5.Nxd4? instead of 5.Qxd4!, missing the queen centralization."
    ],
    bestResponses: [
      "4...Nxe4 5.Qxd4 Nf6 6.Bg5 Be7 7.Nc3 c6!"
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Ng5+ and Qh5#."
    ],
    middlegamePlans: [
      "Castle queenside (O-O-O), play Bg5 and Rhe1.",
      "Push e5 to dislodge Black's f6 knight.",
      "Attack along the open d-file."
    ],
    endgameIdeas: [
      "Equal piece structure makes endgame balanced."
    ],
    famousGames: [
      "Prince Urusov vs Ignatz von Kolisch, St. Petersburg 1862"
    ],
    grandmasterExamples: ["Prince Urusov", "Ignatz von Kolisch"],
    practicePosition: {
      fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3",
      prompt: "Black played 2...Nf6. Strike in the center with 3.d4 to enter the Urusov Gambit setup.",
      solution: ["d4"]
    },
    quiz: {
      question: "What is White's key queen move after Black accepts 4...Nxe4 in the Urusov Gambit?",
      options: [
        "5.Qxd4!, centralizing the queen and threatening e4 and g7",
        "5.Qe2, pinning the knight",
        "5.Qf3, threatening mate on f7",
        "5.Qh5, threatening mate on f7"
      ],
      answer: "5.Qxd4!, centralizing the queen and threatening e4 and g7",
      explanation: "After 4...Nxe4, 5.Qxd4! centralizes White's queen, attacks the e4 knight, and prepares Nc3 and Bg5 with a massive development lead."
    }
  },
  {
    id: "halloween-gambit",
    name: "Halloween Gambit",
    eco: "C47",
    category: "Four Knights Game",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "In the Four Knights Game, White sacrifices a full Knight on move 4 (4.Nxe5!) for massive central pawn space and knight-hunting.",
    estimatedTime: "15 mins",
    popularity: 60,
    successRate: 46,
    history: "Surfaced in Germany; named 'Halloween' because it strikes terror into unprepared opponents in blitz and rapid games.",
    inventor: "Müller-Malo (Analysts)",
    playingStyle: "Chaos-inducing, knight-hunting, spatial squeeze",
    whenToUse: "In blitz games to shock your opponent and force them into solving complex defensive puzzles under clock pressure.",
    recommendedSkillLevel: "1400 - 2200 Elo",
    advantages: [
      "Gains an enormous pawn center with d4 and e5.",
      "Hunts Black's knights back to their starting squares.",
      "Immense psychological pressure."
    ],
    disadvantages: [
      "White is down a full Knight for a pawn.",
      "If Black defends calmly with d6 and Nc6, White's attack dries up."
    ],
    commonTraps: [
      "4.Nxe5 Nxe5 5.d4 Ng6 6.e5 Ng8 7.Bc4 d5 8.Bxd5 c6 9.Bb3 with a massive pawn steamroller."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Nxe5"],
    explanations: [
      "e4 e5 open game.",
      "Nf3 Nc6 Four Knights.",
      "Nc3 Nf6 Four Knights setup.",
      "THE HALLOWEEN GAMBIT! White plays 4.Nxe5!, sacrificing a full knight to build a d4/e5 pawn steamroller!"
    ],
    acceptedVariation: {
      name: "Halloween Main Line (4...Nxe5 5.d4 Ng6 6.e5 Ng8)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Nxe5", "Nxe5", "d4", "Ng6", "e5", "Ng8"],
      explanation: "Black takes the knight. White plays d4 and e5, forcing Black's knights back to their starting squares."
    },
    declinedVariation: {
      name: "Szen Variation (5...Nc6 6.d5)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Nxe5", "Nxe5", "d4", "Nc6", "d5"],
      explanation: "Black retreats the knight to c6. White advances 6.d5, keeping the knight-hunting march alive."
    },
    popularVariations: [
      "Main Line: 5...Ng6 6.e5 Ng8 7.Bc4",
      "Szen Variation: 5...Nc6 6.d5 Ne5 7.f4"
    ],
    strategicIdeas: [
      "Building a massive, space-grabbing pawn center (d4 and e5).",
      "Chasing Black's minor pieces into passive retreats.",
      "Using Bc4, Qf3, and O-O to crush Black before they can develop."
    ],
    tacticalMotifs: [
      "Pawn steamroller pushes (d5, e6).",
      "Bxf7+ sacrifices.",
      "Central breakthroughs."
    ],
    commonMistakes: [
      "Playing too slowly as White, allowing Black to develop and use their extra knight."
    ],
    bestResponses: [
      "Accept, retreat knights calmly (Ng6 and Ng8), and play d6 to break White's pawn chain."
    ],
    typicalCheckmatePatterns: [
      "Bc4 + Qf3 + e6 crushing mate on the uncastled king."
    ],
    middlegamePlans: [
      "Push f4, e6, and Bc4 to keep Black cramped.",
      "Infiltrate with Queen and Rooks along the open d- and e-files."
    ],
    endgameIdeas: [
      "White must win in the middlegame; endgames heavily favor Black's extra piece."
    ],
    famousGames: [
      "Engine vs Engine Halloween Showdown, 2012"
    ],
    grandmasterExamples: ["Grzegorz Lajewski"],
    practicePosition: {
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4",
      prompt: "White has set up the Four Knights Game. Play the shocking 4.Nxe5 sacrifice to launch the Halloween Gambit!",
      solution: ["Nxe5"]
    },
    quiz: {
      question: "What does White gain in exchange for sacrificing a full Knight in the Halloween Gambit?",
      options: [
        "A space-grabbing pawn center (d4 and e5) that hunts Black's knights back to their home squares",
        "Control over the h-file",
        "An immediate queen trade",
        "Immediate checkmate"
      ],
      answer: "A space-grabbing pawn center (d4 and e5) that hunts Black's knights back to their home squares",
      explanation: "By playing 4.Nxe5 followed by d4 and e5, White builds a massive central pawn roller that chases Black's knights all the way back to their home squares."
    }
  },
  {
    id: "elephant-gambit",
    name: "Elephant Gambit",
    eco: "C44",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "Against 1.e4 e5 2.Nf3, Black plays a surprise 2...d5!, sacrificing a pawn to seize central initiative and open diagonals.",
    estimatedTime: "10 mins",
    popularity: 65,
    successRate: 48,
    history: "Also known as the Queen's Pawn Countergambit. A 19th-century surprise opening for Black aimed at breaking White's control.",
    inventor: "19th-Century European Analysts",
    playingStyle: "Surprise central counter-attack, active piece play",
    whenToUse: "In blitz games to surprise 1.e4 e5 players who expect standard 2...Nc6 or 2...Nf6.",
    recommendedSkillLevel: "1000 - 1800 Elo",
    advantages: [
      "Takes White completely out of book on move 2.",
      "Black gets active diagonals for both bishops.",
      "Creates immediate central pawn tension."
    ],
    disadvantages: [
      "White can get a favorable game with 3.exd5 Bd6 4.d4 e4 5.Ne5!"
    ],
    commonTraps: [
      "3.Nxe5 dxe4 4.Bc4 Qg5! 5.Bxf7+ Ke7 6.d4 Qxg2 with black initiative."
    ],
    moves: ["e4", "e5", "Nf3", "d5"],
    explanations: [
      "e4 e5 open game.",
      "2.Nf3 White attacks e5.",
      "THE ELEPHANT GAMBIT! Black strikes back immediately with 2...d5!, counterattacking White's center."
    ],
    acceptedVariation: {
      name: "Main Line (3.exd5 Bd6 4.d4 e4)",
      moves: ["e4", "e5", "Nf3", "d5", "exd5", "Bd6", "d4", "e4"],
      explanation: "White takes on d5. Black plays Bd6 and pushes e4, creating a cramped outpost against White's knight."
    },
    declinedVariation: {
      name: "Maróczy Variation (3.Nxe5 Bd6 4.d4 dxe4)",
      moves: ["e4", "e5", "Nf3", "d5", "Nxe5", "Bd6", "d4", "dxe4"],
      explanation: "White takes e5 with the knight. Black plays Bd6 and recaptures e4, creating balanced active play."
    },
    popularVariations: [
      "Wasp Variation (3.exd5 e4)",
      "Paulsen Countergambit (3.exd5 Bd6)"
    ],
    strategicIdeas: [
      "Challenging White's e4 pawn directly.",
      "Creating an e4 pawn wedge to restrict White's f3 knight.",
      "Activating Black's queen on g5 or e7."
    ],
    tacticalMotifs: [
      "Qg5 double attacks against g2 and e5.",
      "Bc5/Bd6 tactical strikes.",
      "Bxf7+ traps."
    ],
    commonMistakes: [
      "Playing 3...e4? without developing Bd6 first."
    ],
    bestResponses: [
      "White playing 3.exd5 Bd6 4.d4 e4 5.Ne5 Nf6 6.Nc4!"
    ],
    typicalCheckmatePatterns: [
      "Qxg2 and Bh3 mating nets on White's uncastled king."
    ],
    middlegamePlans: [
      "Maintain the e4 pawn wedge as Black.",
      "Develop Nf6, Bg4, and castle queenside or kingside.",
      "Use Qg5 or Qe7 to pressure White's kingside."
    ],
    endgameIdeas: [
      "White's extra d-pawn gives White a slight endgame edge."
    ],
    famousGames: [
      "Adolf Anderssen vs Gustav Neumann, Berlin 1865"
    ],
    grandmasterExamples: ["Adolf Anderssen", "Gustav Neumann"],
    practicePosition: {
      fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      prompt: "Black played 2...d5 (Elephant Gambit). Capture on d5 with 3.exd5 to enter the main line.",
      solution: ["exd5"]
    },
    quiz: {
      question: "What is Black's key move after 3.exd5 in the Elephant Gambit?",
      options: [
        "3...Bd6!, defending e5 and developing the bishop actively",
        "3...Qxd5, getting the queen exposed early",
        "3...f6, weakening the king",
        "3...c6, sacrificing another pawn"
      ],
      answer: "3...Bd6!, defending e5 and developing the bishop actively",
      explanation: "In the Elephant Gambit main line, 3...Bd6! is essential. It protects e5, prepares e4, and places the dark-squared bishop on an active diagonal."
    }
  },
  {
    id: "latvian-gambit",
    name: "Latvian Gambit",
    eco: "C40",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "A Black counter-attack mirroring the King's Gambit: 1.e4 e5 2.Nf3 f5!?, leading to ultra-sharp, volatile tactical lines.",
    estimatedTime: "12 mins",
    popularity: 70,
    successRate: 47,
    history: "Analyzed deeply by Latvian players including Karl Behting. Highly aggressive, though considered risky at elite classical levels.",
    inventor: "Karl Behting & Latvian Theorists",
    playingStyle: "Volatile tactical melees, mirror King's Gambit, early piece sacrifices",
    whenToUse: "In rapid and blitz games to throw 1.e4 e5 White players into wild tactical calculation.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Completely breaks standard 1.e4 e5 theory.",
      "Black gets the open f-file for rook attacks.",
      "Creates complex, non-standard tactical positions."
    ],
    disadvantages: [
      "Exposes Black's king on the e8-h5 diagonal.",
      "White has powerful options like 3.Nxe5 and 3.Bc4."
    ],
    commonTraps: [
      "3.Nxe5 Qf6 4.d4 d6 5.Nc4 fxe4 6.Nc3 Qg6 with counter-play."
    ],
    moves: ["e4", "e5", "Nf3", "f5"],
    explanations: [
      "e4 e5 open game.",
      "2.Nf3 White attacks e5.",
      "THE LATVIAN GAMBIT! Black strikes with 2...f5!?, offering the f-pawn to mirror the King's Gambit."
    ],
    acceptedVariation: {
      name: "Main Line (3.Nxe5 Qf6 4.d4 d6)",
      moves: ["e4", "e5", "Nf3", "f5", "Nxe5", "Qf6", "d4", "d6"],
      explanation: "White takes 3.Nxe5. Black counterattacks the knight with 3...Qf6, leading to sharp tactical play."
    },
    declinedVariation: {
      name: "Polerio Variation (3.Bc4 fxe4 4.Nxe5 Qg5)",
      moves: ["e4", "e5", "Nf3", "f5", "Bc4", "fxe4", "Nxe5", "Qg5"],
      explanation: "White plays 3.Bc4. Black takes 3...fxe4, and after 4.Nxe5, plays 4...Qg5! counterattacking g2 and e5."
    },
    popularVariations: [
      "Main Line: 3.Nxe5 Qf6",
      "Fraser Defense: 3.Nxe5 Nc6",
      "Corkscrew Gambit: 3.Bc4 fxe4 4.Nxe5 d5"
    ],
    strategicIdeas: [
      "Opening the f-file for Black's rook.",
      "Using Qf6 and Qg5 to double-attack White's kingside.",
      "Pushing e4 to dislodge White's f3 knight."
    ],
    tacticalMotifs: [
      "Qh5+ checks for White.",
      "Qg5 double attacks on g2 and e5 for Black.",
      "Bxf7+ sacrifices."
    ],
    commonMistakes: [
      "Playing 3...fxe4? after 3.Nxe5, allowing 4.Qh5+ g6 5.Nxg6 with a winning attack for White."
    ],
    bestResponses: [
      "White playing 3.Nxe5 Qf6 4.d4 d6 5.Nc4 fxe4 6.Nc3!"
    ],
    typicalCheckmatePatterns: [
      "Qh5+ followed by Qf7# or Qxg6#."
    ],
    middlegamePlans: [
      "Black plays Qg6, Nf6, and Be7 to castle kingside.",
      "Use the open f-file to attack White's kingside."
    ],
    endgameIdeas: [
      "White's better pawn structure gives White an advantage in the endgame."
    ],
    famousGames: [
      "Paul Morphy vs Charles Maurian, New Orleans 1855"
    ],
    grandmasterExamples: ["Paul Morphy", "Karl Behting"],
    practicePosition: {
      fen: "rnbqkbnr/pppp2pp/8/4pp2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      prompt: "Black played 2...f5 (Latvian Gambit). Capture the e5 pawn with 3.Nxe5 to enter the main line.",
      solution: ["Nxe5"]
    },
    quiz: {
      question: "What is Black's crucial queen response after White plays 3.Nxe5 in the Latvian Gambit?",
      options: [
        "3...Qf6!, attacking the e5 knight and preparing d6",
        "3...fxe4?, walking into 4.Qh5+",
        "3...Qe7, pinning the knight passively",
        "3...d6, losing the e5 pawn for nothing"
      ],
      answer: "3...Qf6!, attacking the e5 knight and preparing d6",
      explanation: "3...Qf6! is essential. If Black plays 3...fxe4? instead, White wins immediately with 4.Qh5+ g6 5.Nxg6! Nf6 6.Qe5+."
    }
  },
  {
    id: "stafford-gambit",
    name: "Stafford Gambit",
    eco: "C42",
    category: "Petroff Defense",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "In the Petroff Defense, Black offers a knight trade on c6 (1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6!?) to open lines for rapid, poisonous traps.",
    estimatedTime: "12 mins",
    popularity: 92,
    successRate: 53,
    history: "Invented by Patrick Stafford in 1950 and catapulted into massive internet chess popularity by IM Eric Rosen.",
    inventor: "Patrick Stafford & IM Eric Rosen (Popularizer)",
    playingStyle: "Poisonous tactical traps, rapid piece development, open diagonal attacks",
    whenToUse: "In blitz and rapid games to catch White players in lethal, highly dangerous opening traps.",
    recommendedSkillLevel: "800 - 2000 Elo",
    advantages: [
      "Bishops and queen gain instant open diagonals.",
      "White players frequently fall for move 6-10 checkmating traps.",
      "Black gets rapid development lead."
    ],
    disadvantages: [
      "White can refute the gambit with precise play (e.g., 5.e5 Ne4 6.d3 Bc5 7.d4!)."
    ],
    commonTraps: [
      "5.Nxc6 dxc6 6.d3 Bc5 7.Bg5? Nxe4! 8.Bxd8 Bxf2+ 9.Ke2 Bg4# (Oh no my queen!)."
    ],
    moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6"],
    explanations: [
      "e4 e5 open game.",
      "2.Nf3 Nf6 Petroff Defense.",
      "3.Nxe5 White captures e5.",
      "THE STAFFORD GAMBIT! Black plays 3...Nc6!?, offering a knight trade to open lines for the c8 bishop and queen."
    ],
    acceptedVariation: {
      name: "Stafford Accepted (4.Nxc6 dxc6 5.d3 Bc5)",
      moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "d3", "Bc5"],
      explanation: "White accepts the trade with 4.Nxc6. Black recaptures 4...dxc6, opening diagonals for both bishops, and plays Bc5 targeting f2."
    },
    declinedVariation: {
      name: "Stafford Refusal (4.Nf3 Nxe4 5.d4)",
      moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nf3", "Nxe4", "d4"],
      explanation: "White declines the gambit, retreating the knight to f3 and transposing into standard Petroff lines."
    },
    popularVariations: [
      "5.d3 Bc5 6.Be2 h5",
      "5.e5 Ne4 6.d3 Bc5",
      "5.Nc3 Bc5 6.Be2 h5"
    ],
    strategicIdeas: [
      "Using open d- and c-files for rapid queen and rook activation.",
      "Placing Bc5 pointing squarely at f2.",
      "Playing h5 and Ng4 to launch a devastating kingside assault."
    ],
    tacticalMotifs: [
      "Nxe4 queen sacrifice leading to Bxf2+ and Bg4#.",
      "Bxf2+ sacrifices destroying White's king shield.",
      "Ng4 + Qh4 mating batteries."
    ],
    commonMistakes: [
      "White playing 7.Bg5? or 7.Be2? without guarding against Nxe4! traps."
    ],
    bestResponses: [
      "White playing 5.e5! Ne4 6.d3 Bc5 7.d4! or 5.d3 Bc5 6.c3!"
    ],
    typicalCheckmatePatterns: [
      "Bxf2+ followed by Bg4# (Rosen Trap)."
    ],
    middlegamePlans: [
      "Play Bc5, Ng4, h5, and Qh4 targeting f2 and h2.",
      "Castle queenside (O-O-O) to double rooks on the d-file."
    ],
    endgameIdeas: [
      "If White neutralizes the attack, White's extra pawn wins the endgame."
    ],
    famousGames: [
      "Patrick Stafford vs NN, 1950",
      "Eric Rosen vs Various Masters, Online 2020"
    ],
    grandmasterExamples: ["Eric Rosen", "Patrick Stafford"],
    practicePosition: {
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4",
      prompt: "Black played 3...Nc6 (Stafford Gambit). Capture the knight on c6 with 4.Nxc6 to accept.",
      solution: ["Nxc6"]
    },
    quiz: {
      question: "What famous tactical trick occurs if White plays 7.Bg5? after 5.d3 Bc5 6.Be2 in the Stafford Gambit?",
      options: [
        "Black plays 7...Nxe4!!, offering the queen to deliver checkmate with Bxf2+ and Bg4#",
        "Black trades queens immediately",
        "Black loses the dark-squared bishop",
        "Black castles kingside"
      ],
      answer: "Black plays 7...Nxe4!!, offering the queen to deliver checkmate with Bxf2+ and Bg4#",
      explanation: "The famous Rosen Trap! If 7.Bg5?, Black plays 7...Nxe4!! If 8.Bxd8?, Black plays 8...Bxf2+ 9.Ke2 Bg4# checkmate!"
    }
  },
  {
    id: "portuguese-gambit",
    name: "Portuguese Gambit",
    eco: "B01",
    category: "Scandinavian Defense",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "In the Scandinavian Defense, Black pins White's d4 pawn with a rapid 3...Bg4, offering a pawn for extreme active development.",
    estimatedTime: "12 mins",
    popularity: 68,
    successRate: 47,
    history: "Developed by Portuguese chess analysts in the late 20th century as a sharp alternative in 2...Nf6 Scandinavian lines.",
    inventor: "Portuguese Chess Analysts",
    playingStyle: "Active pin play, aggressive piece pressure, queenside castling",
    whenToUse: "To surprise White 1.e4 players with immediate pins and force them to defend early tactical weaknesses.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Pins White's d4 pawn immediately with Bg4.",
      "Forces White into weakening pawn moves like f3.",
      "Prepares rapid Nc6 and O-O-O."
    ],
    disadvantages: [
      "White can play 4.f3 Bf5 5.c4 e6 6.dxe6 fxe6 with a solid center."
    ],
    commonTraps: [
      "4.f3 Bf5 5.c4 e6 6.dxe6 Nc6! 7.exf7+ Kxf7 with massive development for Black."
    ],
    moves: ["e4", "d5", "exd5", "Nf6", "d4", "Bg4"],
    explanations: [
      "e4 d5 Scandinavian Defense.",
      "2.exd5 Nf6 Black develops knight to recapture.",
      "3.d4 White establishes a pawn on d4.",
      "THE PORTUGUESE GAMBIT! Black plays 3...Bg4!, pinning White's d4 pawn and queen."
    ],
    acceptedVariation: {
      name: "Portuguese Accepted (4.f3 Bf5 5.c4)",
      moves: ["e4", "d5", "exd5", "Nf6", "d4", "Bg4", "f3", "Bf5", "c4"],
      explanation: "White plays f3 to break the pin and c4 to defend the extra d5 pawn."
    },
    declinedVariation: {
      name: "Portuguese Declined (4.Be2)",
      moves: ["e4", "d5", "exd5", "Nf6", "d4", "Bg4", "Be2"],
      explanation: "White declines, playing 4.Be2 to trade bishops safely and neutralize the pin."
    },
    popularVariations: [
      "Main Line: 4.f3 Bf5 5.c4 e6",
      "Kiel Variation: 4.Nf3 Qxd5",
      "Würzburg Variation: 4.Bb5+ Nbd7"
    ],
    strategicIdeas: [
      "Creating immediate pins along the h5-e8 and c8-h3 diagonals.",
      "Using e6 and Nc6 to smash White's d5/c4 pawn structure.",
      "Castling queenside (O-O-O) to place a rook on d8."
    ],
    tacticalMotifs: [
      "Bg4 pins.",
      "Nc6-d4 jumps.",
      "Rook sacrifices on d4."
    ],
    commonMistakes: [
      "White playing 5.g4? which weakens the kingside completely."
    ],
    bestResponses: [
      "4.Be2! (Declined) trading bishops, or 4.Nf3 Nxd5 5.c4."
    ],
    typicalCheckmatePatterns: [
      "Rxd4 Rxd4 and Qe1# checkmating combos."
    ],
    middlegamePlans: [
      "Play e6, Nc6, and O-O-O as Black.",
      "Open the d-file and e-file to swarm White's uncastled king."
    ],
    endgameIdeas: [
      "White's extra pawn gives White an endgame edge if Black's attack fails."
    ],
    famousGames: [
      "Jonny Hector vs Various Masters, Copenhagen 1995"
    ],
    grandmasterExamples: ["Jonny Hector", "Rui Dâmaso"],
    practicePosition: {
      fen: "rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
      prompt: "White played 3.d4. Pin White's queen by playing 3...Bg4 to launch the Portuguese Gambit.",
      solution: ["Bg4"]
    },
    quiz: {
      question: "What is the primary tactical purpose of Black playing 3...Bg4 in the Portuguese Gambit?",
      options: [
        "To pin White's d4 pawn, restrict White's development, and force weakening pawn moves like f3",
        "To trade the bishop for a knight",
        "To castle queenside immediately",
        "To deliver checkmate"
      ],
      answer: "To pin White's d4 pawn, restrict White's development, and force weakening pawn moves like f3",
      explanation: "3...Bg4 creates an immediate pin against White's d4 pawn and queen. If White plays f3 to block, White weakens their kingside pawn shelter."
    }
  },
  {
    id: "smith-morra-gambit",
    name: "Smith-Morra Gambit",
    eco: "B21",
    category: "Sicilian Defense",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Against the Sicilian Defense, White sacrifices a c-pawn (1.e4 c5 2.d4 cxd4 3.c3!) to gain rapid development and complete control of c- and d-files.",
    estimatedTime: "12 mins",
    popularity: 85,
    successRate: 51,
    history: "Popularized by Ken Smith in the mid-20th century. He famously played it against Bobby Fischer in San Antonio 1972.",
    inventor: "Ken Smith & Pierre Morra",
    playingStyle: "Positional compression, rapid file access, heavy tactical threats",
    whenToUse: "Against Sicilian players who expect complex Open Sicilian theory; bypasses their prep with direct file attack.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Opens both c- and d-files for White's rooks.",
      "Bc4 aims directly at f7.",
      "Gains complete control of d5."
    ],
    disadvantages: [
      "Black can defend with solid setups (e6, d6, a6, Nf6)."
    ],
    commonTraps: [
      "Siberian Trap: 1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 e6 6.Bc4 Qc7 7.O-O Nf6 8.Qe2 Ng4 9.h3 Nd4! winning."
    ],
    moves: ["e4", "c5", "d4", "cxd4", "c3"],
    explanations: [
      "e4 c5 Sicilian Defense.",
      "2.d4 cxd4 White strikes the center.",
      "THE SMITH-MORRA GAMBIT! White offers 3.c3, sacrificing a pawn to develop Nxc3 and open c/d files."
    ],
    acceptedVariation: {
      name: "Smith-Morra Accepted (3...dxc3 4.Nxc3)",
      moves: ["e4", "c5", "d4", "cxd4", "c3", "dxc3", "Nxc3"],
      explanation: "Black accepts the pawn. White recaptures 4.Nxc3, claiming control of c/d files and d5 outpost."
    },
    declinedVariation: {
      name: "Push Variation (3...d3)",
      moves: ["e4", "c5", "d4", "cxd4", "c3", "d3"],
      explanation: "Black declines, pushing 3...d3 to deny White the c3 knight development square."
    },
    popularVariations: [
      "Finegold Defense (6...e6)",
      "Taylor Defense (5...d6)",
      "Siberian Trap (6...e6 7.Nf3 Nc6 8.Bc4 Qc7)"
    ],
    strategicIdeas: [
      "Placing rooks on c1 and d1 to paralyze Black's position.",
      "Placing bishop on c4 targeting f7.",
      "Utilizing d5 as a knight outpost."
    ],
    tacticalMotifs: [
      "Sacrifices on e6 and f7 with Bc4 and Nd5.",
      "Siberian Trap (Ng4 + Nd4 targeting h2).",
      "Rook infiltrations on c7/d7."
    ],
    commonMistakes: [
      "Forgetting to guard against the Siberian Trap as White."
    ],
    bestResponses: [
      "3...dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O a6!"
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Nd5+ and Qe6#."
    ],
    middlegamePlans: [
      "Place Rooks on c1 and d1, Bc4, Qe2, and O-O.",
      "Push e5 at the right moment to break Black's center.",
      "Leap Nd5 to dominate the position."
    ],
    endgameIdeas: [
      "Black's extra c-pawn gives Black the advantage if queens are traded early."
    ],
    famousGames: [
      "Ken Smith vs Bobby Fischer, San Antonio 1972",
      "Marc Esserman vs Various Grandmasters, 2012"
    ],
    grandmasterExamples: ["Marc Esserman", "Ken Smith"],
    practicePosition: {
      fen: "rnbqkbnr/pp1ppppp/8/8/3pP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      prompt: "Black captured 2...cxd4 in the Sicilian. Offer the Smith-Morra Gambit with 3.c3.",
      solution: ["c3"]
    },
    quiz: {
      question: "Which two files are opened for White's rooks in the accepted Smith-Morra Gambit?",
      options: [
        "The c-file and d-file",
        "The a-file and b-file",
        "The e-file and f-file",
        "The g-file and h-file"
      ],
      answer: "The c-file and d-file",
      explanation: "After 3...dxc3 4.Nxc3, the c- and d-files are open. Placing White's rooks on c1 and d1 creates tremendous positional pressure against Black's queen and backward d-pawn."
    }
  },
  {
    id: "wing-gambit",
    name: "Wing Gambit",
    eco: "B20",
    category: "Sicilian Defense",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "White sacrifices a wing b-pawn (1.e4 c5 2.b4!) to deflect Black's c5 pawn and secure total central domination with d4.",
    estimatedTime: "10 mins",
    popularity: 72,
    successRate: 48,
    history: "A classic flank attack against the Sicilian Defense, analyzed by Frank Marshall and Rudolf Spielmann.",
    inventor: "Frank Marshall & Rudolf Spielmann",
    playingStyle: "Flank diversion, quick space-grabbing, central dominance",
    whenToUse: "To take Sicilian players out of their deeply memorized lines on move 2.",
    recommendedSkillLevel: "1000 - 1800 Elo",
    advantages: [
      "Removes Black's c5 pawn, paving the way for d4.",
      "Gains open a- and b-files for queenside rooks.",
      "Builds an unassailable e4-d4 pawn duo."
    ],
    disadvantages: [
      "Black can strike back in the center with 2...d5!"
    ],
    commonTraps: [
      "2.b4 cxb4 3.a3 d5! 4.exd5 Qxd5 5.Nf3 e5 with strong black counter-play."
    ],
    moves: ["e4", "c5", "b4"],
    explanations: [
      "e4 c5 Sicilian Defense.",
      "THE WING GAMBIT! White plays 2.b4!, offering a flank pawn to deflect Black's c5 pawn away from controlling d4."
    ],
    acceptedVariation: {
      name: "Wing Gambit Accepted (2...cxb4 3.a3)",
      moves: ["e4", "c5", "b4", "cxb4", "a3"],
      explanation: "Black accepts. White plays 3.a3, offering a second pawn to open queenside files."
    },
    declinedVariation: {
      name: "Wing Gambit Declined (2...d5)",
      moves: ["e4", "c5", "b4", "d5"],
      explanation: "Black declines the b4 pawn, striking back in the center with 2...d5."
    },
    popularVariations: [
      "Marshall Variation (3.a3)",
      "Carlsen Variation (3.d4)",
      "French Wing Gambit (1.e4 e6 2.Nf3 d5 3.e5 c5 4.b4)"
    ],
    strategicIdeas: [
      "Deflecting Black's c5 pawn to gain full control over d4.",
      "Building a powerful d4-e4 center.",
      "Utilizing open a- and b-files for active rook play."
    ],
    tacticalMotifs: [
      "Queenside pawn levers.",
      "Ba3 pinning e7/f8.",
      "Central pawn steamroller."
    ],
    commonMistakes: [
      "Failing to play d4 immediately after b4 is captured."
    ],
    bestResponses: [
      "2...d5! (Declined) counterattacking e4 directly."
    ],
    typicalCheckmatePatterns: [
      "Double bishop diagonals backing up a kingside attack."
    ],
    middlegamePlans: [
      "Push d4 and Nf3, build a strong center.",
      "Place bishop on a3 or b2 targeting Black's position.",
      "Attack along open a- and b-files."
    ],
    endgameIdeas: [
      "White's central space advantage provides middlegame play, but Black holds an extra pawn in the endgame."
    ],
    famousGames: [
      "Rudolf Spielmann vs Richard Reti, Vienna 1922"
    ],
    grandmasterExamples: ["Rudolf Spielmann", "Frank Marshall"],
    practicePosition: {
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      prompt: "Black played 1...c5 (Sicilian). Launch the Wing Gambit with 2.b4.",
      solution: ["b4"]
    },
    quiz: {
      question: "What is the primary positional goal of playing 2.b4 in the Wing Gambit against the Sicilian Defense?",
      options: [
        "To deflect Black's c5 pawn so White can occupy the absolute center with d4",
        "To win Black's a8 rook",
        "To castle queenside",
        "To close the position"
      ],
      answer: "To deflect Black's c5 pawn so White can occupy the absolute center with d4",
      explanation: "The Sicilian Defense aims to control d4 using the flank c5 pawn. By offering 2.b4, White tries to trade off Black's c5 pawn, clearing the way for White to play d4 uncontested."
    }
  },
  {
    id: "marshall-gambit",
    name: "Marshall Gambit / Attack",
    eco: "C89",
    category: "Ruy Lopez",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "In the Ruy Lopez, Black sacrifices a central d-pawn (8.c3 d5!) to launch an unstoppable kingside attack against White's castled king.",
    estimatedTime: "15 mins",
    popularity: 90,
    successRate: 51,
    history: "Invented by Frank Marshall and unleashed against Jose Raul Capablanca in 1918. Remains one of Black's most respected weapons in the Ruy Lopez.",
    inventor: "Frank Marshall",
    playingStyle: "Unstoppable kingside onslaught, piece coordination, bishop-queen battery",
    whenToUse: "As Black against 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 to take the initiative.",
    recommendedSkillLevel: "1400 - 2400 Elo",
    advantages: [
      "Gives Black an immense, lasting kingside attack.",
      "White is forced onto the defensive for dozens of moves.",
      "Extremely deep theory where Black holds comfortable compensation."
    ],
    disadvantages: [
      "White can avoid it by playing 'Anti-Marshall' lines (8.a4 or 8.h3)."
    ],
    commonTraps: [
      "8.c3 d5 9.exd5 Nxd5 10.Nxe5 Nxe5 11.Rxe5 c6 12.d4 Bd6 13.Re1 Qh4 14.g3 Qh3 with a terrifying attack."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5"],
    explanations: [
      "Standard Ruy Lopez setup up to move 8.",
      "White plays 8.c3, preparing d4.",
      "THE MARSHALL ATTACK! Black strikes 8...d5!, sacrificing the d-pawn to clear lines for Bd6, Qh4, and Ng4."
    ],
    acceptedVariation: {
      name: "Marshall Attack Main Line (9.exd5 Nxd5 10.Nxe5 Nxe5 11.Rxe5 c6)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5", "exd5", "Nxd5", "Nxe5", "Nxe5", "Rxe5", "c6"],
      explanation: "White accepts the pawn. Black plays 11...c6 to solidify the d5 knight and prepare Bd6 and Qh4."
    },
    declinedVariation: {
      name: "Anti-Marshall (8.a4 or 8.h3)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "h3"],
      explanation: "White plays 8.h3 or 8.a4 before c3 to prevent Black from playing d5."
    },
    popularVariations: [
      "Main Line: 12.d4 Bd6 13.Re1 Qh4",
      "Kevitz Variation: 11...Nf6"
    ],
    strategicIdeas: [
      "Sacrificing a center pawn to secure a blistering kingside attack.",
      "Coordinating Bd6 and Qh4 against White's h2 square.",
      "Disrupting White's coordination before queenside pieces develop."
    ],
    tacticalMotifs: [
      "Sacrifices on h2 and f2.",
      "Bxh3 and Ng4 tactical combinations.",
      "Queen and bishop battery on h4/d6."
    ],
    commonMistakes: [
      "White playing too greedily without securing king defense."
    ],
    bestResponses: [
      "White knowing deep theoretical lines or playing Anti-Marshall setups (8.a4 / 8.h3)."
    ],
    typicalCheckmatePatterns: [
      "Blistering checkmates on h2 or g2 with Queen and Bishop."
    ],
    middlegamePlans: [
      "Play Bd6, Qh4, Bg4, and Re8 as Black.",
      "Sacrifice pieces on h3 or f2 to break White's g3 pawn shield."
    ],
    endgameIdeas: [
      "White aims to trade queens and convert the extra pawn in the endgame."
    ],
    famousGames: [
      "Jose Raul Capablanca vs Frank Marshall, New York 1918",
      "Levon Aronian vs Various Grandmasters, 2015"
    ],
    grandmasterExamples: ["Frank Marshall", "Levon Aronian", "Garry Kasparov", "Ding Liren"],
    practicePosition: {
      fen: "r1bq1rk1/2ppbppp/p1n2n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 b - - 1 8",
      prompt: "White played 8.c3 in the Ruy Lopez. Launch the Marshall Attack by sacrificing your central d-pawn with 8...d5!",
      solution: ["d5"]
    },
    quiz: {
      question: "Which World Champion famously calculated his way through Frank Marshall's surprise attack in 1918 to win?",
      options: [
        "Jose Raul Capablanca",
        "Alexander Alekhine",
        "Mikhail Tal",
        "Garry Kasparov"
      ],
      answer: "Jose Raul Capablanca",
      explanation: "Jose Raul Capablanca famously accepted Frank Marshall's secret home preparation on move 8 and calculated his way through the attack to win a legendary game."
    }
  },
  {
    id: "milner-barry-gambit",
    name: "Milner-Barry Gambit",
    eco: "C02",
    category: "French Defense",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the French Advance Variation, White sacrifices a d4 pawn (6.Bd3 cxd4 7.cxd4 Bd7 8.O-O!) for rapid development and kingside attack.",
    estimatedTime: "12 mins",
    popularity: 78,
    successRate: 51,
    history: "Invented by British codebreaker and chess master Stuart Milner-Barry during WWII. A sharp weapon against the French Advance.",
    inventor: "Sir Stuart Milner-Barry",
    playingStyle: "Castling sacrifice, e5 space wedge, kingside pressure",
    whenToUse: "In the French Advance Variation (1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6) to bypass slow defensive grinds.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "White castles immediately (8.O-O!), leaving d4 undefended for speed.",
      "Maintains the powerful e5 space wedge.",
      "Bishop on d3 and knight on f3 target h7."
    ],
    disadvantages: [
      "White sacrifices a center pawn."
    ],
    commonTraps: [
      "8.O-O Nxd4 9.Nxd4 Qxd4 10.Nc3 Qxe5 11.Re1 Qb8 12.Nxd5! with crushing tactical initiative."
    ],
    moves: ["e4", "e6", "d4", "d5", "e5", "c5", "c3", "Nc6", "Nf3", "Qb6", "Bd3", "cxd4", "cxd4", "Bd7", "O-O"],
    explanations: [
      "1.e4 e6 French Defense.",
      "2.d4 d5 3.e5 Advance Variation.",
      "3...c5 4.c3 Nc6 5.Nf3 Qb6 standard pressure on d4.",
      "6.Bd3! cxd4 7.cxd4 Bd7 White prepares the gambit.",
      "THE MILNER-BARRY GAMBIT! White plays 8.O-O!, offering the d4 pawn to castle and open the e-file!"
    ],
    acceptedVariation: {
      name: "Milner-Barry Accepted (8...Nxd4 9.Nxd4 Qxd4 10.Nc3)",
      moves: ["e4", "e6", "d4", "d5", "e5", "c5", "c3", "Nc6", "Nf3", "Qb6", "Bd3", "cxd4", "cxd4", "Bd7", "O-O", "Nxd4", "Nxd4", "Qxd4", "Nc3"],
      explanation: "Black accepts d4. White plays 10.Nc3, preparing Re1 and Nb5 with immense development lead."
    },
    declinedVariation: {
      name: "Milner-Barry Declined (8...a6)",
      moves: ["e4", "e6", "d4", "d5", "e5", "c5", "c3", "Nc6", "Nf3", "Qb6", "Bd3", "cxd4", "cxd4", "Bd7", "O-O", "a6"],
      explanation: "Black declines d4, playing 8...a6 to prevent Nb5/Bb5 ideas."
    },
    popularVariations: [
      "Main Line: 10.Nc3 a6 11.Qe2",
      "Alternative: 10...Qxe5 11.Re1"
    ],
    strategicIdeas: [
      "Sacrificing the d4 pawn to eliminate Black's pressure on d4.",
      "Using e5 as a wedge to cramp Black's kingside.",
      "Infiltrating via Nb5 or Re1 along open e-file."
    ],
    tacticalMotifs: [
      "Nxd5 sacrifices on e6/d5.",
      "Bxh7+ sacrifices.",
      "Re1 pins against Black's king."
    ],
    commonMistakes: [
      "Black taking on e5 with 10...Qxe5? leading to 11.Re1 and major tactical trouble."
    ],
    bestResponses: [
      "8...Nxd4 9.Nxd4 Qxd4 10.Nc3 a6! (preventing Nb5)."
    ],
    typicalCheckmatePatterns: [
      "Bxh7+ followed by Ng5+ and Qh5#."
    ],
    middlegamePlans: [
      "Play Nc3, Re1, and Qe2.",
      "Use Nb5 to target c7 and d6.",
      "Launch a kingside attack using the e5 pawn wedge."
    ],
    endgameIdeas: [
      "White's active rooks compensate for the pawn deficit."
    ],
    famousGames: [
      "Stuart Milner-Barry vs C.H.O'D. Alexander, Cambridge 1938"
    ],
    grandmasterExamples: ["Stuart Milner-Barry", "Nigel Short", "Vasyl Ivanchuk"],
    practicePosition: {
      fen: "r3kb1r/pp1b1ppp/1qn1p3/3pP3/3P4/3B1N2/PP3PPP/RNBQ1RK1 b kq - 1 8",
      prompt: "White has castled (8.O-O), leaving d4 undefended. Capture the d4 pawn with 8...Nxd4 to accept the gambit.",
      solution: ["Nxd4"]
    },
    quiz: {
      question: "What key development move does White play on move 8 to initiate the Milner-Barry Gambit?",
      options: [
        "8.O-O!, castling and leaving d4 undefended to gain active piece play",
        "8.Be3, defending d4 passively",
        "8.a3, preventing Nb4",
        "8.Qe2, defending e5"
      ],
      answer: "8.O-O!, castling and leaving d4 undefended to gain active piece play",
      explanation: "In the Milner-Barry Gambit, 8.O-O! ignores the threat on d4. If Black captures on d4, White plays Nc3 and Re1 with a crushing lead in development."
    }
  },
  {
    id: "fantasy-variation",
    name: "Fantasy Variation / Gambit",
    eco: "B12",
    category: "Caro-Kann Defense",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Against the Caro-Kann, White plays 3.f3!? to maintain a strong d4/e4 pawn center, offering sharp tactical line breaks.",
    estimatedTime: "10 mins",
    popularity: 80,
    successRate: 51,
    history: "A sharp, aggressive system against 1.e4 c6 2.d4 d5 favored by tactical players like Hector and Nepomniachtchi.",
    inventor: "Classical Attack Analysts",
    playingStyle: "Center fortification, aggressive pawn pushes, tactical melee",
    whenToUse: "Against Caro-Kann players who expect quiet, positional 3.Nc3 or 3.e5 lines.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Maintains the broad d4/e4 pawn duo.",
      "Avoids dry, solid Caro-Kann structures.",
      "Creates dynamic, open tactical lines."
    ],
    disadvantages: [
      "Weakens White's e1-h4 diagonal.",
      "Black can counterattack with 3...dxe4 4.fxe4 e5!"
    ],
    commonTraps: [
      "3.f3 dxe4 4.fxe4 e5 5.Nf3 exd4 6.Bc4! with massive central activity."
    ],
    moves: ["e4", "c6", "d4", "d5", "f3"],
    explanations: [
      "e4 c6 Caro-Kann Defense.",
      "2.d4 d5 central challenge.",
      "THE FANTASY VARIATION! White plays 3.f3!?, reinforcing e4 with the f-pawn to maintain two center pawns."
    ],
    acceptedVariation: {
      name: "Fantasy Main Line (3...dxe4 4.fxe4 e5 5.Nf3)",
      moves: ["e4", "c6", "d4", "d5", "f3", "dxe4", "fxe4", "e5", "Nf3"],
      explanation: "Black takes 3...dxe4, White recaptures 4.fxe4, and Black strikes with 4...e5! targeting White's weak diagonal."
    },
    declinedVariation: {
      name: "Fantasy Solid Line (3...e6)",
      moves: ["e4", "c6", "d4", "d5", "f3", "e6"],
      explanation: "Black declines open tactics, reinforcing d5 with 3...e6 and setting up a French-like structure."
    },
    popularVariations: [
      "3...dxe4 4.fxe4 e5 (Main Line)",
      "3...e6 (French Transposition)",
      "3...g6 (Modern Defense Setup)"
    ],
    strategicIdeas: [
      "Maintaining a full d4-e4 pawn center.",
      "Opening the f-file for kingside rook activity.",
      "Using Bc4 and Nc3 to control key central squares."
    ],
    tacticalMotifs: [
      "Qh4+ checks for Black.",
      "Bc4 targeting f7 for White.",
      "Central pawn steamrollers."
    ],
    commonMistakes: [
      "Playing 5.dxe5? allowing 5...Qh4+ winning."
    ],
    bestResponses: [
      "3...dxe4 4.fxe4 e5! 5.Nf3 Bg4!"
    ],
    typicalCheckmatePatterns: [
      "Bc4 + Rf1 + e5 crushing attacks on f7."
    ],
    middlegamePlans: [
      "Develop Bc4, Nc3, and castle kingside.",
      "Use the f-file and e4/d4 pawns to press Black's kingside."
    ],
    endgameIdeas: [
      "Central space advantage gives White endgame chances if king is safe."
    ],
    famousGames: [
      "Ian Nepomniachtchi vs Alireza Firouzja, 2021",
      "Jonny Hector vs Various Masters, 2010"
    ],
    grandmasterExamples: ["Ian Nepomniachtchi", "Jonny Hector", "Hikaru Nakamura"],
    practicePosition: {
      fen: "rn1qkbnr/pp2pppp/2p5/3p4/3PP3/5P2/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      prompt: "Black played 2...d5 in the Caro-Kann. Support your e4 pawn with 3.f3 to play the Fantasy Variation.",
      solution: ["f3"]
    },
    quiz: {
      question: "What is Black's most energetic tactical counter-strike against 3.f3 in the Fantasy Variation?",
      options: [
        "3...dxe4 4.fxe4 e5!, striking back at White's center and exploiting the weakened diagonal",
        "3...Nf6, allowing e5",
        "3...a6, wasting a move",
        "3...f5, doubling f-pawns"
      ],
      answer: "3...dxe4 4.fxe4 e5!, striking back at White's center and exploiting the weakened diagonal",
      explanation: "After 3...dxe4 4.fxe4, Black's most energetic reply is 4...e5! This attacks d4 and prepares Qh4+ if White captures on e5, exploiting White's weakened e1-h4 diagonal."
    }
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    eco: "D06",
    category: "Queen's Pawn Opening",
    difficulty: "Beginner",
    side: "White",
    shortDesc: "The premier positional opening. White offers the c-pawn (1.d4 d5 2.c4) to divert Black's central d5 pawn and gain complete central supremacy.",
    estimatedTime: "12 mins",
    popularity: 97,
    successRate: 55,
    history: "One of the oldest opening systems (documented 1490), popularized at World Championship level and featured in global culture.",
    inventor: "Philipp Stamma (Popularizer)",
    playingStyle: "Strategic control, positional squeeze, central dominance",
    whenToUse: "Against 1...d5 players when you want a solid, highly strategic game with long-term positional advantages.",
    recommendedSkillLevel: "800 - 2400 Elo",
    advantages: [
      "Challenging Black's central d5 pawn.",
      "Opens the c-file for queenside operations.",
      "Prepares a full e4 center push."
    ],
    disadvantages: [
      "Strictly speaking, a temporary sacrifice since Black cannot safely keep the c4 pawn."
    ],
    commonTraps: [
      "Trying to hold c4 with 2...dxc4 3.e3 b5? 4.a4 c6 5.axb5 cxb5?? 6.Qf3! winning a rook."
    ],
    moves: ["d4", "d5", "c4"],
    explanations: [
      "1.d4 claims central space.",
      "1...d5 mirrors to block.",
      "THE QUEEN'S GAMBIT! White offers 2.c4, challenging Black's d5 pawn."
    ],
    acceptedVariation: {
      name: "Queen's Gambit Accepted (QGA)",
      moves: ["d4", "d5", "c4", "dxc4"],
      explanation: "Black accepts c4. White plays 3.e4 or 3.e3, preparing to recapture with the light-squared bishop."
    },
    declinedVariation: {
      name: "Queen's Gambit Declined (QGD)",
      moves: ["d4", "d5", "c4", "e6"],
      explanation: "Black declines, reinforcing d5 with e6. Highly solid at all World Championship levels."
    },
    popularVariations: [
      "Queen's Gambit Declined (2...e6)",
      "Slav Defense (2...c6)",
      "Queen's Gambit Accepted (2...dxc4)",
      "Albin Countergambit (2...e5)"
    ],
    strategicIdeas: [
      "Diverting Black's d5 pawn to build a d4-e4 pawn center.",
      "Operating along the open c-file with Rc1 and Qc2.",
      "Squeezing Black's space on the queenside."
    ],
    tacticalMotifs: [
      "Qf3 winning a8 rook if Black plays b5.",
      "Minority attack (b4-b5) on the queenside.",
      "Pinning Nc6/Nf6 with Bg5."
    ],
    commonMistakes: [
      "Black trying to defend c4 with b5, a6, c6, which shatters Black's queenside."
    ],
    bestResponses: [
      "2...e6 (QGD) or 2...c6 (Slav Defense)."
    ],
    typicalCheckmatePatterns: [
      "Bishop-queen battery on b1-h7 diagonal crushing Black's castled king."
    ],
    middlegamePlans: [
      "Develop Nc3, Nf3, Bg5, e3, and Rc1.",
      "Launch a minority attack on the queenside (b4-b5).",
      "Control the c-file."
    ],
    endgameIdeas: [
      "White's central majority or superior pawn structure provides long-term endgame advantage."
    ],
    famousGames: [
      "Garry Kasparov vs Anatoly Karpov, World Championship 1985",
      "Magnus Carlsen vs Fabiano Caruana, World Championship 2018"
    ],
    grandmasterExamples: ["Garry Kasparov", "Magnus Carlsen", "Anatoly Karpov", "José Raúl Capablanca"],
    practicePosition: {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      prompt: "White played 1.d4 and Black replied 1...d5. Offer the c-pawn to initiate the Queen's Gambit.",
      solution: ["c4"]
    },
    quiz: {
      question: "Why is the Queen's Gambit not considered a 'true' gambit compared to the King's Gambit?",
      options: [
        "Because White can force the recapture of the c4 pawn, and Black cannot safely defend it",
        "Because Black is forbidden from capturing c4",
        "Because it is played on the queenside",
        "Because the game is immediately drawn"
      ],
      answer: "Because White can force the recapture of the c4 pawn, and Black cannot safely defend it",
      explanation: "If Black accepts 2...dxc4, White plays e3 or e4. Any attempt by Black to hold onto c4 with b5 usually leads to a lost queenside due to a4 and Qf3 tactical lines."
    }
  },
  {
    id: "queens-gambit-accepted",
    name: "Queen's Gambit Accepted",
    eco: "D20",
    category: "Queen's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Black captures 2...dxc4. White develops actively with 3.e4 or 3.Nf3, reclaiming c4 while gaining central supremacy.",
    estimatedTime: "12 mins",
    popularity: 88,
    successRate: 54,
    history: "A classical opening system tested by World Champions from Steinitz to Kasparov and Anand.",
    inventor: "Classical Masters",
    playingStyle: "Central occupation, rapid piece activation, open central lines",
    whenToUse: "When playing White against 2...dxc4 to build a dominant center and active piece placement.",
    recommendedSkillLevel: "1000 - 2200 Elo",
    advantages: [
      "White builds a strong e4-d4 center with 3.e4.",
      "Recaptures c4 with Bxc4.",
      "Open lines for piece development."
    ],
    disadvantages: [
      "Black gets comfortable counter-play with 3...e5! or 3...Nf6."
    ],
    commonTraps: [
      "3.e3 b5? 4.a4 c6 5.axb5 cxb5 6.Qf3! winning Black's a8 rook."
    ],
    moves: ["d4", "d5", "c4", "dxc4"],
    explanations: [
      "d4 d5 central challenge.",
      "c4 Queen's Gambit offered.",
      "THE QUEEN'S GAMBIT ACCEPTED! Black captures 2...dxc4, surrendering the center."
    ],
    acceptedVariation: {
      name: "Central Line (3.e4 e5 4.Nf3)",
      moves: ["d4", "d5", "c4", "dxc4", "e4", "e5", "Nf3"],
      explanation: "White occupies the center with 3.e4. Black counterattacks with 3...e5."
    },
    declinedVariation: {
      name: "Classical Line (3.Nf3 Nf6 4.e3 e6 5.Bxc4)",
      moves: ["d4", "d5", "c4", "dxc4", "Nf3", "Nf6", "e3", "e6", "Bxc4"],
      explanation: "White plays 3.Nf3 first to prevent 3...e5, then 4.e3 and recaptures 5.Bxc4."
    },
    popularVariations: [
      "3.e4 (Central Variation)",
      "3.Nf3 (Classical Variation)",
      "3.e3 (Alekhine Variation)"
    ],
    strategicIdeas: [
      "Establishing an e4-d4 pawn duo.",
      "Recapturing on c4 with Bxc4.",
      "Controlling the d-file with Queen and Rooks."
    ],
    tacticalMotifs: [
      "Qf3 rook traps against b5 defender.",
      "Bxf7+ sacrifices.",
      "Isolated queen pawn tactics."
    ],
    commonMistakes: [
      "Black trying to hold c4 with b5, losing material on the long diagonal."
    ],
    bestResponses: [
      "Black playing 3...e5! against 3.e4, or 3...Nf6 4.e3 e6 5.Bxc4 c5! against 3.Nf3."
    ],
    typicalCheckmatePatterns: [
      "Bxc4 + Qe2 + Rd1 central battery attacks."
    ],
    middlegamePlans: [
      "Castle kingside, play Nc3, Qe2, and Rd1.",
      "Use the isolated queen's pawn (if created) for active piece play."
    ],
    endgameIdeas: [
      "Equal pawn structure leads to balanced endgames if Black neutralizes White's center."
    ],
    famousGames: [
      "Garry Kasparov vs Viswanathan Anand, World Championship 1995"
    ],
    grandmasterExamples: ["Garry Kasparov", "Viswanathan Anand", "Anatoly Karpov"],
    practicePosition: {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
      prompt: "White played 2.c4. Accept the Queen's Gambit by capturing 2...dxc4.",
      solution: ["dxc4"]
    },
    quiz: {
      question: "Why is 3...b5? a blunder for Black after 3.e3 in the Queen's Gambit Accepted?",
      options: [
        "White plays 4.a4 c6 5.axb5 cxb5 6.Qf3!, winning a rook on a8",
        "It loses a queen immediately",
        "It forces an early draw",
        "It traps Black's dark-squared bishop"
      ],
      answer: "White plays 4.a4 c6 5.axb5 cxb5 6.Qf3!, winning a rook on a8",
      explanation: "Attempting to defend c4 with 3...b5 loses to 4.a4 c6 5.axb5 cxb5 6.Qf3! The queen attacks the undefended a8 rook along the h1-a8 diagonal, winning material."
    }
  },
  {
    id: "queens-gambit-declined",
    name: "Queen's Gambit Declined",
    eco: "D30",
    category: "Queen's Pawn Opening",
    difficulty: "Beginner",
    side: "Black",
    shortDesc: "Black declines 2.c4 by playing 2...e6, reinforcing d5 to build an rock-solid central fortress favored at World Championships.",
    estimatedTime: "12 mins",
    popularity: 95,
    successRate: 53,
    history: "The bedrock of classical chess theory. Featured in almost every World Championship match for over a century.",
    inventor: "Classical Masters",
    playingStyle: "Solid central fortress, strategic maneuvering, resilient defense",
    whenToUse: "When playing Black against 1.d4 d5 2.c4 and you want an unshakeable, rock-solid defensive position.",
    recommendedSkillLevel: "800 - 2400 Elo",
    advantages: [
      "Rock-solid control over d5.",
      "Extremely safe king position.",
      "Well-tested theoretical reliability."
    ],
    disadvantages: [
      "Black's light-squared bishop on c8 can become passive behind the e6 pawn."
    ],
    commonTraps: [
      "Elephant Trap: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5 6.Nxd5?? Nxd5! 7.Bxd8 Bb4+ winning back the queen with a piece ahead."
    ],
    moves: ["d4", "d5", "c4", "e6"],
    explanations: [
      "1.d4 d5 central challenge.",
      "2.c4 Queen's Gambit offered.",
      "THE QUEEN'S GAMBIT DECLINED! Black plays 2...e6, reinforcing d5 and opening the f8 bishop."
    ],
    acceptedVariation: {
      name: "Tartakower Defense (3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6)",
      moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6"],
      explanation: "Black fianchettoes the light-squared bishop to b7 to solve its passive placement."
    },
    declinedVariation: {
      name: "Exchange Variation (3.Nc3 Nf6 4.cxd5 exd5)",
      moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "cxd5", "exd5"],
      explanation: "White exchanges 4.cxd5, creating a pawn structure where White can launch a minority attack on the queenside."
    },
    popularVariations: [
      "Tartakower Defense (7...b6)",
      "Lasker Defense (7...Ne4)",
      "Orthodox Defense (7...Nbd7)",
      "Exchange Variation (4.cxd5)"
    ],
    strategicIdeas: [
      "Maintaining the d5 central stronghold.",
      "Solving the c8 'problem bishop' via b6/Bb7 or e5 pawn breaks.",
      "Countering White's queenside minority attack."
    ],
    tacticalMotifs: [
      "Elephant Trap (Bb4+ queen winning tactic).",
      "Bxh7+ Greek Gift sacrifices for White.",
      "Pinning Nf6 with Bg5."
    ],
    commonMistakes: [
      "Leaving the c8 bishop permanently trapped without playing b6 or e5."
    ],
    bestResponses: [
      "Tartakower Defense (7...b6) or Lasker Defense (7...Ne4) to trade pieces and free Black's position."
    ],
    typicalCheckmatePatterns: [
      "Bxh7+ followed by Ng5+ and Qh5# for White."
    ],
    middlegamePlans: [
      "Black plays Nbd7, c6 or c5, and Re8.",
      "Fianchetto c8 bishop to b7 or break with e5.",
      "Neutralize White's open c-file pressure."
    ],
    endgameIdeas: [
      "QGD endgames are renowned for being extremely solid and drawish if Black solves the c8 bishop."
    ],
    famousGames: [
      "Jose Raul Capablanca vs Alexander Alekhine, World Championship 1927",
      "Garry Kasparov vs Anatoly Karpov, World Championship 1984"
    ],
    grandmasterExamples: ["Jose Raul Capablanca", "Garry Kasparov", "Anatoly Karpov", "Magnus Carlsen"],
    practicePosition: {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      prompt: "White played 2.c4. Decline the gambit solidifying d5 with 2...e6.",
      solution: ["e6"]
    },
    quiz: {
      question: "What is Black's main strategic challenge in the Queen's Gambit Declined?",
      options: [
        "Developing the 'problem' light-squared bishop on c8, which is blocked by the e6 pawn",
        "Defending the f7 square",
        "Preventing White from castling",
        "Avoiding immediate checkmate on move 5"
      ],
      answer: "Developing the 'problem' light-squared bishop on c8, which is blocked by the e6 pawn",
      explanation: "Because Black plays 2...e6, the light-squared bishop on c8 is trapped inside the pawn chain. Black must plan to liberate it via b6 and Bb7 or through a central e5 pawn break."
    }
  },
  {
    id: "albin-countergambit",
    name: "Albin Countergambit",
    eco: "D08",
    category: "Queen's Pawn Opening",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "Against the Queen's Gambit, Black strikes back with 2...e5!?, sacrificing a pawn to push d4 and create the famous Lasker Trap underpromotion.",
    estimatedTime: "12 mins",
    popularity: 78,
    successRate: 49,
    history: "Invented by Adolf Albin in 1893. Features the legendary Lasker Trap with an underpromotion to a Knight on move 7.",
    inventor: "Adolf Albin & Emanuel Lasker",
    playingStyle: "Tactical counter-attack, d4 wedge, underpromotion traps",
    whenToUse: "To surprise 1.d4 2.c4 players and force them into calculating sharp, non-standard tactical traps.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "The d4 pawn wedge splits White's position in two.",
      "Contains the famous Lasker Trap (7...fxg1=N+!).",
      "Gains an immediate tactical initiative."
    ],
    disadvantages: [
      "If White avoids traps with 3.dxe5 d4 4.Nf3 Nc6 5.g3!, White holds an extra pawn securely."
    ],
    commonTraps: [
      "Lasker Trap: 1.d4 d5 2.c4 e5 3.dxe5 d4 4.e3? Bb4+ 5.Bd2 dxe3! 6.Bxb4?? exf2+ 7.Ke2 fxg1=N+! 8.Rxg1 Bg4+ winning White's queen!"
    ],
    moves: ["d4", "d5", "c4", "e5"],
    explanations: [
      "1.d4 d5 central challenge.",
      "2.c4 Queen's Gambit offered.",
      "THE ALBIN COUNTERGAMBIT! Black strikes back with 2...e5!?, offering an e-pawn sacrifice to push 3...d4."
    ],
    acceptedVariation: {
      name: "Albin Main Line (3.dxe5 d4 4.Nf3 Nc6)",
      moves: ["d4", "d5", "c4", "e5", "dxe5", "d4", "Nf3", "Nc6"],
      explanation: "White takes 3.dxe5. Black pushes 3...d4!, creating a deep pawn wedge that cramps White's development."
    },
    declinedVariation: {
      name: "Albin Declined (3.Nf3)",
      moves: ["d4", "d5", "c4", "e5", "Nf3", "exd4", "Qxd4"],
      explanation: "White declines the gambit, playing 3.Nf3 to liquidate into open central exchanges."
    },
    popularVariations: [
      "Fianchetto Variation (5.g3 Bg4 6.Bg2 Qd7)",
      "Lasker Trap Line (4.e3? Bb4+ 5.Bd2 dxe3!)"
    ],
    strategicIdeas: [
      "Using the d4 pawn wedge to divide White's kingside and queenside.",
      "Rapid piece deployment with Nc6, Bg4, and Qe7/Qd7.",
      "Castling queenside (O-O-O) for a direct kingside assault."
    ],
    tacticalMotifs: [
      "Lasker Trap underpromotion (fxg1=N+!).",
      "Bb4+ checks exploiting weak diagonals.",
      "Bg4 pins against Nf3."
    ],
    commonMistakes: [
      "White playing 4.e3? walking straight into the Lasker Trap."
    ],
    bestResponses: [
      "White playing 4.Nf3 Nc6 5.g3! (Fianchetto Variation) to neutralize Black's d4 pawn safely."
    ],
    typicalCheckmatePatterns: [
      "Bg4+ and Qe1# combos arising from the Lasker Trap."
    ],
    middlegamePlans: [
      "Black plays Nc6, Bg4, Qd7, and O-O-O.",
      "Maintain the d4 pawn wedge to restrict White's piece coordination."
    ],
    endgameIdeas: [
      "White's extra e5 pawn gives White an advantage if the middlegame attack fails."
    ],
    famousGames: [
      "Emanuel Lasker vs Adolf Albin, New York 1893",
      "Alexander Morozevich vs Various Masters, 2000"
    ],
    grandmasterExamples: ["Adolf Albin", "Emanuel Lasker", "Alexander Morozevich"],
    practicePosition: {
      fen: "rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      prompt: "Black played 2...e5 (Albin Countergambit). Take the e5 pawn with 3.dxe5.",
      solution: ["dxe5"]
    },
    quiz: {
      question: "What unique promotion occurs in the famous Lasker Trap in the Albin Countergambit?",
      options: [
        "Underpromotion to a Knight with check (7...fxg1=N+!), winning White's queen",
        "Promotion to a Queen",
        "Promotion to a Rook",
        "Promotion to a Bishop"
      ],
      answer: "Underpromotion to a Knight with check (7...fxg1=N+!), winning White's queen",
      explanation: "In the Lasker Trap (6.Bxb4?? exf2+ 7.Ke2), Black promotes 7...fxg1=N+! Promoting to a Knight gives check. If 8.Rxg1, 8...Bg4+ wins White's queen!"
    }
  }
];
