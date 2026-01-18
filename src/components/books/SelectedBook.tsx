"use client";

import Image from "next/image";
import { Book } from "@/types/book";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/SelectedBook.module.css";

interface Props {
  book: Book;
}

// === Format seconds into mm:ss ===
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function SelectedBook({ book }: Props) {
  const [duration, setDuration] = useState<string>("--:--");
  const router = useRouter();

  // === Load audio duration ===
  useEffect(() => {
    if (!book?.audioLink) return;
    const audio = document.createElement("audio");
    audio.src = book.audioLink;

    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(formatTime(audio.duration));
      }
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeAttribute("src");
    };
  }, [book?.audioLink]);

  return (
    <div onClick={() => router.push(`/book/${book.id}`)} className="cursor-pointer">
      <div className={styles.selectedBookContainer}>
        {/* --- Subtitle --- */}
        <p className={styles.selectedBookSubtitle}>{book.subTitle}</p>
        <div className={styles.selectedBookDivider}></div>

        {/* --- Book Content --- */}
        <div className={styles.selectedBookRight}>
          <Image
            src={book.imageLink}
            alt={book.title || "Book cover"}
            width={120}
            height={160}
            className={styles.selectedBookImage}
            priority
          />

          {/* --- Book Details --- */}
          <div className={styles.selectedBookInfo}>
            <h3>{book.title}</h3>
            <p>{book.author}</p>

            {/* --- Audio Play Button --- */}
            <div className={styles.selectedBookPlay}>
              <button onClick={() => router.push(`/book/${book.id}/listen`)}>
                <Play size={18} />
              </button>
              <span>
                {duration === "--:--"
                  ? "--:--"
                  : `3 mins ${duration.split(":")[1]} secs`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
