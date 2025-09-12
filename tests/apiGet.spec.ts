import { test, expect, request, APIRequestContext, APIResponse } from '@playwright/test';
import { keys } from '../constants/keys';
import dotenv from 'dotenv';

dotenv.config();

test.describe('API Testing with Playwright + TypeScript', () => {
  let apiContext: APIRequestContext;
  const url = process.env.BASE_URL!;
  const responseKey = 'books';

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: url,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('GET API call', async () => {
    const response = await apiContext.get('/BookStore/v1/Books');
    // console.info(await response.json());
    expect(response.status()).toBe(200);

    const body = await response.json();    
    expect(body).toHaveProperty(responseKey);
    expect(Array.isArray(body[responseKey])).toBe(true);
    expect(body[responseKey].length).toBeGreaterThan(0);

    body[responseKey].forEach((item: any) => {
      keys.forEach(key => {
        // console.info(key)
        expect(item).toHaveProperty(key);
        expect(typeof item[key]).toBe('string');
      });
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
