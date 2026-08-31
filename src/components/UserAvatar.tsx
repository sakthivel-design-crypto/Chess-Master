import React from "react";
import { Crown } from "lucide-react";

export interface UserAvatarProps {
  src?: string | null;
  username?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PRESET_AVATARS = [
  {
    id: "grandmaster_crown",
    name: "Grandmaster Crown",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg1)"/><defs><linearGradient id="bg1" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#3b2d23"/><stop offset="1" stop-color="#0f0c09"/></linearGradient></defs><path d="M25 68h50v6H25z" fill="#D4AF37"/><path d="M28 62l-5-28 17 12 10-18 10 18 17-12-5 28H28z" fill="#F5EBE0" stroke="#D4AF37" stroke-width="2"/><circle cx="23" cy="34" r="3" fill="#D4AF37"/><circle cx="50" cy="28" r="4" fill="#D4AF37"/><circle cx="77" cy="34" r="3" fill="#D4AF37"/></svg>`
  },
  {
    id: "zen_scholar",
    name: "Zen Scholar",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg2)"/><defs><linearGradient id="bg2" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#122836"/><stop offset="1" stop-color="#051017"/></linearGradient></defs><path d="M50 25c-12 0-20 8-20 20 0 8 5 15 12 18v8h16v-8c7-3 12-10 12-18 0-12-8-20-20-20z" fill="#C4D7E0"/><circle cx="42" cy="42" r="3" fill="#122836"/><circle cx="58" cy="42" r="3" fill="#122836"/><path d="M44 52c3 2 9 2 12 0" stroke="#122836" stroke-width="2" stroke-linecap="round"/><path d="M30 75h40v6H30z" fill="#38bdf8"/></svg>`
  },
  {
    id: "ai_bot",
    name: "AI Cyber Bot",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg3)"/><defs><linearGradient id="bg3" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#161922"/><stop offset="1" stop-color="#07090E"/></linearGradient></defs><rect x="28" y="32" width="44" height="36" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/><circle cx="40" cy="50" r="5" fill="#38bdf8"/><circle cx="60" cy="50" r="5" fill="#38bdf8"/><path d="M50 18v14M50 18a4 4 0 100-8 4 4 0 000 8z" fill="#38bdf8" stroke="#38bdf8" stroke-width="2"/><path d="M38 60h24" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: "golden_knight",
    name: "Golden Knight",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg4)"/><defs><linearGradient id="bg4" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#4a3b32"/><stop offset="1" stop-color="#1f1813"/></linearGradient></defs><path d="M48 22c0 0-7 2-14 11-7 9-7 18-7 18s2-4 7-6c0 0 0 9 5 14 0 0 2-7 4-9 0 0 3 11 12 11 9 0 14-9 14-14 0-4 2-7 0-11-2-4-7-9-12-11-5-2-9-3-9-3z" fill="#E5A93C"/><circle cx="44" cy="40" r="3" fill="#1f1813"/><path d="M25 78h50v6H25z" fill="#E5A93C"/></svg>`
  },
  {
    id: "mystic_queen",
    name: "Mystic Queen",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg5)"/><defs><linearGradient id="bg5" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#36183d"/><stop offset="1" stop-color="#130616"/></linearGradient></defs><path d="M25 70h50v6H25z" fill="#c084fc"/><path d="M28 64l-6-32 16 16 12-22 12 22 16-16-6 32H28z" fill="#E0BBE4" stroke="#c084fc" stroke-width="2"/><circle cx="22" cy="32" r="3" fill="#c084fc"/><circle cx="50" cy="26" r="4" fill="#c084fc"/><circle cx="78" cy="32" r="3" fill="#c084fc"/></svg>`
  },
  {
    id: "emerald_monarch",
    name: "Emerald Monarch",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="50" fill="url(#bg6)"/><defs><linearGradient id="bg6" x1="0" y1="0" x2="100" y2="100"><stop stop-color="#1b382b"/><stop offset="1" stop-color="#0a1c13"/></linearGradient></defs><path d="M50 20v10M45 25h10M32 40h36v28H32z" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/><path d="M32 40l18-10 18 10" fill="#E2EFCB"/><circle cx="50" cy="54" r="6" fill="#4ade80"/><path d="M25 74h50v6H25z" fill="#4ade80"/></svg>`
  }
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  username = "User",
  size = "md",
  showBadge = false,
  className = "",
  onClick
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
    "2xl": "h-24 w-24 text-3xl"
  };

  const initial = username ? username.trim()[0]?.toUpperCase() : "C";

  // Check if src is an SVG string or image URL/Data URL
  const isSvg = src && src.trim().startsWith("<svg");

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${
        onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
      } ${className}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[2px] shadow-lg shadow-amber-500/15 flex items-center justify-center`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0D17] flex items-center justify-center relative">
          {src ? (
            isSvg ? (
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: src }}
              />
            ) : (
              <img
                src={src}
                alt={username}
                className="w-full h-full object-cover object-center rounded-full"
                onError={(e) => {
                  // Fallback on image load error
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1b2333] via-[#0E121B] to-[#07090E] flex items-center justify-center text-amber-300 font-extrabold font-serif">
              {initial}
            </div>
          )}
        </div>
      </div>

      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-[#0B0D17] flex items-center justify-center text-slate-950 text-[9px] font-bold shadow-md z-10">
          <Crown className="h-3 w-3 text-slate-950" />
        </div>
      )}
    </div>
  );
};
