// Test utilities exports
export * from './test-utils'
export * from './safeframe-mocks'
export * from './mock-data'
export * from './dom-utils'
export * from './api-mocks'

// Common test helpers
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

export const waitForNextTick = (): Promise<void> => 
  new Promise(resolve => process.nextTick(resolve))

// Mock timers helpers
export const mockTimers = () => {
  jest.useFakeTimers()
}

export const restoreTimers = () => {
  jest.useRealTimers()
}

// Mock console for cleaner test output
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
  })
  
  afterEach(() => {
    global.console = originalConsole
  })
}

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock window.location
  delete (window as any).location
  window.location = {
    ...window.location,
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  } as Location
  
  // Mock navigator
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    writable: true
  })
}

// Cleanup function for tests
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks()
  jest.clearAllTimers()
  
  // Reset window properties
  delete (window as any).$sf
  delete (window as any).postMessage
  delete (window as any).parent
}