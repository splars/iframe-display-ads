import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoTemplate from '../VideoTemplate'
import { mockVideoAdPayload } from '../../test-utils'

// Mock the fireTrackingPixel function
jest.mock('../../lib/ads', () => ({
  fireTrackingPixel: jest.fn(),
}))

describe('VideoTemplate', () => {
  const mockOnImpression = jest.fn()
  const mockOnClick = jest.fn()
  const mockParentPostMessage = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.parent.postMessage
    Object.defineProperty(window, 'parent', {
      value: {
        postMessage: mockParentPostMessage,
      },
      writable: true,
    })
  })

  it('renders video element with correct attributes', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = screen.getByRole('application') || document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', mockVideoAdPayload.creativeUrl)
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('muted')
    expect(video).toHaveAttribute('loop')
  })

  it('has correct video styling', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    expect(video).toHaveClass('w-full', 'h-full', 'object-cover')
  })

  it('renders click overlay with call-to-action text', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(screen.getByText('Click to learn more')).toBeInTheDocument()
  })

  it('has correct container styling', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByText('Click to learn more').closest('div')?.parentElement
    expect(container).toHaveClass('relative', 'w-full', 'h-full', 'overflow-hidden', 'bg-black')
  })

  it('calls onImpression when video loads data', async () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.loadedData(video!)
    
    await waitFor(() => {
      expect(mockOnImpression).toHaveBeenCalledTimes(1)
    })
  })

  it('fires impression tracking pixels on video load', async () => {
    const adWithImpressionTracking = {
      ...mockVideoAdPayload,
      trackingUrls: ['https://example.com/impression', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <VideoTemplate 
        ad={adWithImpressionTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.loadedData(video!)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/impression')
    })
  })

  it('fires start tracking pixels on video play', async () => {
    const adWithStartTracking = {
      ...mockVideoAdPayload,
      trackingUrls: ['https://example.com/start', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <VideoTemplate 
        ad={adWithStartTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.play(video!)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/start')
    })
  })

  it('calls onClick when overlay is clicked', async () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    fireEvent.click(overlay!)
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  it('fires click tracking pixels on overlay click', async () => {
    const adWithClickTracking = {
      ...mockVideoAdPayload,
      trackingUrls: ['https://example.com/click', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <VideoTemplate 
        ad={adWithClickTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    fireEvent.click(overlay!)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/click')
    })
  })

  it('sends navigation message to parent window on click', async () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    fireEvent.click(overlay!)
    
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'navigate',
        data: {
          adId: mockVideoAdPayload.id,
          clickUrl: mockVideoAdPayload.clickUrl,
          productId: `product-${mockVideoAdPayload.id}`,
          source: 'video-ad'
        }
      }, '*')
    })
  })

  it('handles video error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.error(video!)
    
    expect(consoleSpy).toHaveBeenCalledWith('Video failed to load:', mockVideoAdPayload.creativeUrl)
    
    consoleSpy.mockRestore()
  })

  it('has correct overlay styling', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    expect(overlay).toHaveClass('absolute', 'inset-0', 'bg-transparent', 'cursor-pointer')
  })

  it('has hover effect on overlay', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const hoverElement = document.querySelector('.hover\\:bg-opacity-10')
    expect(hoverElement).toBeInTheDocument()
    expect(hoverElement).toHaveClass('bg-black', 'bg-opacity-0', 'hover:bg-opacity-10')
  })

  it('has correct call-to-action positioning', () => {
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaElement = screen.getByText('Click to learn more')
    expect(ctaElement).toHaveClass('absolute', 'bottom-4', 'right-4')
  })

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(HTMLVideoElement.prototype, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(HTMLVideoElement.prototype, 'removeEventListener')
    
    const { unmount } = render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('loadeddata', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('loadeddata', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('play', expect.any(Function))
    
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('handles missing tracking URLs gracefully', () => {
    const adWithoutTracking = {
      ...mockVideoAdPayload,
      trackingUrls: []
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <VideoTemplate 
        ad={adWithoutTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.loadedData(video!)
    fireEvent.play(video!)
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    fireEvent.click(overlay!)
    
    expect(fireTrackingPixel).not.toHaveBeenCalled()
  })

  it('does not send parent message when window.parent is same as window', () => {
    // Mock window.parent to be the same as window
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
    })
    
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const overlay = screen.getByText('Click to learn more').closest('div')?.parentElement
    fireEvent.click(overlay!)
    
    expect(mockParentPostMessage).not.toHaveBeenCalled()
  })

  it('handles video ref being null', () => {
    const { fireTrackingPixel } = require('../../lib/ads')
    
    // Mock useRef to return null
    const useRefSpy = jest.spyOn(require('react'), 'useRef')
    useRefSpy.mockReturnValue({ current: null })
    
    render(
      <VideoTemplate 
        ad={mockVideoAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    // Should not throw error
    expect(fireTrackingPixel).not.toHaveBeenCalled()
    
    useRefSpy.mockRestore()
  })

  it('handles multiple tracking URLs correctly', async () => {
    const adWithMultipleTracking = {
      ...mockVideoAdPayload,
      trackingUrls: [
        'https://example.com/impression',
        'https://example.com/start',
        'https://example.com/click',
        'https://example.com/other'
      ]
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <VideoTemplate 
        ad={adWithMultipleTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const video = document.querySelector('video')
    fireEvent.loadedData(video!)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/impression')
      expect(fireTrackingPixel).not.toHaveBeenCalledWith('https://example.com/start')
      expect(fireTrackingPixel).not.toHaveBeenCalledWith('https://example.com/click')
    })
  })
})