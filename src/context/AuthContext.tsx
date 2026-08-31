import React, { createContext, useContext, useState, useEffect } from "react";
import {
  StoredUser,
  AuthSession,
  getCurrentAuthSession,
  initializeUserDatabase,
  registerNewUser,
  signInUser,
  signInWithGoogle as authServiceSignInWithGoogle,
  signInWithGoogleIdToken as authServiceSignInWithGoogleIdToken,
  processAuthenticatedFirebaseUser,
  logoutUser,
  generateOTPForEmail,
  verifyOTPCode,
  resetPasswordWithVerifiedOTP
} from "../services/authService";
import { onAuthStateChanged, auth } from "../lib/firebase";

export type AuthUser = Omit<StoredUser, 'passwordHash'>;

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signUp: (username: string, email: string, password: string, avatar?: string) => Promise<AuthUser>;
  signIn: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser>;
  signInWithGoogleToken: (idToken: string, accessToken?: string) => Promise<AuthUser>;
  signOut: () => void;
  sendOTP: (email: string) => string;
  verifyOTP: (email: string, code: string) => boolean;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("chessmaster_logged_in") === "true";
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        await initializeUserDatabase();

        // Check active persistent local session
        const session = getCurrentAuthSession();
        if (session && isMounted) {
          setCurrentUser(session.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // 3. Listen to live Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        const activeSession = getCurrentAuthSession();
        // If current session does not match or is missing, sync profile
        if (!activeSession || activeSession.user?.id !== firebaseUser.uid) {
          try {
            const { user } = await processAuthenticatedFirebaseUser(firebaseUser);
            if (isMounted) {
              setCurrentUser(user);
              setIsLoggedIn(true);
              console.log("[GoogleAuth] Auth state updated");
            }
          } catch (err) {
            console.warn("Error processing Firebase user in onAuthStateChanged:", err);
          }
        }
      } else {
        const activeSession = getCurrentAuthSession();
        if (!activeSession) {
          if (isMounted) {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (username: string, email: string, password: string, avatar?: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { user } = await registerNewUser(username, email, password, avatar);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (usernameOrEmail: string, password: string, rememberMe: boolean = true): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { user } = await signInUser(usernameOrEmail, password, rememberMe);
      setCurrentUser(user);
      setIsLoggedIn(true);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { user } = await authServiceSignInWithGoogle();
      setCurrentUser(user);
      setIsLoggedIn(true);
      console.log("[GoogleAuth] Auth state updated");
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleToken = async (idToken: string, accessToken?: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const { user } = await authServiceSignInWithGoogleIdToken(idToken, accessToken);
      setCurrentUser(user);
      setIsLoggedIn(true);
      console.log("[GoogleAuth] Auth state updated");
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    logoutUser();
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const sendOTP = (email: string): string => {
    return generateOTPForEmail(email);
  };

  const verifyOTP = (email: string, code: string): boolean => {
    return verifyOTPCode(email, code);
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    return await resetPasswordWithVerifiedOTP(email, code, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithGoogleToken,
        signOut,
        sendOTP,
        verifyOTP,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
