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
import { addBookToLibrary, removeBookFromLibrary } from "@/lib/firebase";
import { useAppSelector } from "@/redux/hooks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BookActionButtons from "@/components/books/BookActionButtons";

const BookPage = () => {
  const { id } = useParams();
  const { uid } = useAppSelector((state) => state.user);
  const [book, setBook] = useState<Book | null>(null);
  const [duration, setDuration] = useState<string>("--:--");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"save" | "remove" | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        if (!res.ok) throw new Error("Book not found");
        const data = await res.json();
        setBook(data);

        const audio = document.createElement("audio");
        audio.src = data.audioLink;
        audio.addEventListener("loadedmetadata", () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(formatTime(audio.duration));
          }
        });

        if (uid) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsSaved(userData.savedBooks?.includes(id));
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching book:", err);
        setLoading(false);
      }
    }

    fetchBook();
  }, [id, uid]);

  const handleSave = async () => {
    if (!uid || !book) return;
    setActionLoading("save");
    try {
      await addBookToLibrary(book.id, uid);
      setIsSaved(true);
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async () => {
    if (!uid || !book) return;
    setActionLoading("remove");
    try {
      await removeBookFromLibrary(uid, book.id);
      setIsSaved(false);
    } catch (err) {
      console.error("Error removing:", err);
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
    <div className="pt-10 dark:bg-gray-900 min-h-screen transition-colors duration-500 overflow-auto">
      <section
        className="
          w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12
          flex flex-col lg:grid lg:grid-cols-[1fr_380px]
          gap-14
          items-start
        "
      >
        {/* === LEFT COLUMN (or stacked on mobile) === */}
        <div className="order-2 lg:order-1">
          {/* Image for Mobile */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="relative">
              <Image
                src={book.imageLink}
                alt={book.title}
                width={250}
                height={320}
                className="rounded-lg shadow-md object-contain"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150px] h-[60px] bg-[#d2b26b]/50 rounded-t-full"></div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {book.title}
          </h1>

          <p className="text-gray-900 dark:text-gray-300 font-semibold">
            {book.author}
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {book.subTitle}
          </p>

          <hr className="mt-5 border-gray-200 dark:border-gray-700" />

          {/* --- Stats Section --- */}
          <div className="py-4 grid grid-cols-2 max-w-sm gap-y-3 text-gray-800 dark:text-gray-400 text-[15px]">
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

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className="mt-6 gap-3">
            <BookActionButtons
              bookId={book.id}
              isPremiumOnly={book.subscriptionRequired}
            />
          </div>

          {/* Save/Remove Button */}
          <div className="mt-5">
            {!isSaved ? (
              <button
                onClick={handleSave}
                disabled={actionLoading === "save"}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <Bookmark size={18} />
                <span>
                  {actionLoading === "save"
                    ? "Saving..."
                    : "Add title to My Library"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleRemove}
                disabled={actionLoading === "remove"}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <BookmarkCheck size={18} />
                <span>
                  {actionLoading === "remove"
                    ? "Removing..."
                    : "Saved in My Library"}
                </span>
              </button>
            )}
          </div>

          {/* About Section */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What's it about?
            </h2>
            <div className="flex flex-wrap gap-3 mb-5">
              {book.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              {book.bookDescription}
            </p>
          </div>

          {/* Author Section */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              About the author
            </h2>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              {book.authorDescription}
            </p>
          </div>
        </div>

        {/* === RIGHT COLUMN: Book Image (Desktop Only) === */}
        <div className="hidden lg:flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative">
            <Image
              src={book.imageLink}
              alt={book.title}
              width={300}
              height={400}
              className="rounded-lg shadow-md object-contain"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[80px] bg-[#d2b26b]/50 rounded-t-full"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookPage;
