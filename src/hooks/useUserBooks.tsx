"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import {
  auth,
  db,
  addBookToLibrary,
  removeBookFromLibrary,
  markBookAsFinished,
} from "@/lib/firebase";

export function useUserBooks() {
  const [books, setBooks] = useState<{ saved: string[]; finished: string[] }>({
    saved: [],
    finished: [],
  });

  useEffect(() => {
    let unsub: (() => void) | null = null;
    
    const attachListener = (uid: string) => {
      const userRef = doc(db, "users", uid);
      unsub = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBooks({
              saved: data.savedBooks || [],
              finished: data.finishedBooks || [],
            });
          } else {
            setBooks({ saved: [], finished: [] });
          }
        },
        (error) => {
          if (error.code === "permission-denied") {
            setBooks({ saved: [], finished: [] });
            return;
          }
          console.error("Firestore snapshot error:", error);
        }
      );
    };

    // --- reattach Firestore listener when user changes ---
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (unsub) {
        unsub();
        unsub = null;
      }

      if (firebaseUser && !firebaseUser.isAnonymous) {
        attachListener(firebaseUser.uid);
      } else {
        setBooks({ saved: [], finished: [] });
      }
    });
    return () => {
      if (unsub) unsub();
      unsubscribeAuth();
    };
  }, []);

  // ===  convenient API for components ===
  return {
    savedBooks: books.saved,
    finishedBooks: books.finished,

    // --- Add book to user's saved list ---
    addBook: (bookId: string) => {
      if (!auth.currentUser) return Promise.resolve();
      return addBookToLibrary(bookId, auth.currentUser.uid);
    },

    // --- Remove book from user's saved list ---
    removeBook: (bookId: string) => {
      if (!auth.currentUser) return Promise.resolve();
      return removeBookFromLibrary(auth.currentUser.uid, bookId);
    },

    // --- Mark a book as finished ---
    finishBook: (bookId: string) => {
      if (!auth.currentUser) return Promise.resolve();
      return markBookAsFinished(auth.currentUser.uid, bookId);
    },
  };
}
