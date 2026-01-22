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
    null,
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { savedBooks, toggleSavedBook } = useGuestLibrary();

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch book + user library
  useEffect(() => {
    let isMounted = true;

    async function fetchBook() {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`,
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

        // Handle logged-in users
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

        // Handle guest users
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

  // Save / remove handler
  const handleToggleSave = async () => {
    if (!book) return;

    if (isGuest) {
      toggleSavedBook(book.id);
      setIsSaved((prev) => !prev);
      return;
    }

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

  if (loading) return <BookPageSkeleton />;

  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 dark:text-gray-300">Book not found</p>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900 min-h-screen transition-colors duration-500 overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col-reverse [@media(min-width:990px)]:flex-row [@media(min-width:990px)]:items-start [@media(min-width:990px)]:justify-between gap-8">
        {/* --- Left side: Text content --- */}
        <div className="flex-1">
          <h1 className="text-[23px] font-bold text-gray-900 dark:text-white mb-2">
            {book.title}
          </h1>
          <p className="text-gray-800 dark:text-gray-300 font-semibold mb-1">
            {book.author}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {book.subTitle}
          </p>

          {/* --- Divider --- */}
          <hr className="mt-5 mb-5 border-gray-200 dark:border-gray-700" />

          {/* --- Stats Section (2x2 balanced layout) --- */}
          <div className="grid grid-cols-2 gap-y-3 max-w-[420px] text-[15px] sm:text-[16px] text-gray-900 dark:text-gray-300">
            <span className="flex items-center gap-2">
              <Star size={20} />
              <span className="font-medium">
                {book.averageRating?.toFixed(1)}{" "}
                <span className="font-normal text-gray-600 dark:text-gray-400">
                  ({book.totalRating} ratings)
                </span>
              </span>
            </span>

            <span className="flex items-center gap-2">
              <Clock size={20} />
              <span>{duration}</span>
            </span>

            <span className="flex items-center gap-2">
              <Mic size={20} />
              <span>Audio & Text</span>
            </span>

            <span className="flex items-center gap-2">
              <Lightbulb size={20} />
              <span>{book.keyIdeas} Key ideas</span>
            </span>
          </div>

          {/* --- Divider --- */}
          <hr className="mt-4 mb-5 border-gray-200 dark:border-gray-700" />

          {/* --- Action Buttons --- */}
          <div className="gap-3">
            <BookActionButtons
              bookId={book.id}
              isPremiumOnly={book.subscriptionRequired}
            />
          </div>

          {/* About Section */}
          <div className="mt-10 text-left">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What's it about?
            </h2>
            <div className="flex flex-wrap gap-3 mb-5">
              {book.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-gray-800 dark:text-gray-400 leading-relaxed">
              {book.bookDescription}
            </p>
          </div>

          {/* Author Section */}
          <div className="mt-5 text-left pb-16">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              About the author
            </h2>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              {book.authorDescription}
            </p>
          </div>
        </div>

        {/* --- Right side: Image --- */}
        <div className="flex justify-center [@media(min-width:990px)]:justify-end w-full [@media(min-width:990px)]:w-[320px] mb-6 [@media(min-width:990px)]:mb-0">
          <Image
            src={book.imageLink}
            alt={book.title}
            width={320}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}
