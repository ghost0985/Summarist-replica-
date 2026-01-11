"use client";

import { useState, useEffect } from "react";
import { Search, Clock, X, Menu } from "lucide-react";
import { Book } from "@/types/book";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import SearchSkeleton from "../skeletons/SearchSkeleton";
import Link from "next/link";

// === Format seconds into mm:ss ===
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [durations, setDurations] = useState<{ [key: string]: string }>({});
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  // === Handle responsive layout ===
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 770);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // === Prevent scroll when mobile search is active ===
  useEffect(() => {
    if (isMobile && query) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isMobile, query]);

  // === Fetch search results ===
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFiltered([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);

    const fetchSearch = async () => {
      try {
        const res = await fetch(`/api/search?q=${debouncedQuery}`);
        if (!res.ok) throw new Error(`Search API failed: ${res.status}`);
        const data = await res.json();
        setFiltered(data.slice(0, 15));
      } catch (err) {
        console.error("Search error:", err);
        setFiltered([]);
      } finally {
        setLoadingSearch(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  // === Preload audio durations for search results ===
  useEffect(() => {
    filtered.forEach((book) => {
      if (durations[book.id]) return;

      const audio = document.createElement("audio");
      audio.src = book.audioLink || "";

      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDurations((prev) => ({
            ...prev,
            [book.id]: formatTime(audio.duration),
          }));
        }
      });
    });
  }, [filtered, durations]);

  // === Clear search input ===
  const handleClear = () => {
    setQuery("");
    setFiltered([]);
  };

  // === Render ===
  return (
    <div className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1117] relative z-50">
      {/* --- Topbar Row --- */}
      <div className="max-w-5xl mx-auto flex justify-end items-center py-5 px-6">
        {/* === Search Input + Dropdown Container === */}
        <div className="relative w-full max-w-[400px]">
          {/* --- Search Bar --- */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search for books"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] text-gray-900 dark:text-white border-r-2 border-gray-300 placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2.5 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <span className="px-3 py-2">
                <Search size={20} className="text-gray-600 dark:text-gray-300" />
              </span>
            )}
          </div>

          {/* --- Dropdown (Anchored Below Input) --- */}
          {query && !isMobile && (
            <div
              className="
                absolute left-0 top-full mt-2
                w-[400px] md:w-[450px]
                bg-white dark:bg-gray-800
                rounded-lg shadow-xl border border-gray-200 dark:border-gray-700
                max-h-[400px] overflow-y-auto z-50 animate-fadeIn
              "
            >
              {loadingSearch ? (
                Array(4)
                  .fill(null)
                  .map((_, i) => <SearchSkeleton key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((book, idx) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.id}`}
                    className={`flex items-start gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                      idx !== filtered.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                    onClick={() => setQuery("")}
                  >
                    <Image
                      src={book.imageLink || "/assets/placeholder.png"}
                      alt={book.title}
                      width={60}
                      height={60}
                      className="rounded object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white text-[15px] font-semibold mb-1 leading-tight">
                        {book.title}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-[13px] mb-1 leading-none">
                        {book.author}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-[13px]">
                        <Clock size={14} /> {durations[book.id] || "--:--"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-4 text-base text-gray-600 dark:text-gray-400 text-start">
                  No books found
                </div>
              )}
            </div>
          )}
        </div>

        {/* === Sidebar Menu Button (Mobile Only) === */}
        <button
          onClick={onMenuClick}
          className="ml-4 flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={30} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* === Mobile Search Panel === */}
      {isMobile && query && (
        <div
          className="
            fixed inset-x-0 top-[100px]
            bg-white dark:bg-gray-900
            z-[60]
            shadow-lg border-t-2 border-gray-300 dark:border-gray-700
            animate-fadeIn
            flex flex-col
            max-h-[calc(100vh-60px)]
          "
        >
          <div
            className="
              overflow-y-auto
              max-h-[calc(6*100px)]
              px-4 py-2 m-2
              divide-y divide-gray-200 dark:divide-gray-700
              scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
              [-webkit-overflow-scrolling:touch]
            "
          >
            {loadingSearch ? (
              Array(6)
                .fill(null)
                .map((_, i) => <SearchSkeleton key={i} />)
            ) : filtered.length > 0 ? (
              filtered.slice(0, 6).map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="flex items-center gap-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  onClick={() => setQuery("")}
                >
                  <Image
                    src={book.imageLink || "/assets/placeholder.png"}
                    alt={book.title}
                    width={90}
                    height={90}
                    className="rounded object-contain flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-gray-900 dark:text-white font-medium leading-snug line-clamp-2 break-words mb-1 text-[16px]">
                      {book.title}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-[15px] mb-1 truncate">
                      {book.author}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs">
                      <Clock size={14} /> {durations[book.id] || "--:--"}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-6 text-gray-600 dark:text-gray-400 text-center">
                No books found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
