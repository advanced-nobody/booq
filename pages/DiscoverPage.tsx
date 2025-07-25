import React, { useState } from 'react';
import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';
import { QBotButton } from '../components/QBotButton';
import { QBotChatWindow } from '../components/QBotChatWindow';

export const DiscoverPage: React.FC = () => {
  const [isQBotOpen, setIsQBotOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 pt-8 sm:pt-0">
        <MagnifyingGlassCircleIcon className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-500 mb-6" />
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-3">Discover New Books</h1>
        <p className="text-base sm:text-lg mb-2">Coming Soon!</p>
        <p className="max-w-md text-sm sm:text-base">
          This section will allow you to explore popular books, new releases, and browse by genres to find your next favorite read.
        </p>
        <p className="max-w-md text-sm sm:text-base mt-4">
          In the meantime, try our new AI assistant, <strong className="text-emerald-600">Q Bot</strong>, for personalized recommendations. Click the chat icon in the bottom right.
        </p>
      </div>
      
      {process.env.API_KEY && ( 
        <>
          <QBotButton onClick={() => setIsQBotOpen(true)} />
          <QBotChatWindow isOpen={isQBotOpen} onClose={() => setIsQBotOpen(false)} />
        </>
      )}
      {!process.env.API_KEY && (
         <div className="fixed bottom-6 right-6 p-3 bg-slate-100 text-slate-500 text-xs rounded-md shadow-lg z-30 border border-slate-200">
            Q Bot disabled: API Key not configured.
          </div>
      )}
    </>
  );
};