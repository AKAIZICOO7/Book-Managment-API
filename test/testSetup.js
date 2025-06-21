const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';

// Clean up test databases before each test suite
beforeAll(() => {
  const testDbPath = path.join(__dirname, '../server/test_books.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Clean up after all tests
afterAll(() => {
  const testDbPath = path.join(__dirname, '../server/test_books.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Mock console.log to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};