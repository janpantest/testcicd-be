export function payloadAddBook(userId: string) {
  return {
    userId,
    collectionOfIsbns: [{ isbn: "9781449325862" }]
  };
}
