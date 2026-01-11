import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const DEFAULT_BOOKS = ["book-1", "book-2"];

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
  const docSnap = await getDoc(userRef);

  // --- Guest Account (always premium) ---
  if (user.email === "guest@gmail.com") {
    const guestProfile = {
      email: "guest@gmail.com",
      isPremium: true,
      isGuest: true,
      premiumSource: "guest",
      savedBooks: DEFAULT_BOOKS,
      finishedBooks: [],
      updatedAt: new Date(),
    };

    await setDoc(userRef, guestProfile);
    store.dispatch(
      setUser({
        uid: user.uid,
        email: user.email,
        isPremium: true,
        isGuest: true,
        premiumSource: "guest",
      })
    );
    return;
  }

  // --- Existing User: Merge updates ---
  if (docSnap.exists()) {
    const existing = docSnap.data();
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

    store.dispatch(
      setUser({
        uid: user.uid,
        email: user.email ?? null,
        isPremium: updatedFields.isPremium,
        isGuest: updatedFields.isGuest ?? false,
        premiumSource: updatedFields.premiumSource,
      })
    );
  }
  // --- Create fresh profile ---
  else {
    const newProfile = {
      email: user.email ?? null,
      isPremium: overrides?.isPremium ?? false,
      isGuest: overrides?.isGuest ?? user.isAnonymous ?? false,
      premiumSource: overrides?.premiumSource ?? "none",
      savedBooks: DEFAULT_BOOKS,
      finishedBooks: [],
    };

    await setDoc(userRef, newProfile);

    store.dispatch(
      setUser({
        uid: user.uid,
        email: user.email ?? null,
        isPremium: newProfile.isPremium,
        isGuest: newProfile.isGuest,
        premiumSource: newProfile.premiumSource,
      })
    );
  }
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
    const gmail = "guest@gmail.com";
    const password = "guest123";

    const result = await firebaseSignInWithEmailAndPassword(
      auth,
      gmail,
      password
    );
    const user = result.user;

    await saveUserToFirestore(user, {
      isPremium: true,
      isGuest: true,
      premiumSource: "guest",
    });

    return user;
  } catch (err: any) {
    console.error("Guest login error:", err.code, err.message);
    throw err;
  }
}

// === Book Library Helpers ===
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

// === Misc ===
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
