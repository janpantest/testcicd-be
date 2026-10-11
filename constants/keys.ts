export const keys = ['title', 'isbn', 'author', 'subTitle'];

export const chainedKey = ['isbn'];

export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

export interface BooksResponse {
  books: Book[];
}

export const isbnValue = '9781449325862';