import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import AdSlot from '@/components/AdSlot'
import { AdPayload } from '@/types/ad'
import { 
  setupSafeFrameMocks, 
  cleanupSafeFrameMocks, 
  createSafeFrameMessage,
  MockMessageEvent 
} from '../utils/safeframe-mocks'

// Mock the safeframe module
jest.mock('@/lib/safeframe', () => ({
  safeFrameHost: {
    registerSlot: jest.fn(),
    sendToFrame: jest.fn(),
    onMessage: jest.fn()
  }
}))

import { safeFrameHost } from '@/lib/safeframe'

const mockSafeFrameHost = safeFrameHost as jest.Mocked<typeof safeFrameHost>

describe('AdSlot', () => {
  const defaultProps = {
    slotId: 'test-slot-1',
    slotName: 'banner-top',
    width: 300,
    height: 250
  }

  const mockAdData: AdPayload = {
    id: 'ad-123',
    slot: 'banner-top',
    format: 'banner',
    width: 300,
    height: 250,
    clickUrl: 'https://example.com',
    trackingUrls: ['https://track.example.com'],
    headline: 'Test Ad',
    body: 'Test ad body',
    creativeUrl: 'https://example.com/creative.jpg'
  }

  beforeEach(() => {
    setupSafeFrameMocks()
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: [mockAdData]
        })
      })
    ) as jest.Mock

    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupSafeFrameMocks()
  })

  describe('initial render', () => {
    it('should render loading state initially', () => {
      render(<AdSlot {...defaultProps} />)
      
      expect(screen.getByText('Loading Ad...')).toBeInTheDocument()
      expect(screen.getByText('banner-top')).toBeInTheDocument()
      expect(screen.getByText('300×250')).toBeInTheDocument()
    })

    it('should render iframe with correct attributes', () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', '/ad-frame')
      expect(iframe).toHaveAttribute('width', '300')
      expect(iframe).toHaveAttribute('height', '250')
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox')
    })

    it('should apply custom className', () => {
      render(<AdSlot {...defaultProps} className="custom-class" />)
      
      const container = screen.getByTitle('Ad slot: banner-top').parentElement
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('ad data fetching', () => {
    it('should fetch ad data on mount', async () => {
      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ads?slot=banner-top')
      })
    })

    it('should handle successful ad data response', async () => {
      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ads?slot=banner-top')
      })

      // Verify iframe is created with ad data
      const iframe = screen.getByTitle('Ad slot: banner-top')
      expect(iframe).toBeInTheDocument()
    })

    it('should handle empty ad data response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: []
          })
        })
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('No ads available for this slot')).toBeInTheDocument()
      })
    })

    it('should handle failed ad data response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            success: false,
            data: []
          })
        })
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('No ads available for this slot')).toBeInTheDocument()
      })
    })

    it('should handle fetch error', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load ad')).toBeInTheDocument()
      })
    })

    it('should use ad dimensions when available', async () => {
      const adWithDifferentSize = {
        ...mockAdData,
        width: 728,
        height: 90
      }

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: [adWithDifferentSize]
          })
        })
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        const iframe = screen.getByTitle('Ad slot: banner-top')
        expect(iframe).toHaveAttribute('width', '728')
        expect(iframe).toHaveAttribute('height', '90')
      })
    })
  })

  describe('iframe loading detection', () => {
    it('should detect iframe load via onLoad event', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Simulate iframe load
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Iframe onLoad event fired for test-slot-1')
      })
    })

    it('should detect iframe ready via frame-ready message', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Mock iframe contentWindow
      const mockContentWindow = {
        postMessage: jest.fn()
      }
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: mockContentWindow,
        writable: true
      })
      
      // Simulate frame-ready message
      const event = new MockMessageEvent(
        { type: 'frame-ready' },
        'http://localhost:3000',
        mockContentWindow
      )
      
      act(() => {
        window.dispatchEvent(event as MessageEvent)
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Received frame-ready message for test-slot-1')
      })
    })

    it('should handle iframe ready detection fallback timeout', async () => {
      jest.useFakeTimers()
      
      render(<AdSlot {...defaultProps} />)
      
      // Fast forward to trigger fallback timeout
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Iframe fallback timeout reached for test-slot-1, assuming ready')
      })
      
      jest.useRealTimers()
    })

    it('should handle cross-origin iframe detection', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Mock cross-origin access error
      Object.defineProperty(iframe, 'contentDocument', {
        get: () => {
          throw new Error('Cross-origin access denied')
        }
      })
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: {
          document: {
            get readyState() {
              throw new Error('Cross-origin access denied')
            }
          }
        }
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Iframe cross-origin detected for test-slot-1, assuming ready')
      })
    })
  })

  describe('SafeFrame communication', () => {
    it('should register slot with SafeFrame when ad data and iframe are ready', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Simulate iframe load
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.registerSlot).toHaveBeenCalledWith({
          id: 'test-slot-1',
          name: 'banner-top',
          width: 300,
          height: 250,
          iframe: expect.any(HTMLIFrameElement)
        })
      })
    })

    it('should send ad payload to iframe after registration', async () => {
      jest.useFakeTimers()
      
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.registerSlot).toHaveBeenCalled()
      })
      
      // Fast forward to trigger ad payload sending
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      await waitFor(() => {
        expect(mockSafeFrameHost.sendToFrame).toHaveBeenCalledWith(
          'test-slot-1',
          {
            type: 'ad-payload',
            data: mockAdData
          }
        )
      })
      
      jest.useRealTimers()
    })

    it('should handle SafeFrame message responses', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      // Get the message handler
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test creative-ready message
      act(() => {
        messageHandler(createSafeFrameMessage('creative-ready', undefined, 'ad-123'))
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Creative ready for test-slot-1')
      })
    })

    it('should handle expand message and resize iframe', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test expand message
      act(() => {
        messageHandler(createSafeFrameMessage('expand', { width: 500, height: 400 }))
      })
      
      await waitFor(() => {
        expect(iframe.style.width).toBe('500px')
        expect(iframe.style.height).toBe('400px')
        expect(iframe.style.zIndex).toBe('9999')
        expect(iframe.style.position).toBe('relative')
      })
    })

    it('should handle collapse message and reset iframe size', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test collapse message
      act(() => {
        messageHandler(createSafeFrameMessage('collapse'))
      })
      
      await waitFor(() => {
        expect(iframe.style.width).toBe('300px')
        expect(iframe.style.height).toBe('250px')
        expect(iframe.style.zIndex).toBe('auto')
        expect(iframe.style.position).toBe('static')
      })
    })

    it('should handle impression and click messages', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test impression message
      act(() => {
        messageHandler(createSafeFrameMessage('impression', undefined, 'ad-123'))
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Impression logged for test-slot-1')
      })
      
      // Test click message
      act(() => {
        messageHandler(createSafeFrameMessage('click', undefined, 'ad-123'))
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Click logged for test-slot-1')
      })
    })

    it('should handle unknown message types', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test unknown message type
      act(() => {
        messageHandler({ type: 'unknown-type' as any, data: {} })
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Unknown message type: unknown-type')
      })
    })
  })

  describe('navigation handling', () => {
    const mockNavigationData = {
      adId: 'ad-123',
      clickUrl: 'https://example.com/product',
      productId: 'prod-456',
      source: 'banner-ad'
    }

    it('should handle navigate message from SafeFrame', async () => {
      // Mock window.location with assign method
      const mockAssign = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { assign: mockAssign, href: '' },
        writable: true,
        configurable: true
      })
      
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.onMessage).toHaveBeenCalled()
      })
      
      const messageHandler = mockSafeFrameHost.onMessage.mock.calls[0][1]
      
      // Test navigate message
      act(() => {
        messageHandler(createSafeFrameMessage('navigate', mockNavigationData))
      })
      
      // Should have attempted navigation
      expect(console.log).toHaveBeenCalledWith('Navigate message received for test-slot-1:', mockNavigationData)
    })

    it('should handle navigate message directly from iframe', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Mock iframe contentWindow
      const mockContentWindow = {
        postMessage: jest.fn()
      }
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: mockContentWindow,
        writable: true
      })
      
      // Simulate navigate message
      const event = new MockMessageEvent(
        { type: 'navigate', data: mockNavigationData },
        'http://localhost:3000',
        mockContentWindow
      )
      
      act(() => {
        window.dispatchEvent(event as MessageEvent)
      })
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Received navigate message for test-slot-1:', { type: 'navigate', data: mockNavigationData })
      })
    })

    it('should not handle navigate message from wrong iframe', async () => {
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Mock iframe contentWindow
      const mockContentWindow = {
        postMessage: jest.fn()
      }
      
      Object.defineProperty(iframe, 'contentWindow', {
        value: mockContentWindow,
        writable: true
      })
      
      // Simulate navigate message from different source
      const event = new MockMessageEvent(
        { type: 'navigate', data: mockNavigationData },
        'http://localhost:3000',
        { postMessage: jest.fn() } // different source
      )
      
      act(() => {
        window.dispatchEvent(event as MessageEvent)
      })
      
      // Should not have logged the navigation message
      expect(console.log).not.toHaveBeenCalledWith('Received navigate message for test-slot-1:', expect.any(Object))
    })
  })

  describe('error handling', () => {
    it('should render error state when fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Ad Slot Error')).toBeInTheDocument()
        expect(screen.getByText('Failed to load ad')).toBeInTheDocument()
      })
    })

    it('should render error state when no ads available', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            data: []
          })
        })
      ) as jest.Mock

      render(<AdSlot {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Ad Slot Error')).toBeInTheDocument()
        expect(screen.getByText('No ads available for this slot')).toBeInTheDocument()
      })
    })

    it('should handle SafeFrame not available', async () => {
      // Test that AdSlot renders even without SafeFrame
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      fireEvent.load(iframe)
      
      // Should still render iframe and handle gracefully
      expect(iframe).toBeInTheDocument()
      expect(screen.getByText('Loading Ad...')).toBeInTheDocument()
    })

    it('should handle missing iframe contentWindow when sending payload', async () => {
      jest.useFakeTimers()
      
      render(<AdSlot {...defaultProps} />)
      
      const iframe = screen.getByTitle('Ad slot: banner-top')
      
      // Mock iframe without contentWindow
      Object.defineProperty(iframe, 'contentWindow', {
        value: null,
        writable: true
      })
      
      fireEvent.load(iframe)
      
      await waitFor(() => {
        expect(mockSafeFrameHost.registerSlot).toHaveBeenCalled()
      })
      
      // Fast forward to trigger ad payload sending
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to send ad payload - contentWindow: false, safeFrameHost: true')
      })
      
      jest.useRealTimers()
    })
  })

  describe('cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<AdSlot {...defaultProps} />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should cleanup timeouts on unmount', () => {
      jest.useFakeTimers()
      
      const { unmount } = render(<AdSlot {...defaultProps} />)
      
      unmount()
      
      // Should not throw errors when timeouts try to execute
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      jest.useRealTimers()
    })
  })
})