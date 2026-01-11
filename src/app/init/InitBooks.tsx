"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setBooks, setLoading } from "@/redux/slices/booksSlice";

export default function InitBooks() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchBooks() {
      try {
        console.log("Fetching books...");
        dispatch(setLoading());

        const res = await fetch(
          "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=all"
        );
        const data = await res.json();
        
        dispatch(setBooks(data));
      } catch (err) {
        console.error("Failed to fetch books:", err);
      }
    }

    fetchBooks();
  }, [dispatch]);

  return null;
}

