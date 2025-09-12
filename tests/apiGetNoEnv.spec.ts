import { test, expect } from '@playwright/test';
import { keys } from '../constants/keys';

test.describe('API Testing with Playwright + TypeScript + NO ENV', () => {
  const responseKey = 'books';

  test('GET API call', async ({ request }) => {
    const response = await request.get('/BookStore/v1/Books');

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty(responseKey);
    expect(Array.isArray(body[responseKey])).toBe(true);
    expect(body[responseKey].length).toBeGreaterThan(0);

    body[responseKey].forEach((item: any) => {
      keys.forEach(key => {
        expect(item).toHaveProperty(key);
        expect(typeof item[key]).toBe('string');
      });
    });
  });
});
