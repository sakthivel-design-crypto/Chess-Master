import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  XCircle,
  LogIn,
  ChevronRight,
  CheckCircle2,
  UserPlus
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ChessZenLogo } from "../ChessZenLogo";

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onForgotPasswordClick: () => void;
  onSignInSuccess: (user?: any) => void;
  prefilledUsername?: string | null;
  registrationSuccessMessage?: string | null;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSwitchToSignUp,
  onForgotPasswordClick,
  onSignInSuccess,
  prefilledUsername,
  registrationSuccessMessage
}) => {
  const { signIn, signInWithGoogle } = useAuth();

  const [username, setUsername] = useState(prefilledUsername || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(
    registrationSuccessMessage || null
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isGoogleSigningInRef = React.useRef(false);

  useEffect(() => {
    if (prefilledUsername) {
      setUsername(prefilledUsername);
    } else {
      const saved = localStorage.getItem("chesszen_remembered_identity");
      if (saved) {
        setUsername(saved);
        setRememberMe(true);
      }
    }
  }, [prefilledUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg("Please enter your Username or Email.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your Password.");
      return;
    }

    setLoading(true);

    try {
      const user = await signIn(username, password, rememberMe);

      if (rememberMe) {
        localStorage.setItem("chesszen_remembered_identity", username.trim());
      } else {
        localStorage.removeItem("chesszen_remembered_identity");
      }

      onSignInSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your login details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSigningInRef.current || googleLoading || loading) {
      return;
    }
    isGoogleSigningInRef.current = true;
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      console.log("[GoogleAuth] Button tapped");
      const user = await signInWithGoogle();
      console.log("[GoogleAuth] Auth state updated");
      console.log("[GoogleAuth] Navigating to Dashboard");
      onSignInSuccess(user);
    } catch (err: any) {
      const errObj = typeof err === "object" && err !== null ? err : {};
      const msg = err?.message || errObj.error || errObj.type || (typeof err === "string" ? err : "");
      const code = String(err?.code || errObj.code || "");
      const errorStr = typeof err === "object" ? JSON.stringify(err) : String(err);

      if (
        msg === "POPUP_CANCELLED" || 
        msg.includes("POPUP_CANCELLED") ||
        msg.includes("popup_closed_by_user") ||
        msg.includes("closed-by-user") ||
        code === "12501" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        msg.includes("12501") ||
        errorStr.includes("popup_closed_by_user") ||
        errorStr.includes("12501")
      ) {
        console.log("[GoogleAuth] Account selection cancelled by user");
        // User closed Google auth popup/account picker, cancel silently without error
        return;
      }
      
      console.error("[GoogleAuth] Sign-in error:", msg || err);
      setErrorMsg(msg || "Unable to start Google Sign-In. Please try again.");
    } finally {
      setGoogleLoading(false);
      isGoogleSigningInRef.current = false;
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

      {/* ChessZen Brand Header */}
      <div className="text-center flex flex-col items-center space-y-3 relative z-10">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="relative py-1"
        >
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 blur-md" />
          <div className="relative z-10 bg-[#0B0D17]/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
            <ChessZenLogo variant="full" size="md" theme="dark" />
          </div>
        </motion.div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
            WELCOME BACK
          </span>
          <p className="text-xs font-serif font-medium text-amber-100/90 tracking-wide uppercase">
            MASTER EVERY MOVE WITH AI
          </p>
        </div>
      </div>

      {/* Success Banner Overlay (e.g. after Registration) */}
      {successBanner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2.5 leading-relaxed relative z-10 shadow-lg shadow-emerald-500/5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successBanner}</span>
        </motion.div>
      )}

      {/* Error Message Alert Banner */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2.5 leading-relaxed relative z-10"
        >
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans relative z-10">
        {/* Username / Email Input */}
        <div className="space-y-1.5">
          <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px]">
            Username / Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type="text"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-[#070A12] border border-amber-500/20 focus:border-amber-400 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="font-bold text-amber-100/80 uppercase font-mono tracking-wider text-[11px]">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg(null);
              }}
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 py-0.5">
          <input
            type="checkbox"
            id="rememberMeCheck"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-amber-500/30 bg-[#070A12] text-amber-400 focus:ring-amber-400 h-4 w-4 cursor-pointer"
          />
          <label
            htmlFor="rememberMeCheck"
            className="text-xs font-medium text-slate-300 cursor-pointer select-none"
          >
            Remember me on this device
          </label>
        </div>

        {/* Submit LOGIN Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>LOGIN</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        {/* Divider ──────── OR ──────── */}
        <div className="flex items-center gap-3 my-3">
          <div className="h-px bg-amber-500/20 flex-1" />
          <span className="text-[11px] font-mono text-amber-300/70 uppercase tracking-widest font-bold">OR</span>
          <div className="h-px bg-amber-500/20 flex-1" />
        </div>

        {/* Official GOOGLE SIGN-IN Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[#f8f9fa] active:bg-[#f1f3f4] text-[#3c4043] font-medium text-sm inline-flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md shadow-black/40 border border-[#dadce0] disabled:opacity-60"
        >
          {googleLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-[#4285F4]" />
              <span className="font-semibold text-slate-700">Signing in with Google...</span>
            </>
          ) : (
            <>
              {/* Official Google G SVG Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-semibold tracking-normal text-slate-800">Sign in with Google</span>
            </>
          )}
        </motion.button>

        {/* Footer Link: Create Account */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
};


