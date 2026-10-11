import { test, expect, request, APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import { payloadUserCredentials } from '../payload/payloadUserCredentials';
import { payloadAddBook } from '../payload/payloadAddBook';
import { BooksResponse, chainedKey, isbnValue } from '../constants/keys';
dotenv.config();

test.describe('Chained API calls - DemoQA', () => {
  let apiContext: APIRequestContext;
  // const password = requireEnv('PASSWORD');
  // const baseURL = requireEnv ('BASE_URL');

  const userName = `${process.env.USERNAME_PREFIX}${Date.now()}`;
  const password = process.env.PASSWORD!;
  const baseURL = process.env.BASE_URL!;
  
  let userId: string;
  let token: string;
  
  const responseKey = 'books'

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });
  });

  test('Create user -> Generate token -> Authorize -> Add book', async () => {
    // Create user
    const createUserResponse = await apiContext.post('/Account/v1/User', {
      data: payloadUserCredentials(userName, password)
    });
    expect(createUserResponse.status()).toBe(201);
    const createUserBody = await createUserResponse.json();
    // console.info('Create User Response:', createUserBody);
    userId = createUserBody.userID;
    expect(userId).toBeTruthy();
    expect((createUserBody.username)).toEqual(userName)

    // Generate token
    const tokenResponse = await apiContext.post('/Account/v1/GenerateToken', {
      data: payloadUserCredentials(userName, password)
    });
    expect(tokenResponse.status()).toBe(200);
    const tokenBody = await tokenResponse.json();
    // console.info(createUserBody)
    // console.info('Generate Token Response:', tokenBody);
    token = tokenBody.token;
    expect(token).toBeTruthy();

    // Authorize user
    const authResponse = await apiContext.post('/Account/v1/Authorized', {
      // data: { userName, password },
      data: payloadUserCredentials(userName, password)
    });
    expect(authResponse.status()).toBe(200);
    const authResult = await authResponse.json();
    expect(authResult).toBe(true);
    // console.info('Authorize Response:', authResult);

    // Add book
    const addBookResponse = await apiContext.post('/BookStore/v1/Books', {
      headers: { Authorization: `Bearer ${token}` },
      data: payloadAddBook(userId)
    });
    expect(addBookResponse.status()).toBe(201);
    const addBookBody = await addBookResponse.json();
    // console.info('Add Book Response:', addBookBody);
    expect(addBookBody).toHaveProperty(responseKey);
    addBookBody[responseKey].forEach((item: any) => {
      expect(item).toHaveProperty(chainedKey);
    });    

    // Check
    const response = await apiContext.get('/BookStore/v1/Books');
    // console.info(await response.json());
    expect(response.status()).toBe(200);

    const body = await response.json(); 
    // const body: BooksResponse = await response.json(); 
    // console.info(JSON.stringify(body, null, 2));
    // expect(body.books[0].isbn).toEqual(isbnValue); 
    expect(body.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isbn: isbnValue
        })
      ])
    );
    // expect(
    //   body.books.some(book => book.isbn === isbnValue)
    // ).toBe(true);


    // expect(body).toHaveProperty(responseKey);
    // expect(Array.isArray(body[responseKey])).toBe(true);
    // expect(body[responseKey].length).toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
