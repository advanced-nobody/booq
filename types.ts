export enum BookStatus {
  TBR = "To Be Read",
  IN_PROGRESS = "In Progress",
  READ = "Read",
  DNF = "Did Not Finish",
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating?: number; // 0-5
  pages?: number;
  currentPage?: number;
  startDate?: string;
  finishDate?: string;
  notes?: string;
  coverImageUrl?: string;
  description?: string;
  genres?: string[];
  publishedDate?: string; // YYYY-MM-DD or YYYY
  isbn?: string;
  isFavorite?: boolean; 
  customShelfIds?: string[]; // For assigning books to custom shelves
  review?: string; // For public review
  containsSpoilers?: boolean; // For review spoilers
}

export interface UserProfile {
  username: string;
  bio: string;
  profileImageUrl?: string;
  favoriteBookIds: string[]; // Stores IDs of favorite books
  pronouns?: string;
  birthYear?: number;
}

export type ActivityType = 
  | "added_book"
  | "finished_book" 
  | "rated_book" 
  | "added_note" 
  | "started_book" 
  | "marked_favorite"
  | "unmarked_favorite"
  | "updated_profile"; // Added for profile updates if needed later

export interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: string; // ISO string
  bookId?: string; 
  bookTitle?: string;
  details?: string; // e.g., rating given, note snippet, status changed to
}

export interface CustomShelf {
  id: string;
  name: string;
}