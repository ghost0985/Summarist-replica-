"use client";

import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setBooks} from "@/redux/slices/booksSlice";

function GlobalFetcher() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function loadBooks() {
      try{
        const res = await fetch("/api/books");
        if(!res.ok) {
          console.log("Books API request failed:", res.status);
          return;
        }
      
        const books = await res.json();

        dispatch(setBooks(books));
      } catch (err) {
        console.error("❌ Failed to fetch books:", err);
      }
    }

    loadBooks();
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <GlobalFetcher />
      </ThemeProvider>
    </Provider>
  );
}
