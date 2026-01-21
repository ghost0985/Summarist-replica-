"use client";

export default function BookPageSkeleton() {
  return (
    <div className="dark:bg-gray-900 min-h-screen transition-colors duration-500 overflow-auto pt-8">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col-reverse [@media(min-width:990px)]:flex-row [@media(min-width:990px)]:items-start [@media(min-width:990px)]:justify-between gap-8 animate-pulse">
        {/* --- Left side: Text skeletons --- */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div className="h-7 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>

          {/* Author */}
          <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>

          {/* Subtitle */}
          <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded"></div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <div className="h-10 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>

          {/* About text */}
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-11/12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-10/12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-9/12 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* --- Right side: Image skeleton --- */}
        <div className="flex justify-center [@media(min-width:990px)]:justify-end w-full [@media(min-width:990px)]:w-[320px] mb-6 [@media(min-width:990px)]:mb-0">
          <div className="h-[400px] w-[320px] bg-gray-300 dark:bg-gray-700 rounded-md shadow-md"></div>
        </div>
      </div>
    </div>
  );
}
