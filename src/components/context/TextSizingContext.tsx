"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type TextSize = "sm" | "base" | "lg" | "xl";

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType>({
  textSize: "base",
  setTextSize: () => {},
});

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>("base");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("textSize") as TextSize | null;
    if (saved) setTextSize(saved);
    setHydrated(true);
  }, []);

  // === Update and Persist Text Size ===
  const updateSize = (size: TextSize) => {
    setTextSize(size);
    localStorage.setItem("textSize", size);
  };

  if (!hydrated) return <div className="opacity-0" />;

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize: updateSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  return useContext(TextSizeContext);
}
