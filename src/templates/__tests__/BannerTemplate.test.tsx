import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import BannerTemplate from '../BannerTemplate'
import { mockAdPayload } from '../../test-utils'

// Mock the fireTrackingPixel function
jest.mock('../../lib/ads', () => ({
  fireTrackingPixel: jest.fn(),
}))

describe('BannerTemplate', () => {
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

  it('renders banner image with correct attributes', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockAdPayload.creativeUrl)
    expect(image).toHaveAttribute('alt', 'Banner Advertisement')
    expect(image).toHaveClass('w-full', 'h-full', 'object-cover')
  })

  it('renders clickable link with correct href', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', mockAdPayload.clickUrl)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('calls onImpression when image loads', async () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    await waitFor(() => {
      expect(mockOnImpression).toHaveBeenCalledTimes(1)
    })
  })

  it('fires impression tracking pixels on image load', async () => {
    const adWithImpressionTracking = {
      ...mockAdPayload,
      trackingUrls: ['https://example.com/impression', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <BannerTemplate 
        ad={adWithImpressionTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/impression')
    })
  })

  it('calls onClick when banner is clicked', async () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    fireEvent.click(link)
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  it('fires click tracking pixels on click', async () => {
    const adWithClickTracking = {
      ...mockAdPayload,
      trackingUrls: ['https://example.com/click', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <BannerTemplate 
        ad={adWithClickTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    fireEvent.click(link)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/click')
    })
  })

  it('prevents default link behavior on click', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })
    
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')
    fireEvent(link, clickEvent)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('sends navigation message to parent window on click', async () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    fireEvent.click(link)
    
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'navigate',
        data: {
          adId: mockAdPayload.id,
          clickUrl: mockAdPayload.clickUrl,
          productId: `product-${mockAdPayload.id}`,
          source: 'banner-ad'
        }
      }, '*')
    })
  })

  it('handles image load error gracefully', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    // Should replace src with placeholder
    expect(image).toHaveAttribute('src', 
      `https://placehold.co/${mockAdPayload.width}x${mockAdPayload.height}/CCCCCC/666666?text=Ad+Failed+to+Load`
    )
  })

  it('logs error when image fails to load', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    expect(consoleSpy).toHaveBeenCalledWith('Banner image failed to load:', mockAdPayload.creativeUrl)
    
    consoleSpy.mockRestore()
  })

  it('has correct container styling', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('link').parentElement
    expect(container).toHaveClass('w-full', 'h-full', 'overflow-hidden')
  })

  it('has correct link styling', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('block', 'w-full', 'h-full', 'cursor-pointer')
  })

  it('handles multiple tracking URLs correctly', async () => {
    const adWithMultipleTracking = {
      ...mockAdPayload,
      trackingUrls: [
        'https://example.com/impression',
        'https://example.com/click',
        'https://example.com/other-impression',
        'https://example.com/other-click'
      ]
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <BannerTemplate 
        ad={adWithMultipleTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/impression')
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/other-impression')
      expect(fireTrackingPixel).not.toHaveBeenCalledWith('https://example.com/click')
      expect(fireTrackingPixel).not.toHaveBeenCalledWith('https://example.com/other-click')
    })
  })

  it('does not send parent message when window.parent is same as window', () => {
    // Mock window.parent to be the same as window
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
    })
    
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const link = screen.getByRole('link')
    fireEvent.click(link)
    
    expect(mockParentPostMessage).not.toHaveBeenCalled()
  })

  it('handles missing tracking URLs gracefully', () => {
    const adWithoutTracking = {
      ...mockAdPayload,
      trackingUrls: []
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <BannerTemplate 
        ad={adWithoutTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    const link = screen.getByRole('link')
    fireEvent.click(link)
    
    expect(fireTrackingPixel).not.toHaveBeenCalled()
  })

  it('maintains accessibility with proper alt text', () => {
    render(
      <BannerTemplate 
        ad={mockAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Banner Advertisement')
  })
})