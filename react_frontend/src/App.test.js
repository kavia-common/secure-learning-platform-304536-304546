import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to prevent import issues in tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

test('renders app without crashing', () => {
  render(<App />);
  // App should render login page when no user is authenticated
  const loginElement = screen.getByText(/SecLearn Login/i);
  expect(loginElement).toBeInTheDocument();
});

test('displays demo account information', () => {
  render(<App />);
  // Check that demo accounts are shown
  const demoText = screen.getByText(/Demo Accounts:/i);
  expect(demoText).toBeInTheDocument();
});
