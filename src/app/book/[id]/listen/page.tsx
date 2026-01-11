"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Book } from "@/types/book";
import BookPlayer from "@/components/books/BookSummary";
import AudioPlayer from "@/components/books/AudioPlayer";

export default function ListenPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch book");
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  return (
   <div className="min-h-screen text-white">
  <main className="max-w-5xl mx-auto pb-20">
    {loading ? (
      <p className="text-gray-400">Loading...</p>
    ) : book ? (
      <BookPlayer book={book} />
    ) : (
      <p className="text-gray-400">Book not found.</p>
    )}
  </main>

  {book && <AudioPlayer book={book} />}
</div>
  );
}
