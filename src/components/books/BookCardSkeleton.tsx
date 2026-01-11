"use client";

export default function BookCardSkeleton() {
  return (
    <div className="w-44 flex-shrink-0 p-2 rounded-lg">
      {/* Cover */}
      <div className="relative flex justify-center">
        <div className="w-[160px] h-[200px] bg-gray-700 rounded-md animate-pulse" />
      </div>

      {/* Title */}
      <div className="h-4 bg-gray-700 rounded mt-3 w-32 animate-pulse" />

      {/* Author */}
      <div className="h-3 bg-gray-700 rounded mt-2 w-20 animate-pulse" />

      {/* Subtitle */}
      <div className="h-3 bg-gray-700 rounded mt-2 w-36 animate-pulse" />
      <div className="h-3 bg-gray-700 rounded mt-1 w-28 animate-pulse" />

      {/* Duration + Rating */}
      <div className="flex gap-4 mt-3">
        <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-10 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

