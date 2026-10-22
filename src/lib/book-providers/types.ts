export type NormalizedBook = {
  isbn13: string;
  isbn10?: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedAt?: number;
  pages?: number;
  language?: string;
  coverUrl?: string;
  description?: string;
  source: "openlibrary" | "googlebooks" | "brasilapi" | "manual";
};