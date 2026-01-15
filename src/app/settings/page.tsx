"use client";

import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import { Moon, Sun } from "lucide-react";
import CancelSubscriptionButton from "./CancelSubscriptionaabutton";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // === Handle Theme Initialization ===
  useEffect(() => {
    const themeParam = new URLSearchParams(window.location.search).get("theme");
    const saved = themeParam || localStorage.getItem("theme") || "light";
    setTheme(saved as "light" | "dark");
    document.documentElement.classList.toggle("dark", saved === "dark");
    localStorage.setItem("theme", saved);
  }, []);

  // === Toggle Theme ===
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // === Determine Subscription Status ===
  const getSubscriptionStatus = () => {
    if (user.isGuest) return "active";
    if (user.isPremium && user.subscriptionStatus !== "canceled") return "active";
    if (user.subscriptionStatus === "canceled") return "canceled";
    return "inactive";
  };

  return (
    <div className="pt-2 min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <hr className="border-gray-300 dark:border-gray-700 mb-7" />

        {/* === Login Prompt for Unauthenticated Users === */}
        {!user.uid ? (
          <div className="flex flex-col items-center justify-center text-center mt-10">
            <Image
              src="/assets/login.png"
              alt="Login illustration"
              width={460}
              height={250}
              className="mb-6"
            />
            <p className="text-xl font-semibold mb-4">
              Login to your account to see your details.
            </p>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-20 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Login
            </button>
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
            />
          </div>
        ) : (
          <div>
            {/* === Subscription Section === */}
            <div className="mb-10">
              <h2 className="text-lg mb-2">Your Subscription Plan</h2>
              <p
                className={`text-base capitalize pb-1 ${
                  user.isPremium
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {user.isPremium ? "premium" : "basic"}
              </p>

              {/* === Subscription Status === */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Status:{" "}
                <span
                  className={`font-medium ${
                    getSubscriptionStatus() === "active"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {getSubscriptionStatus()}
                </span>
              </p>

              {/* === Cancel or Upgrade Buttons === */}
              {user.isPremium &&
              !user.isGuest &&
              user.email !== "guest@gmail.com" ? (
                <CancelSubscriptionButton />
              ) : null}

              {!user.isPremium && !user.isGuest && (
                <button
                  onClick={() => router.push("/pricing")}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Upgrade to Premium
                </button>
              )}

              <hr className="mt-4 border-gray-300 dark:border-gray-700" />
            </div>

            {/* === Email Display Section === */}
            <div className="mb-10">
              <h2 className="text-lg mb-2">Email</h2>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {user.email || "Guest Mode (no email)"}
              </p>
            </div>

            {/* === Theme Toggle Section === */}
            <div>
              <hr className="mt-4 border-gray-300 dark:border-gray-700 mb-4" />
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium transition"
              >
                {theme === "light" ? (
                  <>
                    <Moon size={18} />
                    <span>Switch to Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={18} />
                    <span>Switch to Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
