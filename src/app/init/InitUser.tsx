"use client";

// === Imports ===
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAppDispatch } from "@/redux/hooks";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { doc, onSnapshot } from "firebase/firestore";

// === Component: InitUser ===
export default function InitUser() {
  const dispatch = useAppDispatch();
  const [authInitializing, setAuthInitializing] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (loggingOut) return;

      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      // === Authenticated User ===
      if (firebaseUser) {
        setAuthInitializing(false);

        // Guest (Anonymous) User Handling
        if (firebaseUser.isAnonymous) {
          const guestData =
            JSON.parse(localStorage.getItem("guestUserData") || "{}") || {};

          const fallbackGuest = {
            uid: "guest",
            email: "guest@gmail.com",
            displayName: "Guest",
            isPremium: true,
            planType: null,
            subscriptionStatus: "active",
            premiumSource: "guest-mode",
            isGuest: true,
            savedBooks: ["yQQhtPEnIauz9ci3Dp3q", "6JQOrLfrtNMzuyHwJKQ2"],
            finishedBooks: ["vhECFu7ctS5e0qx7P2Jx"],
          };

          const userData =
            Object.keys(guestData).length > 0 ? guestData : fallbackGuest;

          localStorage.setItem("guestUserData", JSON.stringify(userData));
          dispatch(setUser(userData));
          return;
        }

        // Normal User (Firestore Sync)
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUser = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              dispatch(
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email ?? null,
                  displayName: firebaseUser.displayName ?? "User",
                  isPremium: data.isPremium ?? false,
                  planType: data.planType ?? null,
                  subscriptionStatus: data.subscriptionStatus ?? "inactive",
                  premiumSource: data.premiumSource ?? "none",
                  isGuest: firebaseUser.isAnonymous ?? false,
                })
              );
            }
          },
          (error) => {
            if (error.code === "permission-denied") return;
          }
        );
      }

      // === Logged Out or No User ===
      else {
        if (!authInitializing) {
          const guestUserData = {
            uid: "guest",
            email: "guest@gmail.com",
            displayName: "Guest",
            isPremium: true,
            planType: null,
            subscriptionStatus: "active",
            premiumSource: "guest-mode",
            isGuest: true,
            savedBooks: ["yQQhtPEnIauz9ci3Dp3q", "6JQOrLfrtNMzuyHwJKQ2"],
            finishedBooks: ["vhECFu7ctS5e0qx7P2Jx"],
          };

          localStorage.setItem("guestUserData", JSON.stringify(guestUserData));
          dispatch(setUser(guestUserData));
        }

        setAuthInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [dispatch, authInitializing, loggingOut]);

    async function handleLogout() {
    setLoggingOut(true);
    localStorage.removeItem("guestUserData");
    await signOut(auth);
    dispatch(clearUser());
    setTimeout(() => setLoggingOut(false), 400);
  }

  return null;
}
