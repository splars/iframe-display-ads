import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import ExpandableTemplate from '../ExpandableTemplate'
import { mockExpandableAdPayload } from '../../test-utils'

// Mock the fireTrackingPixel function
jest.mock('../../lib/ads', () => ({
  fireTrackingPixel: jest.fn(),
}))

describe('ExpandableTemplate', () => {
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

  it('renders collapsed state initially', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockExpandableAdPayload.creativeUrl)
    expect(image).toHaveAttribute('alt', 'Expandable Ad')
    
    expect(screen.getByText('Hover to expand')).toBeInTheDocument()
    expect(screen.queryByText('Expanded Content')).not.toBeInTheDocument()
  })

  it('has correct container styling in collapsed state', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    expect(container).toHaveClass('relative', 'overflow-hidden', 'bg-white', 'rounded-lg', 'shadow-lg', 'cursor-pointer')
    expect(container).toHaveClass('w-full', 'h-full')
    expect(container).not.toHaveClass('w-[600px]', 'h-[400px]')
  })

  it('expands on mouse enter', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      expect(screen.getByText('Expanded Content')).toBeInTheDocument()
      expect(screen.queryByText('Hover to expand')).not.toBeInTheDocument()
    })
  })

  it('sends expand message to parent on mouse enter', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'expand',
        data: { width: 600, height: 400, adId: mockExpandableAdPayload.id }
      }, '*')
    })
  })

  it('collapses on mouse leave', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    
    // First expand
    fireEvent.mouseEnter(container!)
    await waitFor(() => {
      expect(screen.getByText('Expanded Content')).toBeInTheDocument()
    })
    
    // Then collapse
    fireEvent.mouseLeave(container!)
    await waitFor(() => {
      expect(screen.queryByText('Expanded Content')).not.toBeInTheDocument()
      expect(screen.getByText('Hover to expand')).toBeInTheDocument()
    })
  })

  it('sends collapse message to parent on mouse leave', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    
    // First expand
    fireEvent.mouseEnter(container!)
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'expand',
        data: { width: 600, height: 400, adId: mockExpandableAdPayload.id }
      }, '*')
    })
    
    // Then collapse
    fireEvent.mouseLeave(container!)
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'collapse',
        data: { adId: mockExpandableAdPayload.id }
      }, '*')
    })
  })

  it('has correct expanded container styling', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      expect(container).toHaveClass('w-[600px]', 'h-[400px]', 'z-50')
    })
  })

  it('renders expanded content correctly', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      expect(screen.getByText('Expanded Content')).toBeInTheDocument()
      expect(screen.getByText('This is the expanded view with rich interactive content and detailed information about our amazing product.')).toBeInTheDocument()
      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
      expect(screen.getByText('Amazing functionality')).toBeInTheDocument()
      expect(screen.getByText('Incredible performance')).toBeInTheDocument()
      expect(screen.getByText('Move mouse away to collapse')).toBeInTheDocument()
    })
  })

  it('calls onImpression when image loads', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
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
      ...mockExpandableAdPayload,
      trackingUrls: ['https://example.com/impression', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <ExpandableTemplate 
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

  it('calls onClick when collapsed ad is clicked', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const clickableArea = screen.getByRole('img').closest('div')
    fireEvent.click(clickableArea!)
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClick when expanded Learn More button is clicked', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      const learnMoreButton = screen.getByText('Learn More')
      fireEvent.click(learnMoreButton)
    })
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  it('fires click tracking pixels on click', async () => {
    const adWithClickTracking = {
      ...mockExpandableAdPayload,
      trackingUrls: ['https://example.com/click', 'https://example.com/other']
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <ExpandableTemplate 
        ad={adWithClickTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const clickableArea = screen.getByRole('img').closest('div')
    fireEvent.click(clickableArea!)
    
    await waitFor(() => {
      expect(fireTrackingPixel).toHaveBeenCalledWith('https://example.com/click')
    })
  })

  it('sends navigation message to parent window on click', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const clickableArea = screen.getByRole('img').closest('div')
    fireEvent.click(clickableArea!)
    
    await waitFor(() => {
      expect(mockParentPostMessage).toHaveBeenCalledWith({
        type: 'navigate',
        data: {
          adId: mockExpandableAdPayload.id,
          clickUrl: mockExpandableAdPayload.clickUrl,
          productId: `product-${mockExpandableAdPayload.id}`,
          source: 'expandable-ad'
        }
      }, '*')
    })
  })

  it('handles image load error gracefully', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    // Should replace src with placeholder
    expect(image).toHaveAttribute('src', 
      `https://placehold.co/${mockExpandableAdPayload.width}x${mockExpandableAdPayload.height}/CCCCCC/666666?text=Hover+to+Expand`
    )
  })

  it('logs error when image fails to load', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.error(image)
    
    expect(consoleSpy).toHaveBeenCalledWith('Expandable image failed to load:', mockExpandableAdPayload.creativeUrl)
    
    consoleSpy.mockRestore()
  })

  it('has correct hover instruction styling', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const hoverInstruction = screen.getByText('Hover to expand')
    expect(hoverInstruction).toHaveClass('absolute', 'bottom-2', 'right-2', 'bg-black', 'bg-opacity-50', 'text-white', 'text-xs', 'px-2', 'py-1', 'rounded')
  })

  it('has correct expanded content styling', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      const expandedContent = screen.getByText('Expanded Content').closest('div')
      expect(expandedContent).toHaveClass('w-full', 'h-full', 'bg-gradient-to-br', 'from-purple-600', 'to-blue-600', 'text-white', 'p-6')
    })
  })

  it('has correct Learn More button styling in expanded state', async () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    
    await waitFor(() => {
      const learnMoreButton = screen.getByText('Learn More')
      expect(learnMoreButton).toHaveClass('bg-white', 'text-purple-600', 'font-bold', 'py-3', 'px-8', 'rounded-lg', 'hover:bg-gray-100')
    })
  })

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(HTMLDivElement.prototype, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(HTMLDivElement.prototype, 'removeEventListener')
    
    const { unmount } = render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
    
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('does not send parent messages when window.parent is same as window', () => {
    // Mock window.parent to be the same as window
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
    })
    
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    fireEvent.mouseEnter(container!)
    fireEvent.mouseLeave(container!)
    
    const clickableArea = screen.getByRole('img').closest('div')
    fireEvent.click(clickableArea!)
    
    expect(mockParentPostMessage).not.toHaveBeenCalled()
  })

  it('handles missing container ref gracefully', () => {
    const { fireTrackingPixel } = require('../../lib/ads')
    
    // Mock useRef to return null
    const useRefSpy = jest.spyOn(require('react'), 'useRef')
    useRefSpy.mockReturnValue({ current: null })
    
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    // Should not throw error
    expect(fireTrackingPixel).not.toHaveBeenCalled()
    
    useRefSpy.mockRestore()
  })

  it('handles missing tracking URLs gracefully', () => {
    const adWithoutTracking = {
      ...mockExpandableAdPayload,
      trackingUrls: []
    }
    
    const { fireTrackingPixel } = require('../../lib/ads')
    
    render(
      <ExpandableTemplate 
        ad={adWithoutTracking}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const image = screen.getByRole('img')
    fireEvent.load(image)
    
    const clickableArea = screen.getByRole('img').closest('div')
    fireEvent.click(clickableArea!)
    
    expect(fireTrackingPixel).not.toHaveBeenCalled()
  })

  it('has correct transition classes', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    expect(container).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
  })

  it('has correct transform origin', () => {
    render(
      <ExpandableTemplate 
        ad={mockExpandableAdPayload}
        onImpression={mockOnImpression}
        onClick={mockOnClick}
      />
    )
    
    const container = screen.getByRole('img').closest('div')?.parentElement
    expect(container).toHaveStyle('transform-origin: top left')
  })
})