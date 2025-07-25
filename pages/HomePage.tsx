
import React, { useState } from 'react';
import { Book, BookStatus, CustomShelf } from '../types';
import { BookList } from '../components/BookList';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { BookmarkSquareIcon, RectangleStackIcon, InboxIcon, Bars3Icon, PlusCircleIcon, PencilIcon, XMarkIcon, TagIcon, Cog6ToothIcon, BookOpenIcon as BookOpenOutlineIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon as BookOpenSolidIcon } from '@heroicons/react/24/solid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BOOK_STATUS_DISPLAY_NAMES } from '../constants';

interface HomePageProps {
  books: Book[];
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  toggleBookFavoriteStatus: (bookId: string) => void;
  customShelves: CustomShelf[];
  addCustomShelf: (name: string) => void;
  deleteCustomShelf: (shelfId: string) => void;
  renameCustomShelf: (shelfId: string, newName: string) => void;
}

type SectionKey = 'readingStatus' | 'myLibrary';

const defaultStatusOrder: BookStatus[] = [
  BookStatus.IN_PROGRESS,
  BookStatus.TBR,
  BookStatus.READ,
  BookStatus.DNF,
];

interface DisplayableShelf {
  id: string; 
  name: string;
  type: 'status' | 'custom';
  count: number;
}

export const HomePage: React.FC<HomePageProps> = (props) => {
  const { books, updateBook, deleteBook, toggleBookFavoriteStatus, 
          customShelves, addCustomShelf, deleteCustomShelf, renameCustomShelf } = props;

  // State for Reading Status section
  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus>(BookStatus.IN_PROGRESS);

  // State for My Library section
  const [activeLibraryView, setActiveLibraryView] = useState<'allBooks' | 'customShelvesView'>('allBooks');
  const [activeCustomShelfTab, setActiveCustomShelfTab] = useState<string | null>(null);
  
  const [sectionOrder, setSectionOrder] = useLocalStorage<SectionKey[]>('booq-homepage-section-order-v2', ['readingStatus', 'myLibrary']);
  
  const [draggedItemKey, setDraggedItemKey] = useState<SectionKey | null>(null);
  const [dragOverItemKey, setDragOverItemKey] = useState<SectionKey | null>(null);

  // Modal states for custom shelf management (within My Library)
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [shelfToEditOrDelete, setShelfToEditOrDelete] = useState<CustomShelf | null>(null);
  const [isRenameShelfModalOpen, setIsRenameShelfModalOpen] = useState(false);
  const [editedShelfName, setEditedShelfName] = useState('');
  const [isDeleteShelfConfirmOpen, setIsDeleteShelfConfirmOpen] = useState(false);

  const getTabClass = (isActive: boolean, isSubTab: boolean = false) => {
    const baseClass = `px-3 py-1.5 font-medium rounded-md transition-all duration-200 ease-in-out text-sm flex items-center justify-center gap-1.5 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1`;
    const activeClass = isSubTab 
      ? `bg-emerald-500 text-white shadow-sm` 
      : `bg-emerald-600 text-white shadow-md`;
    const inactiveClass = isSubTab 
      ? `bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200`
      : `bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 shadow-sm`;
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: SectionKey) => {
    e.dataTransfer.setData('application/booq-section-key', key);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemKey(key);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, key: SectionKey) => {
    e.preventDefault(); 
    if (key !== draggedItemKey) setDragOverItemKey(key);
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, key: SectionKey) => {
    if (key !== draggedItemKey) setDragOverItemKey(key);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && currentTarget.contains(relatedTarget)) return; 
    setDragOverItemKey(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetKey: SectionKey) => {
    e.preventDefault();
    const draggedKey = e.dataTransfer.getData('application/booq-section-key') as SectionKey;
    
    if (draggedKey && draggedKey !== dropTargetKey) {
      const currentOrder = [...sectionOrder];
      const draggedItemIndex = currentOrder.indexOf(draggedKey);
      const targetItemIndex = currentOrder.indexOf(dropTargetKey);
      currentOrder.splice(draggedItemIndex, 1);
      currentOrder.splice(targetItemIndex, 0, draggedKey);
      setSectionOrder(currentOrder);
    }
    setDraggedItemKey(null);
    setDragOverItemKey(null);
  };

  const handleDragEnd = () => {
    setDraggedItemKey(null);
    setDragOverItemKey(null);
  };
  
  // Custom Shelf Management Functions
  const handleOpenAddShelfModal = () => { setNewShelfName(''); setIsAddShelfModalOpen(true); };
  const handleAddShelf = () => {
    if (newShelfName.trim()) {
      addCustomShelf(newShelfName.trim());
      setIsAddShelfModalOpen(false);
      setNewShelfName('');
    }
  };
  const handleOpenRenameModal = (shelf: CustomShelf) => { setShelfToEditOrDelete(shelf); setEditedShelfName(shelf.name); setIsRenameShelfModalOpen(true); };
  const handleRenameShelf = () => {
    if (shelfToEditOrDelete && editedShelfName.trim()) {
      renameCustomShelf(shelfToEditOrDelete.id, editedShelfName.trim());
      setIsRenameShelfModalOpen(false);
      setShelfToEditOrDelete(null);
    }
  };
  const handleOpenDeleteConfirm = (shelf: CustomShelf) => { setShelfToEditOrDelete(shelf); setIsDeleteShelfConfirmOpen(true); };
  const handleDeleteConfirmedShelf = () => {
    if (shelfToEditOrDelete) {
      deleteCustomShelf(shelfToEditOrDelete.id);
      if (activeCustomShelfTab === shelfToEditOrDelete.id) setActiveCustomShelfTab(null);
      setIsDeleteShelfConfirmOpen(false);
      setShelfToEditOrDelete(null);
    }
  };

  const renderSectionBase = (key: SectionKey, title: string, icon: JSX.Element, children: React.ReactNode) => (
    <div 
      id={`${key}-section`}
      className={`bg-white p-4 sm:p-6 rounded-xl shadow-lg relative transition-all duration-200 text-slate-700 border border-slate-100
        ${draggedItemKey === key ? 'opacity-60 ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-50' : ''}
        ${dragOverItemKey === key ? 'ring-2 ring-emerald-400' : ''}
      `}
      draggable
      onDragStart={(e) => handleDragStart(e, key)}
      onDragOver={(e) => handleDragOver(e, key)}
      onDragEnter={(e) => handleDragEnter(e, key)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, key)}
      onDragEnd={handleDragEnd}
    >
      <div 
          className="absolute top-3 right-3 z-10 p-1.5 text-slate-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-slate-100"
          style={{ cursor: 'grab' }}
          title="Drag to reorder section"
          aria-label={`Drag ${title} section to reorder`}
      >
          <Bars3Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 flex items-center">
              {React.cloneElement(icon, { className: "w-6 h-6 sm:w-7 sm:h-7 mr-2.5 text-emerald-500"})}
              {title}
          </h2>
      </div>
      {children}
    </div>
  );

  const renderReadingStatusSection = () => {
    return renderSectionBase('readingStatus', "Reading Status", <BookmarkSquareIcon />, 
      <>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-4 sm:mb-6" role="tablist" aria-label="Book status shelves">
          {defaultStatusOrder.map(status => {
            const count = books.filter(b => b.status === status).length;
            const displayLabel = BOOK_STATUS_DISPLAY_NAMES[status] || status;
            return (
              <button
                key={status}
                onClick={() => setActiveStatusTab(status)}
                className={getTabClass(activeStatusTab === status)}
                role="tab"
                aria-selected={activeStatusTab === status}
              >
                <span className="truncate max-w-[100px] sm:max-w-none">{displayLabel} ({count})</span>
              </button>
            )
          })}
        </div>
        <BookList
            books={books}
            status={activeStatusTab}
            updateBook={updateBook}
            deleteBook={deleteBook}
            toggleBookFavoriteStatus={toggleBookFavoriteStatus}
            customShelves={customShelves}
        />
      </>
    );
  };

  const renderMyLibrarySection = () => {
    const customShelvesWithCount = customShelves.map(shelf => ({
      ...shelf,
      count: books.filter(b => b.customShelfIds?.includes(shelf.id)).length,
    }));

    return renderSectionBase('myLibrary', "My Library", <BookOpenOutlineIcon />, 
      <>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-slate-200 pb-4 mb-4 sm:mb-6">
          <button onClick={() => setActiveLibraryView('allBooks')} className={getTabClass(activeLibraryView === 'allBooks', true)}>
             <BookOpenSolidIcon className="w-4 h-4 mr-1" /> All Books
          </button>
          <button onClick={() => setActiveLibraryView('customShelvesView')} className={getTabClass(activeLibraryView === 'customShelvesView', true)}>
            <Cog6ToothIcon className="w-4 h-4 mr-1" /> Manage Shelves
          </button>
        </div>

        {activeLibraryView === 'allBooks' && (
          <>
            {books.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg shadow-inner border border-slate-100">
                <InboxIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-500">Your library is empty.</p>
                <p className="text-sm text-slate-400 mt-1">Start by adding some books to your collection!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {books.map(book => (
                  <BookCard 
                    key={book.id} book={book} updateBook={updateBook} deleteBook={deleteBook}
                    toggleBookFavoriteStatus={toggleBookFavoriteStatus} customShelves={customShelves}
                  />
                ))}
              </div>
            )}
            {books.length > 0 && (
              <div className="text-center mt-6 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">{books.length} {books.length === 1 ? 'Book' : 'Books'} Total</p>
              </div>
            )}
          </>
        )}

        {activeLibraryView === 'customShelvesView' && (
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-4 sm:mb-6" role="tablist" aria-label="Custom bookshelves">
              {customShelvesWithCount.map(shelf => (
                <button
                  key={shelf.id}
                  onClick={() => setActiveCustomShelfTab(shelf.id)}
                  className={`${getTabClass(activeCustomShelfTab === shelf.id, true)} group relative pr-8 sm:pr-10`}
                  role="tab"
                  aria-selected={activeCustomShelfTab === shelf.id}
                >
                  <TagIcon className="w-4 h-4 mr-1 opacity-70 group-hover:opacity-100"/>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{shelf.name} ({shelf.count})</span>
                  <span className="absolute top-1/2 right-1 sm:right-1.5 transform -translate-y-1/2 flex items-center opacity-30 group-hover:opacity-100 transition-opacity">
                    <PencilIcon 
                        className="w-3 h-3 text-current hover:text-emerald-700" 
                        onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(shelf); }}
                        title="Rename shelf"
                    />
                    <XMarkIcon 
                        className="w-3.5 h-3.5 ml-0.5 sm:ml-1 text-current hover:text-rose-600" 
                        onClick={(e) => { e.stopPropagation(); handleOpenDeleteConfirm(shelf);}}
                        title="Delete shelf"
                    />
                  </span>
                </button>
              ))}
              <button
                  onClick={handleOpenAddShelfModal}
                  className={`${getTabClass(false, true)} bg-emerald-50 text-emerald-600 hover:bg-emerald-100`}
                  title="Add new custom shelf"
              >
                  <PlusCircleIcon className="w-4 h-4 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Add Shelf</span>
                  <span className="sm:hidden">Add</span>
              </button>
            </div>
            {activeCustomShelfTab && (() => {
                const booksOnThisShelf = books.filter(b => b.customShelfIds?.includes(activeCustomShelfTab));
                const currentShelf = customShelves.find(cs => cs.id === activeCustomShelfTab);
                if (booksOnThisShelf.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 rounded-lg shadow-inner border border-slate-100">
                      <InboxIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                      <p className="text-slate-500">No books on the shelf "{currentShelf?.name || 'this shelf'}".</p>
                      <p className="text-sm text-slate-400 mt-1">You can add books by editing them.</p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {booksOnThisShelf.map(book => (
                      <BookCard key={book.id} book={book} updateBook={updateBook} deleteBook={deleteBook} toggleBookFavoriteStatus={toggleBookFavoriteStatus} customShelves={customShelves} />
                    ))}
                  </div>
                );
            })()}
            {!activeCustomShelfTab && customShelves.length > 0 && (
                <p className="text-center text-slate-500 py-4">Select a custom shelf to view its books or manage your shelves.</p>
            )}
             {!activeCustomShelfTab && customShelves.length === 0 && (
                <p className="text-center text-slate-500 py-4">No custom shelves created yet. Click "Add Shelf" to get started!</p>
            )}
          </div>
        )}
      </>
    );
  };
  
  const sections: Record<SectionKey, () => JSX.Element> = {
    readingStatus: renderReadingStatusSection,
    myLibrary: renderMyLibrarySection,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {sectionOrder.map((sectionKey) => (
        sections[sectionKey] ? React.cloneElement(sections[sectionKey](), { key: sectionKey }) : null
      ))}

      {/* Modals for Shelf Management */}
      {isAddShelfModalOpen && (
        <Modal isOpen={isAddShelfModalOpen} onClose={() => setIsAddShelfModalOpen(false)} title="Add New Shelf">
          <div className="space-y-4">
            <label htmlFor="newShelfName" className="block text-sm font-medium text-slate-600">Shelf Name:</label>
            <input
              type="text"
              id="newShelfName"
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
              placeholder="Enter shelf name"
              autoFocus
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setIsAddShelfModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200 text-sm font-medium">Cancel</button>
              <button onClick={handleAddShelf} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm">Add Shelf</button>
            </div>
          </div>
        </Modal>
      )}

      {isRenameShelfModalOpen && shelfToEditOrDelete && (
        <Modal isOpen={isRenameShelfModalOpen} onClose={() => setIsRenameShelfModalOpen(false)} title={`Rename Shelf "${shelfToEditOrDelete.name}"`}>
          <div className="space-y-4">
            <label htmlFor="editedShelfName" className="block text-sm font-medium text-slate-600">New Shelf Name:</label>
            <input
              type="text"
              id="editedShelfName"
              value={editedShelfName}
              onChange={(e) => setEditedShelfName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
              autoFocus
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setIsRenameShelfModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200 text-sm font-medium">Cancel</button>
              <button onClick={handleRenameShelf} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm">Save Name</button>
            </div>
          </div>
        </Modal>
      )}

      {isDeleteShelfConfirmOpen && shelfToEditOrDelete && (
         <Modal isOpen={isDeleteShelfConfirmOpen} onClose={() => setIsDeleteShelfConfirmOpen(false)} title="Confirm Deletion">
            <p className="text-slate-700">Are you sure you want to delete the shelf "{shelfToEditOrDelete.name}"?</p>
            <p className="text-xs text-slate-500 mt-1">This action cannot be undone. Books on this shelf will be unassigned from it.</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setIsDeleteShelfConfirmOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200 text-sm font-medium">Cancel</button>
                <button onClick={handleDeleteConfirmedShelf} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors text-sm font-medium shadow-sm">Delete Shelf</button>
            </div>
         </Modal>
      )}
    </div>
  );
};