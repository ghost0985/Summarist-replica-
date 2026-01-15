"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser } from "@/redux/slices/userSlice";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

export default function InitUser() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up existing listeners
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      // === User logged out ===
      if (!firebaseUser) {
        console.log("👋 Logged out, switching to guest mode");
        dispatch(clearUser());

        const guestUserData = {
          uid: "guest",
          email: "guest@summarist.app",
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
        return;
      }

      // === Authenticated user ===
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("⚠️ No Firestore doc for user yet. Creating fallback guest.");
          const guestData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "guest@summarist.app",
            isPremium: false,
            isGuest: firebaseUser.isAnonymous ?? false,
            premiumSource: "none",
          };
          dispatch(setUser(guestData));
          return;
        }

        // Subscribe to user updates
        unsubscribeUser = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email ?? "guest@summarist.app",
                displayName: firebaseUser.displayName ?? "User",
                isPremium: data.isPremium ?? false,
                planType: data.planType ?? null,
                subscriptionStatus: data.subscriptionStatus ?? "inactive",
                premiumSource: data.premiumSource ?? "none",
                isGuest: firebaseUser.isAnonymous ?? false,
              })
            );
          }
        });
      } catch (err) {
        console.error("🔥 Error initializing user:", err);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [dispatch]);

  return null;
}
