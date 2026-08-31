import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ChevronRight,
  UserPlus
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import {
  isUsernameAvailable,
  evaluatePasswordStrength,
  extractUsernameFromEmail
} from "../../services/authService";
import { ChessZenLogo } from "../ChessZenLogo";

interface SignUpFormProps {
  onSwitchToSignIn: (prefilledUsername?: string, successMsg?: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToSignIn
}) => {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [hasManuallyEditedUsername, setHasManuallyEditedUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-fill username from email if not manually modified
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (!hasManuallyEditedUsername) {
      const derived = extractUsernameFromEmail(newEmail);
      if (derived && derived !== "player") {
        setUsername(derived);
      }
    }
  };

  // Validation States
  const [usernameStatus, setUsernameStatus] = useState<{
    valid: boolean | null;
    message: string;
  }>({ valid: null, message: "" });

  const [confirmStatus, setConfirmStatus] = useState<{
    valid: boolean | null;
    message: string;
  }>({ valid: null, message: "" });

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [welcomeAnimation, setWelcomeAnimation] = useState(false);

  // Real-time Username Check
  useEffect(() => {
    if (!username) {
      setUsernameStatus({ valid: null, message: "" });
      return;
    }
    const clean = username.trim();
    if (clean.length < 3) {
      setUsernameStatus({
        valid: false,
        message: "Username must be at least 3 characters long."
      });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
      setUsernameStatus({
        valid: false,
        message: "Username can only contain letters, numbers, and underscores."
      });
      return;
    }
    const available = isUsernameAvailable(clean);
    if (available) {
      setUsernameStatus({
        valid: true,
        message: "Username is available!"
      });
    } else {
      setUsernameStatus({
        valid: false,
        message: "Username already exists. Please choose another username."
      });
    }
  }, [username]);

  // Real-time Confirm Password Check
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmStatus({ valid: null, message: "" });
      return;
    }
    if (password === confirmPassword) {
      setConfirmStatus({
        valid: true,
        message: "Passwords match!"
      });
    } else {
      setConfirmStatus({
        valid: false,
        message: "Passwords do not match."
      });
    }
  }, [password, confirmPassword]);

  const passwordStrength = evaluatePasswordStrength(password);

  const isPasswordValid =
    passwordStrength.checks.length &&
    passwordStrength.checks.uppercase &&
    passwordStrength.checks.lowercase &&
    passwordStrength.checks.number &&
    passwordStrength.checks.special;

  const isFormValid =
    usernameStatus.valid === true &&
    isPasswordValid &&
    confirmStatus.valid === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!isFormValid) {
      if (usernameStatus.valid === false) {
        setGeneralError(usernameStatus.message);
      } else if (!isPasswordValid) {
        setGeneralError("Please satisfy all password security requirements.");
      } else if (confirmStatus.valid === false) {
        setGeneralError("Passwords do not match.");
      } else {
        setGeneralError("Please complete all registration fields.");
      }
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim() ? email.trim().toLowerCase() : `${username.trim().toLowerCase()}@chesszen.com`;
      await signUp(username.trim(), cleanEmail, password);

      setWelcomeAnimation(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onSwitchToSignIn(
          username.trim(),
          "✓ Account created successfully! Please sign in with your password."
        );
      }, 1400);
    } catch (err: any) {
      setGeneralError(err.message || "An unexpected error occurred during account registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-lg bg-[#0E1322] border border-amber-500/20 rounded-[24px] p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6 relative overflow-hidden"
    >
      {/* Golden Ambient Background Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 relative z-10">
        <button
          type="button"
          onClick={() => onSwitchToSignIn()}
          className="p-2 text-slate-400 hover:text-amber-300 rounded-xl hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-2">
          <ChessZenLogo variant="icon" size="sm" theme="dark" />
          <h2 className="text-base font-extrabold font-display text-white uppercase tracking-wider">
            CREATE <span className="text-amber-400">ACCOUNT</span>
          </h2>
        </div>
      </div>

      {/* Welcome Success Animation Overlay */}
      <AnimatePresence>
        {welcomeAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-[#0E1322]/95 backdrop-blur-md z-30 rounded-[24px] flex flex-col items-center justify-center p-6 text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-4 rounded-full bg-amber-500/20 border border-amber-400"
            >
              <CheckCircle2 className="h-10 w-10 text-amber-400" />
            </motion.div>
            <h3 className="text-xl font-black text-white font-display uppercase tracking-wide">
              ✓ Account Created Successfully!
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed max-w-xs font-medium">
              Account created for <span className="text-amber-400 font-bold">{username}</span>.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-bold pt-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Navigating to Sign In...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Error Banner */}
      {generalError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2 relative z-10"
        >
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{generalError}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans relative z-10">
        {/* Email Field (Optional / Auto-suggests username) */}
        <div className="space-y-1.5">
          <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px] flex justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-amber-400/60 font-mono font-normal">Optional</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type="email"
              placeholder="e.g. sathishk@gmail.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full bg-[#070A12] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>
        </div>

        {/* Username Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px] flex justify-between">
            <span>Username</span>
            {usernameStatus.valid !== null && (
              <span className={`text-[10px] font-bold ${usernameStatus.valid ? "text-amber-400" : "text-red-400"}`}>
                {usernameStatus.message}
              </span>
            )}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type="text"
              placeholder="Choose or customize username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setHasManuallyEditedUsername(true);
              }}
              className={`w-full bg-[#070A12] border ${
                usernameStatus.valid === true
                  ? "border-amber-400 focus:ring-amber-400"
                  : usernameStatus.valid === false
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-amber-500/20 focus:ring-amber-500/20"
              } rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              required
            />
            {usernameStatus.valid === true && (
              <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
            )}
            {usernameStatus.valid === false && (
              <XCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px] flex justify-between">
            <span>Password</span>
            {password && (
              <span
                className={`text-[10px] font-bold font-mono uppercase ${
                  passwordStrength.score === 5
                    ? "text-emerald-400"
                    : passwordStrength.score >= 3
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                Strength: {passwordStrength.label}
              </span>
            )}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#070A12] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Strength Progress Bar */}
          {password.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step <= passwordStrength.score
                        ? passwordStrength.score === 5
                          ? "bg-emerald-400"
                          : passwordStrength.score >= 3
                          ? "bg-amber-400"
                          : "bg-red-500"
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-2.5 rounded-xl bg-[#070A12]/80 border border-amber-500/10 space-y-1">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200/70 mb-1">
                  Password must contain:
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
                  <div className={`flex items-center gap-1.5 ${passwordStrength.checks.length ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordStrength.checks.uppercase ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordStrength.checks.lowercase ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordStrength.checks.number ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordStrength.checks.special ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px] flex justify-between">
            <span>Confirm Password</span>
            {confirmStatus.valid !== null && (
              <span className={`text-[10px] font-bold ${confirmStatus.valid ? "text-amber-400" : "text-red-400"}`}>
                {confirmStatus.message}
              </span>
            )}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#070A12] border ${
                confirmStatus.valid === true
                  ? "border-amber-400 focus:ring-amber-400"
                  : confirmStatus.valid === false
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-amber-500/20 focus:ring-amber-500/20"
              } rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit CREATE ACCOUNT Button */}
        <motion.button
          whileHover={{ scale: isFormValid ? 1.01 : 1 }}
          whileTap={{ scale: isFormValid ? 0.99 : 1 }}
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/15"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>CREATE ACCOUNT</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

