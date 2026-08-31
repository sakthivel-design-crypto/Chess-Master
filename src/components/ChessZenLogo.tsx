import React from "react";

interface ChessZenLogoProps {
  variant?: "full" | "icon" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  theme?: "dark" | "light";
}

export const ChessZenLogo: React.FC<ChessZenLogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
  theme = "dark"
}) => {
  // Symmetrical Queen Silhouette vector matching the new luxury logo
  const queenPathD = `
    M 42 360
    C 42 368, 258 368, 258 360
    C 262 355, 252 344, 236 344
    C 240 338, 232 328, 222 324
    C 212 270, 172 235, 166 195
    C 174 195, 176 186, 170 182
    C 166 178, 172 152, 186 138
    C 208 116, 228 102, 222 84
    A 6.5 6.5 0 1 0 210 84
    C 204 100, 192 110, 180 80
    A 6.5 6.5 0 1 0 168 80
    C 160 98, 154 98, 150 36
    C 146 98, 140 98, 132 80
    A 6.5 6.5 0 1 0 120 80
    C 108 110, 96 100, 90 84
    A 6.5 6.5 0 1 0 78 84
    C 72 102, 92 116, 114 138
    C 128 152, 134 178, 130 182
    C 124 186, 126 195, 134 195
    C 128 235, 88 270, 78 324
    C 68 328, 60 338, 64 344
    C 48 344, 38 355, 42 360
    Z
  `.replace(/\s+/g, " ").trim();

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-20 h-20"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  const isLight = theme === "light";
  const textColor = isLight ? "text-slate-950" : "text-white";

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 300 380"
          className={`${iconSizes[size]} overflow-visible`}
        >
          <defs>
            <linearGradient id="gold-grad-logo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            <clipPath id="queen-clip-logo">
              <path d={queenPathD} />
            </clipPath>
          </defs>

          {/* Queen Body */}
          <path
            d={queenPathD}
            fill={isLight ? "#09090B" : "#F8FAFC"}
          />

          {/* Inner Highlights */}
          <g clipPath="url(#queen-clip-logo)">
            {/* Curved Highlight */}
            <path
              d="M 172 170 C 148 220 144 280 170 318 C 174 322 168 322 164 320 C 138 280 142 220 166 168 Z"
              fill={isLight ? "#FFFFFF" : "#09090B"}
              opacity={0.35}
            />
            {/* Collar Highlight */}
            <path
              d="M 115 190 C 138 185 162 190 162 193 C 138 188 115 193 115 190 Z"
              fill={isLight ? "#FFFFFF" : "#09090B"}
              opacity={0.45}
            />
          </g>

          {/* Thin Gold Accent Collar Line */}
          <path
            d="M 115 195 C 138 190 162 195 185 195"
            fill="none"
            stroke="url(#gold-grad-logo)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {variant !== "icon" && (
        <div className="flex flex-col items-center mt-2 text-center">
          <div className={`${textSizes[size]} font-extrabold font-serif tracking-tight leading-none`}>
            <span className={textColor}>Chess</span>
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Zen
            </span>
          </div>

          {/* Divider with Gold Diamond Ornament Motif */}
          <div className="flex items-center justify-center gap-1.5 mt-1 w-full max-w-[120px] opacity-80">
            <div className={`h-[1px] flex-1 ${isLight ? "bg-slate-800" : "bg-slate-600"}`} />
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-sm" />
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            <div className={`h-[1px] flex-1 ${isLight ? "bg-slate-800" : "bg-slate-600"}`} />
          </div>
        </div>
      )}
    </div>
  );
};
