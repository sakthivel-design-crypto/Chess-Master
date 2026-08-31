import { Gambit } from "../gambitData";

export const gambits3: Gambit[] = [
  {
    id: "blackmar-diemer-gambit",
    name: "Blackmar-Diemer Gambit",
    eco: "D00",
    category: "Queen's Pawn Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Against 1.d4 d5 2.e4 dxe4 3.Nc3 Nf6 4.f3!, White offers a full pawn to gain rapid development and open e- and f-files.",
    estimatedTime: "12 mins",
    popularity: 82,
    successRate: 51,
    history: "Created by Armand Blackmar (1889) and refined by Emil Joseph Diemer (1930s). Highly cult-followed for fast mating attacks.",
    inventor: "Armand Blackmar & Emil Joseph Diemer",
    playingStyle: "Open-file attacking, quick piece activation, king hunt",
    whenToUse: "Against 1.d4 d5 players to avoid dry positional Queen's Gambit lines and launch a sharp tactical attack.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Opens e- and f-files for major piece attack.",
      "Develops pieces rapidly with Qxf3.",
      "Black's king is under constant tactical pressure."
    ],
    disadvantages: [
      "White is down a full pawn for positional activity."
    ],
    commonTraps: [
      "4...exf3 5.Qxf3 Qxd4 6.Be3 Qb4 7.O-O-O Bg4 8.Nb5! with a crushing attack."
    ],
    moves: ["d4", "d5", "e4", "dxe4", "Nc3", "Nf6", "f3"],
    explanations: [
      "1.d4 d5 central challenge.",
      "2.e4 dxe4 White offers the e-pawn.",
      "3.Nc3 Nf6 Black defends the e4 pawn.",
      "THE BLACKMAR-DIEMER GAMBIT! White plays 4.f3!, offering a second pawn to open the f-file and e-file."
    ],
    acceptedVariation: {
      name: "BDG Accepted (4...exf3 5.Nxf3)",
      moves: ["d4", "d5", "e4", "dxe4", "Nc3", "Nf6", "f3", "exf3", "Nxf3"],
      explanation: "Black accepts. White recaptures 5.Nxf3, obtaining four active pieces and two open files."
    },
    declinedVariation: {
      name: "Lemberger Defense (4...e3)",
      moves: ["d4", "d5", "e4", "dxe4", "Nc3", "Nf6", "f3", "e3"],
      explanation: "Black declines, returning the pawn with 4...e3 to deny White the open f-file."
    },
    popularVariations: [
      "Bogoljubov Defense (5...g6)",
      "Teichmann Defense (5...Bg4)",
      "Euwe Defense (5...e6)"
    ],
    strategicIdeas: [
      "Sacrificing a pawn for rapid piece development and open e/f files.",
      "Targeting f7 with Bc4 and Queen batteries.",
      "Castling queenside (O-O-O) to launch a kingside storm."
    ],
    tacticalMotifs: [
      "Nb5 tactical forks on c7.",
      "Bxf7+ king drag sacrifices.",
      "Open f-file rook pressure."
    ],
    commonMistakes: [
      "White playing 5.Qxf3? instead of 5.Nxf3! when Black can play Qxd4."
    ],
    bestResponses: [
      "5...g6 (Bogoljubov Defense) or 5...c6 6.Bc4 Bf5!"
    ],
    typicalCheckmatePatterns: [
      "Nb5 + Bc4 + Qxf7# crushing checkmates."
    ],
    middlegamePlans: [
      "Play Bc4, Bg5, O-O-O, and Rhe1.",
      "Use the open f-file to attack Black's f7 square."
    ],
    endgameIdeas: [
      "Black's extra pawn gives Black the advantage if White's attack is neutralized."
    ],
    famousGames: [
      "Emil Diemer vs Various Masters, Nuremberg 1950"
    ],
    grandmasterExamples: ["Emil Joseph Diemer", "Armand Blackmar"],
    practicePosition: {
      fen: "rnbqkb1r/ppp1pppp/5n2/8/3pp3/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 4",
      prompt: "Black played 3...Nf6. Offer the Blackmar-Diemer Gambit with 4.f3.",
      solution: ["f3"]
    },
    quiz: {
      question: "What is White's main recapturing move after Black accepts 4...exf3 in the Blackmar-Diemer Gambit?",
      options: [
        "5.Nxf3!, developing the knight and controlling e5 and d4",
        "5.gxf3, wrecking the kingside pawns",
        "5.Qxf3, allowing Qxd4",
        "5.Kxf2, walking into check"
      ],
      answer: "5.Nxf3!, developing the knight and controlling e5 and d4",
      explanation: "5.Nxf3! is the main recapturing move. It develops a piece toward the center, guards d4, and leaves the queen active on d1 behind the open file."
    }
  },
  {
    id: "budapest-gambit",
    name: "Budapest Gambit",
    eco: "A51",
    category: "Indian Defense",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "Against 1.d4 Nf6 2.c4, Black plays 2...e5!?, sacrificing a pawn to dislodge White's central dominance and create early traps.",
    estimatedTime: "12 mins",
    popularity: 78,
    successRate: 49,
    history: "First played by Geza Maroczy and Abonyi in Budapest (1916). Famously features the move 8...Nd3# smothered checkmate trap.",
    inventor: "Istvan Abonyi & Zsigmond Barasz",
    playingStyle: "Piece harassment, central counter-attack, smothered mate traps",
    whenToUse: "Against 1.d4 2.c4 players to dislodge their setup and create fast piece play.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Forces White to defend the e5 pawn with Nf3 and Bf4.",
      "Black develops Bc5 pointing at f2.",
      "Contains the legendary move 8...Nd3# smothered mate."
    ],
    disadvantages: [
      "White can return the pawn with 3.dxe5 Ng4 4.e4! Nxe5 5.f4! for central space."
    ],
    commonTraps: [
      "Fajarowicz Trap: 3.dxe5 Ne4 4.a3 d6 5.exd6 Bxd6 6.g3? Nxf2! 7.Kxf2 Bxg3+ winning White's queen."
    ],
    moves: ["d4", "Nf6", "c4", "e5"],
    explanations: [
      "1.d4 Nf6 Indian Defense.",
      "2.c4 White expands in the center.",
      "THE BUDAPEST GAMBIT! Black strikes back with 2...e5!?, offering the e-pawn."
    ],
    acceptedVariation: {
      name: "Adler Variation (3.dxe5 Ng4 4.Nf3)",
      moves: ["d4", "Nf6", "c4", "e5", "dxe5", "Ng4", "Nf3"],
      explanation: "White takes 3.dxe5. Black moves 3...Ng4 to recapture, and White defends e5 with 4.Nf3."
    },
    declinedVariation: {
      name: "Fajarowicz Variation (3.dxe5 Ne4)",
      moves: ["d4", "Nf6", "c4", "e5", "dxe5", "Ne4"],
      explanation: "Black leaps 3...Ne4 instead of Ng4, creating immediate tactical threats against f2 and d2."
    },
    popularVariations: [
      "Rubinstein Variation (4.Bf4)",
      "Alekhine Variation (4.e4)",
      "Fajarowicz Variation (3...Ne4)"
    ],
    strategicIdeas: [
      "Harassing White's extra e5 pawn with Nc6, Qe7, and Ng4.",
      "Developing Bc5 pointing at f2.",
      "Executing the smothered mate trap (Nd3#) if White defends carelessly."
    ],
    tacticalMotifs: [
      "Smothered checkmate on d3 (Nd3#).",
      "Bxg3+ queen winning tactics in the Fajarowicz.",
      "Pins along the e-file."
    ],
    commonMistakes: [
      "White playing 8.a3? in the Rubinstein line, walking straight into 8...Nd3# smothered mate."
    ],
    bestResponses: [
      "4.Bf4 Nc6 5.Nf3 Bb4+ 6.Nbd2 Qe7 7.a3!"
    ],
    typicalCheckmatePatterns: [
      "Smothered mate on d3 with Nd3#."
    ],
    middlegamePlans: [
      "Black plays Nc6, Bc5, Qe7, and castles kingside.",
      "Recapture on e5 with the knight and maintain active piece diagonals."
    ],
    endgameIdeas: [
      "Equal material leads to balanced endgames."
    ],
    famousGames: [
      "Akiba Rubinstein vs Milan Vidmar, Berlin 1918",
      "Richard Reti vs Savielly Tartakower, Vienna 1919"
    ],
    grandmasterExamples: ["Milan Vidmar", "Savielly Tartakower", "Richard Reti"],
    practicePosition: {
      fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      prompt: "Black played 2...e5 (Budapest Gambit). Capture the e5 pawn with 3.dxe5.",
      solution: ["dxe5"]
    },
    quiz: {
      question: "What iconic checkmate pattern exists in the Budapest Gambit if White plays 8.a3? after 4.Bf4 Nc6 5.Nf3 Bb4+ 6.Nbd2 Qe7 7.e3 Ngxe5?",
      options: [
        "8...Nd3# smothered checkmate, because White's e2 pawn is pinned by Black's queen",
        "Back-rank checkmate on c1",
        "Bxf2# checkmate",
        "Qxh4# checkmate"
      ],
      answer: "8...Nd3# smothered checkmate, because White's e2 pawn is pinned by Black's queen",
      explanation: "The famous Budapest Smothered Mate! 8...Nd3# delivers checkmate because White's e2 pawn is pinned against the white king by Black's queen on e7!"
    }
  },
  {
    id: "benko-gambit",
    name: "Benko Gambit",
    eco: "A57",
    category: "Benoni Opening",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "In the Benoni, Black offers a queenside b-pawn (1.d4 Nf6 2.c4 c5 3.d5 b5!) for long-term pressure along open a- and b-files.",
    estimatedTime: "15 mins",
    popularity: 88,
    successRate: 52,
    history: "Invented by Pal Benko in the late 1960s. One of the most theoretically sound positional gambits in chess history.",
    inventor: "Pal Benko",
    playingStyle: "Long-term queenside pressure, open file rooks, fianchetto bishop",
    whenToUse: "When playing Black against 1.d4 and you want long-term positional compensation rather than short tactical tricks.",
    recommendedSkillLevel: "1200 - 2400 Elo",
    advantages: [
      "Permanent, long-term pressure along open a- and b-files.",
      "G7 fianchetto bishop points straight across the long diagonal.",
      "White's queenside pawns are under constant siege."
    ],
    disadvantages: [
      "White retains an extra pawn on the kingside."
    ],
    commonTraps: [
      "4.cxb5 a6 5.bxa6 Bxa6 6.Nc3 d6 7.e4 Bxf1 8.Kxf1 g6 9.Nf3 Bg7 10.g3 O-O 11.Kg2 Nbd7 with perpetual pressure."
    ],
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"],
    explanations: [
      "1.d4 Nf6 Indian Defense.",
      "2.c4 c5 3.d5 Benoni structure.",
      "THE BENKO GAMBIT! Black plays 3...b5!, offering the b-pawn to open queenside files."
    ],
    acceptedVariation: {
      name: "Benko Accepted (4.cxb5 a6 5.bxa6 Bxa6)",
      moves: ["d4", "Nf6", "c4", "c5", "d5", "b5", "cxb5", "a6", "bxa6", "Bxa6"],
      explanation: "White accepts both b5 and a6. Black recaptures 5...Bxa6, completing the setup for open a/b file pressure."
    },
    declinedVariation: {
      name: "Benko Declined (4.Nf3 or 4.Qc2)",
      moves: ["d4", "Nf6", "c4", "c5", "d5", "b5", "Nf3"],
      explanation: "White declines b5, playing 4.Nf3 to maintain a calm central game."
    },
    popularVariations: [
      "Accepted: 5.bxa6 Bxa6 6.Nc3 d6 7.e4 Bxf1 8.Kxf1 g6",
      "Zaitsev Variation (5.b6)",
      "Declined: 4.Nf3"
    ],
    strategicIdeas: [
      "Using open a- and b-files for rooks.",
      "Fianchettoing the dark-squared bishop to g7.",
      "Creating permanent weaknesses on White's a2 and b2 pawns."
    ],
    tacticalMotifs: [
      "Long diagonal pressure with Bg7.",
      "Double rook stacking on a- and b-files.",
      "c4/d3 knight outposts."
    ],
    commonMistakes: [
      "White trying to push e4 without guarding the f1 bishop, losing castling rights."
    ],
    bestResponses: [
      "4.cxb5 a6 5.b6! (Zaitsev Variation) returning the pawn to deny Black open files."
    ],
    typicalCheckmatePatterns: [
      "Queenside penetration leading to back-rank checkmates."
    ],
    middlegamePlans: [
      "Black plays d6, g6, Bg7, O-O, Nbd7, Qa5, and Rfb8.",
      "Pound White's b2 and a2 pawns relentlessly."
    ],
    endgameIdeas: [
      "Benko endgames heavily favor Black due to open files and superior pawn structure!"
    ],
    famousGames: [
      "Pal Benko vs Various Grandmasters, 1970",
      "Garry Kasparov vs Veselin Topalov, 1996"
    ],
    grandmasterExamples: ["Pal Benko", "Garry Kasparov", "Veselin Topalov", "Magnus Carlsen"],
    practicePosition: {
      fen: "rnbqkb1r/pp1pppp1/5n1p/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3",
      prompt: "White played 3.d5 in the Benoni. Offer the Benko Gambit with 3...b5.",
      solution: ["b5"]
    },
    quiz: {
      question: "Why is compensation in the Benko Gambit unique compared to most tactical gambits?",
      options: [
        "It offers long-term positional pressure along open a- and b-files that lasts all the way into the endgame",
        "It forces immediate checkmate on move 10",
        "It wins a queen",
        "It forces a draw"
      ],
      answer: "It offers long-term positional pressure along open a- and b-files that lasts all the way into the endgame",
      explanation: "Unlike short tactical gambits, the Benko Gambit gives Black permanent open a- and b-files and a monster g7 bishop. This positional pressure persists into the endgame."
    }
  },
  {
    id: "blumenfeld-gambit",
    name: "Blumenfeld Gambit",
    eco: "E10",
    category: "Indian Defense",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "In the Benoni/Indian lines, Black offers b5 and e6 to construct a massive d5-e5 pawn center and launch a kingside storm.",
    estimatedTime: "12 mins",
    popularity: 70,
    successRate: 48,
    history: "Invented by Benjamin Blumenfeld in 1922 and famously played by Alexander Alekhine.",
    inventor: "Benjamin Blumenfeld",
    playingStyle: "Center construction, kingside pawn storm, piece mobilization",
    whenToUse: "Against 1.d4 Nf6 2.c4 e6 3.Nf3 c5 4.d5 to build a massive center and attack White's king.",
    recommendedSkillLevel: "1200 - 2200 Elo",
    advantages: [
      "Builds a dominant d5-e5 center if White accepts.",
      "Gains open f- and g-files for kingside attack.",
      "Denies White comfortable central control."
    ],
    disadvantages: [
      "White can decline with 5.Bg5! disrupting Black's plans."
    ],
    commonTraps: [
      "5.dxe6 fxe6 6.cxb5 d5 7.e3 Bd6 8.Nc3 O-O with a crushing central steamroller."
    ],
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "c5", "d5", "b5"],
    explanations: [
      "1.d4 Nf6 Indian Defense.",
      "2.c4 e6 3.Nf3 c5 Benoni preparation.",
      "4.d5 White pushes d5.",
      "THE BLUMENFELD GAMBIT! Black strikes with 4...b5!, offering a pawn to build a massive center."
    ],
    acceptedVariation: {
      name: "Blumenfeld Accepted (5.dxe6 fxe6 6.cxb5 d5)",
      moves: ["d4", "Nf6", "c4", "e6", "Nf3", "c5", "d5", "b5", "dxe6", "fxe6", "cxb5", "d5"],
      explanation: "White accepts both pawns. Black establishes a massive d5/e5 pawn center."
    },
    declinedVariation: {
      name: "Blumenfeld Declined (5.Bg5)",
      moves: ["d4", "Nf6", "c4", "e6", "Nf3", "c5", "d5", "b5", "Bg5"],
      explanation: "White plays 5.Bg5!, pinning Black's f6 knight and declining the gambit."
    },
    popularVariations: [
      "Accepted: 6.cxb5 d5 7.e3 Bd6",
      "Declined: 5.Bg5 (Rubinstein Line)"
    ],
    strategicIdeas: [
      "Constructing a massive d5-e5 center.",
      "Launching a kingside pawn storm with e5, d4, and f5.",
      "Using the f-file for major piece pressure."
    ],
    tacticalMotifs: [
      "Central pawn steamroller pushes.",
      "Sacrifices on h2 with Bd6 and Qh4.",
      "F-file rook pressure."
    ],
    commonMistakes: [
      "Playing 5...fxe6 without following up with 6...d5."
    ],
    bestResponses: [
      "5.Bg5! (Declined) pinning the knight and neutralizing Black's setup."
    ],
    typicalCheckmatePatterns: [
      "Bd6 + Qh4 + f4 crushing kingside checkmates."
    ],
    middlegamePlans: [
      "Black plays d5, Bd6, O-O, and e5.",
      "Push f5 and e4 to crush White's kingside."
    ],
    endgameIdeas: [
      "Black's central pawn roller compensates for the pawn deficit."
    ],
    famousGames: [
      "Siegbert Tarrasch vs Alexander Alekhine, Bad Pistyan 1922"
    ],
    grandmasterExamples: ["Alexander Alekhine", "Benjamin Blumenfeld"],
    practicePosition: {
      fen: "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 4",
      prompt: "White pushed 4.d5. Offer the Blumenfeld Gambit with 4...b5.",
      solution: ["b5"]
    },
    quiz: {
      question: "What is Black's primary compensation in the accepted Blumenfeld Gambit?",
      options: [
        "A massive, dominating pawn center (d5 and e5) that powers a kingside attack",
        "A queen sacrifice",
        "Back-rank checkmate on move 8",
        "An extra knight"
      ],
      answer: "A massive, dominating pawn center (d5 and e5) that powers a kingside attack",
      explanation: "By sacrificing pawns on b5 and e6, Black builds a central duo of d5 and e5 pawns. These pawns steamroll forward, supporting a fierce kingside assault."
    }
  },
  {
    id: "englund-gambit",
    name: "Englund Gambit",
    eco: "A40",
    category: "Queen's Pawn Opening",
    difficulty: "Beginner",
    side: "Black",
    shortDesc: "Against 1.d4, Black plays 1...e5!?, sacrificing a pawn to trap White's queenside in the infamous 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ line.",
    estimatedTime: "10 mins",
    popularity: 85,
    successRate: 50,
    history: "Invented by Fritz Englund in 1932. Extremely popular in blitz games due to its venomous move 8 queen trap.",
    inventor: "Fritz Englund",
    playingStyle: "Venomous early traps, queen checks, quick material wins",
    whenToUse: "In blitz games to catch unprepared 1.d4 players in an immediate move-8 trap.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Contains one of the most famous move-8 queen traps in chess.",
      "Forces White into precise defense immediately.",
      "Black gets active queen placement."
    ],
    disadvantages: [
      "If White knows 4.Nc3 or 4.Bf4 Qb4+ 5.Bd2 Qxb2 6.Nc3!, White gets a winning advantage."
    ],
    commonTraps: [
      "Main Trap: 1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ 5.Bd2 Qxb2 6.Bc3?? Bb4! 7.Qd2 Bxc3 8.Qxc3 Qc1# checkmate!"
    ],
    moves: ["d4", "e5", "dxe5", "Nc6", "Nf3", "Qe7"],
    explanations: [
      "1.d4 d-pawn opening.",
      "THE ENGLUND GAMBIT! Black strikes with 1...e5!?",
      "2.dxe5 Nc6 Black attacks e5.",
      "3.Nf3 Qe7 Black double-attacks e5.",
      "White plays 4.Bf4, defending e5.",
      "Black plays 4...Qb4+!, double-attacking b2 and f4!"
    ],
    acceptedVariation: {
      name: "Englund Main Trap Line (4.Bf4 Qb4+ 5.Bd2 Qxb2)",
      moves: ["d4", "e5", "dxe5", "Nc6", "Nf3", "Qe7", "Bf4", "Qb4+", "Bd2", "Qxb2"],
      explanation: "Black plays Qb4+, forking king, bishop, and b2 pawn, then takes 5...Qxb2."
    },
    declinedVariation: {
      name: "White Refusal (2.e4)",
      moves: ["d4", "e5", "e4"],
      explanation: "White transposes into a King's Pawn Open Game with 2.e4."
    },
    popularVariations: [
      "Main Line Trap: 5.Bd2 Qxb2 6.Bc3 Bb4",
      "Groat Variation: 4.Nc3 Nxe5 5.e4"
    ],
    strategicIdeas: [
      "Luring White into 6.Bc3?? to play 6...Bb4! pinning the bishop.",
      "Forking f4 and b2 with Qb4+.",
      "Reclaiming material or delivering Qc1# checkmate."
    ],
    tacticalMotifs: [
      "Qb4+ fork.",
      "Bb4 pin on Bc3.",
      "Qc1# back-rank checkmate."
    ],
    commonMistakes: [
      "White playing 6.Bc3?? which loses immediately to 6...Bb4!"
    ],
    bestResponses: [
      "4.Nc3! Nxe5 5.e4 or 4.Bf4 Qb4+ 5.Bd2 Qxb2 6.Nc3! Bb4 7.Rb1!"
    ],
    typicalCheckmatePatterns: [
      "Qc1# back-rank checkmate."
    ],
    middlegamePlans: [
      "Black executes the trap or reclaims b2/c3 material.",
      "If White plays 6.Nc3!, Black must play Bb4 and defend carefully."
    ],
    endgameIdeas: [
      "White holds a winning endgame if White avoids the move-8 trap."
    ],
    famousGames: [
      "Fritz Englund vs Various Masters, 1932"
    ],
    grandmasterExamples: ["Fritz Englund"],
    practicePosition: {
      fen: "r1bqkbnr/pppp1ppp/2n5/4P3/8/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 3",
      prompt: "White played 3.Nf3. Double-attack the e5 pawn with 3...Qe7.",
      solution: ["Qe7"]
    },
    quiz: {
      question: "What is White's fatal mistake after 4.Bf4 Qb4+ 5.Bd2 Qxb2 in the Englund Gambit?",
      options: [
        "6.Bc3??, walking into 6...Bb4! 7.Qd2 Bxc3 8.Qxc3 Qc1# checkmate",
        "6.Nc3!, which is White's best move",
        "6.e3, developing calmly",
        "6.c3, defending b2"
      ],
      answer: "6.Bc3??, walking into 6...Bb4! 7.Qd2 Bxc3 8.Qxc3 Qc1# checkmate",
      explanation: "6.Bc3?? looks natural to defend b2 and attack the queen, but Black plays 6...Bb4!, pinning the bishop. After 7.Qd2 Bxc3 8.Qxc3, Black plays 8...Qc1# checkmate!"
    }
  },
  {
    id: "benoni-gambit",
    name: "Benoni Gambit / Countergambit",
    eco: "A56",
    category: "Benoni Opening",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "In the Benoni Defense, Black offers an e-pawn or b-pawn (1.d4 Nf6 2.c4 c5 3.d5 e6) to undermine White's central wedge.",
    estimatedTime: "12 mins",
    popularity: 80,
    successRate: 50,
    history: "Analyzed by Aaron Reinfeld and Mikhail Tal. A sharp, asymmetrical opening favored by World Champions.",
    inventor: "Mikhail Tal & Aaron Reinfeld",
    playingStyle: "Asymmetrical counter-attack, queenside pawn storm, dynamic piece play",
    whenToUse: "When you want an asymmetrical game against 1.d4 with dynamic winning chances.",
    recommendedSkillLevel: "1000 - 2200 Elo",
    advantages: [
      "Creates dynamic, asymmetrical pawn structures.",
      "G7 dark-squared bishop becomes a monster across the long diagonal.",
      "Black gets queenside pawn majority."
    ],
    disadvantages: [
      "White gains a strong central d5 space wedge."
    ],
    commonTraps: [
      "4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.Bb5+ Nfd7 9.e5! with a explosive central push."
    ],
    moves: ["d4", "Nf6", "c4", "c5", "d5", "e6"],
    explanations: [
      "1.d4 Nf6 Indian Defense.",
      "2.c4 c5 3.d5 Benoni structure.",
      "THE BENONI COUNTERGAMBIT! Black strikes with 3...e6, attacking White's d5 wedge."
    ],
    acceptedVariation: {
      name: "Modern Benoni Main Line (4.Nc3 exd5 5.cxd5 d6)",
      moves: ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3", "exd5", "cxd5", "d6"],
      explanation: "Exchanges occur on d5. Black sets up d6, g6, Bg7, and a queenside pawn majority."
    },
    declinedVariation: {
      name: "Czech Benoni (3...e5)",
      moves: ["d4", "Nf6", "c4", "c5", "d5", "e5"],
      explanation: "Black closes the center with 3...e5, leading to a maneuvering positional game."
    },
    popularVariations: [
      "Taimanov Attack (8.Bb5+)",
      "Four Pawns Attack (7.f4)",
      "Modern Main Line (6.e4 g6 7.Nf3)"
    ],
    strategicIdeas: [
      "Using the e8-h5 and a1-h8 diagonals for active bishops.",
      "Expanding on the queenside with a6 and b5.",
      "Pressuring White's e4 pawn with Re8."
    ],
    tacticalMotifs: [
      "Bb5+ checks for White.",
      "e5 central pawn breaks.",
      "Queenside b5 pawn storms for Black."
    ],
    commonMistakes: [
      "Failing to castle quickly as Black against the Four Pawns Attack."
    ],
    bestResponses: [
      "White playing 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O."
    ],
    typicalCheckmatePatterns: [
      "e6/e7 central breakthroughs leading to rook checkmates."
    ],
    middlegamePlans: [
      "Black plays g6, Bg7, O-O, Re8, a6, and b5.",
      "Launch a queenside pawn storm (b5-b4).",
      "Use Ne4 to centralize the knight."
    ],
    endgameIdeas: [
      "Black's queenside pawn majority provides passed pawn potential in endgames."
    ],
    famousGames: [
      "Mikhail Tal vs Bobby Fischer, Bleurg 1959",
      "Garry Kasparov vs Anatoly Karpov, World Championship 1985"
    ],
    grandmasterExamples: ["Mikhail Tal", "Garry Kasparov", "Bobby Fischer"],
    practicePosition: {
      fen: "rnbqkb1r/pp1p1ppp/5n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3",
      prompt: "White played 3.d5 in the Benoni. Strike at the center wedge with 3...e6.",
      solution: ["e6"]
    },
    quiz: {
      question: "What is Black's primary strategic plan on the queenside in the Modern Benoni?",
      options: [
        "To launch a queenside pawn storm with a6 and b5 to create a passed pawn",
        "To exchange all rooks on move 10",
        "To castle queenside",
        "To trade dark-squared bishops"
      ],
      answer: "To launch a queenside pawn storm with a6 and b5 to create a passed pawn",
      explanation: "In the Modern Benoni, Black's pawn structure (a7, b7, c5) gives Black a 3-vs-2 queenside majority. Black pushes a6 and b5 to create a dangerous passed pawn."
    }
  },
  {
    id: "staunton-gambit",
    name: "Staunton Gambit",
    eco: "A82",
    category: "Dutch Defense",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "Against the Dutch Defense (1.d4 f5), White plays 2.e4!?, sacrificing a pawn to shatter Black's kingside and take the initiative.",
    estimatedTime: "12 mins",
    popularity: 76,
    successRate: 51,
    history: "Invented by Howard Staunton in 1847 to punish 1...f5 players directly.",
    inventor: "Howard Staunton",
    playingStyle: "Kingside destruction, open diagonals, rapid piece deployment",
    whenToUse: "Against Dutch Defense (1...f5) players to break their defensive setup on move 2.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Shatters Black's f5 pawn control immediately.",
      "Gains open e- and f-files.",
      "Bishops on Bd3 and Bg5 attack Black's uncastled king."
    ],
    disadvantages: [
      "Black can hold the extra pawn with 2...fxe4 3.Nc3 Nf6 4.Bg5 g6!"
    ],
    commonTraps: [
      "2...fxe4 3.Nc3 Nf6 4.Bg5 c6 5.f3 exf3 6.Nxf3 d5 7.Bd3 Bg4 8.O-O with massive development."
    ],
    moves: ["d4", "f5", "e4"],
    explanations: [
      "1.d4 f5 Dutch Defense.",
      "THE STAUNTON GAMBIT! White plays 2.e4!, sacrificing a central pawn to attack Black's weakened e8-h5 diagonal."
    ],
    acceptedVariation: {
      name: "Staunton Accepted (2...fxe4 3.Nc3 Nf6 4.Bg5)",
      moves: ["d4", "f5", "e4", "fxe4", "Nc3", "Nf6", "Bg5"],
      explanation: "Black accepts. White develops Nc3 and Bg5, pinning Black's f6 knight and threatening f3."
    },
    declinedVariation: {
      name: "Staunton Declined (2...d6)",
      moves: ["d4", "f5", "e4", "d6"],
      explanation: "Black declines, transposing into Balogh Defense lines."
    },
    popularVariations: [
      "Alekhine Variation (4.g4)",
      "Lazard Variation (4.Bg5 c6)"
    ],
    strategicIdeas: [
      "Opening the e1-h4 and c1-h6 diagonals against Black's king.",
      "Using Bd3 and Bg5 to pin and destroy Black's f6 knight.",
      "Castling kingside or queenside for major piece invasion."
    ],
    tacticalMotifs: [
      "Qh5+ checks exploiting f5 weakness.",
      "Bxf6 followed by Qh5+ and Qxg4.",
      "F3 pawn levers."
    ],
    commonMistakes: [
      "Black playing 3...e6? allowing 4.Nxe4 with central domination for White."
    ],
    bestResponses: [
      "2...fxe4 3.Nc3 Nf6 4.Bg5 g6! (Modern Line) preparing Bg7."
    ],
    typicalCheckmatePatterns: [
      "Qh5+ followed by Bxg6# checkmate."
    ],
    middlegamePlans: [
      "Play f3 or g4 to open additional kingside lines.",
      "Develop Bd3, Qd2, and castle queenside (O-O-O).",
      "Launch a major piece assault along open e- and f-files."
    ],
    endgameIdeas: [
      "White must generate middlegame tactics before Black consolidates the pawn."
    ],
    famousGames: [
      "Howard Staunton vs Horatio Phillips, London 1847"
    ],
    grandmasterExamples: ["Howard Staunton", "Alexander Alekhine"],
    practicePosition: {
      fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      prompt: "Black played 1...f5 (Dutch Defense). Strike back with 2.e4 to play the Staunton Gambit.",
      solution: ["e4"]
    },
    quiz: {
      question: "What structural weakness in Black's position does the Staunton Gambit (2.e4) exploit?",
      options: [
        "The weakened e8-h5 diagonal caused by 1...f5",
        "The a8-h1 long diagonal",
        "The b7 pawn",
        "The c7 square"
      ],
      answer: "The weakened e8-h5 diagonal caused by 1...f5",
      explanation: "Playing 1...f5 weakens the e8-h5 diagonal pointing at Black's king. By playing 2.e4, White opens lines to exploit this diagonal with Qh5+ checks."
    }
  },
  {
    id: "icelandic-gambit",
    name: "Icelandic Gambit",
    eco: "B01",
    category: "Scandinavian Defense",
    difficulty: "Intermediate",
    side: "Black",
    shortDesc: "In the 2...Nf6 Scandinavian, Black offers e6 (1.e4 d5 2.exd5 Nf6 3.c4 e6!) to gain rapid development and active pieces.",
    estimatedTime: "10 mins",
    popularity: 75,
    successRate: 50,
    history: "Analyzed by Icelandic masters in the 1970s. A respected surprise weapon against 3.c4 in the Scandinavian.",
    inventor: "Icelandic Grandmasters",
    playingStyle: "Fast piece mobilization, open central lines, bishop activity",
    whenToUse: "Against 1.e4 d5 2.exd5 Nf6 3.c4 players who greedily try to hold onto the d5 pawn.",
    recommendedSkillLevel: "1000 - 1800 Elo",
    advantages: [
      "Punishes White's greedy 3.c4 pawn hold.",
      "Both bishops gain open, active diagonals.",
      "Prepares rapid kingside castling."
    ],
    disadvantages: [
      "White can return the pawn with 4.dxe6 Bxe6 5.Nf3! for solid equality."
    ],
    commonTraps: [
      "4.dxe6 Bxe6 5.d3 Bc5 6.Nf3 Nc6 7.Be2 Qe7 8.O-O O-O-O with massive development for Black."
    ],
    moves: ["e4", "d5", "exd5", "Nf6", "c4", "e6"],
    explanations: [
      "1.e4 d5 Scandinavian Defense.",
      "2.exd5 Nf6 3.c4 White tries to hold d5 with the c-pawn.",
      "THE ICELANDIC GAMBIT! Black strikes with 3...e6!, offering a second pawn to open lines for Bc5 and Qe7."
    ],
    acceptedVariation: {
      name: "Icelandic Accepted (4.dxe6 Bxe6 5.Nf3)",
      moves: ["e4", "d5", "exd5", "Nf6", "c4", "e6", "dxe6", "Bxe6", "Nf3"],
      explanation: "White takes 4.dxe6. Black recaptures 4...Bxe6, gaining active bishops on e6 and c5."
    },
    declinedVariation: {
      name: "White Transposition (4.d4)",
      moves: ["e4", "d5", "exd5", "Nf6", "c4", "e6", "d4"],
      explanation: "White transposes into Panov-Botvinnik Attack setups with 4.d4."
    },
    popularVariations: [
      "Accepted: 5.Nf3 Bc5 6.d3",
      "Accepted: 5.d4 Bb4+ 6.Bd2"
    ],
    strategicIdeas: [
      "Punishing White's weakened d3/d4 light squares after 3.c4.",
      "Placing Bc5 pointing directly at f2.",
      "Castling queenside (O-O-O) to place a rook on the d-file."
    ],
    tacticalMotifs: [
      "Bxf2+ sacrifices.",
      "Bb4+ checks and pins.",
      "Rxd3/Rxd4 sacrifices."
    ],
    commonMistakes: [
      "White playing 5.d3? allowing Black's Bc5 and O-O-O with a crushing attack."
    ],
    bestResponses: [
      "4.dxe6 Bxe6 5.Nf3! Qe7 6.Be2! Bxc4 7.Nc3!"
    ],
    typicalCheckmatePatterns: [
      "Bxf2+ followed by Ng4+ and Qe3#."
    ],
    middlegamePlans: [
      "Black plays Bc5, Nc6, Qe7, and O-O-O.",
      "Press White's backward d-pawn along the d-file."
    ],
    endgameIdeas: [
      "White holds an extra pawn if White survives Black's middlegame pressure."
    ],
    famousGames: [
      "Johann Hjartarson vs Various Masters, Reykjavik 1985"
    ],
    grandmasterExamples: ["Johann Hjartarson", "Margeir Petursson"],
    practicePosition: {
      fen: "rnbqkb1r/ppp1pppp/5n2/3P4/2P5/8/PP1P1PPP/RNBQKBNR b KQkq - 0 3",
      prompt: "White played 3.c4 trying to hold the pawn. Offer the Icelandic Gambit with 3...e6.",
      solution: ["e6"]
    },
    quiz: {
      question: "What positional weakness does White create by playing 3.c4 in the Scandinavian Defense?",
      options: [
        "Weakens the d3 and d4 squares, making it hard to defend the d-file after Black plays 3...e6! and 4...Bxe6",
        "Loses the queen",
        "Traps the light-squared bishop",
        "Weakens the h1-a8 diagonal"
      ],
      answer: "Weakens the d3 and d4 squares, making it hard to defend the d-file after Black plays 3...e6! and 4...Bxe6",
      explanation: "By playing 3.c4, White moves a pawn away from controlling d3 and d4. When Black opens lines with 3...e6!, Black's pieces dominate the weakened d-file and light squares."
    }
  },
  {
    id: "tennison-gambit",
    name: "Tennison Gambit",
    eco: "A06",
    category: "Flank Opening",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "White starts 1.Nf3 d5 2.e4!? (or 1.e4 d5 2.Nf3 dxe4 3.Ng5), offering an e-pawn to trap Black's queen on move 6.",
    estimatedTime: "10 mins",
    popularity: 82,
    successRate: 50,
    history: "Invented by Otto Tennison in 1891. Famous in modern internet chess as the 'ICBM Gambit' (Intercontinental Ballistic Missile).",
    inventor: "Otto M. Tennison",
    playingStyle: "Surprise knight jumps, queen-hunting, tactical traps",
    whenToUse: "In blitz games against 1...d5 to catch opponents in the move-6 ICBM queen trap.",
    recommendedSkillLevel: "800 - 1800 Elo",
    advantages: [
      "Contains the viral move-6 ICBM queen trap (Nxf7!).",
      "Takes 1.Nf3 or 1.e4 d5 players completely out of book.",
      "Gains rapid development."
    ],
    disadvantages: [
      "If Black defends calmly with 3...e5! or 3...Nf6 4.d3 exd3, Black retains an extra pawn."
    ],
    commonTraps: [
      "ICBM Trap: 1.Nf3 d5 2.e4 dxe4 3.Ng5 Nf6 4.d3 exd3 5.Bxd3 h6?? 6.Nxf7! Kxf7 7.Bg6+! Kxg6 8.Qxd8 winning Black's queen!"
    ],
    moves: ["Nf3", "d5", "e4", "dxe4", "Ng5"],
    explanations: [
      "1.Nf3 d5 Reti/Scandinavian setup.",
      "THE TENNISON GAMBIT! White offers 2.e4!?",
      "2...dxe4 Black captures.",
      "3.Ng5 White leaps the knight to g5, targeting e4 and f7."
    ],
    acceptedVariation: {
      name: "ICBM Main Line (3...Nf6 4.d3 exd3 5.Bxd3)",
      moves: ["Nf3", "d5", "e4", "dxe4", "Ng5", "Nf6", "d3", "exd3", "Bxd3"],
      explanation: "White recaptures 5.Bxd3, setting up the deadly 6.Nxf7! trap if Black plays h6??"
    },
    declinedVariation: {
      name: "Tennison Refusal (2...e5)",
      moves: ["Nf3", "d5", "e4", "e5"],
      explanation: "Black declines, transposing into King's Pawn Open Game lines."
    },
    popularVariations: [
      "Main Line ICBM: 5.Bxd3 h6?? 6.Nxf7!",
      "Modern Line: 3...e5 4.Nxe4 f5"
    ],
    strategicIdeas: [
      "Luring Black into playing 5...h6?? to execute the 6.Nxf7! knight sacrifice.",
      "Using Bg6+ discovered attacks to win Black's queen.",
      "Developing Nc3 and Bc4 if Black avoids the trap."
    ],
    tacticalMotifs: [
      "Nxf7 sacrifice.",
      "Bg6+ discovered attack winning the queen.",
      "Bxf7+ king drag."
    ],
    commonMistakes: [
      "Black playing 5...h6?? walking straight into the ICBM trap."
    ],
    bestResponses: [
      "3...e5! 4.Nxe4 f5! or 3...Nf6 4.d3 e3! returning the pawn."
    ],
    typicalCheckmatePatterns: [
      "Qxd8+ followed by quick piece mates."
    ],
    middlegamePlans: [
      "Win Black's queen on move 8 and convert the material.",
      "If Black plays 5...e6, play Nc3, Qe2, and O-O-O."
    ],
    endgameIdeas: [
      "White wins easily after capturing Black's queen on d8."
    ],
    famousGames: [
      "Otto Tennison vs Various Players, 1891"
    ],
    grandmasterExamples: ["Otto M. Tennison"],
    practicePosition: {
      fen: "rnbqkbnr/ppp1pppp/8/3P4/4p3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      prompt: "Black captured 2...dxe4. Leap your knight to g5 to launch the Tennison Gambit.",
      solution: ["Ng5"]
    },
    quiz: {
      question: "What famous queen-winning tactic occurs if Black plays 5...h6?? after 3...Nf6 4.d3 exd3 5.Bxd3 in the Tennison Gambit?",
      options: [
        "6.Nxf7! Kxf7 7.Bg6+! Kxg6 8.Qxd8, winning Black's queen",
        "6.Bxf7+ Kxf7 7.Ne6",
        "6.Qe2",
        "6.O-O"
      ],
      answer: "6.Nxf7! Kxf7 7.Bg6+! Kxg6 8.Qxd8, winning Black's queen",
      explanation: "The viral ICBM Trap! 6.Nxf7! attacks queen and rook. If 6...Kxf7, 7.Bg6+! checks the king. When Black takes 7...Kxg6, White's queen captures Black's undefended queen on d8!"
    }
  },
  {
    id: "jerome-gambit",
    name: "Jerome Gambit",
    eco: "C50",
    category: "Italian Game",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "An infamous double piece sacrifice in the Giuoco Piano (1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.Bxf7+!? Kxf7 5.Nxe5+!?) for raw tactical madness.",
    estimatedTime: "10 mins",
    popularity: 55,
    successRate: 40,
    history: "Created by Alonzo Wheeler Jerome of Iowa in 1874. One of the wilder double piece sacrifices in chess history.",
    inventor: "Alonzo Wheeler Jerome",
    playingStyle: "Wild double-piece sacrifice, king drag, total tactical chaos",
    whenToUse: "In casual blitz games when you want to drag Black's king to e6 on move 5 and create utter board chaos.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Drags Black's king to e6 or f7 on move 5.",
      "Creates an extreme, unpredictable tactical environment.",
      "High psychological surprise value."
    ],
    disadvantages: [
      "White is down two minor pieces for two pawns.",
      "If Black defends calmly, White is lost."
    ],
    commonTraps: [
      "4.Bxf7+ Kxf7 5.Nxe5+ Nxe5 6.Qh5+ Ke6 7.Qf5+ Kd6 8.f4 Qf6 9.fxe5+ Qxe5 10.Qxf8+ with dynamic chaos."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "Bxf7+", "Kxf7", "Nxe5+"],
    explanations: [
      "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 Giuoco Piano setup.",
      "4.Bxf7+! White sacrifices the bishop on f7!",
      "Black captures 4...Kxf7.",
      "THE JEROME GAMBIT! White sacrifices a second piece with 5.Nxe5+!, dragging Black's king further into the center!"
    ],
    acceptedVariation: {
      name: "Jerome Accepted (5...Nxe5 6.Qh5+ Ke6)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "Bxf7+", "Kxf7", "Nxe5+", "Nxe5", "Qh5+", "Ke6"],
      explanation: "Black accepts both sacrifices. White plays 6.Qh5+ and 7.Qf5+ to hunt Black's king on e6."
    },
    declinedVariation: {
      name: "Jerome King Retreat (5...Ke8)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "Bxf7+", "Kxf7", "Nxe5+", "Ke8"],
      explanation: "Black retreats the king to e8, returning material to stay safe."
    },
    popularVariations: [
      "King Walk Line: 6.Qh5+ Ke6 7.Qf5+ Kd6 8.f4",
      "Retreat Line: 5...Ke8 6.Qh5+ g6 7.Nxg6"
    ],
    strategicIdeas: [
      "Sacrificing two pieces to draw Black's king out to e6/d6.",
      "Using Qh5+, Qf5+, and f4 to relentlessly harass Black's king.",
      "Creating central line openings with d4."
    ],
    tacticalMotifs: [
      "Double piece sacrifice.",
      "King drag to e6/d6.",
      "f4 and d4 pawn levers."
    ],
    commonMistakes: [
      "Playing too slowly as White after move 6."
    ],
    bestResponses: [
      "5...Nxe5 6.Qh5+ Ke6 7.Qf5+ Kd6 8.f4 Qf6! defending smoothly."
    ],
    typicalCheckmatePatterns: [
      "f4 + d4 + Nc3 mating nets on Black's exposed king."
    ],
    middlegamePlans: [
      "Push f4 and d4, develop Nc3 and O-O.",
      "Keep Black's king trapped in the center."
    ],
    endgameIdeas: [
      "Black wins easily in the endgame due to two extra minor pieces."
    ],
    famousGames: [
      "Alonzo Jerome vs NN, Iowa 1874"
    ],
    grandmasterExamples: ["Alonzo Wheeler Jerome"],
    practicePosition: {
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      prompt: "White played 3...Bc5. Launch the Jerome Gambit by playing 4.Bxf7+!",
      solution: ["Bxf7+"]
    },
    quiz: {
      question: "What two minor pieces does White sacrifice on moves 4 and 5 in the Jerome Gambit?",
      options: [
        "Light-squared Bishop on f7 (Bxf7+) and Knight on e5 (Nxe5+)",
        "Dark-squared Bishop and Queen",
        "Two Rooks",
        "Knight and Queen"
      ],
      answer: "Light-squared Bishop on f7 (Bxf7+) and Knight on e5 (Nxe5+)",
      explanation: "In the Jerome Gambit, White plays 4.Bxf7+! (sacrificing the bishop) and after 4...Kxf7, plays 5.Nxe5+! (sacrificing the knight) to drag Black's king out to e6."
    }
  },
  {
    id: "rice-gambit",
    name: "Rice Gambit",
    eco: "C39",
    category: "King's Pawn Opening",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "In the Kieseritzky King's Gambit, White sacrifices a Knight on e8 (8.O-O!?) leaving the knight hanging on e5 to gain open files.",
    estimatedTime: "15 mins",
    popularity: 55,
    successRate: 42,
    history: "Financed by Isaac Rice in 1900. Rice spent a fortune organizing international tournaments dedicated solely to analyzing this knight sacrifice.",
    inventor: "Isaac Rice",
    playingStyle: "Knight sacrifice, rook lift, total romantic tactical defense",
    whenToUse: "To experience a historical 1900s theme gambit that created dedicated chess research societies.",
    recommendedSkillLevel: "1400 - 2400 Elo",
    advantages: [
      "Gains open e-file with Re1.",
      "Bb5 and d4 create heavy tactical pin threats.",
      "Black's king is pinned under fire."
    ],
    disadvantages: [
      "Deep engine analysis proves Black is winning with 8...Bxe5! 9.Re1 Qe7 10.c3 Nd7!"
    ],
    commonTraps: [
      "8.O-O Bxe5 9.Re1 Qe7 10.c3 Nc6 11.d4 Bxh2+ 12.Kxh2 with wild tactics."
    ],
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6", "Bc4", "d5", "exd5", "Bd6", "O-O"],
    explanations: [
      "e4 e5 King's Gambit.",
      "f4 exf4 3.Nf3 g5 4.h4 g4 5.Ne5 Kieseritzky setup.",
      "5...Nf6 6.Bc4 d5 7.exd5 Bd6 standard Kieseritzky defense.",
      "THE RICE GAMBIT! White plays 8.O-O!, leaving the e5 knight undefended to castle and open the e-file!"
    ],
    acceptedVariation: {
      name: "Rice Gambit Accepted (8...Bxe5 9.Re1 Qe7 10.c3)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6", "Bc4", "d5", "exd5", "Bd6", "O-O", "Bxe5", "Re1", "Qe7", "c3"],
      explanation: "Black takes 8...Bxe5. White plays 9.Re1, pinning the bishop against Black's queen on e7."
    },
    declinedVariation: {
      name: "Rice Gambit Declined (8...O-O)",
      moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6", "Bc4", "d5", "exd5", "Bd6", "O-O", "O-O"],
      explanation: "Black declines the knight and castles to safety."
    },
    popularVariations: [
      "Jasnogrodsky Defense (10...Nh5)",
      "Lasker Defense (10...Nd7)"
    ],
    strategicIdeas: [
      "Sacrificing the e5 knight to open the e-file for Re1.",
      "Pinning Black's e5 bishop against the king/queen.",
      "Using d4 and Bb5 to maintain tactical pins."
    ],
    tacticalMotifs: [
      "Re1 pins along the e-file.",
      "Bxh2+ counter-sacrifices for Black.",
      "Bb5 pin combinations."
    ],
    commonMistakes: [
      "Failing to play 9.Re1! after 8...Bxe5."
    ],
    bestResponses: [
      "8...Bxe5 9.Re1 Qe7 10.c3 Nh5! (Jasnogrodsky Defense)."
    ],
    typicalCheckmatePatterns: [
      "Re1 + Bb5 + d6 crushing e-file checkmates."
    ],
    middlegamePlans: [
      "Play Re1, d4, c3, and Bb5.",
      "Recapture on f4 or break Black's e7 queen pin."
    ],
    endgameIdeas: [
      "Black wins if Black neutralizes the e-file pin."
    ],
    famousGames: [
      "Emanuel Lasker vs Mikhail Chigorin, Rice Tournament 1904"
    ],
    grandmasterExamples: ["Isaac Rice", "Emanuel Lasker", "Mikhail Chigorin"],
    practicePosition: {
      fen: "rnbqk2r/ppp2p1p/3b1n2/3PN3/2B2ppP/8/PPPP2P1/RNBQ1RK1 b kq - 1 8",
      prompt: "White castled (8.O-O), leaving the e5 knight hanging. Capture the knight with 8...Bxe5.",
      solution: ["Bxe5"]
    },
    quiz: {
      question: "Why did American industrialist Isaac Rice fund entire international tournaments in the early 1900s?",
      options: [
        "To test and analyze his signature knight sacrifice 8.O-O in the Rice Gambit",
        "To promote speed chess",
        "To ban the King's Gambit",
        "To invent atomic chess"
      ],
      answer: "To test and analyze his signature knight sacrifice 8.O-O in the Rice Gambit",
      explanation: "Isaac Rice created the 'Rice Gambit Association' and funded tournaments featuring World Champions like Lasker and Chigorin specifically to analyze his 8.O-O knight sacrifice!"
    }
  },
  {
    id: "greco-gambit",
    name: "Greco Gambit",
    eco: "C54",
    category: "Italian Game",
    difficulty: "Intermediate",
    side: "White",
    shortDesc: "In the Italian Game, White plays 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Nc3 Nxe4 8.O-O!, offering a full piece for an explosive central attack.",
    estimatedTime: "12 mins",
    popularity: 84,
    successRate: 52,
    history: "Analyzed by Italian master Gioachino Greco in 1620. One of the classic mating attack models taught to chess students for centuries.",
    inventor: "Gioachino Greco",
    playingStyle: "Classical tactical storm, piece sacrifices, d5 push",
    whenToUse: "Against Italian Game (3...Bc5) players to launch a brilliant, classical tactical attack.",
    recommendedSkillLevel: "1000 - 2000 Elo",
    advantages: [
      "Immense development lead after 8.O-O!",
      "Opens e-file for Re1 targeting Black's uncastled king.",
      "Pushing d5 fractures Black's knight coordination."
    ],
    disadvantages: [
      "Black can defend with 8...Bxc3! 9.d5 Bf6! 10.Re1 Ne7 11.Rxe4 d6."
    ],
    commonTraps: [
      "8.O-O! Nxc3? 9.bxc3 Bxc3? 10.Qb3! Bxa1? 11.Bxf7+ Kf8 12.Bg5 winning Black's queen."
    ],
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+", "Nc3", "Nxe4", "O-O"],
    explanations: [
      "e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 Italian Game.",
      "4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ standard center clash.",
      "7.Nc3 Nxe4 White develops Nc3, leaving e4 hanging.",
      "THE GRECO GAMBIT! White plays 8.O-O!, ignoring the knight on e4 to castle and open the e-file!"
    ],
    acceptedVariation: {
      name: "Greco Double Accept (8...Nxc3 9.bxc3 Bxc3 10.Qb3)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+", "Nc3", "Nxe4", "O-O", "Nxc3", "b3", "Bxc3", "Qb3"],
      explanation: "Black takes everything! White responds 10.Qb3, setting up a crushing double attack on f7 and a1."
    },
    declinedVariation: {
      name: "Moller Attack Refusal (8...Bxc3 9.d5 Bf6)",
      moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+", "Nc3", "Nxe4", "O-O", "Bxc3", "d5", "Bf6"],
      explanation: "Black returns material with 9...Bf6, neutralizing White's attack cleanly."
    },
    popularVariations: [
      "Möller Attack (9.d5)",
      "Greco Main Line (10.Qb3)",
      "Bernstein Line (8...Nxc3 9.bxc3 d5)"
    ],
    strategicIdeas: [
      "Sacrificing material for open e-file and d-file access.",
      "Using Qb3 and Bc4 to double-team the f7 pawn.",
      "Pushing d5 to drive away Black's defending Nc6 knight."
    ],
    tacticalMotifs: [
      "Bxf7+ sacrifices.",
      "Bg5 pins against the queen.",
      "Re1 pins along the open e-file."
    ],
    commonMistakes: [
      "Black playing 9...Bxa1? taking the rook and walking straight into 10.Bxf7+ Kf8 11.Bg5! losing the queen."
    ],
    bestResponses: [
      "8...Bxc3! 9.d5 Bf6! 10.Re1 Ne7 11.Rxe4 d6 (Möller Defense)."
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Bg5 and Re8# checkmating nets."
    ],
    middlegamePlans: [
      "Play 9.d5, Re1, and Bg5.",
      "Infiltrate with major pieces along the open e-file."
    ],
    endgameIdeas: [
      "White must deliver checkmate in the middlegame before Black consolidates."
    ],
    famousGames: [
      "Gioachino Greco vs NN, Rome 1620"
    ],
    grandmasterExamples: ["Gioachino Greco", "Jopen Möller", "Paul Morphy"],
    practicePosition: {
      fen: "r1bqk2r/pppp1ppp/2n5/2b5/1b1Pn3/2N2N2/PP3PPP/R1BQ1RK1 b kq - 1 8",
      prompt: "White castled (8.O-O) leaving e4 undefended. Capture on c3 with 8...Nxc3 to enter Greco's main trap line.",
      solution: ["Nxc3"]
    },
    quiz: {
      question: "What is White's key queen move after 8.O-O! Nxc3 9.bxc3 Bxc3 in the Greco Gambit?",
      options: [
        "10.Qb3!, creating a double threat on f7 and a1",
        "10.Rb1, saving the rook",
        "10.Ba3, pinning the pawn",
        "10.Qd3, threatening h7"
      ],
      answer: "10.Qb3!, creating a double threat on f7 and a1",
      explanation: "10.Qb3! is Greco's brilliant move. It threatens 11.Bxf7+ while ignoring the a1 rook. If 10...Bxa1?, 11.Bxf7+ Kf8 12.Bg5! traps Black's queen!"
    }
  },
  {
    id: "orthoschnapp-gambit",
    name: "Orthoschnapp Gambit",
    eco: "B00",
    category: "French Defense",
    difficulty: "Advanced",
    side: "White",
    shortDesc: "Against the French Defense (1.e4 e6), White plays 2.c4 d5 3.cxd5 exd5 4.Qb3!?, offering the d4/e4 pawns for rapid queenside activity.",
    estimatedTime: "10 mins",
    popularity: 50,
    successRate: 42,
    history: "A rare blitz surprise weapon against the French Defense designed to dislodge Black's standard pawn structure.",
    inventor: "Blitz Analysts",
    playingStyle: "Offbeat surprise, queen centralization, diagonal harassment",
    whenToUse: "In casual blitz games to completely catch French Defense players off-guard on move 4.",
    recommendedSkillLevel: "1200 - 2000 Elo",
    advantages: [
      "Bypasses all mainstream French Defense theory.",
      "Qb3 exerts immediate pressure on b7 and d5.",
      "Creates early open files."
    ],
    disadvantages: [
      "Black can defend calmly with 4...dxe4 5.Bc4 Qe7! holding an extra pawn."
    ],
    commonTraps: [
      "4...dxe4 5.Bc4 Qe7 6.Nc3 Nf6 7.d3 exd3+ 8.Be3 with active development."
    ],
    moves: ["e4", "e6", "c4", "d5", "cxd5", "exd5", "Qb3"],
    explanations: [
      "1.e4 e6 French Defense.",
      "2.c4 d5 3.cxd5 exd5 White opens the c-file.",
      "THE ORTHOSCHNAPP GAMBIT! White plays 4.Qb3!?, leaving e4 hanging to pressure b7 and f7."
    ],
    acceptedVariation: {
      name: "Orthoschnapp Accepted (4...dxe4 5.Bc4 Qe7)",
      moves: ["e4", "e6", "c4", "d5", "cxd5", "exd5", "Qb3", "dxe4", "Bc4", "Qe7"],
      explanation: "Black takes 4...dxe4. White plays 5.Bc4 targeting f7, and Black defends with 5...Qe7."
    },
    declinedVariation: {
      name: "Orthoschnapp Solid (4...Nf6)",
      moves: ["e4", "e6", "c4", "d5", "cxd5", "exd5", "Qb3", "Nf6"],
      explanation: "Black develops 4...Nf6, reinforcing d5 and maintaining a solid position."
    },
    popularVariations: [
      "Accepted: 5.Bc4 Qe7 6.Nc3",
      "Declined: 4...c6"
    ],
    strategicIdeas: [
      "Using Qb3 to target b7 and f7 simultaneously.",
      "Placing Bc4 to lock onto f7.",
      "Opening lines for Nc3 and Nf3."
    ],
    tacticalMotifs: [
      "Bxf7+ sacrifices.",
      "Qb7 pawn captures.",
      "Nc3-d5 central jumps."
    ],
    commonMistakes: [
      "Playing 5.Qxb7?? allowing 5...Qd4! with counter-play."
    ],
    bestResponses: [
      "4...dxe4 5.Bc4 Qe7 6.Nc3 Nf6 7.d3 Nc6!"
    ],
    typicalCheckmatePatterns: [
      "Bxf7+ followed by Nd5 and Qe6#."
    ],
    middlegamePlans: [
      "Play Nc3, Nf3, d3, and castle kingside.",
      "Target Black's f7 pawn with Bc4 and Qb3."
    ],
    endgameIdeas: [
      "Black holds a pawn advantage in the endgame if White fails to generate tactics."
    ],
    famousGames: [
      "Engine Blitz Showdown, 2018"
    ],
    grandmasterExamples: ["Blitz Specialists"],
    practicePosition: {
      fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq - 0 3",
      prompt: "In the French Defense, after 3.cxd5 exd5, play 4.Qb3 to launch the Orthoschnapp Gambit.",
      solution: ["Qb3"]
    },
    quiz: {
      question: "What two squares does White's queen target upon playing 4.Qb3 in the Orthoschnapp Gambit?",
      options: [
        "b7 and d5 (and indirectly pressure f7 in tandem with Bc4)",
        "a7 and h7",
        "g2 and h2",
        "c1 and d1"
      ],
      answer: "b7 and d5 (and indirectly pressure f7 in tandem with Bc4)",
      explanation: "4.Qb3 immediately targets Black's b7 pawn and d5 pawn, while preparing Bc4 to form a double assault against f7."
    }
  },
  {
    id: "von-hennig-schara-gambit",
    name: "Von Hennig-Schara Gambit",
    eco: "D32",
    category: "Queen's Gambit",
    difficulty: "Advanced",
    side: "Black",
    shortDesc: "In the Queen's Gambit Tarrasch, Black offers a central pawn (1.d4 d5 2.c4 e6 3.Nc3 c5 4.cxd5 cxd4!?) for explosive piece activity and open central lines.",
    estimatedTime: "12 mins",
    popularity: 76,
    successRate: 50,
    history: "Invented independently by Heinrich von Hennig (1912) and Anton Schara (1918). A respected, dangerous counter-weapon against 1.d4.",
    inventor: "Heinrich von Hennig & Anton Schara",
    playingStyle: "Explosive piece activity, open central lines, tactical initiative",
    whenToUse: "Against 1.d4 2.c4 players to hijack the initiative and force White into active defensive calculation.",
    recommendedSkillLevel: "1200 - 2200 Elo",
    advantages: [
      "Black gets rapid development with Bb4, Nf6, and O-O.",
      "White's d5 pawn can become weak.",
      "Destroys White's standard Queen's Gambit plans."
    ],
    disadvantages: [
      "White can hold the extra pawn with 5.Qxd4 Nc6 6.Qd1 exd5 7.Qxd5 Be6! 8.Qxd8+ Rxd8 9.e3!"
    ],
    commonTraps: [
      "5.Qxd4 Nc6 6.Qd1 exd5 7.Qxd5 Be6 8.Qb5? a6! 9.Qxb7?? Nd4! with a winning attack for Black."
    ],
    moves: ["d4", "d5", "c4", "e6", "Nc3", "c5", "cxd5", "cxd4"],
    explanations: [
      "1.d4 d5 2.c4 e6 Queen's Gambit Declined.",
      "3.Nc3 c5 Tarrasch Defense setup.",
      "4.cxd5 cxd4! THE VON HENNIG-SCHARA GAMBIT! Black ignores White's capture on d5 and pushes 4...cxd4! to open lines."
    ],
    acceptedVariation: {
      name: "Main Line (5.Qxd4 Nc6 6.Qd1 exd5)",
      moves: ["d4", "d5", "c4", "e6", "Nc3", "c5", "cxd5", "cxd4", "Qxd4", "Nc6", "Qd1", "exd5"],
      explanation: "White takes 5.Qxd4. Black plays 5...Nc6 and 6...exd5, obtaining huge development for one pawn."
    },
    declinedVariation: {
      name: "Knight Line (5.Qa4+ Bd7 6.Qxd4 exd5)",
      moves: ["d4", "d5", "c4", "e6", "Nc3", "c5", "cxd5", "cxd4", "Qa4+", "Bd7", "Qxd4", "exd5"],
      explanation: "White gives check with 5.Qa4+, returning the pawn for simpler development."
    },
    popularVariations: [
      "Main Line: 5.Qxd4 Nc6 6.Qd1 exd5 7.Qxd5 Be6",
      "Endgame Line: 8.Qxd8+ Rxd8 9.e3 a6"
    ],
    strategicIdeas: [
      "Sacrificing a pawn for rapid piece development (Nc6, Bb4, Nf6).",
      "Using open d- and c-files for rook invasion.",
      "Exploiting White's weak light squares on the queenside."
    ],
    tacticalMotifs: [
      "Nd4 knight forks on c2.",
      "Bb4+ checks and pins.",
      "Rxd5 sacrifices."
    ],
    commonMistakes: [
      "White playing 8.Qb5? in the main line, walking straight into 8...a6! and 9...Nd4!"
    ],
    bestResponses: [
      "5.Qxd4 Nc6 6.Qd1 exd5 7.Qxd5 Be6 8.Qxd8+ Rxd8 9.e3! a6 10.Bd2!"
    ],
    typicalCheckmatePatterns: [
      "Nc2+ king hunt ending in back-rank or corner checkmates."
    ],
    middlegamePlans: [
      "Black plays Nc6, Nf6, Bc5/Bb4, Be6, and O-O.",
      "Invade along the open d-file with Rooks."
    ],
    endgameIdeas: [
      "Even in queenless endgames, Black's lead in development gives huge winning chances!"
    ],
    famousGames: [
      "Anton Schara vs Ernst Grünfeld, Vienna 1918",
      "Alexander Alekhine vs Heinrich von Hennig, 1912"
    ],
    grandmasterExamples: ["Anton Schara", "Heinrich von Hennig", "Alexander Alekhine", "Lev Aronian"],
    practicePosition: {
      fen: "rnbqkbnr/pp3ppp/4p3/2pP4/2pP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4",
      prompt: "White captured 4.cxd5 in the Tarrasch. Strike back with 4...cxd4! to enter the Von Hennig-Schara Gambit.",
      solution: ["cxd4"]
    },
    quiz: {
      question: "What is Black's primary counter-attacking idea after 4.cxd5 in the Von Hennig-Schara Gambit?",
      options: [
        "4...cxd4!, ignoring the d5 capture to push d4 and gain rapid piece development",
        "4...exd5, playing passively",
        "4...Nf6, losing the c5 pawn for nothing",
        "4...Qxd5, getting the queen trapped"
      ],
      answer: "4...cxd4!, ignoring the d5 capture to push d4 and gain rapid piece development",
      explanation: "4...cxd4! is the core move. Instead of recapturing on d5, Black pushes 4...cxd4!, disrupting White's pawn center and opening the d-file for Nc6, Be6, and Rxd8."
    }
  }
];
