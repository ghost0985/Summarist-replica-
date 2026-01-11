"use client";

import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { Book } from "@/types/book";
import { useEffect, useState } from "react";
import { Clock, Star } from "lucide-react";
import Link from "next/link";

interface Props {
  book: Book;
  isSaved?: boolean;
  isFinished?: boolean;
}

// === Format time from seconds to mm:ss ===
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// === Component: BookCard ===
const BookCard = ({ book }: Props) => {
  const [duration, setDuration] = useState<string>("--:--");
  const user = useAppSelector((state) => state.user)

  // === Fetch audio duration ===
  useEffect(() => {
    if (!book.audioLink) return;
    const audio = document.createElement("audio");
    audio.src = book.audioLink;

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(formatTime(audio.duration));
      }
    });

    return () => {
      audio.removeAttribute("src");
    };
  }, [book.audioLink]);

  return (
    <Link href={`/book/${book.id}`}>
      <div
        className="
          w-44 flex-shrink-0 cursor-pointer p-2 rounded-lg
          bg-transparent
          hover:bg-gray-200 dark:hover:bg-gray-800
          transition-colors duration-300
        "
      >
        {/* --- Book Cover --- */}
        <div className="relative flex justify-center">
          <Image
            src={book.imageLink}
            alt={book.title ? `${book.title} cover` : "Book Cover"}
            width={160}
            height={200}
            className="rounded-md object-contain"
          />

          {/* --- Premium Badge --- */}
          {book.subscriptionRequired &&
            (!user?.isPremium && !user?.isGuest) && (
              <span
                className="
                absolute top-1 right-1
                bg-gray-900/80 dark:bg-gray-100/80
                text-white dark:text-gray-900
                text-sm font-semibold
                px-2 py-1 rounded-full shadow
                transition-colors duration-300
              "
              >
                Premium
              </span>
            )}
        </div>

        {/* --- Book Title & Author --- */}
        <h3
          className="
            font-semibold mt-2 pt-2
            text-gray-900 dark:text-white
            transition-colors duration-300
          "
        >
          {book.title}
        </h3>
        <p
          className="
            text-gray-600 dark:text-gray-400 text-sm pt-2
            transition-colors duration-300
          "
        >
          {book.author}
        </p>

        {/* --- Subtitle --- */}
        <p
          className="
            text-gray-700/90 dark:text-gray-300/80 text-[15px] mt-1 pt-2
            transition-colors duration-300
          "
        >
          {book.subTitle || ""}
        </p>

        {/* --- Duration & Rating --- */}
        <div
          className="
            flex items-center text-gray-600 dark:text-gray-400
            text-xs mt-3 gap-4
            transition-colors duration-300
          "
        >
          <span className="flex items-center gap-1">
            <Clock size={16} /> {duration}
          </span>
          <span className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" />
            {typeof book.averageRating === "number"
              ? book.averageRating.toFixed(1)
              : book.rating
              ? Number(book.rating).toFixed(1)
              : "N/A"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
