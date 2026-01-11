"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setActiveIndex } from "@/redux/slices/statsSlice";

export default function StatsController({ length }: { length: number }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let index = 0;

    dispatch(setActiveIndex(0));

    const interval = setInterval(() => {
      index = (index + 1) % length;
      dispatch(setActiveIndex(index));
    }, 1550);

    return () => clearInterval(interval);
  }, [dispatch, length]);

  return null;
}
