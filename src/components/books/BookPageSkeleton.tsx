"use client";

const BookPageSkeleton = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-start py-10 px-6 animate-pulse">
        {/* Book cover */}
        <div className="w-[180px] h-[260px] bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>

      {/* Title */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

      {/* Author */}
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>

      {/* Subtitle */}
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-6"></div>

      {/* Divider */}
      <div className="w-full max-w-[650px] h-[1px] bg-gray-300 dark:bg-gray-700 mb-4"></div>

      {/* Stats (rating, time, etc.) */}
      <div className="flex gap-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"
          ></div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full max-w-[650px] h-[1px] bg-gray-300 dark:bg-gray-700 mb-6"></div>

      {/* Buttons */}
      <div className="flex gap-4 mb-4">
        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Add to Library */}
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4"></div>

      {/* Divider */}
      <div className="w-full max-w-[650px] h-[1px] bg-gray-300 dark:bg-gray-700 mb-6"></div>

      {/* Section title */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-4"></div>

      {/* Tag chips */}
      <div className="flex gap-3 mb-6">
        <div className="h-6 w-28 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-36 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>

      {/* Paragraph placeholder */}
      <div className="space-y-3 max-w-[700px] w-full">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-10/12"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-9/12"></div>
      </div>
    </>
  );
};

export default BookPageSkeleton;
