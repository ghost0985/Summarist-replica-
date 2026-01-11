"use client";

import {
  Home,
  Pencil,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/lib/firebase";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import LoginModal from "../auth/LoginModal";
import { useTextSize } from "../context/TextSizingContext";
import { clearUser } from "@/redux/slices/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SidebarLink = ({
  href,
  label,
  Icon,
  active,
  onClick,
  cursor,
}: {
  href?: string;
  label: string;
  Icon: any;
  active?: boolean;
  onClick?: () => void;
  cursor?: string;
}) => {
  const isDisabled = cursor?.includes("not-allowed");

  const baseClasses = `
    flex items-center gap-4 px-5 py-3
    rounded-md relative transition-all duration-200
    ${cursor || ""}
  `;

  const activeClasses = active
    ? "text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-800"
    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";

  const content = (
    <>
      {active && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#00B846] rounded-r-md transition-all duration-200"></span>
      )}
      <Icon size={23} className="min-w-[20px]" />
      <span className="text-[17px] tracking-wide">{label}</span>
    </>
  );

  if (isDisabled) {
    return <div className={`${baseClasses} ${activeClasses}`}>{content}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${activeClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} text-left w-full`}
    >
      {content}
    </button>
  );
};

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const { uid } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { textSize, setTextSize } = useTextSize();
  const [loggingOut, setLoggingOut] = useState(false); 

  // === Safe Logout Handler ===
  const handleLogout = async () => {
    if (loggingOut) return; 
    try {
      setLoggingOut(true);
      localStorage.removeItem("guestUserData"); 
      await signOut(auth); // ✅ Firebase logout
      dispatch(clearUser()); // ✅ Reset Redux user
      onClose();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setTimeout(() => setLoggingOut(false), 400);
    }
  };

  // === Disable scrolling when sidebar is open (mobile only) ===
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // === Text Size Controls ===
  const handleTextSizeChange = (size: "sm" | "base" | "lg" | "xl") => {
    setTextSize(size);
    localStorage.setItem("textSize", size);
  };

  const isBookPage = /^\/book\/[^/]+\/listen$/.test(pathname);

  // === Sidebar Link Groups ===
  const topLinks = [
    { href: "/for-you", label: "For you", icon: Home },
    { href: "/library", label: "My Library", icon: Bookmark },
    {
      href: "/highlights",
      label: "Highlights",
      icon: Pencil,
      cursor: "cursor-not-allowed",
    },
    {
      href: "/search",
      label: "Search",
      icon: Search,
      cursor: "cursor-not-allowed",
    },
  ];

  const bottomLinks = [
    { href: "/settings", label: "Settings", icon: Settings },
    {
      href: "/help",
      label: "Help & Support",
      icon: HelpCircle,
      cursor: "cursor-not-allowed",
    },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* --- Mobile Overlay --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-[59] lg:hidden"
          onClick={handleBackdropClick}
        ></div>
      )}

      {/* --- Sidebar Container --- */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-[60]
          bg-gray-100 dark:bg-[#0d1117]
          text-gray-900 dark:text-gray-200
          border-r border-gray-300 dark:border-gray-800
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          flex flex-col justify-between shadow-lg
        `}
      >
        {/* === Top Section === */}
        <div>
          <div className="flex items-center justify-between px-5 pt-6 pb-8">
            <img
              src="/assets/logo.png"
              alt="logo"
              className="h-10 dark:bg-white dark:rounded-md dark:px-1 transition-all duration-300"
            />
          </div>

          <nav className="flex flex-col gap-2">
            {topLinks.map(({ href, label, icon: Icon, cursor }) => (
              <SidebarLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                active={pathname === href}
                cursor={cursor}
              />
            ))}
          </nav>

          {isBookPage && (
            <div className="ml-8 flex items-center gap-4 mt-5">
              {(["sm", "base", "lg", "xl"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleTextSizeChange(size)}
                  className={`relative font-semibold transition-all duration-300 pb-1 ${
                    textSize === size
                      ? "text-gray-900 dark:text-white after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#00B846] after:rounded-full"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  style={{
                    fontSize:
                      size === "sm"
                        ? "14px"
                        : size === "base"
                        ? "17px"
                        : size === "lg"
                        ? "22px"
                        : "26px",
                  }}
                >
                  Aa
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === Bottom Section === */}
        <div
          className={`flex flex-col gap-2 mt-24 mb-8 transition-all duration-300 ${
            isBookPage ? "mb-[140px]" : ""
          }`}
        >
          {bottomLinks.map(({ href, label, icon: Icon, cursor }) => (
            <SidebarLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={pathname === href}
              cursor={cursor}
            />
          ))}

          {uid ? (
            <SidebarLink
              label="Logout"
              Icon={LogOut}
              onClick={handleLogout}
              active={false}
            />
          ) : (
            <>
              <SidebarLink
                label="Login"
                Icon={LogIn}
                onClick={() => setIsLoginOpen(true)}
              />
              <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
              />
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
