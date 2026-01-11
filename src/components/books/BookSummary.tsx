"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useTextSize } from "../context/TextSizingContext";
import Image from "next/image";
import LoginModal from "@/components/auth/LoginModal";
import { Book } from "@/types/book";

interface Props {
  book: Book;
}

export default function BookPlayer({ book }: Props) {
  const { textSize } = useTextSize();
  const user = useAppSelector((state) => state.user);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const text =
    book.summary || book.description || "No summary available for this title.";
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean);

  const fontSizeClass =
    textSize === "sm"
      ? "text-[14px]"
      : textSize === "base"
      ? "text-[17px]"
      : textSize === "lg"
      ? "text-[21px]"
      : "text-[25px]";

  const isLoggedIn = Boolean(user.uid || user.isGuest);

  return (
    <section
      className="
        max-w-4xl w-full mx-auto rounded-lg shadow-sm
        transition-colors duration-300
        text-gray-900 dark:text-gray-100
        pb-[90px] md:pb-[80px]
      "
    >
      {/* === Title always visible === */}
      <h1
        className="
          text-2xl sm:text-xl font-semibold mb-6 pb-4
          border-b border-gray-200 dark:border-gray-700
          text-center sm:text-left
        "
      >
        {book.title}
      </h1>

      {/* === If NOT logged in === */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center text-center mt-10">
          <Image
            src="/assets/login.png"
            alt="Login illustration"
            width={420}
            height={240}
            className="mb-6"
          />
          <p className="text-xl font-semibold mb-4">
            Log in to your account to to read and listen to the book.
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-10 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>

          {/* Modal */}
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
          />
        </div>
      ) : (
        <article
          className={`book-content ${fontSizeClass} leading-relaxed text-gray-800 dark:text-gray-300 space-y-5`}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => <p key={idx}>{para}</p>)
          ) : (
            <p>No summary available for this title.</p>
          )}
        </article>
      )}
    </section>
  );
}
