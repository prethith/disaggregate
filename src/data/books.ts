import booksData from './books.json';

export interface Book {
    title: string;
    author: string;
    /** ISBN-13 or ISBN-10 — used to pull the cover from Open Library. */
    isbn: string;
    status: 'reading' | 'read';
    /** Optional: override the cover URL if Open Library has no good image. */
    cover?: string;
}

export const books: Book[] = booksData as Book[];

export function coverUrl(book: Book, size: 'S' | 'M' | 'L' = 'L'): string  {
    return book.cover ?? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
}