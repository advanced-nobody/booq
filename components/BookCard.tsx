import React, { useState } from 'react';
import { Book, BookStatus, CustomShelf } from '../types';
import { Modal } from './Modal';
import { BookForm } from './BookForm';
import { PencilIcon, TrashIcon, EyeIcon, HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { BOOK_STATUS_DISPLAY_NAMES } from '../constants';


interface BookCardProps {
  book: Book;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  toggleBookFavoriteStatus: (bookId: string) => void;
  customShelves: CustomShelf[];
}

export const BookCard: React.FC<BookCardProps> = ({ book, updateBook, deleteBook, toggleBookFavoriteStatus, customShelves }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(book.notes || '');

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBook({ ...book, status: e.target.value as BookStatus });
  };
  
  const getStatusInfo = (status: BookStatus): { class: string; label: string; textClass: string; borderClass: string;} => {
    const displayLabel = BOOK_STATUS_DISPLAY_NAMES[status] || status;
    switch (status) {
      case BookStatus.TBR: return { class: 'bg-emerald-50', label: displayLabel, textClass: 'text-emerald-700', borderClass: 'border-emerald-200' };
      case BookStatus.IN_PROGRESS: return { class: 'bg-sky-50', label: displayLabel, textClass: 'text-sky-700', borderClass: 'border-sky-200' };
      case BookStatus.READ: return { class: 'bg-slate-100', label: displayLabel, textClass: 'text-slate-600', borderClass: 'border-slate-300' };
      case BookStatus.DNF: return { class: 'bg-rose-50', label: displayLabel, textClass: 'text-rose-700', borderClass: 'border-rose-200' };
      default: return { class: 'bg-gray-100', label: 'Unknown', textClass: 'text-gray-700', borderClass: 'border-gray-300' };
    }
  };

  const statusInfo = getStatusInfo(book.status);

  const handleSaveNotes = () => {
    updateBook({ ...book, notes: currentNotes });
    setIsNotesModalOpen(false);
  };

  const renderStars = (rating?: number) => {
    if (rating === undefined || rating === 0) return <span className="text-slate-400 text-sm">Unrated</span>;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-emerald-500">★</span>);
    }
    if (halfStar) {
      stars.push(<span key="half" className="text-emerald-500">✬</span>);
    }
    for (let i = stars.length; i < 5; i++) {
       stars.push(<span key={`empty-${i}`} className="text-slate-300">★</span>);
    }
    return stars;
  };


  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col border border-slate-100">
      <div className="relative">
        <img 
          src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/400/600`} 
          alt={`Cover of ${book.title}`} 
          className="w-full h-48 object-cover" 
        />
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${statusInfo.class} ${statusInfo.textClass} border ${statusInfo.borderClass}`}>
          {statusInfo.label}
        </div>
         <button
            onClick={() => toggleBookFavoriteStatus(book.id)}
            className="absolute top-2 left-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm"
            title={book.isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={book.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {book.isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <HeartOutlineIcon className="w-5 h-5 text-white hover:text-emerald-300" />
            )}
          </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow text-slate-700">
        <h3 className="text-md font-semibold text-emerald-700 mb-1 truncate" title={book.title}>{book.title}</h3>
        <p className="text-sm text-slate-500 mb-2 truncate" title={book.author}>by {book.author}</p>
        
        <div className="mb-3 text-sm flex items-center h-5">
           {renderStars(book.rating)}
        </div>

        {book.status === BookStatus.IN_PROGRESS && book.pages && (
          <div className="mb-3 text-sm">
            <label htmlFor={`progress-${book.id}`} className="block text-slate-500 mb-1 text-xs">Progress:</label>
            <div className="flex items-center">
              <input
                type="range"
                id={`progress-${book.id}`}
                min="0"
                max={book.pages}
                value={book.currentPage || 0}
                onChange={(e) => updateBook({ ...book, currentPage: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-labelledby={`progress-label-${book.id}`}
              />
              <span id={`progress-label-${book.id}`} className="ml-2 text-slate-600 text-xs">{Math.round(((book.currentPage || 0) / book.pages) * 100)}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{book.currentPage || 0} / {book.pages} pages</p>
          </div>
        )}

        <div className="mt-auto space-y-2 pt-2">
           <div className="flex items-center">
            <label htmlFor={`status-${book.id}`} className="sr-only">Status</label>
            <select
              id={`status-${book.id}`}
              value={book.status}
              onChange={handleStatusChange}
              className="w-full bg-slate-50 text-slate-700 border border-slate-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.values(BookStatus).map(statusValue => (
                <option key={statusValue} value={statusValue}>{BOOK_STATUS_DISPLAY_NAMES[statusValue] || statusValue}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md text-sm transition-colors"
              title="Edit Book"
            >
              <PencilIcon className="w-4 h-4 mr-1.5" /> Edit
            </button>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-md text-sm transition-colors border border-slate-200"
              title="View/Edit Notes"
            >
              <EyeIcon className="w-4 h-4 mr-1.5" /> Notes
            </button>
          </div>
          <button
            onClick={() => {if(window.confirm(`Are you sure you want to delete "${book.title}"?`)) deleteBook(book.id)}}
            className="w-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-rose-600 p-2 rounded-md text-sm transition-colors border border-slate-200 hover:border-rose-200"
            title="Delete Book"
          >
            <TrashIcon className="w-4 h-4 mr-1.5" /> Delete
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Book">
          <BookForm 
            onSubmit={(editedBook) => {
              updateBook({ ...book, ...editedBook });
              setIsEditModalOpen(false);
            }} 
            initialData={book} 
            customShelves={customShelves}
          />
        </Modal>
      )}

      {isNotesModalOpen && (
        <Modal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} title={`Notes for "${book.title}"`}>
          <textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            rows={8}
            className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Write your notes, reflections, or favorite quotes here..."
            aria-label={`Notes for ${book.title}`}
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setIsNotesModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
            >
              Save Notes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};