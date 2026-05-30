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
    { title: 'Christendom Destroyed', author: 'Mark Greengrass', isbn: '9780670024568', status: 'reading', cover: 'https://images.thenile.io/r2000/9780141978529.webp'},
    { title: 'Italian Folktales', author: 'Italo Calvino', isbn: '039474909X', status: 'reading', cover: 'https://m.media-amazon.com/images/I/81M2ohdMVyL._SL1500_.jpg' },

    { title: 'The Dogs of Riga', author: 'Henning Mankell', isbn: '9780099570554', status: 'read'},
    { title: 'Tyrant Banderas', author: 'Ramón del Valle-Inclán', isbn: '9781590174982', status: 'read', cover: 'https://m.media-amazon.com/images/I/618-04WhrxL._SL1200_.jpg' },
    { title: 'The Age Of Empire: 1875-1914', author: 'Eric Hobsbawm', isbn: '0679721754', status: 'read' },
    { title: 'Tokyo Express', author: 'Seicho Matsumoto', isbn: '9780241439081', status: 'read'},
    { title: 'The Communist', author: 'Guido Morselli', isbn: '9781681370781', status: 'read', cover: 'https://m.media-amazon.com/images/I/91B7+1KNRyL.jpg'},
    { title: 'Experiences of Loveday Brooke, Lady Detective', author: 'Catherine Pirkis', isbn: '9781973322443', status: 'read', cover: 'https://www.hachetteindia.com/Content/images/books/Large_Cover/9788196026905.jpg'},
    { title: 'Arsene Lupin versus Herlock Sholmes', author: 'Maurice LeBlanc', isbn: '9780486850597', status: 'read'},
    { title: 'Minor Detail', author: 'Adania Shibli', isbn: '9781913097172', status: 'read'},
    { title: 'Desperately Seeking Shah Rukh', author: 'Shrayana Bhattacharya', isbn: '9789354891939', status: 'read' },
];

/** Open Library cover URL by ISBN. size: S | M | L */
export function coverUrl(book: Book, size: 'S' | 'M' | 'L' = 'L'): string {
    return book.cover ?? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`;
}
