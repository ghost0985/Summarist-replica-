"use client";

import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { useAppSelector } from "@/redux/hooks";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BookCard from "@/components/books/BookCard";
import BookCardSkeleton from "@/components/books/BookCardSkeleton";
import BooksSlider from "@/components/books/BooksSlider";
import LoginModal from "@/components/auth/LoginModal";
import Image from "next/image";
import { useGuestLibrary } from "@/hooks/useGuestLibrary";

// === Guest finished books (always the same) ===
const GUEST_FINISHED_BOOK_IDS = [
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
];

export default function LibraryPage() {
  const { uid, isGuest } = useAppSelector((state) => state.user);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { savedBooks: guestSaved } = useGuestLibrary(); // ✅ only use guest saved books

  // === Fetch Book Data from Cloud Function ===
  async function fetchBooksFromAPI(ids: string[]): Promise<Book[]> {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const results: Book[] = [];

    for (const id of ids) {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        if (!res.ok) continue;
        const data = await res.json();
        results.push({
          id,
          ...data,
          imageLink: data.imageLink?.startsWith("http")
            ? data.imageLink
            : "/images/default-cover.png",
        });
      } catch {
        continue;
      }
    }

    return results;
  }

  // === Load Library Data (Guest or Logged-in) ===
  useEffect(() => {
    async function loadLibrary() {
      setLoading(true);

      try {
        // ✅ Guest User → LocalStorage + Static Finished Books
        if (isGuest) {
          const saved = await fetchBooksFromAPI(guestSaved);
          const finished = await fetchBooksFromAPI(GUEST_FINISHED_BOOK_IDS);
          setSavedBooks(saved);
          setFinishedBooks(finished);
          setLoading(false);
          return;
        }

        // ✅ Logged-in User → Firestore Sync
        if (uid) {
          const userRef = doc(db, "users", uid);
          const unsubscribe = onSnapshot(
            userRef,
            async (snap) => {
              if (!snap.exists()) {
                setSavedBooks([]);
                setFinishedBooks([]);
                setLoading(false);
                return;
              }

              const data = snap.data();
              const savedIds = data.savedBooks || [];
              const finishedIds = data.finishedBooks || [];

              const [saved, finished] = await Promise.all([
                fetchBooksFromAPI(savedIds),
                fetchBooksFromAPI(finishedIds),
              ]);

              setSavedBooks(saved);
              setFinishedBooks(finished);
              setLoading(false);
            },
            (err) => {
              console.error("Error fetching user library:", err);
              setLoading(false);
            }
          );

          return () => unsubscribe();
        }

        // 🚫 No User (Empty State)
        setSavedBooks([]);
        setFinishedBooks([]);
        setLoading(false);
      } catch (err) {
        console.error("Error loading library:", err);
        setLoading(false);
      }
    }

    loadLibrary();
  }, [uid, isGuest, guestSaved]);

  // === No User (Show Login Prompt) ===
  if (!uid && !isGuest) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <Image
          src="/assets/login.png"
          alt="Login illustration"
          width={460}
          height={250}
          className="mb-6"
        />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Login to your account to see your library.
        </h2>
        <button
          onClick={() => setIsLoginOpen(true)}
          className="px-8 py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Login
        </button>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  // === Render Library ===
  return (
    <div className="space-y-10 mx-auto max-w-5xl">
      {/* --- Saved Books Section --- */}
      <section>
        <h2 className="text-xl font-semibold mb-2 mt-4">Saved Books</h2>
        <p className="text-gray-400">{savedBooks.length} items</p>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <BookCardSkeleton />
                </div>
              ))}
          </div>
        ) : savedBooks.length > 0 ? (
          <BooksSlider
            title=" "
            items={savedBooks}
            renderItem={(book: Book) => <BookCard key={book.id} book={book} />}
          />
        ) : (
          <p className="italic text-gray-500 mt-3">No books to display</p>
        )}
      </section>

      {/* --- Finished Books Section --- */}
      <section>
        <h2 className="text-xl font-semibold mb-2 mt-4">Finished Books</h2>
        <p className="text-gray-400 mb-4">{finishedBooks.length} items</p>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <BookCardSkeleton />
                </div>
              ))}
          </div>
        ) : finishedBooks.length > 0 ? (
          <BooksSlider
            title=" "
            items={finishedBooks}
            renderItem={(book: Book) => <BookCard key={book.id} book={book} />}
          />
        ) : (
          <p className="italic text-gray-500 mt-3">No books to display</p>
        )}
      </section>
    </div>
  );
}
