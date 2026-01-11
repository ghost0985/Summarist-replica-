"use client";

import { useEffect, useState } from "react";
import SelectedBook from "@/components/books/SelectedBook";
import BooksSlider from "@/components/books/BooksSlider";
import { Book } from "@/types/book";
import SelectedBookSkeleton from "@/components/books/SelectedBookSkeleton";
import styles from "../../styles/ForYouPage.module.css";

export default function ForYouPage() {
  const [selected, setSelected] = useState<Book | null>(null);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [suggested, setSuggested] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(
        "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected"
      ).then((res) => res.json()),
      fetch(
        "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended"
      ).then((res) => res.json()),
      fetch(
        "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested"
      ).then((res) => res.json()),
    ])
      .then(([selectedData, recommendedData, suggestedData]) => {
        setSelected(selectedData[0]);
        setRecommended(recommendedData);
        setSuggested(suggestedData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.forYouPage}>
      <main className={styles.scrollArea}>
        <div className={styles.content}>
          {/* === Selected Section === */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Selected just for you
            </h2>
            {!selected ? (
              <SelectedBookSkeleton />
            ) : (
              <SelectedBook book={selected} />
            )}
          </section>

          {/* === Recommended Section === */}
          <section>
            <h2 className="text-xl font-semibold mb-1">Recommended For You</h2>
            <p className="text-gray-500 text-[16px] mb-1">
              We think you’ll like these
            </p>
            <BooksSlider
              books={recommended}
              sectionTitle=""
              subtitle=""
              loading={loading}
            />
          </section>

          {/* === Suggested Section === */}
          <section>
            <h2 className="text-xl font-semibold mb-1">Suggested Books</h2>
            <p className="text-gray-500 text-[16px] mb-1">Browse those books</p>
            <BooksSlider
              books={suggested}
              sectionTitle=""
              subtitle=""
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
