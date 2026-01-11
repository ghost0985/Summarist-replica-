"use client";
import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import { useAppSelector } from "@/redux/hooks";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import BookCard from "@/components/books/BookCard";
import BookCardSkeleton from "@/components/books/BookCardSkeleton";
import BooksSlider from "@/components/books/BooksSlider";
import LoginModal from "@/components/auth/LoginModal";
import Image from "next/image";

const GUEST_UID = "LfyT2OqwnKTRHpeGF7fD1DkEda82";

const DEFAULT_GUEST_BOOK_IDS = {
  savedBooks: ["f9gy1gpai8", "g2tdej27d23", "g80xtszllo9"],
  finishedBooks: [
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
  ],
};

export default function LibraryPage() {
  const { uid, isGuest } = useAppSelector((state) => state.user);
  const [authReady, setAuthReady] = useState(false);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  async function fetchBooksFromAPI(ids: string[] | undefined | null): Promise<Book[]> {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const results: Book[] = [];

    for (const id of ids) {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        if (!res.ok) continue;
        const text = await res.text();
        if (!text.trim()) continue;
        const data = JSON.parse(text);
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

  useEffect(() => {
    if (!auth.currentUser && !uid && isGuest) {
      (async () => {
        const saved = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.savedBooks);
        const finished = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.finishedBooks);
        setSavedBooks(saved);
        setFinishedBooks(finished);
        setLoading(false);
      })();
      return;
    }

    if (!authReady) return;

    let unsub: (() => void) | null = null;

    async function attachListener(activeUID: string) {
      const userRef = doc(db, "users", activeUID);
      unsub = onSnapshot(
        userRef,
        async (docSnap) => {
          if (!docSnap.exists()) {
            setSavedBooks([]);
            setFinishedBooks([]);
            setLoading(false);
            return;
          }

          const data = docSnap.data();
          const savedIds: string[] = data.savedBooks || [];
          const finishedIds: string[] = data.finishedBooks || [];

          setLoading(true);
          try {
            const [saved, finished] = await Promise.all([
              fetchBooksFromAPI(savedIds),
              fetchBooksFromAPI(finishedIds),
            ]);
            setSavedBooks(saved);
            setFinishedBooks(finished);
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false)
      );
    }

    async function init() {
      const guestData = JSON.parse(localStorage.getItem("guestUserData") || "{}");
      const activeUID = uid || (guestData?.uid === "guest" ? "guest" : GUEST_UID);

      if (!uid && !auth.currentUser) {
        const saved = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.savedBooks);
        const finished = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.finishedBooks);
        setSavedBooks(saved);
        setFinishedBooks(finished);
        setLoading(false);
        return;
      }

      attachListener(activeUID);
    }

    init();
    return () => {
      if (unsub) unsub();
    };
  }, [authReady, uid, isGuest]);

  // === Firestore or Guest Listener ===
  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function loadGuestBooks() {
      setLoading(true);
      try {
        const cached = JSON.parse(localStorage.getItem("cachedGuestBooks") || "{}");
        if (cached?.saved?.length && cached?.finished?.length) {
          setSavedBooks(cached.saved);
          setFinishedBooks(cached.finished);
          setLoading(false);
          return;
        }

        const saved = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.savedBooks);
        const finished = await fetchBooksFromAPI(DEFAULT_GUEST_BOOK_IDS.finishedBooks);

        localStorage.setItem(
          "cachedGuestBooks",
          JSON.stringify({ saved, finished, timestamp: Date.now() })
        );

        setSavedBooks(saved);
        setFinishedBooks(finished);
      } finally {
        setLoading(false);
      }
    }

    async function attachListener(activeUID: string) {
      const userRef = doc(db, "users", activeUID);
      unsub = onSnapshot(
        userRef,
        async (docSnap) => {
          if (!docSnap.exists()) {
            setSavedBooks([]);
            setFinishedBooks([]);
            setLoading(false);
            return;
          }

          const data = docSnap.data();
          const savedIds: string[] = data.savedBooks || [];
          const finishedIds: string[] = data.finishedBooks || [];

          try {
            const [saved, finished] = await Promise.all([
              fetchBooksFromAPI(savedIds),
              fetchBooksFromAPI(finishedIds),
            ]);
            setSavedBooks(saved);
            setFinishedBooks(finished);
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false)
      );
    }

    async function init() {
      const guestData = JSON.parse(localStorage.getItem("guestUserData") || "{}");
      const isRealUser = !!auth.currentUser && !!uid;

      if (isGuest || !uid || auth.currentUser?.email === "guest@gmail.com") {
        await loadGuestBooks();
        return;
      }

      const activeUID = uid || auth.currentUser?.uid;
      if (activeUID) {
        await attachListener(activeUID);
        return;
      }

      await loadGuestBooks();
    }

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [uid, isGuest]);

  return (
    <div className="space-y-10 mx-auto max-w-5xl">
      {!uid && !isGuest ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
          <Image
            src="/assets/login.png"
            alt="Login illustration"
            width={460}
            height={250}
            className="mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Log in to your account to see your library.
          </h2>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-8 py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Login
          </button>
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
