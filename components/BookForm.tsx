import React, { useState, useEffect } from 'react';
import { Book, BookStatus, CustomShelf } from '../types';
import { BOOK_STATUS_OPTIONS, BOOK_STATUS_DISPLAY_NAMES } from '../constants';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, HeartIcon as HeartOutline, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface BookFormProps {
  onSubmit: (book: Omit<Book, 'id' | 'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>) => void;
  initialData?: Partial<Book>;
  customShelves: CustomShelf[];
}

const StarRatingInput: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const totalStars = 5;

  const handleStarClick = (newRating: number) => {
    if (newRating === 3.5) {
      onRatingChange(4);
    } else {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex space-x-0.5" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(totalStars * 2)].map((_, index) => {
        const starValue = (index + 1) / 2;
        const isHalf = starValue % 1 !== 0;
        const IconComponent = starValue <= (hoverRating || rating) ? StarSolid : StarOutline;
        
        return (
          <button
            key={starValue}
            type="button"
            className={`p-0.5 focus:outline-none transition-colors 
                        ${isHalf && starValue - 0.5 < (hoverRating || rating) && starValue > (hoverRating || rating) ? 'text-emerald-500' : 
                          starValue <= (hoverRating || rating) ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-300'}`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            aria-label={`Rate ${starValue} stars`}
          >
            <IconComponent className="w-6 h-6" style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : {}} />
          </button>
        );
      })}
      {rating > 0 && (
          <button 
            type="button" 
            onClick={() => onRatingChange(0)} 
            className="ml-2 text-xs text-slate-400 hover:text-emerald-500"
            title="Clear rating"
          >
            Clear
          </button>
      )}
    </div>
  );
};


export const BookForm: React.FC<BookFormProps> = ({ onSubmit, initialData, customShelves }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<BookStatus>(BookStatus.TBR);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [pages, setPages] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [notes, setNotes] = useState(''); // Private notes
  const [review, setReview] = useState(''); // Public review
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [publishedDate, setPublishedDate] = useState('');
  const [selectedCustomShelfIds, setSelectedCustomShelfIds] = useState<string[]>([]);


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setStatus(initialData.status || BookStatus.TBR);
      setRating(initialData.rating);
      setPages(initialData.pages);
      setCurrentPage(initialData.currentPage);
      setStartDate(initialData.startDate || '');
      setFinishDate(initialData.finishDate || '');
      setNotes(initialData.notes || '');
      setReview(initialData.review || '');
      setContainsSpoilers(initialData.containsSpoilers || false);
      setIsFavorite(initialData.isFavorite || false);
      setDescription(initialData.description || '');
      setGenres(initialData.genres || []);
      setPublishedDate(initialData.publishedDate || '');
      setSelectedCustomShelfIds(initialData.customShelfIds || []);
    }
  }, [initialData]);

  const handleCustomShelfChange = (shelfId: string) => {
    setSelectedCustomShelfIds(prevIds =>
      prevIds.includes(shelfId)
        ? prevIds.filter(id => id !== shelfId)
        : [...prevIds, shelfId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      alert("Title and Author are required.");
      return;
    }
    const bookData = {
      title,
      author,
      status,
      rating: rating === 0 ? undefined : rating,
      pages: pages && pages > 0 ? pages : undefined,
      currentPage: currentPage && currentPage > 0 && pages && currentPage <= pages ? currentPage : undefined,
      startDate: startDate || undefined,
      finishDate: finishDate || undefined,
      notes: notes || undefined,
      review: review || undefined,
      containsSpoilers,
      isFavorite,
      description: description || undefined,
      genres: genres.length > 0 ? genres : undefined,
      publishedDate: publishedDate || undefined,
      customShelfIds: selectedCustomShelfIds,
      ...(initialData?.coverImageUrl && { coverImageUrl: initialData.coverImageUrl }),
    };
    
    if (initialData && 'id' in initialData && initialData.id) {
      onSubmit({ ...initialData, ...bookData } as Book);
    } else {
      onSubmit(bookData as Omit<Book, 'id' | 'coverImageUrl'> & Partial<Pick<Book, 'coverImageUrl'>>);
    }

    if (!initialData || !('id' in initialData)) { 
        setTitle('');
        setAuthor('');
        setStatus(BookStatus.TBR);
        setRating(undefined);
        setPages(undefined);
        setCurrentPage(undefined);
        setStartDate('');
        setFinishDate('');
        setNotes('');
        setReview('');
        setContainsSpoilers(false);
        setIsFavorite(false);
        setDescription('');
        setGenres([]);
        setPublishedDate('');
        setSelectedCustomShelfIds([]);
    }
  };
  
  const formFieldClass = "w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400";
  const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";
  const sectionSpacingClass = "space-y-4";
  const subSectionSpacingClass = "space-y-1";

  return (
    <form onSubmit={handleSubmit} className={`${sectionSpacingClass} text-slate-700`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <label htmlFor="title" className={labelClass}>Title:</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className={formFieldClass} aria-required="true" />
        </div>
        <div className="ml-4 mt-7">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors duration-150 ease-in-out 
                          ${isFavorite ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
              aria-pressed={isFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <HeartSolid className="w-6 h-6" /> : <HeartOutline className="w-6 h-6" />}
            </button>
        </div>
      </div>

      <div>
        <label htmlFor="author" className={labelClass}>Author:</label>
        <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} required className={formFieldClass} aria-required="true" />
      </div>
      
      <div>
        <label htmlFor="description" className={labelClass}>Description:</label>
        <textarea 
            id="description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3} 
            className={formFieldClass}
            placeholder="Brief summary of the book..."
        />
      </div>

      <div className={`${sectionSpacingClass} p-4 bg-slate-50/70 rounded-lg border border-slate-200`}>
        <div className={subSectionSpacingClass}>
          <label className={labelClass}>Status:</label>
          <div className="flex flex-wrap gap-2">
            {BOOK_STATUS_OPTIONS.map(s_opt => (
              <button
                key={s_opt.value}
                type="button"
                onClick={() => setStatus(s_opt.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors
                            ${status === s_opt.value 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                              : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border-slate-300'}`}
                aria-pressed={status === s_opt.value}
              >
                {s_opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className={subSectionSpacingClass}>
          <label className={labelClass}>Rating:</label>
          <StarRatingInput rating={rating || 0} onRatingChange={setRating} />
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pages" className={labelClass}>Total Pages:</label>
          <input type="number" id="pages" value={pages || ''} onChange={e => setPages(parseInt(e.target.value) || undefined)} min="0" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="currentPage" className={labelClass}>Current Page:</label>
          <input 
            type="number" 
            id="currentPage" 
            value={currentPage || ''} 
            onChange={e => setCurrentPage(parseInt(e.target.value) || undefined)} 
            min="0" 
            max={pages || undefined} 
            className={formFieldClass} 
            disabled={!pages || pages === 0}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="publishedDate" className={labelClass}>Publication Date:</label>
          <input type="text" id="publishedDate" value={publishedDate} onChange={e => setPublishedDate(e.target.value)} placeholder="YYYY or YYYY-MM-DD" className={formFieldClass} />
        </div>
        <div>
            <label htmlFor="genres" className={labelClass}>Genres (comma-separated):</label>
            <input 
                type="text" 
                id="genres" 
                value={genres.join(', ')} 
                onChange={e => setGenres(e.target.value.split(',').map(g => g.trim()).filter(g => g))} 
                className={formFieldClass}
                placeholder="E.g.: Fiction, Mystery, ..."
            />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className={labelClass}>Reading Start Date:</label>
          <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="finishDate" className={labelClass}>Reading Finish Date:</label>
          <input type="date" id="finishDate" value={finishDate} onChange={e => setFinishDate(e.target.value)} className={formFieldClass} />
        </div>
      </div>
      
      {customShelves && customShelves.length > 0 && (
        <div>
          <label className={labelClass}>Assign to Custom Shelves:</label>
          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto bg-slate-50 p-3 rounded-md border border-slate-200">
            {customShelves.map(shelf => (
              <div key={shelf.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`shelf-${shelf.id}`}
                  checked={selectedCustomShelfIds.includes(shelf.id)}
                  onChange={() => handleCustomShelfChange(shelf.id)}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor={`shelf-${shelf.id}`} className="ml-2 text-sm text-slate-700">
                  {shelf.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="notes" className={labelClass}>Private Notes:</label>
        <textarea 
            id="notes" 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            rows={3} 
            className={formFieldClass}
            placeholder="Your reflections, favorite quotes... (visible only to you)"
        />
      </div>

      <div className={`${sectionSpacingClass} p-4 bg-slate-50/70 rounded-lg border border-slate-200`}>
        <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="review" className={labelClass}>Public Review:</label>
            <button
                type="button"
                onClick={() => setContainsSpoilers(!containsSpoilers)}
                className={`px-2 py-1 text-xs font-medium rounded-md flex items-center transition-colors
                            ${containsSpoilers 
                                ? 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                aria-pressed={containsSpoilers}
                title={containsSpoilers ? "Mark as NO spoilers" : "Mark review as CONTAINS SPOILERS"}
            >
                {containsSpoilers ? <EyeSlashIcon className="w-4 h-4 mr-1.5"/> : <EyeIcon className="w-4 h-4 mr-1.5" />}
                {containsSpoilers ? 'Spoilers!' : 'No Spoilers'}
            </button>
        </div>
        <textarea 
            id="review" 
            value={review} 
            onChange={e => setReview(e.target.value)} 
            rows={4} 
            className={formFieldClass}
            placeholder="Share your thoughts with others... (this review might be public)"
        />
      </div>

      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm flex items-center justify-center">
         <CheckCircleIcon className="w-5 h-5 mr-2" />
        {initialData && 'id' in initialData ? 'Update Book' : 'Add Book to Library'}
      </button>
    </form>
  );
};