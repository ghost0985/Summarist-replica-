export const runtime = "node.js"

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  signInAnonymously,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { store } from "@/redux/store";
import { setUser, clearUser } from "@/redux/slices/userSlice";

export type PremiumSource = "none" | "guest" | "stripe";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!firebaseConfig.apiKey) {
  console.error("❌ Missing Firebase env vars in build:", firebaseConfig);
} else {
  console.log("✅ Firebase config successfully loaded:", firebaseConfig);
}


// === Initialize Firebase ===
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// === Default starter books ===
const DEFAULT_BOOKS = ["book-1", "book-2"];

// === Ensure user doc exists in Firestore ===
async function ensureUserDoc(
  user: User,
  overrides?: Partial<{
    isPremium: boolean;
    isGuest: boolean;
    premiumSource: PremiumSource;
  }>
) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email ?? "guest@summarist.app",
      isPremium: overrides?.isPremium ?? false,
      isGuest: overrides?.isGuest ?? user.isAnonymous ?? false,
      premiumSource: overrides?.premiumSource ?? "none",
      savedBooks: DEFAULT_BOOKS,
      finishedBooks: [],
      createdAt: new Date(),
    });
    console.log("Created new Firestore doc for user:", user.uid);
  }
}

// === Save or update user profile ===
async function saveUserToFirestore(
  user: User | null,
  overrides?: Partial<{
    isPremium: boolean;
    isGuest: boolean;
    premiumSource: PremiumSource;
  }>
) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await ensureUserDoc(user, overrides);
  } else {
    const existing = userSnap.data();
    const updatedFields: Record<string, any> = {};

    if (existing.email !== user.email) updatedFields.email = user.email ?? null;
    if (existing.isGuest === undefined)
      updatedFields.isGuest = user.isAnonymous ?? false;
    if (existing.savedBooks === undefined)
      updatedFields.savedBooks = DEFAULT_BOOKS;
    if (existing.finishedBooks === undefined) updatedFields.finishedBooks = [];

    updatedFields.isPremium =
      existing.isPremium ?? overrides?.isPremium ?? false;
    updatedFields.premiumSource =
      existing.premiumSource ?? overrides?.premiumSource ?? "none";

    await setDoc(userRef, updatedFields, { merge: true });
  }

  // Always update Redux store
  store.dispatch(
    setUser({
      uid: user.uid,
      email: user.email ?? "guest@summarist.app",
      isPremium: overrides?.isPremium ?? false,
      isGuest: overrides?.isGuest ?? user.isAnonymous ?? false,
      premiumSource: overrides?.premiumSource ?? "none",
    })
  );
}

// === Auth Methods ===
async function signInWithEmail(email: string, password: string) {
  const result = await firebaseSignInWithEmailAndPassword(
    auth,
    email,
    password
  );
  await saveUserToFirestore(result.user);
  return result.user;
}

async function signUpWithEmail(email: string, password: string) {
  const result = await firebaseCreateUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await saveUserToFirestore(result.user, {
    isPremium: false,
    isGuest: false,
    premiumSource: "none",
  });
  return result.user;
}

async function signInWithGoogle() {
  const result = await firebaseSignInWithPopup(auth, googleProvider);
  await saveUserToFirestore(result.user);
  return result.user;
}

// === Guest Login ===
async function signInGuest() {
  try {
    // --- Try to load existing guest data from localStorage ---
    const existingGuestData = JSON.parse(
      localStorage.getItem("guestUserData") || "null"
    );

    const DEFAULT_BOOKS = ["book-1", "book-2"];
    const guestEmail = "guest@summarist.app";

    // --- Sign in anonymously ---
    const result = await signInAnonymously(auth);
    const user = result.user;

    // --- Determine what data to save ---
    const guestProfile = existingGuestData
      ? {
          ...existingGuestData,
          uid: user.uid,
          email: guestEmail,
          isPremium: true,
          isGuest: true,
          premiumSource: "guest",
          updatedAt: new Date(),
        }
      : {
          uid: user.uid,
          email: guestEmail,
          isPremium: true,
          isGuest: true,
          premiumSource: "guest",
          savedBooks: DEFAULT_BOOKS,
          finishedBooks: [],
          updatedAt: new Date(),
        };

    // --- Store locally ---
    localStorage.setItem("guestUserData", JSON.stringify(guestProfile));

    // --- Save or update Firestore (optional) ---
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, guestProfile, { merge: true });

    // --- Update Redux store immediately ---
    store.dispatch(
      setUser({
        uid: user.uid,
        email: guestEmail,
        isPremium: true,
        isGuest: true,
        premiumSource: "guest",
      })
    );

    return user;
  } catch (err: any) {
    console.error("Guest login error:", err);
    throw err;
  }
}

// === Library Helpers ===
async function addBookToLibrary(bookId: string, uid: string) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { savedBooks: arrayUnion(bookId) });
}

async function removeBookFromLibrary(userId: string, bookId: string) {
  await updateDoc(doc(db, "users", userId), {
    savedBooks: arrayRemove(bookId),
  });
}

async function markBookAsFinished(userId: string, bookId: string) {
  await updateDoc(doc(db, "users", userId), {
    savedBooks: arrayRemove(bookId),
    finishedBooks: arrayUnion(bookId),
  });
}

// === Logout & Reset ===
async function logout() {
  await firebaseSignOut(auth);
  store.dispatch(clearUser());
}

async function resetPassword(email: string) {
  return await firebaseSendPasswordResetEmail(auth, email);
}


export {
  app,
  auth,
  db,
  googleProvider,
  ensureUserDoc,
  saveUserToFirestore,
  signInGuest,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  addBookToLibrary,
  removeBookFromLibrary,
  markBookAsFinished,
  logout,
  resetPassword,
};
