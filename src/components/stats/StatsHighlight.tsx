"use client";

import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";

interface Props {
  texts: string[];
  align?: "start" | "end";
}

export default function StatsHighlight({ texts, align = "start" }: Props) {
  const activeIndex = useSelector((state: RootState) => state.stats.activeIndex);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const alignmentClasses = isMobile
    ? "items-start text-left"
    : align === "end"
    ? "items-end text-right"
    : "items-start text-left";

  return (
    <div className={`space-y-4 flex flex-col ${alignmentClasses}`}>
      {texts.map((text, i) => (
        <p
          key={i}
          className={`text-2xl sm:text-3xl md:text-3xl font-semibold transition-all duration-700 ease-in-out transform ${
            i === activeIndex
              ? "text-green-500 dark:text-green-400 scale-105"
              : "text-gray-700 dark:text-gray-300 scale-100"
          }`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
