import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { evaluatePasswordStrength } from "../../services/authService";

interface ForgotPasswordFlowProps {
  onBackToSignIn: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  onBackToSignIn
}) => {
  const { sendOTP, verifyOTP, resetPassword } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 & 2: Send OTP
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const code = sendOTP(email);
      setGeneratedOTP(code);
      setStep(3); // Move to OTP Verification Step
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate OTP for this email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpInput.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      verifyOTP(email, otpInput);
      setStep(4); // Move to Create New Password
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4 & 5: New Password & Confirm Password
  const passwordStrength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (passwordStrength.score < 2) {
      setErrorMsg("Please choose a stronger password (at least 8 characters).");
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otpInput, newPassword);
      setStep(6); // Step 6: Success
      setTimeout(() => {
        onBackToSignIn();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
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
      className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-[20px] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>

        <h2 className="text-xl font-extrabold font-display text-white uppercase tracking-wider">
          Reset <span className="text-[#00E5A8]">Password</span>
        </h2>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-2 py-1 bg-[#0B1220] rounded-xl border border-slate-800/60">
        <span className={step >= 1 ? "text-[#00E5A8]" : "text-slate-600"}>1. Email</span>
        <span>→</span>
        <span className={step >= 3 ? "text-[#00E5A8]" : "text-slate-600"}>2. OTP</span>
        <span>→</span>
        <span className={step >= 4 ? "text-[#00E5A8]" : "text-slate-600"}>3. New Password</span>
        <span>→</span>
        <span className={step === 6 ? "text-[#00E5A8]" : "text-slate-600"}>4. Done</span>
      </div>

      {/* Error Message Alert Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1 & 2: Enter Email & Request OTP */}
      {(step === 1 || step === 2) && (
        <form onSubmit={handleSendOTP} className="space-y-4 text-xs font-sans">
          <p className="text-slate-300 text-xs leading-relaxed">
            Enter your registered email address. We will generate a 6-digit security OTP verification code to reset your password.
          </p>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px]">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-800 focus:border-[#00E5A8] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00E5A8]/20 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5A8] to-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00E5A8]/10 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Send OTP Code</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 3: Verify OTP */}
      {step === 3 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-[#00E5A8]/10 border border-[#00E5A8]/30 rounded-xl text-xs text-[#00E5A8] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Simulated Security OTP Dispatched!</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your 6-digit verification code is:{" "}
              <span className="font-mono font-black text-[#00E5A8] text-sm bg-slate-950 px-2 py-0.5 rounded border border-[#00E5A8]/40">
                {generatedOTP}
              </span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px]">
              Enter 6-Digit OTP Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 582914"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-800 focus:border-[#00E5A8] rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00E5A8]/20 transition-all font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpInput.length < 6}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5A8] to-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00E5A8]/10 disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Verify OTP Code</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4 & 5: Create & Confirm New Password */}
      {(step === 4 || step === 5) && (
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px] flex justify-between">
              <span>New Password</span>
              {newPassword && (
                <span className="text-[#00E5A8] font-bold font-mono text-[10px]">
                  Strength: {passwordStrength.label}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-800 focus:border-[#00E5A8] rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00E5A8]/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase font-mono tracking-wider text-[11px]">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-800 focus:border-[#00E5A8] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00E5A8]/20 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch || passwordStrength.score < 2}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5A8] to-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00E5A8]/10 disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Confirm & Save Password</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 6: Success Message & Redirect */}
      {step === 6 && (
        <div className="p-6 bg-[#00E5A8]/10 border border-[#00E5A8]/40 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-[#00E5A8] mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white font-display uppercase">
            Password Reset Successful!
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your account credentials have been securely updated. Redirecting to Sign In...
          </p>
        </div>
      )}
    </motion.div>
  );
};
