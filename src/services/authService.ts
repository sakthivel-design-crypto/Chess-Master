// Complete Authentication & Storage Service for ChessZen AI

import { ModeRatings, ModeStats, MatchRecord, DEFAULT_RATINGS, GameModeKey } from "../types";
import { 
  signInWithPopup, 
  signInWithCredential, 
  GoogleAuthProvider, 
  signOut,
  FirebaseUser,
  firebaseConfig,
  auth,
  googleProvider
} from "../lib/firebase";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { 
  saveUserProfileToFirestore, 
  getUserProfileFromFirestore,
  getUserProfileByEmailFromFirestore,
  isUsernameTakenInFirestore
} from "./firestoreService";

export interface UserSettings {
  theme: string;
  soundEnabled: boolean;
  coachMode: boolean;
  boardStyle: string;
  boardTheme?: string;
  pieceStyle?: string;
}

export interface StoredUser {
  id: string;
  uid?: string;
  username: string;
  email: string;
  passwordHash: string; // SHA-256 hashed password
  profilePicture: string;
  profileImageUrl?: string;
  level: number;
  xp: number;
  coins: number;
  rating: number;
  elo: number;
  puzzleElo: number;
  ratings: ModeRatings;
  modeStats?: Record<GameModeKey, ModeStats>;
  matchHistory?: MatchRecord[];
  puzzleProgress?: Record<string, any>;
  gambitProgress?: Record<string, any>;
  boardTheme?: string;
  highestRating?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  gamesLost?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  puzzlesSolved?: number;
  lessonsCompleted?: number;
  gambitsCompleted?: number;
  trapsCompleted?: number;
  streak: number;
  longestStreak?: number;
  bestStreak?: number;
  lastActivityDate?: string | null;
  streakStartedAt?: string | null;
  unlockedBadges: string[];
  lastActiveDate: string | null;
  settings: UserSettings;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: Omit<StoredUser, 'passwordHash'>;
  expiresAt: number;
}

const USERS_DB_KEY = "chesszen_users_db";
const CURRENT_SESSION_KEY = "chesszen_current_session";
const OTP_STORE_KEY = "chesszen_otp_verification_store";

// Helper: Password Hashing using SHA-256 Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_chesszen_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Seed default users if DB is empty
export async function initializeUserDatabase(): Promise<StoredUser[]> {
  const existing = localStorage.getItem(USERS_DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // Fallback if corrupt
    }
  }

  const initialUsers: StoredUser[] = [];
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(initialUsers));
  return initialUsers;
}

// Get all stored users
export function getStoredUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_DB_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save users DB
function saveUsersDB(users: StoredUser[]): void {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

// Validation Helpers
export function validateEmailFormat(email: string): boolean {
  if (!email || !email.trim()) return true; // Email optional if username is primary
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isUsernameAvailable(username: string): boolean {
  const cleaned = username.trim().toLowerCase();
  if (cleaned.length < 3) return false;
  // Check alphanumeric + underscore/hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(cleaned)) return false;
  const users = getStoredUsers();
  return !users.some((u) => u.username.toLowerCase() === cleaned);
}

export function isEmailAvailable(email: string): boolean {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned) return true;
  const users = getStoredUsers();
  return !users.some((u) => u.email.toLowerCase() === cleaned);
}

export interface PasswordStrengthResult {
  score: number; // 0 to 5
  label: "Weak" | "Medium" | "Strong";
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  let score = 0;
  if (checks.length) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  let label: "Weak" | "Medium" | "Strong" = "Weak";
  if (score >= 3 && score < 5) label = "Medium";
  if (score === 5) label = "Strong";

  return { score, label, checks };
}

// User Registration
export async function registerNewUser(
  username: string,
  email: string,
  password: string,
  profilePicture?: string
): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  await initializeUserDatabase();
  const users = getStoredUsers();

  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : "";
  let cleanUsername = username.trim();
  if (!cleanUsername && cleanEmail) {
    cleanUsername = extractUsernameFromEmail(cleanEmail);
  }

  if (cleanUsername.length < 2) {
    throw new Error("Username must be at least 2 characters long.");
  }

  // Generate deterministic UID based on email or unique identifier
  const permanentUid = cleanEmail 
    ? ("usr_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"))
    : ("usr_" + Math.random().toString(36).substring(2, 11));

  // Check if profile already exists in Firestore or local DB for this email / uid
  const existingFsUser = await getUserProfileFromFirestore(permanentUid) || (cleanEmail ? await getUserProfileByEmailFromFirestore(cleanEmail) : null);
  const existingLocalUser = users.find((u) => u.id === permanentUid || (cleanEmail && u.email.toLowerCase() === cleanEmail));

  if (existingFsUser || existingLocalUser) {
    throw new Error("An account with this email address already exists. Please sign in instead.");
  }

  // Check if username is taken, generate unique if derived from email
  const isTaken = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase()) || (await isUsernameTakenInFirestore(cleanUsername));
  if (isTaken && (!username.trim() || username.trim() === cleanUsername)) {
    cleanUsername = await generateUniqueUsername(cleanUsername);
  } else if (isTaken) {
    throw new Error("Username already exists. Please choose another username.");
  }

  const finalEmail = cleanEmail || `${cleanUsername.toLowerCase()}@chesszen.com`;

  const strength = evaluatePasswordStrength(password);
  if (!strength.checks.length || !strength.checks.uppercase || !strength.checks.lowercase || !strength.checks.number || !strength.checks.special) {
    throw new Error("Password does not meet all security requirements.");
  }

  const passwordHash = await hashPassword(password);
  const avatar = profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanUsername)}`;

  // Newly registered user starts with starting rating 1200
  const newUser: StoredUser = {
    id: permanentUid,
    username: cleanUsername,
    email: finalEmail,
    passwordHash,
    profilePicture: avatar,
    level: 1,
    xp: 0,
    coins: 0,
    rating: 1200,
    elo: 1200,
    puzzleElo: 1200,
    ratings: {
      bullet: 1200,
      blitz: 1200,
      rapid: 1200,
      classical: 1200
    },
    modeStats: {
      bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
    },
    matchHistory: [],
    highestRating: 1200,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    puzzlesSolved: 0,
    lessonsCompleted: 0,
    gambitsCompleted: 0,
    trapsCompleted: 0,
    streak: 0,
    longestStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    streakStartedAt: null,
    unlockedBadges: [],
    lastActiveDate: new Date().toISOString().split("T")[0],
    settings: {
      theme: "tournament",
      soundEnabled: true,
      coachMode: true,
      boardStyle: "tournament"
    },
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsersDB(users);

  // Synchronize with Firestore Database
  try {
    await saveUserProfileToFirestore(newUser);
  } catch (err) {
    console.warn("Firestore sync warning during register:", err);
  }

  syncLegacyUserProfile(newUser);

  const { passwordHash: _, ...userWithoutHash } = newUser;
  const token = "token_" + Math.random().toString(36).substring(2, 15) + Date.now();

  return { user: userWithoutHash, token };
}

// User Sign In (Supports Username OR Email)
export async function signInUser(
  usernameOrEmail: string,
  password: string,
  rememberMe: boolean = true
): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  await initializeUserDatabase();
  const users = getStoredUsers();
  const query = usernameOrEmail.trim().toLowerCase();

  let foundUser = users.find(
    (u) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
  );

  const computedHash = await hashPassword(password);

  if (!foundUser) {
    // If not found in local DB, attempt lookup in Firestore
    const candidateUid = "usr_" + query.replace(/[^a-zA-Z0-9]/g, "_");
    const fsProfile = await getUserProfileFromFirestore(candidateUid) || await getUserProfileByEmailFromFirestore(query);
    if (fsProfile) {
      // Reconstruct local record from Firestore
      const restoredUser: StoredUser = {
        id: fsProfile.id || candidateUid,
        username: fsProfile.username || extractUsernameFromEmail(query),
        email: fsProfile.email || query,
        passwordHash: computedHash,
        profilePicture: fsProfile.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fsProfile.username || query)}`,
        level: fsProfile.level || 1,
        xp: fsProfile.xp || 0,
        coins: fsProfile.coins || 0,
        rating: fsProfile.rating ?? fsProfile.elo ?? 1200,
        elo: fsProfile.elo ?? fsProfile.rating ?? 1200,
        puzzleElo: fsProfile.puzzleElo ?? 1200,
        ratings: fsProfile.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
        modeStats: fsProfile.modeStats || {
          bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
          blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
          rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
          classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
        },
        matchHistory: fsProfile.matchHistory || [],
        highestRating: fsProfile.highestRating || fsProfile.rating || 1200,
        gamesPlayed: fsProfile.gamesPlayed || 0,
        gamesWon: fsProfile.gamesWon || fsProfile.wins || 0,
        gamesLost: fsProfile.gamesLost || fsProfile.losses || 0,
        wins: fsProfile.wins || fsProfile.gamesWon || 0,
        losses: fsProfile.losses || fsProfile.gamesLost || 0,
        draws: fsProfile.draws || 0,
        puzzlesSolved: fsProfile.puzzlesSolved || 0,
        lessonsCompleted: fsProfile.lessonsCompleted || 0,
        gambitsCompleted: fsProfile.gambitsCompleted || 0,
        trapsCompleted: fsProfile.trapsCompleted || 0,
        streak: fsProfile.streak || 0,
        longestStreak: fsProfile.longestStreak || 0,
        bestStreak: fsProfile.bestStreak || 0,
        lastActivityDate: fsProfile.lastActivityDate || null,
        streakStartedAt: fsProfile.streakStartedAt || null,
        unlockedBadges: fsProfile.unlockedBadges || [],
        lastActiveDate: new Date().toISOString().split("T")[0],
        settings: fsProfile.settings || {
          theme: "tournament",
          soundEnabled: true,
          coachMode: true,
          boardStyle: "tournament"
        },
        createdAt: fsProfile.createdAt || new Date().toISOString()
      };
      users.push(restoredUser);
      saveUsersDB(users);
      foundUser = restoredUser;
    } else {
      throw new Error("Account not found. Please check your username or create a new account.");
    }
  }

  if (computedHash !== foundUser.passwordHash && foundUser.passwordHash !== "google_authenticated_oauth") {
    throw new Error("Incorrect password. Please try again.");
  }

  // Retrieve persistent profile directly from Firestore to ensure latest values are loaded
  try {
    const fsProfile = await getUserProfileFromFirestore(foundUser.id) || await getUserProfileByEmailFromFirestore(foundUser.email);
    if (fsProfile) {
      const savedElo = fsProfile.rating ?? fsProfile.elo ?? foundUser.rating ?? 1200;
      foundUser.rating = savedElo;
      foundUser.elo = savedElo;
      foundUser.puzzleElo = fsProfile.puzzleElo ?? foundUser.puzzleElo ?? 1200;
      foundUser.ratings = fsProfile.ratings || foundUser.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 };
      foundUser.modeStats = fsProfile.modeStats || foundUser.modeStats;
      foundUser.matchHistory = fsProfile.matchHistory || foundUser.matchHistory || [];
      foundUser.gamesPlayed = fsProfile.gamesPlayed ?? foundUser.gamesPlayed ?? 0;
      foundUser.wins = fsProfile.wins ?? (fsProfile as any).gamesWon ?? foundUser.wins ?? 0;
      foundUser.losses = fsProfile.losses ?? (fsProfile as any).gamesLost ?? foundUser.losses ?? 0;
      foundUser.draws = fsProfile.draws ?? foundUser.draws ?? 0;
      foundUser.level = fsProfile.level || foundUser.level || 1;
      foundUser.xp = fsProfile.xp ?? foundUser.xp ?? 0;
      foundUser.coins = fsProfile.coins ?? foundUser.coins ?? 0;
      foundUser.profilePicture = fsProfile.profilePicture || foundUser.profilePicture;
      foundUser.settings = fsProfile.settings || foundUser.settings;
      foundUser.unlockedBadges = fsProfile.unlockedBadges || foundUser.unlockedBadges || [];
    } else {
      await saveUserProfileToFirestore(foundUser);
    }
  } catch (err) {
    console.warn("Firestore sync warning during sign-in:", err);
  }

  // Update last active date
  const today = new Date().toISOString().split("T")[0];
  foundUser.lastActiveDate = today;
  saveUsersDB(users);

  syncLegacyUserProfile(foundUser);

  const { passwordHash: _, ...userWithoutHash } = foundUser;
  const token = "token_" + Math.random().toString(36).substring(2, 15) + Date.now();
  const session: AuthSession = {
    token,
    user: userWithoutHash,
    expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
  };

  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("chessmaster_logged_in", "true");

  return { user: userWithoutHash, token };
}

/**
 * Extracts username from email address (part before @)
 * Examples:
 * sathishk@gmail.com -> sathishk
 * john.doe@gmail.com -> john.doe
 * chessplayer123@gmail.com -> chessplayer123
 */
export function extractUsernameFromEmail(email: string): string {
  if (!email || !email.trim()) return "player";
  const trimmed = email.trim();
  const atIdx = trimmed.indexOf("@");
  if (atIdx > 0) {
    const prefix = trimmed.substring(0, atIdx).trim();
    if (prefix) return prefix;
  }
  return trimmed;
}

/**
 * Helper to generate a collision-free username for new users
 */
export async function generateUniqueUsername(baseCandidate: string): Promise<string> {
  let cleaned = (baseCandidate || "player")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  if (!cleaned || cleaned.length < 2) {
    cleaned = "player";
  }
  if (cleaned.length > 25) {
    cleaned = cleaned.substring(0, 25);
  }

  const users = getStoredUsers();
  const isLocalTaken = (name: string) =>
    users.some((u) => u.username.toLowerCase() === name.toLowerCase());

  let isTaken = isLocalTaken(cleaned) || (await isUsernameTakenInFirestore(cleaned));

  if (!isTaken) {
    return cleaned;
  }

  // Attempt numbered suffixes: candidate01, candidate02...
  for (let i = 1; i <= 99; i++) {
    const suffix = i < 10 ? `0${i}` : `${i}`;
    const candidateWithSuffix = `${cleaned.substring(0, 23)}${suffix}`;
    const taken = isLocalTaken(candidateWithSuffix) || (await isUsernameTakenInFirestore(candidateWithSuffix));
    if (!taken) {
      return candidateWithSuffix;
    }
  }

  return `${cleaned.substring(0, 18)}_${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Ensures any async promise rejects cleanly after timeoutMs rather than hanging forever.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = "Operation timed out. Please try again."
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Centralized Processor for Authenticated Firebase Google User.
 * Handles both Android Native (ID token), Capacitor, Redirect, and Popup flows.
 * Preserves all existing Firestore statistics, ratings, match histories, and usernames.
 * Creates clean new profiles without hardcoded names like "ChessScholar".
 */
export async function processAuthenticatedFirebaseUser(
  googleUser: FirebaseUser | any
): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  console.log("[GoogleAuth] Loading ChessZen profile");
  if (!googleUser || !googleUser.uid) {
    throw new Error("Invalid authentication user payload.");
  }

  await initializeUserDatabase();
  const users = getStoredUsers();

  const uid = googleUser.uid;
  const verifiedEmail = (googleUser.email || "").trim().toLowerCase();
  const displayName = (googleUser.displayName || "").trim();
  const photoURL = googleUser.photoURL || "";

  // 1. Check if profile already exists in Firestore (with 5s timeout guard) or local DB
  let fsProfile: Omit<StoredUser, 'passwordHash'> | null = null;
  try {
    const fetchProfilePromise = (async () => {
      let p = await getUserProfileFromFirestore(uid);
      if (!p && verifiedEmail) {
        p = await getUserProfileByEmailFromFirestore(verifiedEmail);
      }
      return p;
    })();
    fsProfile = await withTimeout(fetchProfilePromise, 5000, "Firestore fetch timed out");
  } catch (fsErr) {
    console.warn("Firestore lookup note (using cached/fallback profile):", fsErr);
  }

  const localFound = users.find(
    (u) => u.id === uid || (verifiedEmail && u.email.toLowerCase() === verifiedEmail)
  );

  if (fsProfile || localFound) {
    // Existing Google or linked User -> PRESERVE ALL STATS AND SAVED USERNAME
    const base = fsProfile || localFound!;
    const savedElo = base.rating ?? base.elo ?? 1200;
    const existingUsername = base.username || displayName || extractUsernameFromEmail(verifiedEmail);

    const mergedUser: StoredUser = {
      id: uid, // Bind to authenticated Google UID
      uid: uid,
      username: existingUsername,
      email: verifiedEmail || base.email,
      passwordHash: localFound?.passwordHash || "google_authenticated_oauth",
      profilePicture: base.profilePicture || photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(existingUsername)}`,
      profileImageUrl: base.profileImageUrl || base.profilePicture || photoURL,
      level: base.level || 1,
      xp: base.xp ?? 0,
      coins: base.coins ?? 0,
      rating: savedElo,
      elo: savedElo,
      puzzleElo: base.puzzleElo ?? 1200,
      ratings: base.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
      modeStats: base.modeStats || {
        bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
        classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
      },
      matchHistory: base.matchHistory || [],
      highestRating: base.highestRating || savedElo,
      gamesPlayed: base.gamesPlayed || 0,
      gamesWon: base.gamesWon || base.wins || 0,
      gamesLost: base.gamesLost || base.losses || 0,
      wins: base.wins || base.gamesWon || 0,
      losses: base.losses || base.gamesLost || 0,
      draws: base.draws || 0,
      puzzlesSolved: base.puzzlesSolved || 0,
      lessonsCompleted: base.lessonsCompleted || 0,
      gambitsCompleted: base.gambitsCompleted || 0,
      trapsCompleted: base.trapsCompleted || 0,
      streak: base.streak ?? 0,
      longestStreak: base.longestStreak ?? base.bestStreak ?? 0,
      bestStreak: base.bestStreak ?? base.longestStreak ?? 0,
      lastActivityDate: base.lastActivityDate ?? null,
      streakStartedAt: base.streakStartedAt ?? null,
      unlockedBadges: base.unlockedBadges || [],
      lastActiveDate: new Date().toISOString().split("T")[0],
      settings: base.settings || {
        theme: "tournament",
        soundEnabled: true,
        coachMode: true,
        boardStyle: "tournament"
      },
      createdAt: base.createdAt || new Date().toISOString()
    };

    const existingIndex = users.findIndex(
      (u) => u.id === uid || (verifiedEmail && u.email.toLowerCase() === verifiedEmail)
    );
    if (existingIndex !== -1) {
      users[existingIndex] = mergedUser;
    } else {
      users.push(mergedUser);
    }
    saveUsersDB(users);

    // Save to Firestore asynchronously so it never blocks login completion
    saveUserProfileToFirestore(mergedUser).catch((err) => {
      console.warn("Firestore sync warning during Google sign-in:", err);
    });

    syncLegacyUserProfile(mergedUser);

    const { passwordHash: _, ...userWithoutHash } = mergedUser;
    const token = `google_token_${uid}_${Date.now()}`;
    const session: AuthSession = {
      token,
      user: userWithoutHash,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days persistent
    };

    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("chessmaster_logged_in", "true");

    console.log("[GoogleAuth] Profile loaded");
    return { user: userWithoutHash, token };
  }

  // 2. Brand New First-Time Google User
  // Preferred name is Google displayName. If unavailable, use email prefix.
  const initialCandidate = displayName || extractUsernameFromEmail(verifiedEmail);
  const uniqueUsername = await generateUniqueUsername(initialCandidate);
  const avatar = photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(uniqueUsername)}`;

  const newGoogleUser: StoredUser = {
    id: uid,
    uid: uid,
    username: uniqueUsername,
    email: verifiedEmail || `${uniqueUsername.toLowerCase()}@gmail.com`,
    passwordHash: "google_authenticated_oauth",
    profilePicture: avatar,
    profileImageUrl: avatar,
    level: 1,
    xp: 0,
    coins: 0,
    rating: 1200,
    elo: 1200,
    puzzleElo: 1200,
    ratings: { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
    modeStats: {
      bullet: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      blitz: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      rapid: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 },
      classical: { games: 0, wins: 0, losses: 0, draws: 0, highest: 1200 }
    },
    matchHistory: [],
    highestRating: 1200,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    puzzlesSolved: 0,
    lessonsCompleted: 0,
    gambitsCompleted: 0,
    trapsCompleted: 0,
    streak: 0,
    longestStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    streakStartedAt: null,
    unlockedBadges: [],
    lastActiveDate: new Date().toISOString().split("T")[0],
    settings: {
      theme: "tournament",
      soundEnabled: true,
      coachMode: true,
      boardStyle: "tournament"
    },
    createdAt: new Date().toISOString()
  };

  users.push(newGoogleUser);
  saveUsersDB(users);

  // Save to Firestore asynchronously
  saveUserProfileToFirestore(newGoogleUser).catch((err) => {
    console.warn("Firestore sync warning during new Google user creation:", err);
  });

  syncLegacyUserProfile(newGoogleUser);

  const { passwordHash: _, ...userWithoutHash } = newGoogleUser;
  const token = `google_token_${uid}_${Date.now()}`;
  const session: AuthSession = {
    token,
    user: userWithoutHash,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  };

  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("chessmaster_logged_in", "true");

  console.log("[GoogleAuth] Profile loaded");
  return { user: userWithoutHash, token };
}

/**
 * Detects if the current environment is Android Capacitor native app,
 * an Android native shell, or mobile WebView bridge.
 * Returns false on standard web browsers to prevent web fallback popup errors.
 */
export function isAndroidMobilePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // 1. Android JavaScript Bridge injected by native app wrapper
    if ((window as any).AndroidBridge?.signInWithGoogle || (window as any).AndroidGoogleAuth?.signIn) {
      return true;
    }
    // 2. Capacitor native platform running on Android (strictly native, not web)
    const cap = (window as any).Capacitor || Capacitor;
    if (typeof cap?.isNativePlatform === "function" && cap.isNativePlatform()) {
      return true;
    }
    // 3. Native app protocol scheme
    if (window.location?.protocol === "capacitor:" || window.location?.protocol === "ionic:") {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Retrieves the effective Google Web Client ID for OAuth / ID token verification.
 * Only returns valid, non-placeholder credentials from environment, firebaseConfig, or window globals.
 * If not explicitly configured, returns undefined to allow Android's native
 * google-services.json (R.string.default_web_client_id) to be used automatically.
 * NEVER returns fabricated or fake strings like ${senderId}-...
 */
export function getEffectiveGoogleClientId(): string | undefined {
  const envWebClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  const envServerClientId = (import.meta as any).env?.VITE_GOOGLE_SERVER_CLIENT_ID;
  const configClientId = (firebaseConfig as any)?.oAuthClientId;
  const windowClientId = typeof window !== "undefined" 
    ? ((window as any).GOOGLE_CLIENT_ID || (window as any).GOOGLE_WEB_CLIENT_ID) 
    : undefined;

  const raw = envWebClientId || envServerClientId || configClientId || windowClientId;
  if (raw && typeof raw === "string" && raw.trim().length > 0) {
    const trimmed = raw.trim();
    // Verify it's a real format and not a placeholder or fake concat
    if (
      trimmed.includes(".apps.googleusercontent.com") &&
      !trimmed.includes("YOUR_") &&
      !trimmed.includes("dummy") &&
      !trimmed.startsWith("123456789")
    ) {
      return trimmed;
    }
  }

  return undefined;
}

/**
 * Concurrency flag to prevent duplicate simultaneous sign-in requests
 */
let isGoogleSignInRunning = false;

/**
 * Direct ID Token Authentication with Firebase (Used by Android Native Google Sign-In,
 * Credential Manager, Capacitor Plugins, or GIS).
 */
export async function signInWithGoogleIdToken(
  idToken: string, 
  accessToken?: string
): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  try {
    console.log("[GoogleAuth] Firebase credential created");
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const authResult = await withTimeout(
      signInWithCredential(auth, credential),
      25000,
      "Unable to complete sign-in. Please check your internet connection."
    );
    if (!authResult || !authResult.user) {
      throw new Error("Firebase Google authentication failed. Please try again.");
    }
    const uid = authResult.user.uid;
    if (!uid) {
      throw new Error("Firebase UID missing from authenticated user.");
    }
    console.log("[GoogleAuth] Firebase authentication successful");
    console.log("[GoogleAuth] Firebase user available");
    const session = await processAuthenticatedFirebaseUser(authResult.user);
    console.log("[GoogleAuth] Auth state authenticated");
    console.log("[GoogleAuth] Navigating to Dashboard");
    return session;
  } catch (error: any) {
    console.error("Firebase signInWithCredential error:", error);
    const errCode = error?.code || "";
    if (errCode === "auth/invalid-credential" || errCode === "auth/invalid-verification-id") {
      throw new Error("Invalid Google authentication credential. Please try again.");
    }
    if (errCode === "auth/network-request-failed" || errCode === "7") {
      throw new Error("Unable to sign in. Check your internet connection and try again.");
    }
    throw new Error(error.message || "Google Sign-In failed. Please try again.");
  }
}

/**
 * Native Android Google Sign-In Flow.
 * Exclusively invokes the native Google Account Chooser via Capacitor plugin or Android Bridge,
 * extracts the Google ID token, performs Firebase signInWithCredential,
 * hydrates/creates the user profile in Firestore, and transitions directly to Dashboard.
 * Absolutely NEVER uses signInWithPopup, signInWithRedirect, or window.open on Android.
 */
export async function performAndroidNativeGoogleAuth(): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  console.log("[GoogleAuth] Android detected");
  console.log("[GoogleAuth] Native sign-in starting");

  // 1. Check custom Android JavascriptInterface bridge if provided by wrapper
  if ((window as any).AndroidBridge?.signInWithGoogle || (window as any).AndroidGoogleAuth?.signIn) {
    try {
      console.log("[GoogleAuth] Account chooser opened");
      const bridge = (window as any).AndroidBridge || (window as any).AndroidGoogleAuth;
      const bridgePromise = new Promise<string>((resolve, reject) => {
        (window as any)._onAndroidGoogleAuthSuccess = (token: string) => resolve(token);
        (window as any)._onAndroidGoogleAuthError = (errMsg: string) => reject(new Error(errMsg));
        bridge.signInWithGoogle();
      });
      const idToken = await withTimeout(bridgePromise, 35000, "Google Sign-In timed out. Please try again.");
      if (idToken) {
        console.log("[GoogleAuth] Account selected");
        console.log("[GoogleAuth] ID token available");
        return await signInWithGoogleIdToken(idToken);
      } else {
        console.error("[GoogleAuth] Android bridge returned empty ID token");
        throw new Error("Unable to complete Google Sign-In. Please try again.");
      }
    } catch (bridgeErr: any) {
      const bMsg = bridgeErr?.message || String(bridgeErr);
      if (bMsg.includes("cancel") || bMsg.includes("12501")) {
        console.log("[GoogleAuth] Native account selection cancelled by user");
        throw new Error("POPUP_CANCELLED");
      }
      console.warn("Android bridge auth note:", bridgeErr);
    }
  }

  // 2. Use Capacitor GoogleAuth Plugin
  const clientId = getEffectiveGoogleClientId();
  console.log("Configuring Capacitor GoogleAuth. Explicit client ID:", clientId || "None (Using native Android default_web_client_id from google-services.json)");

  try {
    const cap = (window as any).Capacitor;
    const plugin = GoogleAuth || cap?.Plugins?.GoogleAuth || (window as any).GoogleAuth;
    
    if (plugin) {
      try {
        const initOptions: Record<string, any> = {
          scopes: ["profile", "email"],
          grantOfflineAccess: false
        };
        // ONLY pass clientId and serverClientId if an explicit valid client ID is provided.
        // Otherwise omit them so Capacitor GoogleAuth on Android automatically pulls
        // default_web_client_id from strings.xml generated by google-services.json.
        if (clientId) {
          initOptions.clientId = clientId;
          initOptions.serverClientId = clientId;
        }
        await withTimeout(plugin.initialize(initOptions), 6000, "Plugin init timeout");
      } catch (initErr) {
        console.log("GoogleAuth plugin initialize note:", initErr);
      }

      console.log("[GoogleAuth] Account chooser opened");
      const signInPromise = plugin.signIn();
      const googleUser = await withTimeout<any>(
        signInPromise,
        40000,
        "Google Sign-In timed out. Please try again."
      );
      
      console.log("[GoogleAuth] Account selected");
      const idToken =
        googleUser?.authentication?.idToken ||
        googleUser?.idToken ||
        googleUser?.token ||
        googleUser?.id_token ||
        googleUser?.response?.id_token ||
        googleUser?.credential;
      const accessToken =
        googleUser?.authentication?.accessToken ||
        googleUser?.accessToken;

      if (!idToken) {
        console.error("[GoogleAuth] Missing Google ID token from Google Account Picker result:", googleUser);
        throw new Error("Unable to complete Google Sign-In. Please try again.");
      }

      console.log("[GoogleAuth] ID token available");
      return await signInWithGoogleIdToken(idToken, accessToken);
    } else {
      throw new Error("GoogleAuth plugin is not available on this device.");
    }
  } catch (err: any) {
    const errObj = typeof err === "object" && err !== null ? err : {};
    const msg = err?.message || errObj.error || errObj.type || String(err);
    const code = String(err?.code || errObj.code || "");
    const errorStr = JSON.stringify(err);

    // User cancelled / closed Google account selection
    if (
      code === "12501" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      msg === "POPUP_CANCELLED" ||
      msg.includes("POPUP_CANCELLED") ||
      msg.includes("popup_closed_by_user") ||
      msg.includes("closed-by-user") ||
      msg.includes("12501") ||
      msg.includes("cancelled") ||
      msg.includes("canceled") ||
      msg.includes("closed") ||
      msg.includes("user_cancel") ||
      errorStr.includes("popup_closed_by_user") ||
      errorStr.includes("12501")
    ) {
      console.log("[GoogleAuth] Native account selection cancelled by user");
      throw new Error("POPUP_CANCELLED");
    }

    console.error("Android Native Google Sign-In caught error:", msg);

    // Google OAuth 401 invalid_client
    if (
      code === "401" ||
      msg.includes("401") ||
      msg.includes("invalid_client") ||
      msg.includes("OAuth client was not found")
    ) {
      console.error("Android OAuth 401 (invalid_client): Client ID not recognized in Google Cloud project:", (firebaseConfig as any).projectId);
      throw new Error("Google OAuth Client ID error (Error 401: invalid_client). Please check your Web Client ID and SHA-1 in Firebase Console.");
    }

    // Android Developer Error 10 (Fingerprint or package mismatch)
    if (code === "10" || msg.includes("10") || msg.includes("DEVELOPER_ERROR")) {
      console.error("Android DEVELOPER_ERROR (code 10): Ensure SHA-1/SHA-256 fingerprints are added in Firebase Console for package name.");
      throw new Error("Google Sign-In configuration error (Code 10: DEVELOPER_ERROR). Please ensure SHA-1/SHA-256 fingerprints are registered in Firebase.");
    }

    // Network connection error
    if (code === "7" || msg.includes("7") || msg.includes("NETWORK_ERROR") || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("internet")) {
      throw new Error("Unable to sign in. Check your internet connection and try again.");
    }

    if (msg.includes("Unable to complete Google Sign-In") || msg.includes("timed out")) {
      throw err;
    }

    throw new Error("Google Sign-In failed. Please try again.");
  }
}

/**
 * Universal Android / Mobile / Web Google Authentication Flow.
 * On Android/Capacitor: Exclusively uses Native Google Account Chooser with ID token exchange.
 * On Web: Uses Google Auth Popup.
 * Absolutely NEVER calls signInWithPopup or signInWithRedirect on Android.
 */
export async function signInWithGoogle(): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string }> {
  if (isGoogleSignInRunning) {
    throw new Error("Sign-in is already in progress.");
  }
  isGoogleSignInRunning = true;

  try {
    // If running inside Android mobile / Capacitor native app shell:
    if (isAndroidMobilePlatform()) {
      return await performAndroidNativeGoogleAuth();
    }

    // Standard Desktop / Mobile Web Browser Flow (Firebase Popup)
    googleProvider.setCustomParameters({
      prompt: "select_account"
    });

    console.log("[GoogleAuth] Account chooser opened");
    const popupPromise = signInWithPopup(auth, googleProvider);
    const authResult = await withTimeout(
      popupPromise,
      35000,
      "Google Sign-In request timed out. Please try again."
    );

    if (!authResult || !authResult.user) {
      throw new Error("Google Sign-In failed. Please try again.");
    }
    const uid = authResult.user.uid;
    if (!uid) {
      throw new Error("Firebase UID missing from authenticated user.");
    }
    console.log("[GoogleAuth] Account selected");
    console.log("[GoogleAuth] Firebase authentication successful");
    console.log("[GoogleAuth] Firebase user available");
    const session = await processAuthenticatedFirebaseUser(authResult.user);
    console.log("[GoogleAuth] Auth state authenticated");
    console.log("[GoogleAuth] Navigating to Dashboard");
    return session;
  } catch (error: any) {
    const errObj = typeof error === "object" && error !== null ? error : {};
    const errCode = String(error?.code || errObj.code || "");
    const errMsg = error?.message || errObj.error || errObj.type || String(error);
    const errorStr = JSON.stringify(error);

    // User explicitly cancelled / dismissed picker
    if (
      errCode === "auth/popup-closed-by-user" || 
      errCode === "auth/cancelled-popup-request" ||
      errCode === "12501" ||
      errMsg === "POPUP_CANCELLED" ||
      errMsg.includes("POPUP_CANCELLED") ||
      errMsg.includes("popup_closed_by_user") ||
      errMsg.includes("closed-by-user") ||
      errMsg.includes("12501") ||
      errMsg.includes("cancelled") ||
      errMsg.includes("canceled") ||
      errorStr.includes("popup_closed_by_user") ||
      errorStr.includes("12501")
    ) {
      console.log("[GoogleAuth] Account selection cancelled by user");
      throw new Error("POPUP_CANCELLED");
    }

    // Network connection failure
    if (errCode === "auth/network-request-failed" || errCode === "7") {
      throw new Error("Unable to sign in. Check your internet connection and try again.");
    }

    // If popup is blocked by browser on desktop
    if (
      errCode === "auth/popup-blocked" || 
      errCode === "popup_blocked_by_browser" ||
      errCode === "auth/operation-not-supported-in-this-environment" ||
      errMsg.includes("popup_blocked_by_browser") ||
      errMsg.includes("popup-blocked") ||
      errorStr.includes("popup_blocked_by_browser")
    ) {
      console.warn("[GoogleAuth] Popup blocked by browser");
      throw new Error("Google Sign-In popup was blocked by your browser. Please allow popups for ChessZen to sign in.");
    }

    // Developer / Config errors
    if (errMsg.includes("DEVELOPER_ERROR") || errMsg.includes("code 10")) {
      console.error("Android DEVELOPER_ERROR: Package name or SHA-1 certificate fingerprint mismatch.");
      throw new Error("Google Sign-In configuration error. Please verify SHA-1 and package name in Firebase.");
    }

    throw new Error(error?.message || "Google Sign-In failed. Please try again.");
  } finally {
    isGoogleSignInRunning = false;
  }
}

/**
 * Clean legacy redirect check (no-op to prevent broken sessionStorage errors).
 */
export async function checkPendingRedirectAuth(): Promise<{ user: Omit<StoredUser, 'passwordHash'>; token: string } | null> {
  return null;
}

// Forgot Password OTP Flow
export interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
}

export function generateOTPForEmail(email: string): string {
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error("No account registered with this email address.");
  }

  // Generate 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const record: OTPRecord = {
    email: cleanEmail,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
  };

  localStorage.setItem(OTP_STORE_KEY + "_" + cleanEmail, JSON.stringify(record));
  return code;
}

export function verifyOTPCode(email: string, code: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const raw = localStorage.getItem(OTP_STORE_KEY + "_" + cleanEmail);
  if (!raw) throw new Error("OTP expired or not found. Please request a new code.");

  const record: OTPRecord = JSON.parse(raw);
  if (Date.now() > record.expiresAt) {
    localStorage.removeItem(OTP_STORE_KEY + "_" + cleanEmail);
    throw new Error("OTP verification code has expired. Please request a new code.");
  }

  if (record.code !== code.trim()) {
    throw new Error("Invalid verification code. Please check and try again.");
  }

  return true;
}

export async function resetPasswordWithVerifiedOTP(
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> {
  verifyOTPCode(email, code);

  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (userIndex === -1) {
    throw new Error("User account not found.");
  }

  const newHash = await hashPassword(newPassword);
  users[userIndex].passwordHash = newHash;
  saveUsersDB(users);

  // Clear OTP record
  localStorage.removeItem(OTP_STORE_KEY + "_" + cleanEmail);
  return true;
}

// Session Management
export function getCurrentAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!raw) return null;
  try {
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      logoutUser();
      return null;
    }
    return session;
  } catch {
    logoutUser();
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
  localStorage.removeItem("chessmaster_logged_in");
  localStorage.setItem("chessmaster_logged_in", "false");
  localStorage.removeItem("chessmaster_user_profile");
  
  // Sign out from Firebase
  try {
    signOut(auth).catch(() => {});
  } catch {
    // ignore
  }

  // Sign out from Capacitor GoogleAuth plugin if present
  try {
    const cap = (window as any).Capacitor;
    const capGoogleAuth = cap?.Plugins?.GoogleAuth || (window as any).GoogleAuth;
    if (capGoogleAuth?.signOut) {
      capGoogleAuth.signOut().catch(() => {});
    }
  } catch {
    // ignore
  }

  // Disable GIS auto-select if present
  try {
    if ((window as any).google?.accounts?.id?.disableAutoSelect) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
  } catch {
    // ignore
  }
}

// Helper to keep App's existing localStorage structure synced
function syncLegacyUserProfile(user: StoredUser): void {
  const savedRating = user.rating ?? user.elo ?? 1200;
  const legacyProfile = {
    id: user.id,
    uid: user.id,
    username: user.username,
    email: user.email,
    isGuest: false,
    elo: savedRating,
    rating: savedRating,
    puzzleElo: user.puzzleElo ?? 1200,
    ratings: user.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 },
    modeStats: user.modeStats,
    matchHistory: user.matchHistory || [],
    puzzleProgress: (user as any).puzzleProgress || {},
    gambitProgress: (user as any).gambitProgress || {},
    boardTheme: (user as any).boardTheme || user.settings?.boardStyle || "tournament",
    settings: user.settings,
    profilePicture: user.profilePicture,
    profileImageUrl: user.profilePicture,
    highestRating: user.highestRating || savedRating,
    gamesPlayed: user.gamesPlayed || 0,
    wins: user.wins || 0,
    losses: user.losses || 0,
    draws: user.draws || 0,
    streak: user.streak ?? 0,
    longestStreak: user.longestStreak ?? user.bestStreak ?? 0,
    bestStreak: user.bestStreak ?? user.longestStreak ?? 0,
    lastActivityDate: user.lastActivityDate ?? null,
    streakStartedAt: user.streakStartedAt ?? null,
    level: user.level || 1,
    xp: user.xp || 0,
    coins: user.coins || 0,
    unlockedBadges: user.unlockedBadges || [],
    lastActiveDate: user.lastActiveDate ?? null
  };
  localStorage.setItem("chessmaster_user_profile", JSON.stringify(legacyProfile));

  // Sync to registered users array for existing components
  const rawReg = localStorage.getItem("chessmaster_registered_users");
  let regUsers = rawReg ? JSON.parse(rawReg) : [];
  const idx = regUsers.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase() || (u.profile && u.profile.id === user.id));
  if (idx !== -1) {
    regUsers[idx].username = user.username;
    regUsers[idx].profile = legacyProfile;
  } else {
    regUsers.push({
      id: user.id,
      email: user.email,
      username: user.username,
      password: "hashed_in_auth_service",
      profile: legacyProfile
    });
  }
  localStorage.setItem("chessmaster_registered_users", JSON.stringify(regUsers));
}
