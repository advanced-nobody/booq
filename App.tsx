import React, { useState, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Book, BookStatus, UserProfile, ActivityItem, CustomShelf } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HomePage } from './pages/HomePage';
import { AddBookPage } from './pages/AddBookPage';
import { StatsPage } from './pages/StatsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { FriendsPage } from './pages/FriendsPage';
import { ProfilePage } from './pages/ProfilePage';
import { BottomNavigation } from './components/BottomNavigation';
import { Modal } from './components/Modal';
import { BookForm } from './components/BookForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { searchBookDetailsWithGemini } from './services/geminiService';
import { PlusCircleIcon, ChartBarIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [books, setBooks] = useLocalStorage<Book[]>('booq-books', []);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('booq-user-profile', {
    username: "Voracious Reader",
    bio: "Exploring universes one book at a time. Coffee, blankets, and good stories are my perfect combo. Follow me to discover new literary adventures!",
    profileImageUrl: `https://ui-avatars.com/api/?name=Voracious+Reader&background=e2e8f0&color=10B981&size=128&font-size=0.33&bold=true`, // slate-200 BG, emerald-500 text
    favoriteBookIds: [],
    pronouns: "",
    birthYear: undefined,
  });
  const [activityLog, setActivityLog] = useLocalStorage<ActivityItem[]>('booq-activity-log', []);
  const [customShelves, setCustomShelves] = useLocalStorage<CustomShelf[]>('booq-custom-shelves', []);

  // Header Search State
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState<Partial<Book>[]>([]);
  const [isHeaderSearching, setIsHeaderSearching] = useState(false);
  const [headerSearchError, setHeaderSearchError] = useState<string | null>(null);
  const [isHeaderSearchModalOpen, setIsHeaderSearchModalOpen] = useState(false);
  const [selectedBookForHeaderSearch, setSelectedBookForHeaderSearch] = useState<Partial<Book> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const addBook = (book: Omit<Book, 'id' | 'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title: book.title,
      author: book.author,
      status: book.status,
      rating: book.rating,
      pages: book.pages,
      currentPage: book.currentPage,
      startDate: book.startDate,
      finishDate: book.finishDate,
      notes: book.notes,
      description: book.description,
      genres: book.genres,
      publishedDate: book.publishedDate,
      isbn: book.isbn,
      coverImageUrl: book.coverImageUrl || `https://picsum.photos/seed/${Date.now().toString()}/400/600`,
      isFavorite: book.isFavorite || false, 
      customShelfIds: book.customShelfIds || [],
      review: book.review || undefined,
      containsSpoilers: book.containsSpoilers || false,
    };
    setBooks(prevBooks => [...prevBooks, newBook]);
    // If the book was marked as favorite during addition, update profile
    if (newBook.isFavorite && !userProfile.favoriteBookIds.includes(newBook.id)) {
      setUserProfile(prev => ({ ...prev, favoriteBookIds: [...prev.favoriteBookIds, newBook.id] }));
    }
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prevBooks =>
      prevBooks.map(book => (book.id === updatedBook.id ? updatedBook : book))
    );
     // Update favorite status in profile if it changed
    const isCurrentlyFavoriteInProfile = userProfile.favoriteBookIds.includes(updatedBook.id);
    if (updatedBook.isFavorite && !isCurrentlyFavoriteInProfile) {
      setUserProfile(prevProfile => ({ ...prevProfile, favoriteBookIds: [...prevProfile.favoriteBookIds, updatedBook.id] }));
    } else if (!updatedBook.isFavorite && isCurrentlyFavoriteInProfile) {
      setUserProfile(prevProfile => ({ ...prevProfile, favoriteBookIds: prevProfile.favoriteBookIds.filter(id => id !== updatedBook.id) }));
    }
  };

  const deleteBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    setUserProfile(prevProfile => ({ // Also remove from favorites if deleted
        ...prevProfile, 
        favoriteBookIds: prevProfile.favoriteBookIds.filter(id => id !== bookId) 
    }));
  };
  
  const updateUserProfile = (updatedProfileData: Partial<UserProfile>) => {
    setUserProfile(prevProfile => ({ ...prevProfile, ...updatedProfileData }));
  };

  const toggleBookFavoriteStatus = useCallback((bookId: string) => {
    let newFavoriteStatus: boolean | undefined = undefined;
    setBooks(prevBooks => 
      prevBooks.map(book => {
        if (book.id === bookId) {
          newFavoriteStatus = !book.isFavorite;
          return { ...book, isFavorite: newFavoriteStatus };
        }
        return book;
      })
    );

    if (newFavoriteStatus !== undefined) {
        setUserProfile(prevProfile => {
          const isCurrentlyFavorite = prevProfile.favoriteBookIds.includes(bookId);
          if (newFavoriteStatus && !isCurrentlyFavorite) {
            return { ...prevProfile, favoriteBookIds: [...prevProfile.favoriteBookIds, bookId] };
          } else if (!newFavoriteStatus && isCurrentlyFavorite) {
            return { ...prevProfile, favoriteBookIds: prevProfile.favoriteBookIds.filter(id => id !== bookId) };
          }
          return prevProfile;
        });
    }
  }, [setBooks, setUserProfile]);

  const addCustomShelf = (name: string) => {
    if (name.trim() === '') return;
    const newShelf: CustomShelf = {
      id: `custom-${Date.now().toString()}`,
      name: name.trim(),
    };
    setCustomShelves(prevShelves => [...prevShelves, newShelf]);
  };

  const deleteCustomShelf = (shelfId: string) => {
    setCustomShelves(prevShelves => prevShelves.filter(shelf => shelf.id !== shelfId));
    setBooks(prevBooks => 
      prevBooks.map(book => ({
        ...book,
        customShelfIds: book.customShelfIds?.filter(id => id !== shelfId)
      }))
    );
  };

  const renameCustomShelf = (shelfId: string, newName: string) => {
    if (newName.trim() === '') return;
    setCustomShelves(prevShelves =>
      prevShelves.map(shelf =>
        shelf.id === shelfId ? { ...shelf, name: newName.trim() } : shelf
      )
    );
  };

  // Header Search Handlers
  const performHeaderSearch = async () => {
    if (!headerSearchQuery.trim()) {
      setHeaderSearchError("Please enter a search term.");
      setHeaderSearchResults([]);
      return;
    }
    if (!process.env.API_KEY) {
      setHeaderSearchError("Gemini API key is not configured. Cannot search for books.");
      setHeaderSearchResults([]);
      return;
    }
    setIsHeaderSearching(true);
    setHeaderSearchError(null);
    setHeaderSearchResults([]);
    try {
      const results = await searchBookDetailsWithGemini(headerSearchQuery);
      setHeaderSearchResults(results);
      if (results.length === 0) {
        setHeaderSearchError("No books found. Try different terms.");
      }
    } catch (error) {
      setHeaderSearchError(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsHeaderSearching(false);
    }
  };

  const handleSelectBookFromHeaderSearch = (bookData: Partial<Book>) => {
    setSelectedBookForHeaderSearch({ ...bookData, status: BookStatus.TBR, isFavorite: false, review: '', containsSpoilers: false });
    setIsHeaderSearchModalOpen(true);
    setHeaderSearchQuery('');
    setHeaderSearchResults([]);
    setHeaderSearchError(null);
  };

  const handleAddBookFromHeaderSearch = (bookData: Omit<Book, 'id'|'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>) => {
    addBook(bookData);
    setIsHeaderSearchModalOpen(false);
    setSelectedBookForHeaderSearch(null);
  };
  

  const topNavItems = [
    { path: '/add', label: 'Add Book', icon: <PlusCircleIcon className="w-5 h-5 mr-1 sm:mr-2" /> },
    { path: '/stats', label: 'Statistics', icon: <ChartBarIcon className="w-5 h-5 mr-1 sm:mr-2" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-700">
      <header className="bg-white/95 backdrop-blur-md shadow-sm p-3 sm:p-4 sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <Link to="/" className="text-3xl font-bold tracking-tight">
            <span className="text-emerald-600">booq</span><span className="text-slate-500 font-medium text-2xl">.world</span>
          </Link>
          
          <div className="relative order-3 sm:order-2 w-full sm:w-auto sm:flex-grow max-w-xs lg:max-w-md">
            <div className="relative">
              <input
                type="search"
                value={headerSearchQuery}
                onChange={(e) => {
                  setHeaderSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setHeaderSearchResults([]);
                    setHeaderSearchError(null);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && performHeaderSearch()}
                placeholder="Search to add books..."
                className="w-full p-2 pl-10 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label="Search books to add"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
               {headerSearchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setHeaderSearchQuery(''); setHeaderSearchResults([]); setHeaderSearchError(null); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            {isHeaderSearching && <div className="absolute w-full mt-1 p-2 text-center"><LoadingSpinner /></div>}
            {headerSearchError && !isHeaderSearching && <p className="absolute w-full mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-md shadow">{headerSearchError}</p>}
            {headerSearchResults.length > 0 && !isHeaderSearching && (
              <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {headerSearchResults.map((book, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectBookFromHeaderSearch(book)}
                    className="p-2.5 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <p className="font-medium text-slate-700 text-sm">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 order-2 sm:order-3">
            <nav className="flex space-x-1 sm:space-x-2">
              {topNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ease-in-out
                    ${location.pathname === item.path 
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'
                    }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
            <Link to="/profile" aria-label="View user profile" className="flex-shrink-0">
              <img 
                src={userProfile.profileImageUrl || `https://ui-avatars.com/api/?name=${userProfile.username.replace(/\s+/g, '+')}&background=e2e8f0&color=10B981&size=128&font-size=0.33&bold=true`} 
                alt="Profile picture" 
                className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 hover:border-emerald-500 transition-colors"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 pb-20">
        <Routes>
          <Route path="/" element={
            <HomePage 
              books={books} 
              updateBook={updateBook} 
              deleteBook={deleteBook} 
              toggleBookFavoriteStatus={toggleBookFavoriteStatus}
              customShelves={customShelves}
              addCustomShelf={addCustomShelf}
              deleteCustomShelf={deleteCustomShelf}
              renameCustomShelf={renameCustomShelf}
            />} 
          />
          <Route path="/add" element={<AddBookPage addBook={addBook} navigate={navigate} customShelves={customShelves} />} />
          <Route path="/stats" element={<StatsPage books={books} />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={<ProfilePage userProfile={userProfile} books={books} activityLog={activityLog} updateUserProfile={updateUserProfile} />} />
        </Routes>
      </main>
      
      {isHeaderSearchModalOpen && selectedBookForHeaderSearch && (
        <Modal 
          isOpen={isHeaderSearchModalOpen} 
          onClose={() => { setIsHeaderSearchModalOpen(false); setSelectedBookForHeaderSearch(null); }}
          title={`Add "${selectedBookForHeaderSearch.title || 'New Book'}" to Library`}
        >
          <BookForm
            onSubmit={handleAddBookFromHeaderSearch}
            initialData={selectedBookForHeaderSearch}
            customShelves={customShelves}
          />
        </Modal>
      )}
      <BottomNavigation />
    </div>
  );
};

export default App;