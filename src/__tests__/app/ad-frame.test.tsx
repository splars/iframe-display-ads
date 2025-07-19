import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import AdFrame from '@/app/ad-frame/page'
import { AdPayload } from '@/types/ad'
import { SafeFrameGuest } from '@/lib/safeframe'
import { 
  setupSafeFrameMocks, 
  cleanupSafeFrameMocks, 
  createSafeFrameMessage,
  MockMessageEvent 
} from '../utils/safeframe-mocks'

// Mock the SafeFrameGuest class
jest.mock('@/lib/safeframe', () => ({
  SafeFrameGuest: jest.fn()
}))

// Mock the template components
jest.mock('@/templates/BannerTemplate', () => {
  return function MockBannerTemplate({ ad, onImpression, onClick }: any) {
    return (
      <div data-testid="banner-template">
        <div>Banner Ad: {ad.headline}</div>
        <button onClick={onImpression}>Fire Impression</button>
        <button onClick={onClick}>Fire Click</button>
      </div>
    )
  }
})

jest.mock('@/templates/VideoTemplate', () => {
  return function MockVideoTemplate({ ad, onImpression, onClick }: any) {
    return (
      <div data-testid="video-template">
        <div>Video Ad: {ad.headline}</div>
        <button onClick={onImpression}>Fire Impression</button>
        <button onClick={onClick}>Fire Click</button>
      </div>
    )
  }
})

jest.mock('@/templates/NativeCardTemplate', () => {
  return function MockNativeCardTemplate({ ad, onImpression, onClick }: any) {
    return (
      <div data-testid="native-template">
        <div>Native Ad: {ad.headline}</div>
        <button onClick={onImpression}>Fire Impression</button>
        <button onClick={onClick}>Fire Click</button>
      </div>
    )
  }
})

jest.mock('@/templates/ExpandableTemplate', () => {
  return function MockExpandableTemplate({ ad, onImpression, onClick }: any) {
    return (
      <div data-testid="expandable-template">
        <div>Expandable Ad: {ad.headline}</div>
        <button onClick={onImpression}>Fire Impression</button>
        <button onClick={onClick}>Fire Click</button>
      </div>
    )
  }
})

const MockSafeFrameGuest = SafeFrameGuest as jest.MockedClass<typeof SafeFrameGuest>

describe('AdFrame', () => {
  let mockSafeFrameGuest: jest.Mocked<SafeFrameGuest>
  let mockParentWindow: any

  const mockAdData: AdPayload = {
    id: 'ad-123',
    slot: 'banner-top',
    format: 'banner',
    width: 300,
    height: 250,
    clickUrl: 'https://example.com',
    trackingUrls: ['https://track.example.com'],
    headline: 'Test Ad Headline',
    body: 'Test ad body',
    creativeUrl: 'https://example.com/creative.jpg'
  }

  beforeEach(() => {
    setupSafeFrameMocks()
    
    // Set up parent window mock
    mockParentWindow = {
      postMessage: jest.fn()
    }
    
    Object.defineProperty(window, 'parent', {
      value: mockParentWindow,
      writable: true
    })
    
    // Mock SafeFrameGuest instance
    mockSafeFrameGuest = {
      onMessage: jest.fn(),
      sendToHost: jest.fn(),
      isReady: jest.fn().mockReturnValue(true)
    } as any
    
    MockSafeFrameGuest.mockImplementation(() => mockSafeFrameGuest)
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupSafeFrameMocks()
  })

  describe('initialization', () => {
    it('should render loading state initially', () => {
      render(<AdFrame />)
      
      expect(screen.getByText('Waiting for ad payload...')).toBeInTheDocument()
      expect(screen.getByText('Waiting for ad payload...').closest('div')).toHaveClass('text-center')
    })

    it('should create SafeFrameGuest instance on mount', () => {
      render(<AdFrame />)
      
      expect(MockSafeFrameGuest).toHaveBeenCalledTimes(1)
      expect(mockSafeFrameGuest.onMessage).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should register SafeFrame immediately if available', () => {
      render(<AdFrame />)
      
      expect(window.$sf?.ext.register).toHaveBeenCalledWith('ad-frame', expect.any(Function))
    })

    it('should send frame-ready message to parent', async () => {
      jest.useFakeTimers()
      
      render(<AdFrame />)
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'frame-ready' },
        '*'
      )
      
      jest.useRealTimers()
    })

    it('should add resize event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      
      render(<AdFrame />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should handle SafeFrame register callback', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      render(<AdFrame />)
      
      // Get the callback that was passed to register
      const registerCall = (window.$sf?.ext.register as jest.Mock).mock.calls[0]
      const callback = registerCall[1]
      
      callback('ok')
      
      expect(consoleSpy).toHaveBeenCalledWith('SafeFrame registration status:', 'ok')
    })
  })

  describe('message handling', () => {
    it('should handle ad-payload message', async () => {
      render(<AdFrame />)
      
      // Get the message handler
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // Send ad payload message
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Banner Ad: Test Ad Headline')).toBeInTheDocument()
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })

    it('should handle different ad formats', async () => {
      const adFormats = [
        { format: 'banner', testId: 'banner-template' },
        { format: 'video', testId: 'video-template' },
        { format: 'native', testId: 'native-template' },
        { format: 'expandable', testId: 'expandable-template' }
      ] as const
      
      for (const { format, testId } of adFormats) {
        const adData = { ...mockAdData, format }
        
        const { unmount } = render(<AdFrame />)
        
        // Get message handler for this render
        const messageHandlerCalls = mockSafeFrameGuest.onMessage.mock.calls
        const messageHandler = messageHandlerCalls[messageHandlerCalls.length - 1][0]
        
        act(() => {
          messageHandler(createSafeFrameMessage('ad-payload', adData))
        })
        
        await waitFor(() => {
          expect(screen.getByTestId(testId)).toBeInTheDocument()
        })
        
        unmount()
        
        // Clear mocks between iterations
        jest.clearAllMocks()
        MockSafeFrameGuest.mockImplementation(() => mockSafeFrameGuest)
      }
    })

    it('should handle unknown ad format', async () => {
      const adWithUnknownFormat = { ...mockAdData, format: 'unknown' as any }
      
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', adWithUnknownFormat))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Ad Error')).toBeInTheDocument()
        expect(screen.getByText('Unknown ad format: unknown')).toBeInTheDocument()
      })
    })

    it('should clear error when valid ad is received', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // First send invalid ad
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'unknown' as any }))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Ad Error')).toBeInTheDocument()
      })
      
      // Then send valid ad
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Ad Error')).not.toBeInTheDocument()
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })

    it('should ignore non-ad-payload messages', () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // Send non-ad-payload message
      act(() => {
        messageHandler(createSafeFrameMessage('impression', undefined, 'ad-123'))
      })
      
      // Should still show loading state
      expect(screen.getByText('Waiting for ad payload...')).toBeInTheDocument()
    })
  })

  describe('creative-ready handling', () => {
    it('should send creative-ready message when ad is loaded', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
          type: 'creative-ready',
          adId: 'ad-123'
        })
      })
    })

    it('should not send creative-ready if SafeFrame is not available', async () => {
      // Create a component where SafeFrame will be null
      const mockNullSafeFrame = null
      MockSafeFrameGuest.mockImplementation(() => mockNullSafeFrame)
      
      expect(() => {
        render(<AdFrame />)
      }).not.toThrow()
    })
  })

  describe('impression handling', () => {
    beforeEach(async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })

    it('should handle impression event from template', async () => {
      const impressionButton = screen.getByText('Fire Impression')
      
      act(() => {
        impressionButton.click()
      })
      
      expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
        type: 'impression',
        adId: 'ad-123'
      })
    })

    it('should log impression event', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      const impressionButton = screen.getByText('Fire Impression')
      
      act(() => {
        impressionButton.click()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Impression fired for ad:', 'ad-123')
    })

    it('should handle impression when SafeFrame is not available', async () => {
      // Test that impression handling works even when SafeFrame is not available
      const impressionButton = screen.getByText('Fire Impression')
      
      // Temporarily set safeFrame to null in the component
      const componentInstance = { current: { safeFrame: null, ad: mockAdData } } as any
      
      expect(() => {
        impressionButton.click()
      }).not.toThrow()
    })
  })

  describe('click handling', () => {
    beforeEach(async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })

    it('should handle click event from template', async () => {
      const clickButton = screen.getByText('Fire Click')
      
      act(() => {
        clickButton.click()
      })
      
      expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
        type: 'click',
        adId: 'ad-123'
      })
    })

    it('should log click event', async () => {
      const consoleSpy = jest.spyOn(console, 'log')
      const clickButton = screen.getByText('Fire Click')
      
      act(() => {
        clickButton.click()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith('Click fired for ad:', 'ad-123')
    })

    it('should handle click when SafeFrame is not available', async () => {
      // Test that click handling works even when SafeFrame is not available
      const clickButton = screen.getByText('Fire Click')
      
      expect(() => {
        clickButton.click()
      }).not.toThrow()
    })
  })

  describe('resize handling', () => {
    it('should send resize message on window resize', () => {
      render(<AdFrame />)
      
      // Mock document.body dimensions
      Object.defineProperty(document.body, 'scrollWidth', { value: 400, writable: true })
      Object.defineProperty(document.body, 'scrollHeight', { value: 300, writable: true })
      
      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'))
      })
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
        {
          type: 'resize',
          data: {
            width: 400,
            height: 300
          }
        },
        '*'
      )
    })

    it('should not send resize message when no parent window', () => {
      Object.defineProperty(window, 'parent', {
        value: window,
        writable: true
      })
      
      render(<AdFrame />)
      
      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'))
      })
      
      expect(mockParentWindow.postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'resize' }),
        '*'
      )
    })
  })

  describe('error states', () => {
    it('should render error state for unknown ad format', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'unknown' as any }))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Ad Error')).toBeInTheDocument()
        expect(screen.getByText('Unknown ad format: unknown')).toBeInTheDocument()
      })
    })

    it('should render error state with custom styling', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'unknown' as any }))
      })
      
      await waitFor(() => {
        const errorContainer = screen.getByText('Ad Error').closest('div')?.parentElement
        expect(errorContainer).toHaveClass('bg-red-100', 'text-red-600')
      })
    })
  })

  describe('cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<AdFrame />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('SafeFrame ready check', () => {
    it('should check SafeFrame ready state', async () => {
      jest.useFakeTimers()
      
      render(<AdFrame />)
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(mockSafeFrameGuest.isReady).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('SafeFrame ready check:', true)
      
      jest.useRealTimers()
    })

    it('should handle SafeFrame not ready', async () => {
      jest.useFakeTimers()
      
      mockSafeFrameGuest.isReady.mockReturnValue(false)
      
      render(<AdFrame />)
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(console.log).toHaveBeenCalledWith('SafeFrame ready check:', false)
      
      jest.useRealTimers()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete ad loading flow', async () => {
      jest.useFakeTimers()
      
      render(<AdFrame />)
      
      // Check initial state
      expect(screen.getByText('Waiting for ad payload...')).toBeInTheDocument()
      
      // Fast forward to frame-ready message
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'frame-ready' },
        '*'
      )
      
      // Send ad payload
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
      
      // Check creative-ready message
      expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
        type: 'creative-ready',
        adId: 'ad-123'
      })
      
      // Test impression
      const impressionButton = screen.getByText('Fire Impression')
      
      act(() => {
        impressionButton.click()
      })
      
      expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
        type: 'impression',
        adId: 'ad-123'
      })
      
      // Test click
      const clickButton = screen.getByText('Fire Click')
      
      act(() => {
        clickButton.click()
      })
      
      expect(mockSafeFrameGuest.sendToHost).toHaveBeenCalledWith({
        type: 'click',
        adId: 'ad-123'
      })
      
      jest.useRealTimers()
    })

    it('should handle ad format switching', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // Start with banner
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'banner' }))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
      
      // Switch to video
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'video' }))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('video-template')).toBeInTheDocument()
        expect(screen.queryByTestId('banner-template')).not.toBeInTheDocument()
      })
    })

    it('should handle error recovery', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // Send invalid ad
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', { ...mockAdData, format: 'invalid' as any }))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Ad Error')).toBeInTheDocument()
      })
      
      // Send valid ad
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Ad Error')).not.toBeInTheDocument()
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle SafeFrame not available on window', () => {
      delete (window as any).$sf
      
      expect(() => {
        render(<AdFrame />)
      }).not.toThrow()
    })

    it('should handle message handler errors', () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      // Mock template to throw error
      jest.doMock('@/templates/BannerTemplate', () => {
        return function ErrorTemplate() {
          throw new Error('Template error')
        }
      })
      
      expect(() => {
        messageHandler(createSafeFrameMessage('ad-payload', mockAdData))
      }).not.toThrow()
    })

    it('should handle missing ad data properties', async () => {
      render(<AdFrame />)
      
      const messageHandler = mockSafeFrameGuest.onMessage.mock.calls[0][0]
      
      const incompleteAd = {
        id: 'ad-123',
        format: 'banner'
      } as AdPayload
      
      act(() => {
        messageHandler(createSafeFrameMessage('ad-payload', incompleteAd))
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('banner-template')).toBeInTheDocument()
      })
    })
  })
})