"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signInGuest,
  auth,
} from "@/lib/firebase";
import { UserRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export default function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const maybeRedirect = () => {
    if (!pathname.startsWith("/book")) {
      router.push("/for-you");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
      maybeRedirect();
    } catch {
      setError("Google login failed.");
    }
  };

  const handleEmailLogin = async () => {
    setError(null);
    try {
      await signInWithEmail(email, password);
      onClose();
      maybeRedirect
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    }
  };

  const handleRegister = async () => {
    setError(null);
    try {
      await signUpWithEmail(email, password);
      onClose();
      maybeRedirect
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        default:
          setError("Registration failed. Please try again.");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        setError("No account found with this email. Please sign up first.");
        return;
      }
      await resetPassword(email);
      setMessage("Password reset email sent!");
      setError(null);
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Failed to send reset email. Try again later.");
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const user = await signInGuest();
      console.log("Guest user logged in as premium:", user);
      onClose();
      maybeRedirect
    } catch {
      setError("Guest login failed. Try again.");
    }
  };

  // === Modal Content ===
  const modal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative z-[10000]">
        {/* === Close Button === */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>

        {/* === Header === */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          {isRegister ? "Sign up to Summarist" : "Log in to Summarist"}
        </h2>

        {/* === Conditional Auth Form === */}
        {isRegister ? (
          <>
            {/* --- Sign Up View --- */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 mt-3 relative flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <img
                src="/assets/google.png"
                alt="google"
                className="absolute left-1 w-10 h-10 rounded-md bg-white p-1"
              />
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="px-3 text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Email/Password Fields */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 mt-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 mt-5 border rounded-lg bg-gray-50 dark:bg-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="mt-3 text-red-600 text-center">{error}</p>}

            <button
              onClick={handleRegister}
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Sign up
            </button>

            {/* Switch to Login */}
            <div className="mt-4 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-b-lg">
              <p
                onClick={() => setIsRegister(false)}
                className="text-center text-blue-600 hover:underline cursor-pointer"
              >
                Already have an account?
              </p>
            </div>
          </>
        ) : (
          <>
            {/* --- Login View --- */}
            <button
              onClick={handleGuestLogin}
              className="w-full py-3 mb-3 flex items-center justify-center bg-blue-900/90 text-white rounded-lg hover:bg-blue-900"
            >
              <UserRound className="absolute left-8 w-8 h-8" />
              Login as a Guest
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t"></div>
              <span className="px-3 text-gray-500">or</span>
              <div className="flex-grow border-t"></div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 mt-3 relative flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <img
                src="/assets/google.png"
                alt="google"
                className="absolute left-1 w-10 h-10 rounded-md bg-white p-1"
              />
              <span>Login with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t"></div>
              <span className="px-3 text-gray-500">or</span>
              <div className="flex-grow border-t"></div>
            </div>

            {/* Email/Password Fields */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 mt-3 border rounded-lg bg-gray-50 dark:bg-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 mt-5 border rounded-lg bg-gray-50 dark:bg-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            {message && (
              <p className="mt-4 text-green-600 text-center">{message}</p>
            )}

            <button
              onClick={handleEmailLogin}
              className="w-full py-2 mt-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Login
            </button>

            <p
              onClick={handleForgotPassword}
              className="mt-4 text-blue-600 hover:underline cursor-pointer text-center"
            >
              Forgot your password?
            </p>

            {/* Switch to Sign Up */}
            <div className="mt-4 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-b-lg">
              <p
                onClick={() => setIsRegister(true)}
                className="text-center text-blue-600 hover:underline cursor-pointer"
              >
                Don't have an account?
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
