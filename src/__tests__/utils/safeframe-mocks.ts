import { SafeFrameMessage, AdPayload } from '@/types/ad'

// Mock SafeFrame global object
export const mockSafeFrame = {
  ext: {
    register: jest.fn((id: string, callback: (status: string) => void) => {
      callback('ok')
    }),
    expand: jest.fn(),
    collapse: jest.fn(),
    geom: jest.fn(() => ({
      win: { w: 1024, h: 768 },
      self: { w: 300, h: 250 }
    })),
    meta: jest.fn(() => ({
      url: 'http://localhost:3000'
    }))
  }
}

// Mock window.postMessage
export const mockPostMessage = jest.fn()

// Mock MessageEvent for testing
export class MockMessageEvent {
  data: any
  origin: string
  source: any

  constructor(data: any, origin = 'http://localhost:3000', source = window) {
    this.data = data
    this.origin = origin
    this.source = source
  }
}

// Helper to create SafeFrame message events
export const createSafeFrameMessage = (
  type: SafeFrameMessage['type'],
  data?: any,
  adId?: string
): SafeFrameMessage => ({
  type,
  data,
  adId
})

// Mock iframe element for testing
export const createMockIframe = (contentWindow?: Window) => ({
  contentWindow: contentWindow || {
    postMessage: mockPostMessage
  },
  src: 'http://localhost:3000/ad-frame',
  onload: jest.fn(),
  style: {
    width: '300px',
    height: '250px',
    border: 'none'
  }
} as unknown as HTMLIFrameElement)

// Setup function to mock window globals for SafeFrame
export const setupSafeFrameMocks = () => {
  // Mock window.$sf
  Object.defineProperty(window, '$sf', {
    value: mockSafeFrame,
    writable: true
  })

  // Mock window.postMessage
  Object.defineProperty(window, 'postMessage', {
    value: mockPostMessage,
    writable: true
  })

  // Mock parent window
  Object.defineProperty(window, 'parent', {
    value: {
      postMessage: mockPostMessage
    },
    writable: true
  })

  // Mock document.referrer
  Object.defineProperty(document, 'referrer', {
    value: 'http://localhost:3000',
    writable: true
  })
}

// Cleanup function to reset mocks
export const cleanupSafeFrameMocks = () => {
  jest.clearAllMocks()
  delete (window as any).$sf
}