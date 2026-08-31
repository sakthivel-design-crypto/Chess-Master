import React from "react";
import { Sparkles, Star, Target, CheckCircle2, ThumbsUp, AlertTriangle, HelpCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";

export type MoveQuality = 
  | "Brilliant" 
  | "Great" 
  | "Best" 
  | "Excellent" 
  | "Good" 
  | "Inaccuracy" 
  | "Mistake" 
  | "Blunder";

interface MoveQualityBadgeProps {
  quality: MoveQuality;
  showIconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const moveQualityConfig: Record<MoveQuality, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  Brilliant: {
    label: "Brilliant",
    icon: Sparkles,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-400/50",
    desc: "A game-changing tactical piece sacrifice or key sequence!"
  },
  Great: {
    label: "Great",
    icon: Star,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
    border: "border-indigo-400/50",
    desc: "Critical find that shifts the evaluation heavily in your favor."
  },
  Best: {
    label: "Best",
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-400/50",
    desc: "Top engine move recommendation."
  },
  Excellent: {
    label: "Excellent",
    icon: CheckCircle2,
    color: "text-teal-300",
    bg: "bg-teal-500/20",
    border: "border-teal-400/40",
    desc: "Very strong continuation with near-optimal value."
  },
  Good: {
    label: "Good",
    icon: ThumbsUp,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-400/30",
    desc: "Solid move maintaining board dynamics."
  },
  Inaccuracy: {
    label: "Inaccuracy",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
    border: "border-amber-400/40",
    desc: "Sub-optimal choice giving up minor positional advantage."
  },
  Mistake: {
    label: "Mistake",
    icon: HelpCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-400/40",
    desc: "Unfavorable move allowing counter-play."
  },
  Blunder: {
    label: "Blunder",
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/20",
    border: "border-rose-500/50",
    desc: "Severe tactical oversight resulting in material loss or mate threat."
  }
};

export const MoveQualityBadge: React.FC<MoveQualityBadgeProps> = ({
  quality,
  showIconOnly = false,
  size = "md",
  className = ""
}) => {
  const config = moveQualityConfig[quality] || moveQualityConfig.Good;
  const Icon = config.icon;

  if (showIconOnly) {
    return (
      <span 
        title={`${config.label}: ${config.desc}`}
        className={`inline-flex items-center justify-center p-1 rounded-md border ${config.bg} ${config.color} ${config.border} ${className}`}
      >
        <Icon className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${config.bg} ${config.color} ${config.border} shadow-sm ${className}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"} />
      <span>{config.label}</span>
    </motion.div>
  );
};
