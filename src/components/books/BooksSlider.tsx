"use client";

import React from "react";
import { Book } from "@/types/book";
import BookCard from "@/components/books/BookCard";
import BookCardSkeleton from "@/components/books/BookCardSkeleton";

interface BooksSliderProps {
  title?: string;
  items?: Book[];
  renderItem?: (item: Book) => React.ReactNode;
  books?: Book[];
  sectionTitle?: string;
  subtitle?: string;
  loading?: boolean;
}

// === Component: BooksSlider ===
const BooksSlider: React.FC<BooksSliderProps> = ({
  title,
  sectionTitle,
  subtitle,
  items,
  books,
  renderItem,
  loading = false,
}) => {
  // === Data Setup ===
  const data = books || items || [];
  const displayTitle = sectionTitle || title;
  const sliderRef = React.useRef<HTMLDivElement>(null);

  return (
    <section className="relative w-full max-w-[958px] py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{displayTitle}</h2>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* --- Scrollable Book Slider --- */}
      <div
        ref={sliderRef}
        className="
          flex gap-4 md:gap-5
          overflow-x-auto scroll-smooth scrollbar-hide
          px-1 sm:px-2 md:px-0
        "
      >
        {/* Loading State */}
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <BookCardSkeleton />
              </div>
            ))
        ) : data.length > 0 ? (
          // Books Loaded
          data.map((book) => (
            <div key={`${title}-${book.id}`} className="flex-shrink-0">
              {renderItem ? renderItem(book) : <BookCard book={book} />}
            </div>
          ))
        ) : (
          // Empty State
          <p className="text-gray-400 italic">No books to display</p>
        )}
      </div>
    </section>
  );
};

export default BooksSlider;
