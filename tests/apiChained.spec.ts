import { test, expect, request, APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import { payloadUserCredentials } from '../payload/payloadUserCredentials';
import { payloadAddBook } from '../payload/payloadAddBook';
import { chainedKey } from '../constants/keys';
dotenv.config();

test.describe('Chained API calls - DemoQA', () => {
  let apiContext: APIRequestContext;

  // Environment variables
  const userName = `${process.env.USERNAME_PREFIX}-${Date.now()}`;
  const password = process.env.PASSWORD!;
  const baseURL = process.env.BASE_URL!;

  // Variables used across API requests
  let userId: string;
  let token: string;
  let isbnToAdd: string;
  const responseKey = 'books';

  // Create API request context
  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  });

  test('Create user -> Generate token -> Get books -> Add book -> Verify collection', async () => {
    // 1. Create user
    const createUserResponse = await apiContext.post(
      '/Account/v1/User',
      {
        data: payloadUserCredentials(userName, password),
      }
    );

    expect(createUserResponse.status()).toBe(201);

    const createUserBody = await createUserResponse.json();
    userId = createUserBody.userID;
    expect(userId).toBeTruthy();
    expect(createUserBody.username).toEqual(userName);
    // console.info('Created user:', userName);
    // console.info('User ID:', userId);

    // 2. Generate token
    const tokenResponse = await apiContext.post(
      '/Account/v1/GenerateToken',
      {
        data: payloadUserCredentials(userName, password),
      }
    );

    expect(tokenResponse.status()).toBe(200);

    const tokenBody = await tokenResponse.json();
    token = tokenBody.token;
    expect(token).toBeTruthy();

    // 3. Get available books
    const initialResponse = await apiContext.get(
      '/BookStore/v1/Books'
    );

    expect(initialResponse.status()).toBe(200);

    const initialBody = await initialResponse.json();
    expect(initialBody.books.length).toBeGreaterThan(0);
    const bookAmount = initialBody.books.length;
    const randomIndex = Math.floor(Math.random() * bookAmount);
    isbnToAdd = initialBody.books[randomIndex].isbn;
    expect(isbnToAdd).toBeTruthy();

    // 4. Add book to user collection
    const addBookResponse = await apiContext.post(
      '/BookStore/v1/Books',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: payloadAddBook(userId, isbnToAdd),
      }
    );

    expect(addBookResponse.status()).toBe(201);

    const addBookBody = await addBookResponse.json();
    expect(addBookBody).toHaveProperty(responseKey);
    addBookBody[responseKey].forEach((item: any) => {
      expect(item).toHaveProperty(chainedKey);
    });

    // 5. Verify book in user collection
    const userResponse = await apiContext.get(
      `/Account/v1/User/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(userResponse.status()).toBe(200);

    const userBody = await userResponse.json();
    const bookExists = userBody.books.some(
      (book: { isbn: string }) => book.isbn === isbnToAdd
    );

    expect(
      bookExists,
      'Newly added book should exist in user collection'
    ).toBe(true);
  });

  // Dispose API request context
  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
