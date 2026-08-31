import { Gambit } from "../gambitData";

export const gambits1: Gambit[] = [
  {
    id: "kings-gambit",
    name: "King's Gambit",
    eco: "C30",
    category: "King's Pawn Opening",
    difficulty: "Beginner",
    side: "White",
    shortDesc: "Symmetrical e4-e5 opening where White offers the f-pawn to gain total central supremacy and open the f-file.",
    estimatedTime: "12 mins",
    popularity: 88,
    successRate: 53,
    history: "One of the oldest documented chess openings, dating back to the 15th century. It was the absolute favorite during the 19th-century Romantic Era.",
    inventor: "Ruy López de Segura (First analyzed)",
    playingStyle: "Ultra-aggressive tactical hacking, piece sacrifices, open lines",
    whenToUse: "Against players who struggle with sharp tactics and prefer slow, passive defensive games.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Immediate central pawn domination with e4 and d4.",
      "Opens the f-file for rapid rook activity after castling.",
      "Creates quick attacking chances against f7."
    ],
    disadvantages: [
      "Exposes White's king along the e1-h4 diagonal.",
      "Black can hold the extra pawn with g5 in classical lines.",
      "Requires precise tactical calculation."
    ],
    commonTraps: [
      "Early Qh4+ check forcing White's king to move if Nf3 is omitted.",
      "g5-g4 pawn pushes driving away White's f3 knight."
    ],
    moves: ["e4", "e5", "f4"],
    explanations: [
      "White begins with the king's pawn, taking space in the center and freeing up the bishop and queen.",
      "Black mirrors White's move, staking an equal claim on center squares and planning quick development.",
      "The Gambit! White strikes at the e5 pawn using the f-pawn. By offering this pawn, White aims to displace Black's center pawn and open the f-file."
    ],
    acceptedVariation: {
      name: "King's Gambit Accepted (KGA)",
      moves: ["e4", "e5", "f4", "exf4"],
      explanation: "Black captures the pawn, accepting the challenge. White must proceed rapidly with Nf3 to prevent Black's queen from giving check on h4."
    },
    declinedVariation: {
      name: "Falkbeer Countergambit",
      moves: ["e4", "e5", "f4", "d5"],
      explanation: "Black strikes back immediately in the center, declining the f4 pawn. If White plays exd5, Black replies with e4."
    },
    popularVariations: [
      "KGA: King's Knight Gambit (3.Nf3)",
      "KGA: Bishop's Gambit (3.Bc4)",
      "KGD: Classical Defense (2...Bc5)",
      "KGD: Falkbeer Countergambit (2...d5)"
    ],
    strategicIdeas: [
      "Eliminating Black's e5 pawn to build a massive d4-e4 pawn center.",
      "Opening up the f-file to target Black's weakest spot: the f7 square.",
      "Rapid piece development, frequently sacrificing minor pieces for quick mating attacks."
    ],
    tacticalMotifs: [
      "Weak f7-f8 diagonal vulnerabilities.",
      "Queen checks on h4 exploiting White's exposed king path.",
      "Discovered attacks when the e-file or f-file opens."
    ],
    commonMistakes: [
      "Failing to prevent Qh4+ check when playing bishop setups without Nf3.",
      "Overextending the f-pawn without developing king-side support first.",
      "Getting too greedy keeping the gambit pawn as Black instead of prioritizing king safety."
    ],
    bestResponses: [
      "Play 2...d5 (Falkbeer Countergambit) to disrupt White's plan instantly.",
      "Accept with 2...exf4 and play 3...g5 (Classical Defense) to anchor the pawn."
    ],
    typicalCheckmatePatterns: [
      "Mating attacks on f7 using Bishop and Knight.",
      "Rook lifting to f3 and g3/h3 to deliver back-rank or corner mates."
    ],
    middlegamePlans: [
      "Castle kingside and stack Rooks on the f-file.",
      "Push d4 to establish full central control.",
      "Sacrifice minor pieces on f7 or e6 to dismantle Black's pawn shield."
    ],
    endgameIdeas: [
      "Utilize the central pawn majority (d4/e4) to create a passed pawn.",
      "Keep active rooks on open files to constrain Black's king."
    ],
    famousGames: [
      "Adolf Anderssen vs Lionel Kieseritzky, 1851 (The Immortal Game)",
      "Boris Spassky vs David Bronstein, USSR Championship 1960"
    ],
    grandmasterExamples: ["Boris Spassky", "Bobby Fischer", "Alexei Shirov", "David Bronstein"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2",
      prompt: "White has just played 2.f4 initiating the King's Gambit. Accept the challenge by capturing White's f4 pawn.",
      solution: ["exf4"]
    },
    quiz: {
      question: "What is White's primary danger in the King's Gambit if they do not develop the King's Knight (Nf3) early?",
      options: [
        "Losing the light-squared bishop",
        "A lethal Queen check on h4 (Qh4+)",
        "Losing the a1 rook to a pin",
        "Having no pawn center"
      ],
      answer: "A lethal Queen check on h4 (Qh4+)",
      explanation: "By playing f4, White weakens the e1-h4 diagonal. If Nf3 is not played to cover h4, Black can launch Qh4+, forcing the White king to move and lose castling rights."
    }
  },
  {
    id: "kings-gambit-accepted",
    name: "King's Gambit Accepted",
    eco: "C34",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Black accepts White's f4 pawn, initiating a sharp battle where White fights for central dominance while Black attempts to retain the gambit pawn.",
    estimatedTime: "15 mins",
    popularity: 85,
    successRate: 52,
    history: "The principal test of 1.e4 e5 2.f4. For centuries, accepted lines were considered the ultimate test of tactical skill.",
    inventor: "Classical Masters",
    playingStyle: "Wild tactical melees, piece sacrifices, dynamic pawn chains",
    whenToUse: "When you want to challenge Black to defend an awkward extra pawn while you rapidly develop your pieces.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Removes Black's central e5 pawn.",
      "Opens the f-file for White's rook after castling.",
      "Paves the way for White's d4 pawn push."
    ],
    disadvantages: [
      "Black holds an extra pawn on f4.",
      "Black can defend the pawn with g5, creating a pawn chain.",
      "White's king safety is compromised on the e1-h4 diagonal."
    ],
    commonTraps: [
      "3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 (Muzio Gambit transition).",
      "Kieseritzky Gambit pins on the e-file."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3"],
    explanations: [
      "White claims center space with 1.e4.",
      "Black matches with 1...e5.",
      "White offers the f4 gambit pawn.",
      "Black accepts with 2...exf4.",
      "White plays 3.Nf3, guarding h4 against Qh4+ and preparing rapid piece deployment."
    ],
    acceptedVariation: {
      name: "Classical Defense (3...g5)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5"],
      explanation: "Black defends the f4 pawn with g5, preparing g4 to kick White's f3 knight."
    },
    declinedVariation: {
      name: "Abbazia Defense (3...d5)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "d5"],
      explanation: "Black accepts f4 but immediately strikes back in the center with d5 to return the pawn for equal development."
    },
    popularVariations: [
      "Classical Defense (3...g5)",
      "Modern Defense (3...d5)",
      "Cunningham Defense (3...Be7)",
      "Fischer Defense (3...d6)"
    ],
    strategicIdeas: [
      "Building the d4-e4 center while Black defends f4.",
      "Targeting f7 with Bc4 and Qb3.",
      "Undermining Black's g5 pawn with h4."
    ],
    tacticalMotifs: [
      "Knight sacrifices on f7 or g5.",
      "Open f-file rook pressure.",
      "H4 pawn levers cracking open the g-file."
    ],
    commonMistakes: [
      "Playing 3.Bc4 instead of 3.Nf3 and allowing 3...Qh4+.",
      "Failing to counter Black's g5-g4 push dynamically."
    ],
    bestResponses: [
      "Black playing 3...d5 (Modern Defense) to equalize cleanly without getting bogged down in tactics."
    ],
    typicalCheckmatePatterns: [
      "Bc4 + Qf3 + Rf1 triple assault on f7 ending in checkmate."
    ],
    middlegamePlans: [
      "Play h4 to break Black's g5-f4 pawn structure.",
      "Develop Bc4, O-O, and d4 to dominate the center.",
      "Infiltrate with Knights via e5 or d5."
    ],
    endgameIdeas: [
      "Convert the central space advantage into passed d- and e-pawns.",
      "Neutralize Black's kingside pawn majority before it advances."
    ],
    famousGames: [
      "Paul Morphy vs Louis Paulsen, New York 1857",
      "Bobby Fischer vs Larry Evans, US Championship 1963"
    ],
    grandmasterExamples: ["Paul Morphy", "Boris Spassky", "Bobby Fischer"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 1 3",
      prompt: "White has played 3.Nf3 to prevent Qh4+. Defend the f4 pawn aggressively by playing g5.",
      solution: ["g5"]
    },
    quiz: {
      question: "Why is 3.Nf3 considered the main line after 2...exf4 in the King's Gambit?",
      options: [
        "It guards the h4 square, preventing Black's devastating Qh4+ check",
        "It attacks Black's h7 pawn",
        "It prepares a queenside castle",
        "It trades queens immediately"
      ],
      answer: "It guards the h4 square, preventing Black's devastating Qh4+ check",
      explanation: "Without 3.Nf3, Black plays 3...Qh4+, forcing White's king to move to e2, losing castling rights and leaving the king awkwardly exposed."
    }
  },
  {
    id: "kings-gambit-declined",
    name: "King's Gambit Declined",
    eco: "C30",
    category: "King's Pawn Opening",
    difficulty: "Beginner",
    side: "Black",
    shortDesc: "Black declines the f4 pawn with 2...Bc5 or 2...d6, developing smoothly while keeping White's f4 pawn awkward.",
    estimatedTime: "10 mins",
    popularity: 80,
    successRate: 51,
    history: "A classic defensive choice dating back to early master play, avoiding wild tactics in favor of solid positional play.",
    inventor: "Classical Defensive Theorists",
    playingStyle: "Solid positional blockades, counter-attacking the diagonal",
    whenToUse: "When playing Black against 1.e4 e5 2.f4 and you want a solid, risk-free positional setup.",
    recommendedSkillLevel: "800 - 1600 Elo",
    advantages: [
      "Avoids wild tactical traps in King's Gambit Accepted.",
      "The bishop on c5 prevents White from castling easily.",
      "Black maintains a strong pawn in the center on e5."
    ],
    disadvantages: [
      "White still gains space on the kingside with f4.",
      "Black's c5 bishop can become a target for White's c3 and d4 pushes."
    ],
    commonTraps: [
      "White playing fxe5 and expecting Black to take back, but Black's Bc5 pins White's d-pawn."
    ],
    moves: ["e4", "e5", "f4", "Bc5"],
    explanations: [
      "White occupies the center with e4.",
      "Black mirrors with e5.",
      "White offers the f4 gambit pawn.",
      "Black declines! 2...Bc5 develops the dark-squared bishop, controlling the a7-g1 diagonal and preventing White from castling."
    ],
    acceptedVariation: {
      name: "Classical Declined (2...Bc5 3.Nf3 d6)",
      moves: ["e4", "e5", "f4", "Bc5", "Nf3", "d6"],
      explanation: "Black reinforces e5 with d6, keeping the c5 bishop active and preparing Bg4."
    },
    declinedVariation: {
      name: "Falkbeer Countergambit (2...d5)",
      moves: ["e4", "e5", "f4", "d5"],
      explanation: "Black declines by striking directly in the center with 2...d5, opening lines immediately."
    },
    popularVariations: [
      "Classical Declined (2...Bc5)",
      "Falkbeer Countergambit (2...d5)",
      "Keene Defense (2...Qh4+)"
    ],
    strategicIdeas: [
      "Controlling the a7-g1 diagonal to stop White's king from castling safely.",
      "Striking in the center with d6 and Nf6.",
      "Pinning White's f3 knight with Bg4."
    ],
    tacticalMotifs: [
      "Pins on the a7-g1 diagonal.",
      "Counter-strikes on e4 when White plays fxe5.",
      "Knight jumps to d4 exploiting weak dark squares."
    ],
    commonMistakes: [
      "Playing 2...Nc6? which allows White to play 3.Nf3 and eventual d4 with a huge pawn center."
    ],
    bestResponses: [
      "3.Nf3 d6 4.c3 Nf6 5.d4 Bb6 keeping the bishop strong on b6."
    ],
    typicalCheckmatePatterns: [
      "Bxf2+ tactics exploiting White's exposed king diagonal."
    ],
    middlegamePlans: [
      "Maintain the bishop on the a7-g1 diagonal.",
      "Develop Nf6, Nc6, Bg4, and castle queenside or kingside.",
      "Break White's center with d5 at the right moment."
    ],
    endgameIdeas: [
      "Target White's weak f4 pawn in the endgame.",
      "Utilize superior king safety to win pawn endgames."
    ],
    famousGames: [
      "Siegbert Tarrasch vs Emanuel Lasker, World Championship 1908"
    ],
    grandmasterExamples: ["Emanuel Lasker", "Siegbert Tarrasch", "Nigel Short"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2",
      prompt: "White has played 2.f4. Decline the gambit by developing your dark-squared bishop to c5.",
      solution: ["Bc5"]
    },
    quiz: {
      question: "What is the key strategic benefit of 2...Bc5 in the King's Gambit Declined?",
      options: [
        "It pins the d2 pawn and controls the a7-g1 diagonal, preventing White from castling easily",
        "It threatens immediate checkmate on f2",
        "It wins a rook on a1",
        "It forces an exchange of queens"
      ],
      answer: "It pins the d2 pawn and controls the a7-g1 diagonal, preventing White from castling easily",
      explanation: "The bishop on c5 eyes g1. If White tries to castle kingside, the g1 square is controlled by the bishop, preventing White from castling until the diagonal is blocked."
    }
  },
  {
    id: "bishops-gambit",
    name: "Bishop's Gambit",
    eco: "C33",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the King's Gambit, White plays 3.Bc4 instead of 3.Nf3, welcoming Black's Qh4+ check to build a massive pawn center.",
    estimatedTime: "12 mins",
    popularity: 75,
    successRate: 50,
    history: "Favored by 19th-century giants like Adolf Anderssen and Howard Staunton. It allows Black Qh4+ but gains massive central tempo.",
    inventor: "Howard Staunton & Adolf Anderssen",
    playingStyle: "Unflinching central march, tactical king walks, piece counter-attacks",
    whenToUse: "To surprise King's Gambit players who automatically expect 3.Nf3 and force them into unfamiliar territory.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Develops the bishop immediately toward f7.",
      "Prepares d4 with complete central dominance.",
      "White's king on f1 is surprisingly safe behind a wall of center pawns."
    ],
    disadvantages: [
      "White loses castling rights after 3...Qh4+ 4.Kf1.",
      "Black's queen gains an active post on h4."
    ],
    commonTraps: [
      "3...Qh4+ 4.Kf1 g5 5.Nc3 Bg7 6.d4 Ne7 with sharp tactics."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Bc4"],
    explanations: [
      "White claims center space.",
      "Black matches.",
      "White offers the f4 pawn.",
      "Black accepts the gambit.",
      "The Bishop's Gambit! White plays 3.Bc4, inviting Qh4+ while aiming directly at f7."
    ],
    acceptedVariation: {
      name: "Main Line (3...Qh4+ 4.Kf1 g5)",
      moves: ["e4", "e5", "f4", "exf4", "Bc4", "Qh4+", "Kf1", "g5"],
      explanation: "Black gives check on h4 and then defends f4 with g5. White plays Nc3 and d4 to build a massive center."
    },
    declinedVariation: {
      name: "Bledow Countergambit (3...d5)",
      moves: ["e4", "e5", "f4", "exf4", "Bc4", "d5"],
      explanation: "Black strikes back in the center with 3...d5! returning the pawn to disrupt White's bishop."
    },
    popularVariations: [
      "3...Qh4+ 4.Kf1 g5 (Classical)",
      "3...d5 (Bledow Countergambit)",
      "3...Nf6 (Cozius Defense)"
    ],
    strategicIdeas: [
      "Allowing Kf1 to build an uncontested d4-e4 pawn center.",
      "Using Nc3, Nf3, and e5 to trap Black's misplaced queen.",
      "Targeting f7 with Bc4 and Qb3."
    ],
    tacticalMotifs: [
      "Trapping Black's queen on h4 or h5 with g3 and Nf3.",
      "Sack on f7 drawing out Black's king.",
      "Central pawn steamroller pushing d4, e5, d5."
    ],
    commonMistakes: [
      "Panicking after Qh4+ and playing 4.g3? which loses a rook to 4...fxg3 5.hxg3 Qxh1."
    ],
    bestResponses: [
      "3...d5 (Bledow Countergambit) or 3...Nf6 counter-attacking e4."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Nf3 and d4 leading to central checkmating traps."
    ],
    middlegamePlans: [
      "Play Nf3 to attack Black's queen on h4.",
      "Push d4 and Nc3 to control every key central square.",
      "Rook lift via h3 or f1 to launch a kingside counterattack."
    ],
    endgameIdeas: [
      "White's strong center will dominate the endgame once queens are traded."
    ],
    famousGames: [
      "Adolf Anderssen vs Lionel Kieseritzky, London 1851"
    ],
    grandmasterExamples: ["Adolf Anderssen", "Howard Staunton", "Bent Larsen"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/2B1Pp2/8/PPPP2PP/RNBQK1NR b KQkq - 1 3",
      prompt: "White has played 3.Bc4. Give check with your queen on h4 to exploit White's uncastled king.",
      solution: ["Qh4+"]
    },
    quiz: {
      question: "What is White's intended move after Black plays 3...Qh4+ in the Bishop's Gambit?",
      options: [
        "4.g3?, sacrificing a rook",
        "4.Kf1!, stepping aside safely while preparing d4 and Nf3 to harass the black queen",
        "4.Ke2, walking into checkmate",
        "4.Qf3, trading queens"
      ],
      answer: "4.Kf1!, stepping aside safely while preparing d4 and Nf3 to harass the black queen",
      explanation: "After 4.Kf1!, White's king is safe on f1 behind the pawn shield. White will proceed with d4, Nc3, and Nf3, forcing Black's queen to waste time moving again."
    }
  },
  {
    id: "muzio-gambit",
    name: "Muzio Gambit",
    eco: "C37",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "The ultimate Romantic sacrifice: White offers an entire Knight on f3 to open the f-file and launch a terrifying attack on f7.",
    estimatedTime: "15 mins",
    popularity: 80,
    successRate: 48,
    history: "Named after Mutio d'Avalos (16th century), this variation embodies total piece sacrifice for an overwhelming lead in development.",
    inventor: "Mutio d'Avalos & Gioachino Greco",
    playingStyle: "Wild piece sacrifices, non-stop tactical attacks, mate hunting",
    whenToUse: "In blitz or friendly games when you want to experience the raw excitement of Romantic Era chess.",
    recommendedSkillLevel: "1400 - 2200 Elo",
    advantages: [
      "Tremendous development lead over Black.",
      "Total control of the open f-file targeting f7.",
      "Black's king is pinned under intense fire."
    ],
    disadvantages: [
      "White is down a full piece (Knight) for pawns.",
      "If Black defends perfectly, White will lose in the endgame."
    ],
    commonTraps: [
      "5.O-O gxf3 6.Qxf3 Qf6 7.e5 Qxe5 8.Bxf7+! Kxf7 9.d4! with maximum chaos."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O"],
    explanations: [
      "White starts e4.",
      "Black matches e5.",
      "White offers f4.",
      "Black accepts.",
      "White plays Nf3.",
      "Black defends with g5.",
      "White aims at f7 with Bc4.",
      "Black pushes g4, attacking White's f3 knight.",
      "The Muzio Gambit! White ignores the knight and castles (O-O!), offering the knight on f3!"
    ],
    acceptedVariation: {
      name: "Muzio Gambit Accepted (5...gxf3 6.Qxf3)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O", "gxf3", "Qxf3"],
      explanation: "Black accepts the knight. White recaptures with 6.Qxf3, creating a triple attack on f7 with Queen, Bishop, and Rook."
    },
    declinedVariation: {
      name: "Muzio Gambit Declined (5...d5)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O", "d5"],
      explanation: "Black declines the knight sacrifice and strikes in the center with 5...d5 to gain defensive air."
    },
    popularVariations: [
      "Paulsen Defense (6...Qf6)",
      "Double Muzio (7.e5 Qxe5 8.Bxf7+)"
    ],
    strategicIdeas: [
      "Sacrificing the f3 knight to immediately bring the f1 rook into play via castling.",
      "Building unstoppable pressure on f7 with Qf3, Bc4, and Rf1.",
      "Pushing e5 and d4 to shatter Black's central defenses."
    ],
    tacticalMotifs: [
      "Sacrifice on f7 (Bxf7+) drawing Black's king into the open.",
      "Pins along the f-file.",
      "Central line clearance with d4."
    ],
    commonMistakes: [
      "Playing too passively after 6.Qxf3; White must attack with full energy before Black consolidates."
    ],
    bestResponses: [
      "6...Qf6 (Paulsen Defense), holding the f7 square firmly with the queen."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Rf7+ and Qf7# or Qh5# mating nets."
    ],
    middlegamePlans: [
      "Play e5 to displace Black's defending queen on f6.",
      "Advance d4 and Bxf4 to regain material while maintaining the attack.",
      "Rook lifts to f4 and h4 targeting h7 and f7."
    ],
    endgameIdeas: [
      "Avoid endgames at all costs! White must deliver checkmate in the middlegame."
    ],
    famousGames: [
      "Paul Morphy vs Alonzo Morphy, New Orleans 1858",
      "Alexander Alekhine vs NN, Simultaneous 1913"
    ],
    grandmasterExamples: ["Paul Morphy", "Alexander Alekhine", "Gioachino Greco"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1p1p/8/8/2B1Pp2/5p2/PPPP2PP/RNBQ1RK1 w kq - 0 6",
      prompt: "Black has just captured your f3 knight (gxf3). Recapture on f3 with your Queen to launch the Muzio attack.",
      solution: ["Qxf3"]
    },
    quiz: {
      question: "What piece does White sacrifice on move 5 in the Muzio Gambit?",
      options: [
        "A Bishop on c4",
        "A Knight on f3",
        "The Queen on d1",
        "A Rook on f1"
      ],
      answer: "A Knight on f3",
      explanation: "In the Muzio Gambit, White castles (5.O-O) leaving the f3 knight undefended. When Black plays 5...gxf3, White plays 6.Qxf3 with three pieces aiming at f7."
    }
  },
  {
    id: "double-muzio-gambit",
    name: "Double Muzio Gambit",
    eco: "C37",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "An insane continuation of the Muzio Gambit where White sacrifices a second piece (Bishop on f7) to drag Black's king into the open.",
    estimatedTime: "15 mins",
    popularity: 65,
    successRate: 45,
    history: "Analyzed by Alexander MacDonnell and Paul Morphy. White sacrifices both a knight and a bishop to force checkmate.",
    inventor: "Alexander MacDonnell",
    playingStyle: "Maximum tactical violence, double piece sacrifice, king drag",
    whenToUse: "When you want to play one of the most aggressive, breathtaking tactical combinations in chess history.",
    recommendedSkillLevel: "1600 - 2400 Elo",
    advantages: [
      "Black's king is forced onto f7 into total crossfire.",
      "White's queen, rook, and d-pawn team up for unstoppable threats.",
      "Extremely difficult for Black to defend over the board."
    ],
    disadvantages: [
      "White is down two minor pieces (Knight + Bishop).",
      "One defensive miscalculation by White results in a lost game."
    ],
    commonTraps: [
      "7.e5 Qxe5 8.Bxf7+! Kxf7 9.d4! Qxd4+ 10.Be3! with a winning attack."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O", "gxf3", "Qxf3", "Qf6", "e5", "Qxe5", "Bxf7+"],
    explanations: [
      "e4 e5 standard open game.",
      "King's Gambit with f4.",
      "Black accepts f4.",
      "Nf3 prevents Qh4+.",
      "Black defends with g5.",
      "Bc4 targets f7.",
      "Black pushes g4 attacking Nf3.",
      "O-O offers the f3 knight (Muzio Gambit).",
      "Black accepts with gxf3.",
      "Qxf3 recaptures, threatening f7.",
      "Black defends f7 with Qf6.",
      "White pushes e5!, sacrificing a pawn to deflect Black's queen.",
      "Black takes Qxe5.",
      "THE DOUBLE MUZIO! White plays 8.Bxf7+!, sacrificing the light-squared bishop to strip away Black's king shield!"
    ],
    acceptedVariation: {
      name: "Double Muzio Accepted (8...Kxf7 9.d4)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O", "gxf3", "Qxf3", "Qf6", "e5", "Qxe5", "Bxf7+", "Kxf7", "d4"],
      explanation: "Black takes the bishop with 8...Kxf7. White plays 9.d4!, opening the c1-h6 diagonal and gaining another tempo on Black's queen."
    },
    declinedVariation: {
      name: "Double Muzio Declined (8...Kd8)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4", "g4", "O-O", "gxf3", "Qxf3", "Qf6", "e5", "Qxe5", "Bxf7+", "Kd8"],
      explanation: "Black declines the bishop sacrifice, moving the king to d8 to stay out of the open f-file."
    },
    popularVariations: [
      "Main Line: 8...Kxf7 9.d4 Qxd4+ 10.Be3",
      "Alternative: 9...Qf6 10.Bxf4"
    ],
    strategicIdeas: [
      "Sacrificing two pieces to strip Black's king of all pawn cover.",
      "Opening the d-file and f-file for queen and rooks.",
      "Developing Be3 with check or tempo on Black's queen."
    ],
    tacticalMotifs: [
      "Bxf7+ king drag.",
      "Be3 pins and discovered checks along the f-file.",
      "Qxf4+ and Rf7+ forcing checkmate."
    ],
    commonMistakes: [
      "Failing to follow up 8.Bxf7+ with 9.d4! immediately."
    ],
    bestResponses: [
      "8...Kd8! avoiding the worst of the f-file firestorm."
    ],
    typicalCheckmatePatterns: [
      "Rf7+ followed by Qxf8# or Be3+ / Qh5# checkmates."
    ],
    middlegamePlans: [
      "Use d4 and Be3 to keep Black's queen pinned and busy.",
      "Infiltrate with Rf7+ to restrict Black's king on e8/f8/g6."
    ],
    endgameIdeas: [
      "No endgame exists — checkmate or bust!"
    ],
    famousGames: [
      "Alexander MacDonnell vs Louis de la Bourdonnais, London 1834"
    ],
    grandmasterExamples: ["Alexander MacDonnell", "Paul Morphy"],
    practicePosition: {
      fen: "rnb1kb1r/pppp1p1p/5q2/4q3/8/5Q2/PPPP1PPP/RNB2RK1 w kq - 0 8",
      prompt: "Black has just taken your e5 pawn with Qxe5. Play the Double Muzio sacrifice: 8.Bxf7+!",
      solution: ["Bxf7+"]
    },
    quiz: {
      question: "What is the second piece sacrificed in the Double Muzio Gambit?",
      options: [
        "The c1 Dark-Squared Bishop",
        "The c4 Light-Squared Bishop on f7 (Bxf7+)",
        "The a1 Rook",
        "The Queen"
      ],
      answer: "The c4 Light-Squared Bishop on f7 (Bxf7+)",
      explanation: "After sacrificing the f3 knight on move 5, White plays 8.Bxf7+!, giving up the bishop to destroy Black's king shield and force Black's king into the open."
    }
  },
  {
    id: "allgaier-gambit",
    name: "Allgaier Gambit",
    eco: "C39",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "In the King's Gambit Accepted, White plays h4 g4 and sacrifices a Knight on f7 (Nxf7!) to drag Black's king into a tactical funnel.",
    estimatedTime: "12 mins",
    popularity: 70,
    successRate: 49,
    history: "Invented by Johann Baptist Allgaier in 1795. It features an explosive knight sacrifice on f7 on move 7.",
    inventor: "Johann Baptist Allgaier",
    playingStyle: "Early piece sacrifice, king drag, open-file attack",
    whenToUse: "To punish players who play 3...g5 and 4...g4 aggressively without expecting a direct piece sacrifice.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Black's king is forced to f7 on move 7.",
      "White gains d4 and Bc4 with huge central tempo.",
      "Black's kingside pawns are broken."
    ],
    disadvantages: [
      "White is down a full Knight.",
      "Black can defend with d5 and Nf6 if calculated carefully."
    ],
    commonTraps: [
      "7.Nxf7 Kxf7 8.d4 d5 9.Bxf4 dxe4 10.Bc4+ Be6 with fiery tactics."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ng5", "h6", "Nxf7"],
    explanations: [
      "Standard e4 e5 opening.",
      "f4 King's Gambit.",
      "Black accepts.",
      "Nf3 development.",
      "Black plays g5.",
      "White plays h4, undermining Black's g5 pawn.",
      "Black pushes g4, attacking Nf3.",
      "White plays Ng5, targeting f7.",
      "Black plays h6, kicking the knight.",
      "THE ALLGAIER GAMBIT! White plays 7.Nxf7!, sacrificing the knight to force Black's king into f7!"
    ],
    acceptedVariation: {
      name: "Allgaier Accepted (7...Kxf7 8.d4)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ng5", "h6", "Nxf7", "Kxf7", "d4"],
      explanation: "Black accepts the knight. White responds with 8.d4!, building a strong center and preparing Bxf4."
    },
    declinedVariation: {
      name: "Allgaier Refusal",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ng5", "Nf6"],
      explanation: "Black plays 5...Nf6 instead of 5...h6, avoiding the Nxf7 sacrifice entirely."
    },
    popularVariations: [
      "Hamppe-Allgaier Gambit",
      "Urso Defense (8...d5)",
      "Horny Defense (8...f3)"
    ],
    strategicIdeas: [
      "Sacrificing the knight on f7 to strip Black's king of castling rights.",
      "Building a solid center with d4 and recapturing on f4 with Bxf4.",
      "Using Bc4+ and O-O to pile pressure on Black's exposed king."
    ],
    tacticalMotifs: [
      "Nxf7 sacrifice.",
      "Bc4+ check forcing the king further into the center.",
      "Bxf4 opening the f-file."
    ],
    commonMistakes: [
      "Playing 8.Qxg4? instead of 8.d4! which allows Black to organize with Nf6."
    ],
    bestResponses: [
      "8...d5! returning a pawn to open lines for Black's pieces."
    ],
    typicalCheckmatePatterns: [
      "Bc4+ followed by Qd3+ and Rf1# mating nets."
    ],
    middlegamePlans: [
      "Play Bc4+ and castle kingside.",
      "Infiltrate with Queen and Rook along the f-file.",
      "Use e5 to drive away Black's defending f6 knight."
    ],
    endgameIdeas: [
      "Endgames favor Black if Black survives the middlegame onslaught."
    ],
    famousGames: [
      "Johann Allgaier vs NN, Vienna 1795"
    ],
    grandmasterExamples: ["Johann Allgaier", "Wilhelm Steinitz"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1p2/7p/6N1/4Pp1P/8/PPPP2P1/RNBQKB1R w KQkq - 0 7",
      prompt: "Black has played 6...h6 kicking your knight. Play the shocking 7.Nxf7 sacrifice to start the Allgaier Gambit!",
      solution: ["Nxf7"]
    },
    quiz: {
      question: "What is White's primary follow-up move after Black accepts the knight with 7...Kxf7 in the Allgaier Gambit?",
      options: [
        "8.d4!, occupying the center and preparing Bxf4 to regain material and keep attacking",
        "8.Qxg4?, taking a pawn immediately",
        "8.Bc4+?, giving check without center control",
        "8.b3?, preparing a queenside attack"
      ],
      answer: "8.d4!, occupying the center and preparing Bxf4 to regain material and keep attacking",
      explanation: "8.d4! is the key move. It establishes central dominance, frees the dark-squared bishop to capture on f4, and gives White total control over the board."
    }
  },
  {
    id: "kieseritzky-gambit",
    name: "Kieseritzky Gambit",
    eco: "C39",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the 3...g5 King's Gambit, White plays 4.h4 g4 5.Ne5!, centralizing the knight on an aggressive outpost rather than sacrificing it.",
    estimatedTime: "12 mins",
    popularity: 82,
    successRate: 52,
    history: "Favored by Lionel Kieseritzky and later analyzed deeply by Wilhelm Steinitz and Boris Spassky. Considered the main positional weapon in KGA.",
    inventor: "Lionel Kieseritzky",
    playingStyle: "Positional knight pressure, central outpost, dynamic tactical control",
    whenToUse: "When you want to play 4.h4 against 3...g5 without sacrificing a knight on f7.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "The e5 knight is a formidable outpost attacking f7, g4, and c6.",
      "White does not give up piece material.",
      "Cracks open Black's kingside pawn structure."
    ],
    disadvantages: [
      "Black can attack the e5 knight with Nf6 or d6.",
      "Requires precise positional and tactical knowledge."
    ],
    commonTraps: [
      "5...Nf6 6.Bc4 d5 7.exd5 Bd6 8.d4 with sharp central play."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5"],
    explanations: [
      "Standard King's Gambit.",
      "Black accepts f4.",
      "White plays Nf3.",
      "Black plays g5.",
      "White plays h4 to challenge g5.",
      "Black plays g4, attacking Nf3.",
      "The Kieseritzky Gambit! White plays 5.Ne5!, centralizing the knight on e5 to attack f7 and g4."
    ],
    acceptedVariation: {
      name: "Berlin Defense (5...Nf6)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6"],
      explanation: "Black counterattacks White's e4 pawn with Nf6, leading to the main theoretical battleground."
    },
    declinedVariation: {
      name: "Neumann Defense (5...Nc6)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nc6"],
      explanation: "Black plays Nc6, challenging White's centralized e5 knight immediately."
    },
    popularVariations: [
      "Berlin Defense (5...Nf6)",
      "Rubinstein Defense (5...d6)",
      "Brentano Defense (5...Bg7)",
      "Longstocking Defense (5...h5)"
    ],
    strategicIdeas: [
      "Utilizing e5 as a dominant knight outpost.",
      "Building a solid center with d4 and recapturing f4 with Bxf4.",
      "Opening the f-file for major piece pressure."
    ],
    tacticalMotifs: [
      "Nxf7 or Nxg4 tactical strikes.",
      "Bc4 targeting f7.",
      "d4 and Bxf4 regaining material."
    ],
    commonMistakes: [
      "Retreating the e5 knight prematurely when attacked by d6 instead of playing d4 or Nc4."
    ],
    bestResponses: [
      "5...Nf6 (Berlin Defense) or 5...d6 (Rubinstein Defense)."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Nxg6+ discovered checkmate combos."
    ],
    middlegamePlans: [
      "Reinforce e5 with d4.",
      "Develop Bc4 and O-O.",
      "Recapture on f4 with Bxf4 to eliminate Black's gambit pawn."
    ],
    endgameIdeas: [
      "White's central pawn roller provides a long-term endgame advantage."
    ],
    famousGames: [
      "Lionel Kieseritzky vs Adolf Anderssen, London 1851",
      "Boris Spassky vs David Bronstein, USSR 1960"
    ],
    grandmasterExamples: ["Lionel Kieseritzky", "Boris Spassky", "Wilhelm Steinitz"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1p1p/8/4N3/4Pp1P/8/PPPP2P1/RNBQKB1R b KQkq - 1 5",
      prompt: "White has centralized the knight on e5. Counterattack White's e4 pawn with Nf6 to enter the Berlin Defense.",
      solution: ["Nf6"]
    },
    quiz: {
      question: "What square does White's knight leap to on move 5 in the Kieseritzky Gambit?",
      options: [
        "5.Ne5!, occupying a dominant central outpost",
        "5.Ng5, targeting f7 for a sacrifice",
        "5.Ng1, retreating backwards",
        "5.Ne1, retreating to safety"
      ],
      answer: "5.Ne5!, occupying a dominant central outpost",
      explanation: "In the Kieseritzky Gambit, 5.Ne5! places the knight on a supreme central square where it attacks f7, g4, and d7 while remaining safe from immediate capture."
    }
  },
  {
    id: "falkbeer-countergambit",
    name: "Falkbeer Countergambit",
    eco: "C31",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "In response to 2.f4, Black declines the pawn and strikes back with 2...d5!, offering an e-pawn push to cramp White's development.",
    estimatedTime: "12 mins",
    popularity: 80,
    successRate: 50,
    history: "Invented by Ernst Falkbeer in 1850. It effectively neutralizes White's King's Gambit by striking back in the center.",
    inventor: "Ernst Falkbeer",
    playingStyle: "Center striking, spatial cramping, counter-attack",
    whenToUse: "When playing Black against the King's Gambit and you want to deny White all kingside attack plans.",
    recommendedSkillLevel: "1000 - 1800 Elo",
    advantages: [
      "Forks White's center plans immediately.",
      "The e4 push cramps White's f3 knight development.",
      "Black secures fast piece deployment."
    ],
    disadvantages: [
      "White can play 3.exd5 e4 4.d3 Nf6 with heavy theoretical lines."
    ],
    commonTraps: [
      "3.exd5 e4 4.d3 Nf6 5.dxe4 Nxe4 6.Nf3 Bc5 with a strong attack on f2."
    ],
    moves: ["e4", "e5", "f4", "d5"],
    explanations: [
      "White plays e4.",
      "Black plays e5.",
      "White offers f4.",
      "THE FALKBEER COUNTERGAMBIT! Black strikes back immediately with 2...d5!, challenging White's center."
    ],
    acceptedVariation: {
      name: "Main Line (3.exd5 e4 4.d3 Nf6)",
      moves: ["e4", "e5", "f4", "d5", "exd5", "e4", "d3", "Nf6"],
      explanation: "White takes on d5, and Black pushes e4! to cramp White's f3 knight square, then develops Nf6."
    },
    declinedVariation: {
      name: "White Declines (3.Nf3)",
      moves: ["e4", "e5", "f4", "d5", "Nf3", "dxe4", "Nxe5"],
      explanation: "White declines to capture on d5 and plays 3.Nf3, transposing into open central exchanges."
    },
    popularVariations: [
      "Main Line: 3.exd5 e4 4.d3 Nf6",
      "Hinrichsen Variation: 4.Nc3",
      "Nimzowitsch Variation: 3...c6"
    ],
    strategicIdeas: [
      "Using the e4 pawn wedge to prevent White from developing Nf3 comfortably.",
      "Rapid development with Nf6, Bc5, and O-O.",
      "Exposing White's weak e1-h4 diagonal."
    ],
    tacticalMotifs: [
      "bc5 targeting f2.",
      "Qxd5 centralizing the queen after e4 trade.",
      "Pinning White's e-pawn with Qe7."
    ],
    commonMistakes: [
      "Playing 3...exf4? after 2...d5, transposing back into KGA under worse conditions."
    ],
    bestResponses: [
      "3.exd5 e4 4.d3 Nf6 5.dxe4 Nxe4 6.Nf3 Bc5 for Black."
    ],
    typicalCheckmatePatterns: [
      "Bc5 + Qh4+ tactics destroying White's king."
    ],
    middlegamePlans: [
      "Maintain the e4 pawn wedge as long as possible.",
      "Develop Bc5, Bg4, and castle kingside.",
      "Pressure White's isolated d5 pawn."
    ],
    endgameIdeas: [
      "Black's active piece placement compensates for any minor pawn imbalance."
    ],
    famousGames: [
      "Adolf Anderssen vs Ernst Falkbeer, Berlin 1851",
      "Paul Morphy vs Henry Bird, London 1858"
    ],
    grandmasterExamples: ["Ernst Falkbeer", "Paul Morphy", "Aron Nimzowitsch"],
    practicePosition: {
      fen: "rnbqkbnr/ppp2ppp/8/3pp3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3",
      prompt: "Black has played 2...d5. Capture on d5 with 3.exd5 to enter the Falkbeer main line.",
      solution: ["exd5"]
    },
    quiz: {
      question: "What is Black's key pawn push after 3.exd5 in the Falkbeer Countergambit?",
      options: [
        "3...e4!, creating a pawn wedge that cramps White's knight development",
        "3...exf4, giving up the center",
        "3...c6, sacrificing another pawn",
        "3...f5, weakening the king"
      ],
      answer: "3...e4!, creating a pawn wedge that cramps White's knight development",
      explanation: "After 3.exd5, Black advances 3...e4! This wedge prevents White from playing Nf3, depriving White of their ideal development square."
    }
  },
  {
    id: "vienna-gambit",
    name: "Vienna Gambit",
    eco: "C30",
    category: "King's Pawn Opening",
    difficulty: "Beginner",
    side: "White",
    shortDesc: "A delayed King's Gambit with Nc3 developed first. White maintains central protection and avoids early Qh4+ checks.",
    estimatedTime: "10 mins",
    popularity: 84,
    successRate: 53,
    history: "Developed in 19th-century Vienna by Carl Hamppe. It offers all the attacking power of the King's Gambit with superior king safety.",
    inventor: "Carl Hamppe",
    playingStyle: "Center-focused attacking, solid development, knight-push tactics",
    whenToUse: "To play a King's Gambit-style attack without exposing your king to early queen checks.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Nc3 covers d5 and e4, protecting White's center.",
      "If Black plays 3...exf4, White's 4.e5! attacks Black's f6 knight.",
      "Avoids early Qh4+ checks."
    ],
    disadvantages: [
      "Black can equalize with the precise 3...d5! counter-strike."
    ],
    commonTraps: [
      "3...exf4 4.e5 Ng4? 5.h3! trapping Black's knight."
    ],
    moves: ["e4", "e5", "Nc3", "Nf6", "f4"],
    explanations: [
      "e4 king's pawn.",
      "e5 symmetrical reply.",
      "The Vienna Game! 2.Nc3 develops the queen's knight.",
      "Black develops 2...Nf6.",
      "The Vienna Gambit! White plays 3.f4!, challenging e5."
    ],
    acceptedVariation: {
      name: "Vienna Gambit Accepted (3...exf4 4.e5)",
      moves: ["e4", "e5", "Nc3", "Nf6", "f4", "exf4", "e5"],
      explanation: "Black accepts f4. White plays 4.e5!, driving Black's f6 knight back to g8 or e4."
    },
    declinedVariation: {
      name: "Steinitz Defense (3...d5)",
      moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d5"],
      explanation: "Black declines f4 and strikes back in the center with 3...d5! leading to exciting, balanced play."
    },
    popularVariations: [
      "Main Line: 3...d5 4.fxe5 Nxe4",
      "Accepted: 3...exf4 4.e5 Qe7"
    ],
    strategicIdeas: [
      "Using Nc3 to control d5 and back up the center.",
      "Pushing e5 to force Black's Nf6 knight into retreat.",
      "Opening the f-file for castled rook pressure."
    ],
    tacticalMotifs: [
      "Knight traps on g4 with h3.",
      "Forks on c7 with Nc3-d5/b5.",
      "Qe2 pins along the e-file."
    ],
    commonMistakes: [
      "Failing to play 4.e5! after 3...exf4, allowing Black to consolidate."
    ],
    bestResponses: [
      "3...d5! (Steinitz Defense) striking back in the center."
    ],
    typicalCheckmatePatterns: [
      "Bc4 + Qh5 + Rf1 crushing attack on f7."
    ],
    middlegamePlans: [
      "Build a d4-e5 pawn wedge.",
      "Develop Nf3, Bc4, and castle kingside.",
      "Launch a kingside pawn storm if Black castles kingside."
    ],
    endgameIdeas: [
      "White's e5 pawn wedge grants space advantage in knight/rook endgames."
    ],
    famousGames: [
      "Wilhelm Steinitz vs Louis Paulsen, Baden-Baden 1870"
    ],
    grandmasterExamples: ["Wilhelm Steinitz", "Carl Hamppe", "Richard Rapport"],
    practicePosition: {
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 3 3",
      prompt: "White has developed Nc3. Launch the Vienna Gambit by playing f4.",
      solution: ["f4"]
    },
    quiz: {
      question: "Why is 3...exf4 followed by 4.e5! dangerous for Black in the Vienna Gambit?",
      options: [
        "It forces Black's f6 knight to retreat to g8, losing all development tempo",
        "It traps Black's dark-squared bishop",
        "It wins Black's queen",
        "It forces an immediate draw"
      ],
      answer: "It forces Black's f6 knight to retreat to g8, losing all development tempo",
      explanation: "When Black takes 3...exf4, White pushes 4.e5!, attacking the f6 knight. With no good forward squares, the knight is usually forced to retreat to g8, resetting Black's development."
    }
  },
  {
    id: "danish-gambit",
    name: "Danish Gambit",
    eco: "C21",
    category: "King's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "White sacrifices two whole pawns (c3 and b2) for unmatched bishop activity targeting Black's kingside.",
    estimatedTime: "12 mins",
    popularity: 76,
    successRate: 50,
    history: "Analyzed by Danish master Andreas Schack Dahl in the 19th century. A classic double pawn sacrifice for rapid development.",
    inventor: "Andreas Schack Dahl",
    playingStyle: "Vicious double-bishop attack, tactical fireworks, rapid open lines",
    whenToUse: "In casual games where you want to unleash terrifying double-bishop tactical pressure.",
    recommendedSkillLevel: "1000 - 1800 Elo",
    advantages: [
      "Bishops on c4 and b2 slice across both main diagonals.",
      "Enormous lead in piece development.",
      "Black's king is under constant tactical threat."
    ],
    disadvantages: [
      "White is down two full pawns.",
      "Black can neutralize the attack with 5...d5! (Schlechter Defense)."
    ],
    commonTraps: [
      "1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2 Bb4+ 6.Nc3 Nf6 7.Nne2 Nxe4 8.O-O!"
    ],
    moves: ["e4", "e5", "d4", "exd4", "c3"],
    explanations: [
      "e4 king's pawn.",
      "e5 response.",
      "White plays d4, striking the center.",
      "Black takes 2...exd4.",
      "The Danish Gambit! White offers 3.c3 to accelerate development."
    ],
    acceptedVariation: {
      name: "Danish Gambit Accepted (Double Sacrifice)",
      moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2"],
      explanation: "White sacrifices both pawns! Bishops on c4 and b2 point directly at Black's f7 and g7 squares."
    },
    declinedVariation: {
      name: "Svenonius Defense (3...d5)",
      moves: ["e4", "e5", "d4", "exd4", "c3", "d5"],
      explanation: "Black declines by striking back in the center with 3...d5, neutralizing White's plans."
    },
    popularVariations: [
      "Double Gambit (4...cxb2 5.Bxb2)",
      "Single Gambit (4.Nxc3)",
      "Schlechter Defense (5...d5)"
    ],
    strategicIdeas: [
      "Sacrificing two flank pawns to get two active monster bishops.",
      "Preventing Black from finding a safe square to develop.",
      "Launching an early mating attack against Black's king."
    ],
    tacticalMotifs: [
      "Double bishop diagonals slicing toward f7 and g7.",
      "Bxf7+ sacrifices.",
      "Qb3 and Nf3 battery attacks."
    ],
    commonMistakes: [
      "Overplaying the attack and neglecting king safety as White."
    ],
    bestResponses: [
      "5...d5! (Schlechter Defense), returning both pawns to equalize development."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Bxg7 and Qg4# checkmates."
    ],
    middlegamePlans: [
      "Castle kingside, play Nc3, Nf3, and Qg4.",
      "Maintain double-bishop pressure along the open diagonals.",
      "Use open c- and d-files for rook infiltration."
    ],
    endgameIdeas: [
      "Avoid endgames down two pawns unless Black's pawn structure is shattered."
    ],
    famousGames: [
      "Alexander Alekhine vs M. Vasic, Banja Luka 1931",
      "Jacques Mieses vs Frank Marshall, Monte Carlo 1903"
    ],
    grandmasterExamples: ["Alexander Alekhine", "Jacques Mieses", "Frank Marshall"],
    practicePosition: {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      prompt: "White played 2.d4 and Black captured 2...exd4. Offer the Danish Gambit with 3.c3.",
      solution: ["c3"]
    },
    quiz: {
      question: "What does White gain by sacrificing two pawns in the accepted Danish Gambit?",
      options: [
        "Two active monster bishops on c4 and b2 pointing at f7 and g7",
        "A knight on e5",
        "An immediate queen trade",
        "Control over the h-file"
      ],
      answer: "Two active monster bishops on c4 and b2 pointing at f7 and g7",
      explanation: "By giving up c3 and b2 pawns, White places bishops on c4 and b2. Both bishops slice uninterrupted along parallel diagonals toward Black's kingside."
    }
  },
  {
    id: "goring-gambit",
    name: "Göring Gambit",
    eco: "C44",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "Similar to the Danish Gambit but initiated via the Scotch Game (3.d4 exd4 4.c3). White sacrifices pawns for open files and piece speed.",
    estimatedTime: "12 mins",
    popularity: 68,
    successRate: 49,
    history: "Analyzed by Carl Theodor Göring in 1877. It applies Danish Gambit principles within the Scotch Game framework.",
    inventor: "Carl Theodor Göring",
    playingStyle: "Center breakthroughs, quick knight development, open-file pressure",
    whenToUse: "Against 1.e4 e5 players who play 2...Nc6, offering a sharper alternative to standard Scotch lines.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Includes early Nf3 and Nc6 development, avoiding early queen traps.",
      "Gains open c- and d-files for major pieces.",
      "Builds a dominant center if Black declines."
    ],
    disadvantages: [
      "Black can return pawns with 7...d5! to neutralize the attack."
    ],
    commonTraps: [
      "4.c3 dxc3 5.Bc4 cxb2 6.Bxb2 d6 7.Qb3 Qd7 8.Bc3 with immense pressure."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "c3"],
    explanations: [
      "e4 e5 open game.",
      "Nf3 Nc6 knight development.",
      "Scotch Game: 3.d4 exd4.",
      "The Göring Gambit! White offers 4.c3, challenging Black to accept."
    ],
    acceptedVariation: {
      name: "Göring Gambit Accepted (4...dxc3 5.Nxc3)",
      moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "c3", "dxc3", "Nxc3"],
      explanation: "Black accepts. White recaptures 5.Nxc3, obtaining active pieces and open c/d files."
    },
    declinedVariation: {
      name: "Göring Gambit Declined (4...d5)",
      moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "c3", "d5"],
      explanation: "Black declines by striking back in the center with 4...d5, leading to equalized endgame setups."
    },
    popularVariations: [
      "Double Pawn Sacrifice (5.Bc4 cxb2 6.Bxb2)",
      "Single Pawn Sacrifice (5.Nxc3)",
      "Capablanca Defense (4...d3)"
    ],
    strategicIdeas: [
      "Utilizing open c- and d-files for rooks.",
      "Placing bishops on b2 and c4 to target f7 and g7.",
      "Maintaining high tactical pressure on c6 and d5."
    ],
    tacticalMotifs: [
      "Pins against Nc6 with Bb5.",
      "Qb3 attacking f7 and b7.",
      "Central breakthroughs with e5."
    ],
    commonMistakes: [
      "Allowing Black to play d5 uncontested and consolidate."
    ],
    bestResponses: [
      "4...d5! (Declined) or 4...dxc3 5.Nxc3 Bb4!"
    ],
    typicalCheckmatePatterns: [
      "Double bishop diagonal mates backed by Nc3-d5."
    ],
    middlegamePlans: [
      "Castle kingside, place rooks on c1 and d1.",
      "Use Nc3-d5 to dominate central outposts.",
      "Push e5 to shatter Black's central pawn structure."
    ],
    endgameIdeas: [
      "Endgame favors Black if White fails to generate middlegame tactics."
    ],
    famousGames: [
      "Carl Theodor Göring vs Wilfried Paulsen, Leipzig 1877"
    ],
    grandmasterExamples: ["Carl Theodor Göring", "Frank Marshall"],
    practicePosition: {
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
      prompt: "In the Scotch Game, Black captured on d4. Offer the Göring Gambit by playing c3.",
      solution: ["c3"]
    },
    quiz: {
      question: "How does the Göring Gambit differ from the Danish Gambit?",
      options: [
        "Knights are already developed (Nf3 and Nc6) before c3 is offered",
        "It is played on the queenside",
        "It is always declined",
        "It involves a queen sacrifice"
      ],
      answer: "Knights are already developed (Nf3 and Nc6) before c3 is offered",
      explanation: "The Göring Gambit arises after 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.c3. Because knights are on f3 and c6, tactical options and king defenses differ from the pure Danish Gambit."
    }
  },
  {
    id: "scotch-gambit",
    name: "Scotch Gambit",
    eco: "C44",
    category: "King's Pawn Opening",
    difficulty: "Beginner",
    side: "White",
    shortDesc: "In the Scotch Game, White plays 4.Bc4 instead of recapturing on d4, aiming directly at f7 and preparing rapid castling.",
    estimatedTime: "10 mins",
    popularity: 90,
    successRate: 52,
    history: "A classical opening favored by 19th-century masters and revived by Garry Kasparov for fast, open tactical play.",
    inventor: "Garry Kasparov (Modern Reviver)",
    playingStyle: "Open diagonals, fast castling, tactical pressure on f7",
    whenToUse: "To avoid long, theoretical Spanish lines and attack Black's f7 square directly.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Rapid piece development with simple plans.",
      "Prepares fast kingside castling.",
      "Keeps Black's king under immediate pressure."
    ],
    disadvantages: [
      "Black can counterattack e4 with 4...Nf6!"
    ],
    commonTraps: [
      "4...Bc5 5.c3 dxc3 6.Bxf7+! Kxf7 7.Qd5+ regaining the piece with interest."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4"],
    explanations: [
      "e4 e5 open game.",
      "Nf3 Nc6 knight development.",
      "Scotch Game: 3.d4 exd4.",
      "The Scotch Gambit! White plays 4.Bc4, developing the bishop to attack f7 instead of taking back on d4."
    ],
    acceptedVariation: {
      name: "Classical Acceptance (4...Bc5 5.c3)",
      moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Bc5", "c3"],
      explanation: "Black defends d4 with Bc5. White plays c3 to open lines for Qb3 and Nc3."
    },
    declinedVariation: {
      name: "Dubois Defense (4...Nf6)",
      moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Bc4", "Nf6"],
      explanation: "Black counterattacks White's e4 pawn with 4...Nf6, transposing into solid Two Knights lines."
    },
    popularVariations: [
      "4...Bc5 (Classical)",
      "4...Nf6 (Two Knights Transposition)",
      "4...Be7 (Benima Defense)"
    ],
    strategicIdeas: [
      "Development lead in exchange for one pawn.",
      "Using c3 to activate Qb3 targeting f7 and b7.",
      "Castling quickly to pin Black's pieces along the e-file."
    ],
    tacticalMotifs: [
      "Bxf7+ sacrifices drawing out Black's king.",
      "Ng5 jumps coordinating with Bc4.",
      "Re1 pins along the e-file."
    ],
    commonMistakes: [
      "Playing too passively after 4.Bc4, letting Black castle safely."
    ],
    bestResponses: [
      "4...Nf6! counter-attacking e4."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Ng5+ and Qh5# mating nets."
    ],
    middlegamePlans: [
      "Play c3 and O-O, then d5 or e5.",
      "Qb3 battery targeting f7 and b7.",
      "Use Bg5 to pin Black's f6 knight."
    ],
    endgameIdeas: [
      "Recapture pawns in the middlegame to avoid worse endgames."
    ],
    famousGames: [
      "Garry Kasparov vs Viswanathan Anand, World Championship 1995"
    ],
    grandmasterExamples: ["Garry Kasparov", "Levon Aronian", "Vassily Ivanchuk"],
    practicePosition: {
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
      prompt: "Black captured 3...exd4 in the Scotch Game. Develop your bishop to c4 to play the Scotch Gambit.",
      solution: ["Bc4"]
    },
    quiz: {
      question: "What is Black's most energetic counter-attack after White plays the Scotch Gambit (4.Bc4)?",
      options: [
        "4...Nf6!, attacking White's undefended e4 pawn",
        "4...h6, preventing Ng5",
        "4...f6, defending e5 awkwardly",
        "4...a6, preparing queenside expansion"
      ],
      answer: "4...Nf6!, attacking White's undefended e4 pawn",
      explanation: "4...Nf6! immediately attacks White's e4 pawn, forcing White to address the threat (often with 5.e5 or 5.O-O) and preventing White from mounting an unhindered attack."
    }
  },
  {
    id: "evans-gambit",
    name: "Evans Gambit",
    eco: "C51",
    category: "Italian Game",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the Italian Game, White sacrifices a queenside b-pawn to gain tempo, build a massive pawn center, and launch a furious attack.",
    estimatedTime: "12 mins",
    popularity: 82,
    successRate: 52,
    history: "Invented by Captain William Davies Evans in 1826. It became the 'gift of the gods' for Romantic players including Paul Morphy and Garry Kasparov.",
    inventor: "Captain William Davies Evans",
    playingStyle: "Furious development, open lines, tactical pressure against f7",
    whenToUse: "Against symmetrical Italian setups (3...Bc5) to launch a dramatic, early initiative.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Gains tempo with c3, forcing Black's bishop to move.",
      "Builds an ideal d4-e4 pawn center.",
      "Opens diagonals for Ba3 and Qb3 targeting f7."
    ],
    disadvantages: [
      "Black can accept, defend carefully (Lasker Defense), and return the pawn later."
    ],
    commonTraps: [
      "4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O dxc3 8.Qb3! with a winning battery."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    explanations: [
      "e4 e5 open game.",
      "Nf3 Nc6 knight development.",
      "Bc4 Italian Bishop.",
      "Bc5 Classical Italian reply.",
      "THE EVANS GAMBIT! White plays 4.b4!, offering a queenside pawn to gain a tempo with c3 and prepare d4."
    ],
    acceptedVariation: {
      name: "Evans Gambit Accepted (4...Bxb4 5.c3)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3"],
      explanation: "Black accepts the b4 pawn. White plays 5.c3, attacking the bishop and preparing d4."
    },
    declinedVariation: {
      name: "Evans Gambit Declined (4...Bb6)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bb6"],
      explanation: "Black declines the pawn, retreating the bishop to b6. White plays a4 to gain queenside space."
    },
    popularVariations: [
      "Accepted: Ba5 (Lasker Defense)",
      "Accepted: Be7",
      "Accepted: Bc5",
      "Declined: 4...Bb6"
    ],
    strategicIdeas: [
      "Sacrificing a flank pawn for tempi to build a d4-e4 pawn center.",
      "Targeting the f7 square with Bc4, Qb3, and Ba3.",
      "Keeping Black's king trapped in the center."
    ],
    tacticalMotifs: [
      "Qb3 + Bc4 double assault on f7.",
      "Ba3 preventing Black from castling.",
      "d5 pawn pushes driving away Nc6."
    ],
    commonMistakes: [
      "Playing c3 and d4 too slowly, giving Black time to consolidate."
    ],
    bestResponses: [
      "Accept with 4...Bxb4 5.c3 Ba5 6.d4 d6 (Lasker Defense), returning the pawn later on d5."
    ],
    typicalCheckmatePatterns: [
      "Ng5, Qf3, and Bxf7+ leading to early checkmating nets."
    ],
    middlegamePlans: [
      "Play c3, d4, and O-O.",
      "Place bishop on a3 to prevent Black from castling.",
      "Qb3 battery targeting f7."
    ],
    endgameIdeas: [
      "If Black defends into an endgame, Black's extra pawn gives them the advantage."
    ],
    famousGames: [
      "Adolf Anderssen vs Jean Dufresne, Berlin 1852 (The Evergreen Game)",
      "Garry Kasparov vs Viswanathan Anand, Riga 1995"
    ],
    grandmasterExamples: ["Garry Kasparov", "Paul Morphy", "Adolf Anderssen", "Hikaru Nakamura"],
    practicePosition: {
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      prompt: "White has set up the Italian Game. Play 4.b4 to offer the Evans Gambit.",
      solution: ["b4"]
    },
    quiz: {
      question: "What is White's primary strategic compensation for sacrificing the b4 pawn in the Evans Gambit?",
      options: [
        "Winning extra tempi via c3 to build a rapid pawn center with d4",
        "Promoting a pawn immediately on b8",
        "Trading queens on move 5",
        "Winning a rook on a8"
      ],
      answer: "Winning extra tempi via c3 to build a rapid pawn center with d4",
      explanation: "When Black takes 4...Bxb4, White plays 5.c3!, gaining a tempo by attacking the bishop and establishing support for a rapid d4 push to dominate the center."
    }
  },
  {
    id: "belgrade-gambit",
    name: "Belgrade Gambit",
    eco: "C47",
    category: "Four Knights Game",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the Four Knights Game, White sacrifices a central d-pawn (4.d4 exd4 5.Nd5!) to centralize a knight and disrupt Black's structure.",
    estimatedTime: "12 mins",
    popularity: 72,
    successRate: 51,
    history: "Developed by Belgrade chess analysts in the mid-20th century. A sharp weapon in the usually drawish Four Knights Game.",
    inventor: "Belgrade Analysts",
    playingStyle: "Central knight outpost, tactical melee, rapid piece coordination",
    whenToUse: "To transform a quiet Four Knights Game into a dynamic, highly tactical battle.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "The knight on d5 is an aggressive central outpost.",
      "Avoids quiet drawish Four Knights lines.",
      "Creates immediate tactical problems for Black on c7 and f6."
    ],
    disadvantages: [
      "Black can defend with 5...Be7 or 5...Nxe4."
    ],
    commonTraps: [
      "5.Nd5 Nxe4 6.Qe2 f5 7.Ng5! d3 8.cxd3 with a massive attack."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "d4", "exd4", "Nd5"],
    explanations: [
      "e4 e5 open game.",
      "Nf3 Nc6 Four Knights preparation.",
      "Nc3 Nf6 Four Knights Game established.",
      "3.d4 exd4 White strikes in the center.",
      "THE BELGRADE GAMBIT! White leaps 5.Nd5!, offering the d4/e4 pawns to place a knight on d5."
    ],
    acceptedVariation: {
      name: "Belgrade Accepted (5...Nxe4 6.Qe2)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "d4", "exd4", "Nd5", "Nxe4", "Qe2"],
      explanation: "Black takes on e4. White plays 6.Qe2, pinning Black's e4 knight against the king."
    },
    declinedVariation: {
      name: "Belgrade Declined (5...Be7)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "d4", "exd4", "Nd5", "Be7"],
      explanation: "Black declines, developing 5...Be7 to prepare castling and maintain piece harmony."
    },
    popularVariations: [
      "Accepted: 5...Nxe4 6.Qe2 f5",
      "Declined: 5...Be7 6.Nxd4 Nxd5"
    ],
    strategicIdeas: [
      "Using d5 as a supreme knight outpost.",
      "Pinning Black's e4 knight with Qe2.",
      "Opening lines for dark-squared bishop development with Bg5."
    ],
    tacticalMotifs: [
      "Nxc7+ forks on c7.",
      "Qe2 pins along the e-file.",
      "Ng5 knight tandem attacks."
    ],
    commonMistakes: [
      "Playing 6.Bxf4? instead of 6.Qe2 after 5...Nxe4."
    ],
    bestResponses: [
      "5...Be7! (Declined) or 5...Nxe4 6.Qe2 f5 7.Ng5 d3!"
    ],
    typicalCheckmatePatterns: [
      "Nxc7+ followed by Qe6# checkmate."
    ],
    middlegamePlans: [
      "Maintain the d5 knight outpost.",
      "Develop Bg5 and castle queenside (O-O-O).",
      "Launch an e-file attack with Rooks."
    ],
    endgameIdeas: [
      "If material is equalized, White's active knight placement keeps pressure."
    ],
    famousGames: [
      "Milan Vidmar vs Savielly Tartakower, Vienna 1908"
    ],
    grandmasterExamples: ["Milan Vidmar", "Savielly Tartakower"],
    practicePosition: {
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4",
      prompt: "In the Four Knights, Black took 4...exd4. Leap your knight to d5 to launch the Belgrade Gambit.",
      solution: ["Nd5"]
    },
    quiz: {
      question: "What is White's key pinning move after Black plays 5...Nxe4 in the Belgrade Gambit?",
      options: [
        "6.Qe2!, pinning the e4 knight against Black's uncastled king",
        "6.Bxd4, taking a pawn back",
        "6.O-O, castling",
        "6.Nxe5, trading knights"
      ],
      answer: "6.Qe2!, pinning the e4 knight against Black's uncastled king",
      explanation: "After 5...Nxe4, White plays 6.Qe2! This pins the knight on e4 along the open e-file against Black's king, creating immediate defensive difficulties for Black."
    }
  }
];
