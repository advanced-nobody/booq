import React from 'react';
import { Book, BookStatus } from '../types';
import { StatsFilterType } from '../pages/StatsPage'; // Import filter type
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BookOpenIcon, CheckCircleIcon, ClockIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { BOOK_STATUS_DISPLAY_NAMES } from '../constants';

interface StatsDisplayProps {
  books: Book[];
  filterType: StatsFilterType;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; 
  iconColorClass: string;
  iconBgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, iconColorClass, iconBgClass }) => (
  <div className={`bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border-l-4 ${colorClass}`}>
    <div className={`p-3 rounded-full ${iconBgClass}`}>
      {React.cloneElement<React.SVGAttributes<SVGSVGElement>>(
        icon as React.ReactElement, 
        { className: `w-7 h-7 ${iconColorClass}`}
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);


export const StatsDisplay: React.FC<StatsDisplayProps> = ({ books, filterType }) => {
  const currentYear = new Date().getFullYear();

  const getFilteredBooks = (status: BookStatus, dateField: 'startDate' | 'finishDate' = 'finishDate') => {
    if (filterType === 'ytd') {
      return books.filter(b => 
        b.status === status && 
        b[dateField] && 
        new Date(b[dateField]!).getFullYear() === currentYear
      );
    }
    return books.filter(b => b.status === status);
  };

  const booksDoneList = getFilteredBooks(BookStatus.READ, 'finishDate');
  const booksReadingList = getFilteredBooks(BookStatus.IN_PROGRESS, 'startDate');

  const totalBooks = books.length; // Always all time
  const booksReadCount = booksDoneList.length;
  const booksInProgressCount = booksReadingList.length;
  const booksTBRCount = books.filter(b => b.status === BookStatus.TBR).length; // Always all time
  const booksDNFCount = books.filter(b => b.status === BookStatus.DNF).length; // Always all time
  
  const pagesReadCount = booksDoneList
    .filter(b => b.pages)
    .reduce((sum, b) => sum + (b.pages || 0), 0);

  const averageRating = () => {
    const ratedBooks = booksDoneList.filter(b => b.rating !== undefined && b.rating > 0);
    if (ratedBooks.length === 0) return 0;
    const totalRating = ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0);
    return parseFloat((totalRating / ratedBooks.length).toFixed(1));
  };
  
  const avgRating = averageRating();

  const statusColors = {
    [BookStatus.READ]: '#a7f3d0',        // emerald-200 (lighter for chart contrast)
    [BookStatus.IN_PROGRESS]: '#7dd3fc', // sky-300
    [BookStatus.TBR]: '#6ee7b7',          // emerald-300
    [BookStatus.DNF]: '#fda4af',          // rose-300
  };
  
  // Status Distribution Chart always shows All Time data
  const allTimeBooksRead = books.filter(b => b.status === BookStatus.READ).length;
  const allTimeBooksInProgress = books.filter(b => b.status === BookStatus.IN_PROGRESS).length;

  const statusChartData = [
    { name: BOOK_STATUS_DISPLAY_NAMES[BookStatus.READ], count: allTimeBooksRead, fill: statusColors[BookStatus.READ] },
    { name: BOOK_STATUS_DISPLAY_NAMES[BookStatus.IN_PROGRESS], count: allTimeBooksInProgress, fill: statusColors[BookStatus.IN_PROGRESS] },
    { name: BOOK_STATUS_DISPLAY_NAMES[BookStatus.TBR], count: booksTBRCount, fill: statusColors[BookStatus.TBR] },
    { name: BOOK_STATUS_DISPLAY_NAMES[BookStatus.DNF], count: booksDNFCount, fill: statusColors[BookStatus.DNF] },
  ];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Books" value={totalBooks} icon={<BookOpenIcon />} colorClass="border-emerald-500" iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50" />
        <StatCard title={`Books ${BOOK_STATUS_DISPLAY_NAMES[BookStatus.READ]}`} value={booksReadCount} icon={<CheckCircleIcon />} colorClass="border-slate-500" iconColorClass="text-slate-600" iconBgClass="bg-slate-100" />
        <StatCard title="Pages Read" value={pagesReadCount.toLocaleString()} icon={<BookOpenIcon />} colorClass="border-emerald-500" iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50"/>
        <StatCard title={BOOK_STATUS_DISPLAY_NAMES[BookStatus.IN_PROGRESS]} value={booksInProgressCount} icon={<ClockIcon />} colorClass="border-sky-500" iconColorClass="text-sky-600" iconBgClass="bg-sky-50" />
        <StatCard title={BOOK_STATUS_DISPLAY_NAMES[BookStatus.TBR]} value={booksTBRCount} icon={<BookOpenIcon />} colorClass="border-emerald-500" iconColorClass="text-emerald-600" iconBgClass="bg-emerald-50" />
        <StatCard title={BOOK_STATUS_DISPLAY_NAMES[BookStatus.DNF]} value={booksDNFCount} icon={<XCircleIcon />} colorClass="border-rose-500" iconColorClass="text-rose-600" iconBgClass="bg-rose-50" />
        {avgRating > 0 && <StatCard title={`Average Rating (${BOOK_STATUS_DISPLAY_NAMES[BookStatus.READ]})`} value={`${avgRating} ★`} icon={<StarIcon />} colorClass="border-yellow-500" iconColorClass="text-yellow-600" iconBgClass="bg-yellow-50" />}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-slate-700 mb-6">Status Distribution (All Time)</h3>
        {totalBooks > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /> {/* slate-200 */}
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} fontSize={12} /> {/* slate-500 */}
              <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} fontSize={12} /> {/* slate-500 */}
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                labelStyle={{ color: '#334155', fontWeight: '500' }} /* slate-700 */
                itemStyle={{ color: '#475569' }} /* slate-600 */
              />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px' }}/> {/* slate-500 */}
              <Bar dataKey="count" name="Number of books" barSize={40}>
                 {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity"/>
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-8">Not enough data to display chart. Add some books!</p>
        )}
      </div>
    </div>
  );
};