"use client";

import { useEffect, useState } from "react";

const DEFAULT_GUEST_BOOKS = ["f9gy1gpai8", "g2tdej27d23", "g80xtszllo9"];

export function useGuestLibrary() {
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [finishedBooks] = useState<string[]>([
    "18tro3gle2p",
    "2l0idxm1rvw",
    "2ozpy1q1pbt",
    "4t0amyb4upc",
    "5bxl50cz4bt",
    "6ctat6ynzqp",
    "ap153fptaq",
    "cuolx5oryy8",
    "f9gy1gpai8",
    "g2tdej27d23",
    "g80xtszllo9",
    "hyqzkhdyq7h",
    "vt4i7lvosz",
  ]);

  // === Load guest saved books from localStorage (or initialize defaults) ===
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("guestSavedBooks") || "[]");

      if (Array.isArray(stored) && stored.length > 0) {
        setSavedBooks(stored);
      } else {
        // First-time guest: set defaults
        setSavedBooks(DEFAULT_GUEST_BOOKS);
        localStorage.setItem("guestSavedBooks", JSON.stringify(DEFAULT_GUEST_BOOKS));
      }
    } catch (e) {
      console.error("Failed to load guest library:", e);
      setSavedBooks(DEFAULT_GUEST_BOOKS);
      localStorage.setItem("guestSavedBooks", JSON.stringify(DEFAULT_GUEST_BOOKS));
    }
  }, []);

  // === Toggle saved book ===
  const toggleSavedBook = (bookId: string) => {
    setSavedBooks((prev) => {
      const newList = prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId];
      localStorage.setItem("guestSavedBooks", JSON.stringify(newList));
      return newList;
    });
  };

  return { savedBooks, finishedBooks, toggleSavedBook };
}
