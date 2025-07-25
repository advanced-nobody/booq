import React, { useState } from 'react';
import { Book } from '../types';
import { StatsDisplay } from '../components/StatsDisplay';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface StatsPageProps {
  books: Book[];
}

export type StatsFilterType = 'allTime' | 'ytd';

export const StatsPage: React.FC<StatsPageProps> = ({ books }) => {
  const [filterType, setFilterType] = useState<StatsFilterType>('allTime');

  const getButtonClass = (isActive: boolean) => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? 'bg-emerald-500 text-white shadow-sm' 
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-slate-800 mb-2 pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center">
          <ChartBarIcon className="w-8 h-8 text-emerald-600 mr-3" aria-hidden="true"/>
          <h2 className="text-2xl sm:text-3xl font-semibold">My Reading Statistics</h2>
        </div>
        <div className="flex space-x-2 self-end sm:self-center">
          <button 
            onClick={() => setFilterType('ytd')} 
            className={getButtonClass(filterType === 'ytd')}
            aria-pressed={filterType === 'ytd'}
          >
            Year-to-Date
          </button>
          <button 
            onClick={() => setFilterType('allTime')} 
            className={getButtonClass(filterType === 'allTime')}
            aria-pressed={filterType === 'allTime'}
          >
            All Time
          </button>
        </div>
      </div>
      <StatsDisplay books={books} filterType={filterType} />
    </div>
  );
};