"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Book } from "@/types/book";
import {
  Clock,
  Star,
  Mic,
  Bookmark,
  Lightbulb,
  BookmarkCheck,
} from "lucide-react";
import BookPageSkeleton from "@/components/books/BookPageSkeleton";
import { addBookToLibrary, removeBookFromLibrary, db } from "@/lib/firebase";
import { useAppSelector } from "@/redux/hooks";
import { doc, getDoc } from "firebase/firestore";
import BookActionButtons from "@/components/books/BookActionButtons";
import { useGuestLibrary } from "@/hooks/useGuestLibrary";

export default function BookPage() {
  const { id } = useParams();
  const { uid, isGuest } = useAppSelector((state) => state.user);
  const [book, setBook] = useState<Book | null>(null);
  const [duration, setDuration] = useState<string>("--:--");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"save" | "remove" | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { savedBooks, toggleSavedBook } = useGuestLibrary();

  // === Format time helper ===
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // === Fetch book and user library state ===
  useEffect(() => {
    let isMounted = true;

    async function fetchBook() {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        if (!res.ok) throw new Error("Book not found");
        const data = await res.json();
        if (!isMounted) return;
        setBook(data);

        // Load audio duration
        const audio = document.createElement("audio");
        audio.src = data.audioLink;
        audio.addEventListener("loadedmetadata", () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(formatTime(audio.duration));
          }
        });

        // === Handle normal users (Firestore) ===
        if (uid && !isGuest) {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (!isMounted) return;
            setIsSaved(userData.savedBooks?.includes(id));
            setIsFinished(userData.finishedBooks?.includes(id));
          }
        }

        // === Handle guest users (localStorage) ===
        if (isGuest) {
          setIsSaved(savedBooks.includes(id as string));
        }

        if (isMounted) setLoading(false);
      } catch (err: any) {
        if (err.code === "permission-denied") {
          console.warn("User logged out before data could be fetched.");
          return;
        }
        console.error("Error fetching book:", err);
        if (isMounted) setLoading(false);
      }
    }

    fetchBook();

    return () => {
      isMounted = false;
    };
  }, [id, uid, isGuest, savedBooks]);

  // Keep guest saved state in sync with localStorage
  useEffect(() => {
    if (isGuest && id) {
      setIsSaved(savedBooks.includes(id as string));
    }
  }, [isGuest, savedBooks, id]);

  // === Handle save/remove ===
  const handleToggleSave = async () => {
    if (!book) return;

    // === Guest users: localStorage only ===
    if (isGuest) {
      toggleSavedBook(book.id);
      setIsSaved((prev) => !prev);
      return;
    }

    // === Normal users: Firestore ===
    try {
      setActionLoading(isSaved ? "remove" : "save");

      if (isSaved) {
        await removeBookFromLibrary(uid!, book.id);
        setIsSaved(false);
      } else {
        await addBookToLibrary(book.id, uid!);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error updating library:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // === Loading skeleton ===
  if (loading) return <BookPageSkeleton />;

  // === No book found ===
  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-300 transition-colors duration-300">
          Book not found
        </p>
      </div>
    );
  }

  // === Render book page ===
  return (
    <div className="pt-5 dark:bg-gray-900 min-h-screen transition-colors duration-500 overflow-auto">
      <div className="max-w-2xl mx-auto px-4">
        {/* --- Book Image --- */}
        <div className="flex justify-center mb-6">
          <Image
            src={book.imageLink}
            alt={book.title}
            width={300}
            height={360}
            className="rounded-md shadow-md"
          />
        </div>

        {/* --- Title, Author, Subtitle --- */}
        <h1 className="text-[23px] font-bold text-gray-900 dark:text-white transition-colors duration-300 mb-3 text-center sm:text-left">
          {book.title}
        </h1>
        <p className="text-gray-900 dark:text-gray-300 font-bold text-center sm:text-left transition-colors duration-300">
          {book.author}
        </p>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-3 text-center sm:text-left transition-colors duration-300">
          {book.subTitle}
        </p>

        {/* --- Divider --- */}
        <hr className="mt-5 mb-4 border-gray-300 dark:border-gray-700" />

        {/* --- Stats --- */}
        <div className="grid grid-cols-2 gap-5 text-lg text-gray-900 dark:text-gray-400 transition-colors duration-300">
          <span className="flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            {book.averageRating?.toFixed(1)} ({book.totalRating} ratings)
          </span>
          <span className="flex items-center gap-2">
            <Clock size={18} /> {duration}
          </span>
          <span className="flex items-center gap-2">
            <Mic size={18} /> Audio & Text
          </span>
          <span className="flex items-center gap-2">
            <Lightbulb size={18} /> {book.keyIdeas} key ideas
          </span>
        </div>

        {/* --- Divider --- */}
        <hr className="mt-5 mb-4 border-gray-300 dark:border-gray-700" />

        {/* --- Action Buttons --- */}
        <div className="gap-3">
          <BookActionButtons
            bookId={book.id}
            isPremiumOnly={book.subscriptionRequired}
          />
        </div>

        {/* --- Save / Remove from Library --- */}
        <div className="mt-4">
          <button
            onClick={handleToggleSave}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={18} />
                <span>
                  {actionLoading === "remove"
                    ? "Removing..."
                    : "Saved in My Library"}
                </span>
              </>
            ) : (
              <>
                <Bookmark size={18} />
                <span>
                  {actionLoading === "save"
                    ? "Saving..."
                    : "Add title to My Library"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* --- About Section --- */}
        <div className="mt-10 text-left">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
            What's it about?
          </h2>
          <div className="flex flex-wrap gap-3 mb-5">
            {book.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-400 leading-relaxed transition-colors duration-300">
            {book.bookDescription}
          </p>
        </div>

        {/* --- Author Section --- */}
        <div className="mt-10 text-left pb-16">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
            About the author
          </h2>
          <p className="text-gray-700 dark:text-gray-400 leading-relaxed transition-colors duration-300">
            {book.authorDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
