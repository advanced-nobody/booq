import React, { useState } from 'react';
import { Book, BookStatus, CustomShelf } from '../types';
import { BookForm } from '../components/BookForm';
import { PlusCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface AddBookPageProps {
  addBook: (book: Omit<Book, 'id' | 'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>) => void;
  navigate: (path: string) => void;
  customShelves: CustomShelf[];
}


const searchBooksWithGoogleAPI = async (query: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  const response = await fetch(url);
  const data = await response.json();
  return data.items?.map((item: any) => {
    const volume = item.volumeInfo;
    return {
      title: volume.title,
      author: volume.authors?.[0] || 'Unknown Author',
      description: volume.description || '',
      coverImageUrl: volume.imageLinks?.thumbnail || '',
      publisher: volume.publisher || '',
      publishedDate: volume.publishedDate || '',
    };
  }) || [];
};


export const AddBookPage: React.FC<AddBookPageProps> = ({ addBook, navigate, customShelves }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Book>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedBookForForm, setSelectedBookForForm] = useState<Partial<Book> | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search term.");
      return;
    }
    

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedBookForForm(null); 

    try {
      const results = await searchBooksWithGoogleAPI(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError("No books found for your search. Try different terms or add manually.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error instanceof Error ? error.message : "An error occurred during the search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = (bookData: Partial<Book>) => {
    setSelectedBookForForm(bookData);
    setSearchResults([]); 
  };

  const handleSubmit = (bookData: Omit<Book, 'id' | 'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>) => {
    addBook(bookData);
    navigate('/'); 
  };
  
  const handleManualEntry = () => {
    setSelectedBookForForm({ status: BookStatus.TBR, customShelfIds: [] }); 
    setSearchResults([]);
    setSearchQuery('');
    setSearchError(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-100">
      <div className="flex items-center mb-6 pb-4 border-b border-slate-200">
        <PlusCircleIcon className="w-8 h-8 text-emerald-600 mr-3" aria-hidden="true"/>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800">Add New Book</h2>
      </div>

      {!selectedBookForForm && (
        <div className="mb-6 space-y-4">
          <p className="text-slate-600 text-sm">Search for a book to auto-fill its details or enter the information manually.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              aria-label="Search book"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors flex items-center disabled:opacity-60 shadow-sm"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Search
            </button>
          </div>
           <button
            onClick={handleManualEntry}
            className="w-full text-sm text-emerald-600 hover:text-emerald-700 py-1 text-center"
            >
            Or add book manually
          </button>
        </div>
      )}

      {isSearching && (
        <div className="my-6">
          <LoadingSpinner />
        </div>
      )}

      {searchError && !isSearching && (
        <p className="my-4 text-center text-rose-700 bg-rose-50 p-3 rounded-md border border-rose-200 text-sm">{searchError}</p>
      )}

      {searchResults.length > 0 && !isSearching && !selectedBookForForm && (
        <div className="my-6 space-y-3 max-h-80 overflow-y-auto pr-2 border border-slate-200 rounded-md p-2 bg-slate-50/50">
          <h3 className="text-md font-semibold text-slate-700 px-1 pb-1 border-b border-slate-200 mb-2">Search results:</h3>
          {searchResults.map((book, index) => (
            <div 
              key={index} 
              className="p-3 bg-white hover:bg-emerald-50 rounded-md cursor-pointer transition-colors border border-slate-100 hover:border-emerald-100 shadow-sm"
              onClick={() => handleSelectBook(book)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectBook(book)}
            >
              <h4 className="font-semibold text-emerald-700">{book.title}</h4>
              <p className="text-sm text-slate-500">{book.author}</p>
              {book.description && <p className="text-xs text-slate-400 mt-1 truncate">{book.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {(selectedBookForForm || (!searchQuery && !searchResults.length && !searchError && !isSearching)) && (
         <>
          {selectedBookForForm && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-md border border-emerald-200">
              <p className="text-sm text-emerald-700">
                Editing details for: <strong className="font-semibold">{selectedBookForForm.title || 'New Book'}</strong>
                {selectedBookForForm.author && ` by ${selectedBookForForm.author}`}
              </p>
              <button
                onClick={() => { setSelectedBookForForm(null); setSearchQuery(''); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 mt-1"
              >
                Search for another book or enter manually
              </button>
            </div>
          )}
          <BookForm 
            onSubmit={handleSubmit} 
            initialData={{ ...selectedBookForForm, status: selectedBookForForm?.status || BookStatus.TBR }} 
            customShelves={customShelves}
          />
        </>
      )}
    </div>
  );
};