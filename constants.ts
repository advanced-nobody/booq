import { BookStatus } from './types';

export const APP_NAME = "booq";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

export const BOOK_STATUS_DISPLAY_NAMES: Record<BookStatus, string> = {
  [BookStatus.TBR]: "Want to Read",
  [BookStatus.IN_PROGRESS]: "Reading",
  [BookStatus.READ]: "Done",
  [BookStatus.DNF]: "DNF",
};

export const BOOK_STATUS_OPTIONS = [
  { value: BookStatus.TBR, label: BOOK_STATUS_DISPLAY_NAMES[BookStatus.TBR] },
  { value: BookStatus.IN_PROGRESS, label: BOOK_STATUS_DISPLAY_NAMES[BookStatus.IN_PROGRESS] },
  { value: BookStatus.READ, label: BOOK_STATUS_DISPLAY_NAMES[BookStatus.READ] },
  { value: BookStatus.DNF, label: BOOK_STATUS_DISPLAY_NAMES[BookStatus.DNF] },
];

export const RATING_OPTIONS = [
  { value: 0, label: "Unrated" },
  { value: 1, label: "★" },
  { value: 1.5, label: "★✬" },
  { value: 2, label: "★★" },
  { value: 2.5, label: "★★✬" },
  { value: 3, label: "★★★" },
  { value: 3.5, label: "★★★✬" },
  { value: 4, label: "★★★★" },
  { value: 4.5, label: "★★★★✬" },
  { value: 5, label: "★★★★★" },
];