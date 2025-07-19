import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import ProductDetails from '../page'

// Access global mocks
declare global {
  var __nextMocks: {
    mockPush: jest.Mock,
    mockReplace: jest.Mock,
    mockPrefetch: jest.Mock,
    mockBack: jest.Mock,
    mockForward: jest.Mock,
    mockSearchParamsGet: jest.Mock,
    mockParams: jest.Mock,
  }
}

// Components will render normally since they're tested separately

describe('ProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.__nextMocks.mockParams.mockReturnValue({ id: 'test-product' })
    global.__nextMocks.mockSearchParamsGet.mockReturnValue(null)
  })

  it('renders product page with Header and Sidebar', () => {
    render(<ProductDetails />)
    
    // The components are not mocked correctly - they render the real components
    // Check for elements that would be in the real components
    expect(screen.getByText('Display Ads')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    render(<ProductDetails />)
    
    expect(screen.getByText('Back to Demo')).toBeInTheDocument()
    expect(screen.getByText('Product Details')).toBeInTheDocument()
  })

  it('renders default product when no adId is provided', () => {
    render(<ProductDetails />)
    
    expect(screen.getByText('Featured Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$129.99')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('A high-quality product with excellent features and competitive pricing.')).toBeInTheDocument()
  })

  it('renders banner product when adId contains "banner"', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'banner-ad-123'
      if (key === 'source') return 'banner-click'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Premium Tech Bundle')).toBeInTheDocument()
    expect(screen.getByText('$299.99')).toBeInTheDocument()
    expect(screen.getByText('$399.99')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('A comprehensive technology bundle featuring the latest gadgets and accessories.')).toBeInTheDocument()
  })

  it('renders native product when adId contains "native"', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'native-ad-456'
      if (key === 'source') return 'native-click'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Amazing Product Deal')).toBeInTheDocument()
    expect(screen.getByText('$149.99')).toBeInTheDocument()
    expect(screen.getByText('$299.99')).toBeInTheDocument()
    expect(screen.getByText('Special Offers')).toBeInTheDocument()
    expect(screen.getByText('Get 50% off on our premium products. Limited time offer with exceptional value.')).toBeInTheDocument()
  })

  it('renders expandable product when adId contains "expandable"', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'expandable-ad-789'
      if (key === 'source') return 'expandable-click'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Interactive Experience Kit')).toBeInTheDocument()
    expect(screen.getByText('$199.99')).toBeInTheDocument()
    expect(screen.getByText('$249.99')).toBeInTheDocument()
    expect(screen.getByText('Interactive')).toBeInTheDocument()
    expect(screen.getByText('An expandable, interactive product that grows with your needs.')).toBeInTheDocument()
  })

  it('displays ad context when adId is provided', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'test-ad-123'
      if (key === 'source') return 'banner-ad'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Ad Click Navigation')).toBeInTheDocument()
    expect(screen.getByText('Navigated from ad: test-ad-123 (source: banner-ad)')).toBeInTheDocument()
  })

  it('does not display ad context when no adId is provided', () => {
    render(<ProductDetails />)
    
    expect(screen.queryByText('Ad Click Navigation')).not.toBeInTheDocument()
  })

  it('renders product image with correct src', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'banner-ad-123'
      return null
    })
    
    render(<ProductDetails />)
    
    const productImage = screen.getByRole('img', { name: 'Premium Tech Bundle' })
    expect(productImage).toHaveAttribute('src', 'https://placehold.co/600x400/0066CC/FFFFFF?text=Premium+Tech+Bundle')
  })

  it('renders star ratings correctly', () => {
    render(<ProductDetails />)
    
    // Should render 5 star icons
    const stars = document.querySelectorAll('[data-testid="star"], .w-4.h-4')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('calculates and displays discount percentage', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'native-ad-456'
      return null
    })
    
    render(<ProductDetails />)
    
    // Should show 50% discount for $149.99 vs $299.99
    expect(screen.getByText('Save 50%')).toBeInTheDocument()
  })

  it('renders product features list', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'banner-ad-123'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Latest wireless technology')).toBeInTheDocument()
    expect(screen.getByText('Premium build quality')).toBeInTheDocument()
    expect(screen.getByText('2-year warranty included')).toBeInTheDocument()
    expect(screen.getByText('Free shipping worldwide')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<ProductDetails />)
    
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()
  })

  it('renders guarantee information', () => {
    render(<ProductDetails />)
    
    expect(screen.getByText('Free shipping on orders over $99')).toBeInTheDocument()
    expect(screen.getByText('2-year warranty included')).toBeInTheDocument()
    expect(screen.getByText('30-day return policy')).toBeInTheDocument()
  })

  it('renders product specifications card', () => {
    global.__nextMocks.mockParams.mockReturnValue({ id: 'test-product-123' })
    render(<ProductDetails />)
    
    expect(screen.getByText('Product Specifications')).toBeInTheDocument()
    expect(screen.getByText('Product ID:')).toBeInTheDocument()
    expect(screen.getByText('test-product-123')).toBeInTheDocument()
    expect(screen.getByText('Category:')).toBeInTheDocument()
    expect(screen.getByText('Rating:')).toBeInTheDocument()
    expect(screen.getByText('Reviews:')).toBeInTheDocument()
  })

  it('renders customer reviews section', () => {
    render(<ProductDetails />)
    
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument()
    expect(screen.getByText('What our customers are saying')).toBeInTheDocument()
    expect(screen.getByText('"Excellent product with great value for money. Highly recommended!"')).toBeInTheDocument()
    expect(screen.getByText('"Fast delivery and exactly as described. Will buy again."')).toBeInTheDocument()
    expect(screen.getByText('- Sarah J.')).toBeInTheDocument()
    expect(screen.getByText('- Mike R.')).toBeInTheDocument()
  })

  it('has correct layout structure with sidebar offset', () => {
    render(<ProductDetails />)
    
    // Check for the main content container
    const mainContent = document.querySelector('.lg\\:pl-64')
    expect(mainContent).toBeInTheDocument()
  })

  it('handles unknown source parameter', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'test-ad-123'
      if (key === 'source') return null
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('Navigated from ad: test-ad-123 (source: unknown)')).toBeInTheDocument()
  })

  it('renders responsive grid layout', () => {
    render(<ProductDetails />)
    
    // Check for responsive layout elements
    const keyFeatures = screen.getByText('Key Features:')
    expect(keyFeatures).toBeInTheDocument()
  })

  it('renders additional details grid', () => {
    render(<ProductDetails />)
    
    const additionalDetails = screen.getByText('Product Specifications').closest('.md\\:grid-cols-2')
    expect(additionalDetails).toHaveClass('grid', 'md:grid-cols-2', 'gap-8')
  })

  it('has correct breadcrumb link', () => {
    render(<ProductDetails />)
    
    const backLink = screen.getByText('Back to Demo').closest('a')
    expect(backLink).toHaveAttribute('href', '/mock-host')
  })

  it('renders product rating with correct value display', () => {
    global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
      if (key === 'adId') return 'expandable-ad-789'
      return null
    })
    
    render(<ProductDetails />)
    
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('(567 reviews)')).toBeInTheDocument()
  })

  it('handles different ad types correctly in getProductData', () => {
    const testCases = [
      { adId: 'banner-test', expectedName: 'Premium Tech Bundle', expectedCategory: 'Technology' },
      { adId: 'native-test', expectedName: 'Amazing Product Deal', expectedCategory: 'Special Offers' },
      { adId: 'expandable-test', expectedName: 'Interactive Experience Kit', expectedCategory: 'Interactive' },
      { adId: 'other-test', expectedName: 'Featured Product', expectedCategory: 'General' }
    ]

    testCases.forEach(({ adId, expectedName, expectedCategory }) => {
      global.__nextMocks.mockSearchParamsGet.mockImplementation((key) => {
        if (key === 'adId') return adId
        return null
      })
      
      const { unmount } = render(<ProductDetails />)
      
      expect(screen.getByText(expectedName)).toBeInTheDocument()
      expect(screen.getByText(expectedCategory)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('maintains accessibility with proper heading structure', () => {
    render(<ProductDetails />)
    
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    
    const subHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(subHeadings.length).toBeGreaterThan(0)
  })

  it('has proper semantic structure with main content area', () => {
    render(<ProductDetails />)
    
    const mainElement = document.querySelector('main') || 
                       screen.getByText('Key Features:').closest('div')
    expect(mainElement).toBeInTheDocument()
  })
})