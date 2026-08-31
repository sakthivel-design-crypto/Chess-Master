export interface BoardThemeConfig {
  id: string;
  name: string;
  subtitle: string;
  lightSquare: string;
  darkSquare: string;
  lightText?: string;
  darkText?: string;
  frameGradient: string;
  frameBorder: string;
  highlightAccent: string;
  description: string;
  styleTag: string;
}

export interface PieceStyleConfig {
  id: string;
  name: string;
  description: string;
  styleClass: string;
}

export const BOARD_THEMES: BoardThemeConfig[] = [
  {
    id: "classic_wood",
    name: "Classic Wood",
    subtitle: "Theme 1",
    lightSquare: "#F0D9B5",
    darkSquare: "#B58863",
    lightText: "text-[#B58863]",
    darkText: "text-[#F0D9B5]",
    frameGradient: "from-[#4e342e] via-[#3e2723] to-[#261714]",
    frameBorder: "border-[#3e2723]",
    highlightAccent: "#f7ec59",
    description: "Traditional wooden tournament chessboard.",
    styleTag: "Tournament Classic"
  },
  {
    id: "midnight",
    name: "Midnight",
    subtitle: "Theme 2",
    lightSquare: "#3A3F4D",
    darkSquare: "#1A1D24",
    lightText: "text-[#8A90A0]",
    darkText: "text-[#3A3F4D]",
    frameGradient: "from-[#161922] via-[#0E121B] to-[#07090E]",
    frameBorder: "border-[#D4AF37]/40",
    highlightAccent: "#D4AF37",
    description: "Premium dark ChessZen theme with subtle gold highlights.",
    styleTag: "Dark Luxury"
  },
  {
    id: "emerald",
    name: "Emerald",
    subtitle: "Theme 3",
    lightSquare: "#E2EFCB",
    darkSquare: "#4B7354",
    lightText: "text-[#4B7354]",
    darkText: "text-[#E2EFCB]",
    frameGradient: "from-[#1b382b] via-[#122b1f] to-[#0a1c13]",
    frameBorder: "border-[#2d5a42]",
    highlightAccent: "#10b981",
    description: "Elegant classic chess aesthetic with deep green tones.",
    styleTag: "Classic Green"
  },
  {
    id: "ocean",
    name: "Ocean",
    subtitle: "Theme 4",
    lightSquare: "#C4D7E0",
    darkSquare: "#2A4858",
    lightText: "text-[#2A4858]",
    darkText: "text-[#C4D7E0]",
    frameGradient: "from-[#122836] via-[#0b1b26] to-[#051017]",
    frameBorder: "border-[#1e3a4c]",
    highlightAccent: "#38bdf8",
    description: "Modern cool-toned oceanic chessboard.",
    styleTag: "Cool Aquatic"
  },
  {
    id: "royal_gold",
    name: "Royal Gold",
    subtitle: "Theme 5",
    lightSquare: "#F5EBE0",
    darkSquare: "#4A3B32",
    lightText: "text-[#4A3B32]",
    darkText: "text-[#F5EBE0]",
    frameGradient: "from-[#3b2d23] via-[#2a1e16] to-[#18110b]",
    frameBorder: "border-[#E5A93C]",
    highlightAccent: "#E5A93C",
    description: "Luxury ChessZen board with ivory and dark brown squares.",
    styleTag: "Metallic Gold"
  },
  {
    id: "rosewood",
    name: "Rosewood",
    subtitle: "Theme 6",
    lightSquare: "#EAE0D5",
    darkSquare: "#800C0C",
    lightText: "text-[#800C0C]",
    darkText: "text-[#EAE0D5]",
    frameGradient: "from-[#4a0808] via-[#330505] to-[#1f0202]",
    frameBorder: "border-[#800C0C]",
    highlightAccent: "#f43f5e",
    description: "Elegant wooden tournament board with deep crimson brown.",
    styleTag: "Deep Mahogany"
  },
  {
    id: "arctic",
    name: "Arctic",
    subtitle: "Theme 7",
    lightSquare: "#FFFFFF",
    darkSquare: "#738A9C",
    lightText: "text-[#738A9C]",
    darkText: "text-[#FFFFFF]",
    frameGradient: "from-[#2d3748] via-[#1a202c] to-[#0f172a]",
    frameBorder: "border-[#94a3b8]",
    highlightAccent: "#38bdf8",
    description: "Minimal, clean, high-contrast crisp white & slate board.",
    styleTag: "Minimalist High Contrast"
  },
  {
    id: "forest",
    name: "Forest",
    subtitle: "Theme 8",
    lightSquare: "#D8E2DC",
    darkSquare: "#2D5A27",
    lightText: "text-[#2D5A27]",
    darkText: "text-[#D8E2DC]",
    frameGradient: "from-[#1e3a1b] via-[#142812] to-[#0b170a]",
    frameBorder: "border-[#386633]",
    highlightAccent: "#4ade80",
    description: "Natural, soothing sage and deep forest green palette.",
    styleTag: "Organic Relaxing"
  },
  {
    id: "lavender",
    name: "Lavender",
    subtitle: "Theme 9",
    lightSquare: "#E0BBE4",
    darkSquare: "#522B5B",
    lightText: "text-[#522B5B]",
    darkText: "text-[#E0BBE4]",
    frameGradient: "from-[#36183d] via-[#240e29] to-[#130616]",
    frameBorder: "border-[#854f96]",
    highlightAccent: "#c084fc",
    description: "Modern and unique soft lavender and regal purple theme.",
    styleTag: "Modern Purple"
  },
  {
    id: "carbon",
    name: "Carbon",
    subtitle: "Theme 10",
    lightSquare: "#555555",
    darkSquare: "#222222",
    lightText: "text-[#222222]",
    darkText: "text-[#888888]",
    frameGradient: "from-[#1f1f1f] via-[#141414] to-[#090909]",
    frameBorder: "border-[#444444]",
    highlightAccent: "#f59e0b",
    description: "Futuristic carbon-fiber inspired dark matte finish.",
    styleTag: "Futuristic Stealth"
  }
];

export const PIECE_STYLES: PieceStyleConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional Staunton pieces with smooth vector gradients.",
    styleClass: "classic-style"
  },
  {
    id: "modern",
    name: "Modern",
    description: "Sleek geometric minimalist silhouettes.",
    styleClass: "modern-style"
  },
  {
    id: "tournament",
    name: "Tournament",
    description: "Heavy weighted tournament pieces with high contrast.",
    styleClass: "tournament-style"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean outline line-art vector pieces.",
    styleClass: "minimal-style"
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Regal pieces featuring subtle metallic gold highlights.",
    styleClass: "elegant-style"
  },
  {
    id: "3d",
    name: "3D",
    description: "Embossed depth and tactile 3D drop shadows.",
    styleClass: "3d-style"
  }
];

export function getBoardThemeConfig(themeId?: string): BoardThemeConfig {
  if (!themeId) return BOARD_THEMES[0];
  const found = BOARD_THEMES.find((t) => t.id === themeId);
  return found || BOARD_THEMES[0];
}

export function getPieceStyleConfig(styleId?: string): PieceStyleConfig {
  if (!styleId) return PIECE_STYLES[0];
  const found = PIECE_STYLES.find((s) => s.id === styleId);
  return found || PIECE_STYLES[0];
}
