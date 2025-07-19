import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import NativeCardTemplate from '../NativeCardTemplate'
import { mockNativeAdPayload } from '../../test-utils'

// Mock the fireTrackingPixel function
jest.mock('../../lib/ads', () => ({
  fireTrackingPixel: jest.fn(),
}))

describe('NativeCardTemplate', () => {
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

  it('renders native card with correct structure', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    // Check main container
    const container = screen.getByRole('img').closest('div')
    expect(container).toHaveClass('w-full', 'h-full', 'bg-white', 'rounded-lg', 'shadow-lg')
    
    // Check if ad label is present
    expect(screen.getByText('Ad')).toBeInTheDocument()
    
    // Check if CTA button is present
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('renders image with correct attributes', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockNativeAdPayload.creativeUrl)
    expect(image).toHaveAttribute('alt', 'Native Ad')
    expect(image).toHaveClass('w-full', 'h-32', 'object-cover')
  })

  it('renders headline and body text', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(screen.getByText(mockNativeAdPayload.headline!)).toBeInTheDocument()
    expect(screen.getByText(mockNativeAdPayload.body!)).toBeInTheDocument()
  })

  it('renders default headline when not provided', () => {
    const adWithoutHeadline = {
      ...mockNativeAdPayload,
      headline: undefined
    }
    
    render(
      <NativeCardTemplate 
        ad={adWithoutHeadline}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(screen.getByText('Native Advertisement')).toBeInTheDocument()
  })

  it('renders default body when not provided', () => {
    const adWithoutBody = {
      ...mockNativeAdPayload,
      body: undefined
    }
    
    render(
      <NativeCardTemplate 
        ad={adWithoutBody}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(screen.getByText('This is a native advertisement that blends seamlessly with your content.')).toBeInTheDocument()
  })

  it('calls onImpression when image loads', async () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
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
      ...mockNativeAdPayload,
      trackingUrls: ['https://example.com/impression', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <NativeCardTemplate 
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

  it('calls onClick when CTA button is clicked', async () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByText('Learn More')
    fireEvent.click(ctaButton)
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  it('fires click tracking pixels on CTA button click', async () => {
    const adWithClickTracking = {
      ...mockNativeAdPayload,
      trackingUrls: ['https://example.com/click', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <NativeCardTemplate 
        ad={adWithClickTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByText('Learn More')
    fireEvent.click(ctaButton)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/click')
    })
  })

  it('sends navigation message to parent window on click', async () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByText('Learn More')
    fireEvent.click(ctaButton)
    
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'navigate',
        data: {
          adId: mockNativeAdPayload.id,
          clickUrl: mockNativeAdPayload.clickUrl,
          productId: `product-${mockNativeAdPayload.id}`,
          source: 'native-ad'
        }
      }, '*')
    })
  })

  it('handles image load error gracefully', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    // Should replace src with placeholder
    expect(image).toHaveAttribute('src', 
      `https://placehold.co/${mockNativeAdPayload.width}x200/CCCCCC/666666?text=Image+Failed`
    )
  })

  it('logs error when image fails to load', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    expect(consoleSpy).toHaveBeenCalledWith('Native image failed to load:', mockNativeAdPayload.creativeUrl)
    
    consoleSpy.mockRestore()
  })

  it('has correct ad label styling', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const adLabel = screen.getByText('Ad')
    expect(adLabel).toHaveClass('absolute', 'top-2', 'right-2', 'bg-gray-800', 'bg-opacity-50', 'text-white', 'text-xs', 'px-2', 'py-1', 'rounded')
  })

  it('has correct headline styling', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const headline = screen.getByText(mockNativeAdPayload.headline!)
    expect(headline).toHaveClass('font-bold', 'text-lg', 'text-gray-800', 'mb-2', 'line-clamp-2')
  })

  it('has correct body text styling', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const bodyText = screen.getByText(mockNativeAdPayload.body!)
    expect(bodyText).toHaveClass('text-gray-600', 'text-sm', 'mb-3', 'line-clamp-3')
  })

  it('has correct CTA button styling', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByText('Learn More')
    expect(ctaButton).toHaveClass('w-full', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'font-semibold', 'py-2', 'px-4', 'rounded', 'transition-colors')
  })

  it('has hover shadow effect', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')
    expect(container).toHaveClass('hover:shadow-xl', 'transition-shadow')
  })

  it('has correct content padding', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const contentArea = screen.getByText(mockNativeAdPayload.headline!).closest('div')
    expect(contentArea).toHaveClass('p-4')
  })

  it('handles multiple tracking URLs correctly', async () => {
    const adWithMultipleTracking = {
      ...mockNativeAdPayload,
      trackingUrls: [
        'https://example.com/impression',
        'https://example.com/click',
        'https://example.com/other-impression',
        'https://example.com/other-click'
      ]
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <NativeCardTemplate 
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
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByText('Learn More')
    fireEvent.click(ctaButton)
    
    expect(mockParentPostMessage).not.toHaveBeenCalled()
  })

  it('handles missing tracking URLs gracefully', () => {
    const adWithoutTracking = {
      ...mockNativeAdPayload,
      trackingUrls: []
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <NativeCardTemplate 
        ad={adWithoutTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    const ctaButton = screen.getByText('Learn More')
    fireEvent.click(ctaButton)
    
    expect(fireTrackingPixel).not.toHaveBeenCalled()
  })

  it('maintains accessibility with proper button semantics', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const ctaButton = screen.getByRole('button', { name: 'Learn More' })
    expect(ctaButton).toBeInTheDocument()
  })

  it('has semantic HTML structure', () => {
    render(
      <NativeCardTemplate 
        ad={mockNativeAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    
    // The headline is rendered as h3
    const headline = screen.getByText(mockNativeAdPayload.headline!)
    expect(headline).toBeInTheDocument()
  })
})