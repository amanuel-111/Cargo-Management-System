import React from 'react';

export const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-24 mb-2" />
        <div className="h-7 bg-gray-200 dark:bg-dark-600 rounded w-16" />
      </div>
      <div className="w-12 h-12 bg-gray-200 dark:bg-dark-600 rounded-xl" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded flex-1" />
          <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 bg-gray-200 dark:bg-dark-600 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

const LoadingSkeleton = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

export default LoadingSkeleton;
