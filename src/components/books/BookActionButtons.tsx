"use client";

import { useRouter } from "next/navigation";
import { Mic, BookOpenText } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";

interface BookActionButtonsProps {
  bookId: string;
  isPremiumOnly?: boolean;
}

export default function BookActionButtons({
  bookId,
  isPremiumOnly = false,
}: BookActionButtonsProps) {
  const router = useRouter();
  const { isPremium, isGuest } = useAppSelector((state) => state.user);

  // === Handle Navigation & Access Control ===
  const handleNavigate = (type: "read" | "listen") => {
    console.log("Access check:", { isPremium, isGuest, isPremiumOnly });
    if (isPremiumOnly && !isPremium && !isGuest) {
      toast.error("Upgrade to Premium to access this book.");
      router.push("/pricing");
      return;
    }
    router.push(`/book/${bookId}/listen`);
  };

  return (
    <div className="flex gap-4 mt-6">
      {/* --- Read Button --- */}
      <button
        onClick={() => handleNavigate("read")}
        aria-label="Read book"
        className="flex items-center gap-2 px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <BookOpenText size={25} />
        Read
      </button>

      {/* --- Listen Button --- */}
      <button
        onClick={() => handleNavigate("listen")}
        aria-label="Listen to book"
        className="flex items-center gap-2 px-8 py-3 rounded-md bg-gray-700 dark:bg-gray-600 hover:bg-gray-500 text-white font-medium transition-colors"
      >
        <Mic size={18} />
        Listen
      </button>
    </div>
  );
}
