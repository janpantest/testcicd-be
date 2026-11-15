import { isbnValue } from "../constants/keys";

export function payloadAddBook(userId: string, isbn: string) {
  return {
    userId,
    collectionOfIsbns: [{ isbn: isbnValue }]
  };
}
