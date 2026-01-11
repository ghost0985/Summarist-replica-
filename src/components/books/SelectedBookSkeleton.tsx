"use client";

const SelectedBookSkeleton = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex  items-center animate-pulse">
      {/* Left content */}
      <div className="flex flex-col space-y-3 w-2/3">
        {/* Subtitle */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        {/* Title */}
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        {/* Author */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        {/* Play button + duration */}
      </div>

      {/* Right - book image placeholder */}
      <div className="w-[140px] h-[180px] bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="flex flex-col justify-center items-start">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-5 mb-3"></div>
        <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 ml-5"></div>
      </div>
    </div>
  );
};

export default SelectedBookSkeleton;
