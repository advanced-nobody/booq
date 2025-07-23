import React from 'react';
import { Book, BookStatus, CustomShelf } from '../types';
import { BookCard } from './BookCard';
import { InboxIcon } from '@heroicons/react/24/outline';
import { BOOK_STATUS_DISPLAY_NAMES } from '../constants';

interface BookListProps {
  books: Book[];
  status: BookStatus;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  toggleBookFavoriteStatus: (bookId: string) => void;
  customShelves: CustomShelf[];
}

export const BookList: React.FC<BookListProps> = ({ books, status, updateBook, deleteBook, toggleBookFavoriteStatus, customShelves }) => {
  const filteredBooks = books.filter(book => book.status === status);
  const displayStatusName = BOOK_STATUS_DISPLAY_NAMES[status] || status;

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-10 bg-white/50 rounded-lg shadow-inner border border-slate-100">
        <InboxIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
        <p className="text-slate-500">No books in the "{displayStatusName}" category.</p>
        {status === BookStatus.TBR && <p className="text-sm text-slate-400 mt-1">Add some books to your "{displayStatusName}" list!</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {filteredBooks.map(book => (
        <BookCard 
          key={book.id} 
          book={book} 
          updateBook={updateBook} 
          deleteBook={deleteBook}
          toggleBookFavoriteStatus={toggleBookFavoriteStatus}
          customShelves={customShelves}
        />
      ))}
    </div>
  );
};