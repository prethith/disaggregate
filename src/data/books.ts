export interface Book {
    title: string;
    author: string;
    /** ISBN-13 or ISBN-10 — used to pull the cover from Open Library. */
    isbn: string;
    status: 'reading' | 'read';
    /** Optional: override the cover URL if Open Library has no good image. */
    cover?: string;
}

/* Edit this list to update the /reading page.
   Covers are fetched by ISBN from Open Library — no API key needed.
   Find an ISBN on the book's Open Library / Amazon page. */
export const books: Book[] = [
    { title: 'Christendom Destroyed', author: 'Mark Greengrass', isbn: '9780670024568', status: 'reading'},

    { title: 'The Age Of Empire: 1875-1914', author: 'Eric Hobsbawm', isbn: '0679721754', status: 'read'},
    { title: 'Desperately Seeking Shah Rukh', author: 'Shrayana Bhattacharya', isbn: '9789354891939', status: 'read'},
];

/** Open Library cover URL by ISBN. size: S | M | L */
export function coverUrl(book: Book, size: 'S' | 'M' | 'L' = 'L'): string {
    return book.cover ?? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
}
