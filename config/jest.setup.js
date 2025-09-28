import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// BigInt serialization support
BigInt.prototype.toJSON = function() {
  return this.toString()
}

// Fix BigInt serialization for Jest
expect.addSnapshotSerializer({
  test: (val) => typeof val === 'bigint',
  print: (val) => val.toString(),
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: () => null,
  useConnect: () => ({ connect: jest.fn() }),
  useDisconnect: () => ({ disconnect: jest.fn() }),
  ThirdwebProvider: ({ children }) => children,
}))

// Mock @use-glyph/sdk-react
jest.mock('@use-glyph/sdk-react', () => ({
  useNativeGlyphConnection: () => ({ connect: jest.fn() }),
  useGlyph: () => ({ login: jest.fn(), user: null }),
  GlyphProvider: ({ children }) => children,
}))

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: null, isLoading: false, error: null }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}))

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// JSDOM environment is now properly set up above
