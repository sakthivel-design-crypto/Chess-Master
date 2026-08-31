import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SignUpForm } from "./auth/SignUpForm";
import { SignInForm } from "./auth/SignInForm";
import { ForgotPasswordFlow } from "./auth/ForgotPasswordFlow";
import { navigationManager } from "../utils/navigationManager";
import { getCurrentAuthSession } from "../services/authService";

interface LoginPageProps {
  onLoginSuccess: (email: string, username: string, isGuest: boolean) => void;
  onReplaySplash?: () => void;
  defaultEmail?: string;
}

type AuthScreen = "signin" | "signup" | "forgot";

const LoginPageContent: React.FC<LoginPageProps> = ({ onLoginSuccess, onReplaySplash }) => {
  const [screen, setScreen] = useState<AuthScreen>("signin");
  const [prefilledUsername, setPrefilledUsername] = useState<string | null>(null);
  const [registrationBanner, setRegistrationBanner] = useState<string | null>(null);

  const { currentUser, isLoggedIn } = useAuth();

  // Register Back Handler for sub-screens in Login flow
  useEffect(() => {
    if (screen !== "signin") {
      const unregister = navigationManager.registerHandler({
        id: "login-screen-subview",
        priority: 75,
        handleBack: () => {
          setScreen("signin");
          return true;
        }
      });
      return unregister;
    }
  }, [screen]);

  // If user becomes logged in via context, notify parent
  React.useEffect(() => {
    if (isLoggedIn && currentUser) {
      onLoginSuccess(
        currentUser.email,
        currentUser.username,
        false
      );
    }
  }, [isLoggedIn, currentUser, onLoginSuccess]);

  const handleSuccessRedirect = (user?: any) => {
    const targetUser = user || currentUser;
    if (targetUser) {
      onLoginSuccess(
        targetUser.email,
        targetUser.username,
        false
      );
      return;
    }

    // Fallback: check session from localStorage
    const session = getCurrentAuthSession();
    if (session?.user) {
      onLoginSuccess(
        session.user.email,
        session.user.username,
        false
      );
    }
  };

  const handleSwitchToSignInWithNotice = (username?: string, msg?: string) => {
    if (username) setPrefilledUsername(username);
    if (msg) setRegistrationBanner(msg);
    setScreen("signin");
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-slate-100">
      {/* Background Ambience Radial Gradient & Subtle Gold Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-b from-amber-500/10 via-yellow-600/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />

      {/* Subtle Decorative Chessboard Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(45deg,#d4af37_25%,transparent_25%),linear-gradient(-45deg,#d4af37_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d4af37_75%),linear-gradient(-45deg,transparent_75%,#d4af37_75%)] bg-[size:48px_48px] bg-[position:0_0,0_24px,24px_-24px,24px_0] pointer-events-none" />

      {/* Top Corner Replay Intro Button */}
      {onReplaySplash && (
        <button
          onClick={onReplaySplash}
          className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-[#151922]/90 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-xl shadow-black/50"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Play Intro</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {screen === "signin" && (
          <motion.div key="signin" className="z-10 w-full flex justify-center">
            <SignInForm
              onSwitchToSignUp={() => {
                setRegistrationBanner(null);
                setScreen("signup");
              }}
              onForgotPasswordClick={() => setScreen("forgot")}
              onSignInSuccess={handleSuccessRedirect}
              prefilledUsername={prefilledUsername}
              registrationSuccessMessage={registrationBanner}
            />
          </motion.div>
        )}

        {screen === "signup" && (
          <motion.div key="signup" className="z-10 w-full flex justify-center">
            <SignUpForm
              onSwitchToSignIn={handleSwitchToSignInWithNotice}
            />
          </motion.div>
        )}

        {screen === "forgot" && (
          <motion.div key="forgot" className="z-10 w-full flex justify-center">
            <ForgotPasswordFlow
              onBackToSignIn={() => setScreen("signin")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const LoginPage: React.FC<LoginPageProps> = (props) => {
  return (
    <AuthProvider>
      <LoginPageContent {...props} />
    </AuthProvider>
  );
};

