"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import Image from "next/image";
import { Book } from "@/types/book";
import { markBookAsFinished } from "@/lib/firebase";
import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";
import LoginModal from "@/components/auth/LoginModal";

interface AudioPlayerProps {
  book: Book;
}

export default function AudioPlayer({ book }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useAppSelector((state) => state.user);

  const isLoggedIn = Boolean(user?.uid || user?.isGuest);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioData = () => setDuration(audio.duration);

    const handleEnded = async () => {
      if (!user?.uid) {
        toast.error("You must be logged in to save progress.");
        return;
      }

      try {
        await markBookAsFinished(user.uid, book.id);
        toast.success(`${book.title} added to Finished Books`);
      } catch (error) {
        console.error("Error marking book as finished:", error);
        toast.error("Failed to mark book as finished.");
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [book, user?.uid]);

  const togglePlay = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) audio.pause();
    else audio.play();

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime += seconds;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#022c43] text-white flex flex-col items-center px-4 py-4 shadow-lg z-[60] md:flex-row md:justify-between md:px-6">
      {/* Book Info */}
      <div className="flex items-center gap-3 mb-4 md:mb-0 md:w-1/3 min-w-0">
        <Image
          src={book.imageLink}
          alt={book.title}
          width={55}
          height={60}
          className="rounded-sm flex-shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-medium text-white leading-tight line-clamp-2 break-words">
            {book.title}
          </h3>
          <p className="text-xs text-gray-300 truncate">{book.author}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center gap-3 w-full md:w-1/3">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => skip(-10)}
            className="text-gray-300 hover:text-white transition"
          >
            <RotateCcw size={26} />
          </button>

          <button
            onClick={togglePlay}
            className="bg-white text-[#022c43] p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Play audio"
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} />}
          </button>

          <button
            onClick={() => skip(10)}
            className="text-gray-300 hover:text-white transition"
          >
            <RotateCw size={26} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-[500px] mt-1">
          <span className="text-xs text-gray-300">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-blue-500 bg-gray-700 rounded-lg cursor-pointer"
          />
          <span className="text-xs text-gray-300">{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={book.audioLink} />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
