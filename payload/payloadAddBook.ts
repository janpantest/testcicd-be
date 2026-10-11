import { isbnValue } from "../constants/keys";

export function payloadAddBook(userId: string) {
  return {
    userId,
    collectionOfIsbns: [{ isbn: isbnValue }]
  };
}
