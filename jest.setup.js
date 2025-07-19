import '@testing-library/jest-dom'

// Mock Next.js router - using default mocks that can be overridden in individual tests
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockSearchParamsGet = jest.fn()
const mockParams = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    forward: mockForward,
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
  usePathname: () => '/mock-path',
  useParams: mockParams,
}))

// Export mocks for use in individual tests
global.__nextMocks = {
  mockPush,
  mockReplace,
  mockPrefetch,
  mockBack,
  mockForward,
  mockSearchParamsGet,
  mockParams,
}

// Mock window.postMessage for SafeFrame testing
Object.defineProperty(window, 'postMessage', {
  value: jest.fn(),
  writable: true,
})

// Mock window.parent for iframe testing
Object.defineProperty(window, 'parent', {
  value: {
    postMessage: jest.fn(),
  },
  writable: true,
})

// Mock HTMLMediaElement for video testing
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  value: jest.fn().mockImplementation(() => Promise.resolve()),
  writable: true,
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  value: jest.fn(),
  writable: true,
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: jest.fn(),
  writable: true,
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock fetch for tracking pixels
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
  })
)

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})