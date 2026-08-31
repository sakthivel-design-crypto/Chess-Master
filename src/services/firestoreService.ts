import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from "../lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  limit 
} from "firebase/firestore";
import { StoredUser } from "./authService";
import { MatchRecord } from "../types";

/**
 * Save or update user profile in Firestore (/users/{userId})
 */
export async function saveUserProfileToFirestore(user: any): Promise<void> {
  const userId = user.uid || user.id || (user.email ? ("usr_" + user.email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")) : user.username);
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, "users", userId);
    const ratingVal = user.rating ?? user.elo ?? 1200;
    const puzzleEloVal = user.puzzleElo ?? 1200;
    const ratingsVal = user.ratings || { bullet: 1200, blitz: 1200, rapid: 1200, classical: 1200 };
    const boardThemeVal = user.boardTheme || user.settings?.boardTheme || "tournament";

    const payload: Record<string, any> = {
      id: userId,
      uid: userId,
      username: user.username || "player",
      email: user.email || "",
      profilePicture: user.profilePicture || user.profileImageUrl || "",
      profileImageUrl: user.profileImageUrl || user.profilePicture || "",
      boardTheme: boardThemeVal,
      level: user.level ?? 1,
      xp: user.xp ?? 0,
      coins: user.coins ?? 0,
      rating: ratingVal,
      elo: ratingVal,
      puzzleElo: puzzleEloVal,
      ratings: ratingsVal,
      modeStats: user.modeStats || {},
      gamesPlayed: user.gamesPlayed ?? 0,
      gamesWon: user.gamesWon ?? user.wins ?? 0,
      gamesLost: user.gamesLost ?? user.losses ?? 0,
      wins: user.wins ?? user.gamesWon ?? 0,
      losses: user.losses ?? user.gamesLost ?? 0,
      draws: user.draws ?? 0,
      puzzleProgress: user.puzzleProgress || {},
      gambitProgress: user.gambitProgress || {},
      puzzleStats: user.puzzleStats || {},
      matchHistory: user.matchHistory || [],
      friends: user.friends || [],
      streak: user.streak ?? 0,
      longestStreak: user.longestStreak ?? user.bestStreak ?? 0,
      bestStreak: user.bestStreak ?? user.longestStreak ?? 0,
      lastActivityDate: user.lastActivityDate ?? null,
      streakStartedAt: user.streakStartedAt ?? null,
      unlockedBadges: user.unlockedBadges || [],
      lastActiveDate: user.lastActiveDate ?? new Date().toISOString().split("T")[0],
      settings: {
        theme: boardThemeVal,
        boardTheme: boardThemeVal,
        soundEnabled: user.settings?.soundEnabled ?? true,
        boardHaptics: user.settings?.boardHaptics ?? true,
        pieceStyle: user.settings?.pieceStyle ?? "cburnett",
        moveMethod: user.settings?.moveMethod ?? "drag_or_click",
        coachMode: true,
        boardStyle: boardThemeVal
      },
      updatedAt: new Date().toISOString()
    };

    if (user.createdAt) {
      payload.createdAt = user.createdAt;
    }

    await setDoc(userRef, payload, { merge: true });
    console.log("Successfully saved user profile to Firestore:", userId, "Rating:", ratingVal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Helper to prevent hung Firestore requests
 */
function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore operation timed out"));
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
 * Get user profile from Firestore
 */
export async function getUserProfileFromFirestore(userId: string): Promise<Omit<StoredUser, 'passwordHash'> | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, "users", userId);
    const snap = await withFirestoreTimeout(getDoc(userRef), 5000);
    if (snap.exists()) {
      return snap.data() as Omit<StoredUser, 'passwordHash'>;
    }
    return null;
  } catch (error) {
    console.warn("Firestore profile fetch note (falling back):", error);
    return null;
  }
}

/**
 * Save match record to subcollection (/users/{userId}/matches/{matchId})
 */
export async function saveMatchToFirestore(userId: string, match: MatchRecord): Promise<void> {
  const path = `users/${userId}/matches`;
  try {
    const matchesRef = collection(db, "users", userId, "matches");
    await addDoc(matchesRef, {
      ...match,
      date: match.date || new Date().toISOString()
    });
    console.log("Saved match to Firestore subcollection for user:", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get match history from Firestore subcollection
 */
export async function getUserMatchesFromFirestore(userId: string): Promise<MatchRecord[]> {
  const path = `users/${userId}/matches`;
  try {
    const matchesRef = collection(db, "users", userId, "matches");
    const q = query(matchesRef, orderBy("date", "desc"), limit(50));
    const snap = await getDocs(q);
    const matches: MatchRecord[] = [];
    snap.forEach((doc) => {
      matches.push(doc.data() as MatchRecord);
    });
    return matches;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Save generated Study Plan to subcollection (/users/{userId}/studyPlans/{planId})
 */
export async function saveStudyPlanToFirestore(userId: string, plan: any): Promise<void> {
  const path = `users/${userId}/studyPlans`;
  try {
    const plansRef = collection(db, "users", userId, "studyPlans");
    await addDoc(plansRef, {
      title: plan.title || "Custom Study Plan",
      focusAreas: plan.focusAreas || [],
      dailySchedule: plan.dailySchedule || [],
      generalAdvice: plan.generalAdvice || "",
      createdAt: new Date().toISOString()
    });
    console.log("Saved study plan to Firestore for user:", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Find user profile by email in Firestore
 */
export async function getUserProfileByEmailFromFirestore(email: string): Promise<Omit<StoredUser, 'passwordHash'> | null> {
  if (!email || !email.trim()) return null;
  const cleanEmail = email.trim().toLowerCase();
  const path = "users";
  try {
    const q = query(collection(db, "users"), where("email", "==", cleanEmail), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Omit<StoredUser, 'passwordHash'>;
    }
  } catch (error) {
    console.warn("Firestore query by email warning:", error);
  }

  // Fallback: check if document ID is the email address or standard uid format
  try {
    const formattedId = "usr_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const docSnapFormatted = await getDoc(doc(db, "users", formattedId));
    if (docSnapFormatted.exists()) {
      return docSnapFormatted.data() as Omit<StoredUser, 'passwordHash'>;
    }
    const docSnap = await getDoc(doc(db, "users", cleanEmail));
    if (docSnap.exists()) {
      return docSnap.data() as Omit<StoredUser, 'passwordHash'>;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Check if a username is already taken in Firestore
 */
export async function isUsernameTakenInFirestore(username: string): Promise<boolean> {
  if (!username || !username.trim()) return false;
  const cleanUsername = username.trim().toLowerCase();
  try {
    const q = query(collection(db, "users"), where("username", "==", cleanUsername), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return true;
    }
    // Also check case-insensitive match by doc ID or scanning if needed
    const docSnap = await getDoc(doc(db, "users", cleanUsername));
    if (docSnap.exists()) {
      return true;
    }
  } catch (error) {
    console.warn("Firestore username availability check warning:", error);
  }
  return false;
}

