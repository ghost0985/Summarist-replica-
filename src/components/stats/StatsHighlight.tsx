"use client";

import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface Props {
  texts: string[];
  align?: "start" | "end";
}

export default function StatsHighlight({ texts, align = "start" }: Props) {
  const activeIndex = useSelector((state: RootState) => state.stats.activeIndex);

  return (
    <div className={`space-y-4 flex flex-col items-${align}`}>
      {texts.map((text, i) => (
        <p
          key={i}
          className={`text-2xl sm:text-3xl font-semibold transition-all duration-700 ease-in-out transform ${
            i === activeIndex
              ? "text-green-400 scale-105"
              : "text-gray-600 dark:text-gray-300 scale-100"
          }`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}
