"use client";

const SearchSkeletion = () => {
  return (
    <div className="flex items-start gap-3 px-3 py-3 animate-pulse">
      {/* Book Placeholder */}
      <div className="w-12 h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>

      {/* text placeholder */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default SearchSkeletion;
