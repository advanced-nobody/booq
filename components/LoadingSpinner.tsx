import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4" role="status" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-t-emerald-500 border-r-emerald-500 border-b-slate-200 border-l-slate-200 rounded-full animate-spin"></div>
      <p className="mt-2.5 text-sm text-slate-600">Loading...</p>
    </div>
  );
};