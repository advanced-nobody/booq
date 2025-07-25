import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export const FriendsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-600">
      <UserGroupIcon className="w-24 h-24 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-semibold text-slate-800 mb-3">Friends & Reading Groups</h1>
      <p className="text-lg mb-2">Coming Soon!</p>
      <p className="max-w-md">
        Here you'll be able to connect with friends, see their reading progress, share recommendations,
        and join or create reading groups to discuss your favorite books.
      </p>
    </div>
  );
};