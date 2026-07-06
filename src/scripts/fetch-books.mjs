import { writeFile } from "node:fs/promises"

const CSV_URL = process.env.BOOKS_SHEET_CSV_URL;
if (!CSV_URL) {
    console.error(`Missing URL for books list.`);
    process.exit(1);
}

function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for(let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i+1] === '"') {
                    field += '"';
                    i++;
                } else inQuotes = false;
            } else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') {row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i+1] === '\n') i++;
            row.push(field); field = '';
            if (row.length > 1 || row[0] != '') rows.push(row);
            row = [];
        } else field += c;
    }

    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
}

const res = await fetch(CSV_URL);
if (!res.ok) {
    console.error(`Fetch failed: ${res.status}`);
}
const text = await res.text();

const [header, ...rows] = parseCSV(text);
const cols = header.map(h => h.trim().toLowerCase());

const books = rows
.filter(r => r.some(cell => cell.trim() !== ''))
.map(r => {
    const obj = {};
    cols.forEach((key,i) => { obj[key] = (r[i] ?? '').trim(); });
    return {
        title: obj.title,
        author: obj.author,
        isbn: obj.isbn,
        status: obj.status === 'reading' ? 'reading' : 'read',
        ...(obj.cover ? { cover: obj.cover } : {}),
    };
});

await writeFile('src/data/books.json', JSON.stringify(books, null, 4) + '\n');
console.log(`Wrote ${books.length} books`);