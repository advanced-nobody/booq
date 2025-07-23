import React from 'react';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';

interface QBotButtonProps {
  onClick: () => void;
}

export const QBotButton: React.FC<QBotButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 sm:bottom-6 sm:right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-50 transition-transform transform hover:scale-110 z-40"
      aria-label="Open Q Bot, recommendation assistant"
      title="Open Q Bot"
    >
      <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
    </button>
  );
};