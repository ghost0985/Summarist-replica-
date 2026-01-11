"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideUI =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/pricing");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (hideUI) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 w-full px-6 pt-6 pb-10 text-gray-900 dark:text-gray-100 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
