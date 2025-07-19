import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import Sidebar from '../Sidebar'

// Mock Next.js navigation
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/mock-path')
  })

  it('renders all navigation sections', () => {
    render(<Sidebar />)
    
    // Check if all section headers are rendered
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText('Ad Formats')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('renders Getting Started section items', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('API')).toBeInTheDocument()
  })

  it('renders Examples section items', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Product Page')).toBeInTheDocument()
  })

  it('renders Ad Formats section items', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('Banner Ads')).toBeInTheDocument()
    expect(screen.getByText('Video Ads')).toBeInTheDocument()
    expect(screen.getByText('Native Ads')).toBeInTheDocument()
    expect(screen.getByText('Expandable')).toBeInTheDocument()
  })

  it('renders Features section items', () => {
    render(<Sidebar />)
    
    expect(screen.getByText('SafeFrame')).toBeInTheDocument()
    expect(screen.getByText('Tracking')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />)
    
    const overviewLink = screen.getByText('Overview').closest('a')
    const demoLink = screen.getByText('Demo').closest('a')
    const apiLink = screen.getByText('API').closest('a')
    const productPageLink = screen.getByText('Product Page').closest('a')
    
    expect(overviewLink).toHaveAttribute('href', '/')
    expect(demoLink).toHaveAttribute('href', '/mock-host')
    expect(apiLink).toHaveAttribute('href', '/api/ads')
    expect(productPageLink).toHaveAttribute('href', '/product/demo-product?adId=demo&source=navigation')
  })

  it('highlights active navigation item based on pathname', () => {
    mockPathname.mockReturnValue('/')
    render(<Sidebar />)
    
    const overviewLink = screen.getByText('Overview').closest('a')
    expect(overviewLink).toHaveClass('bg-primary/10', 'text-primary')
  })

  it('applies inactive styles to non-active navigation items', () => {
    mockPathname.mockReturnValue('/')
    render(<Sidebar />)
    
    const demoLink = screen.getByText('Demo').closest('a')
    expect(demoLink).toHaveClass('text-gray-600', 'hover:text-gray-900')
    expect(demoLink).not.toHaveClass('bg-primary/10', 'text-primary')
  })

  it('renders icons for each navigation item', () => {
    render(<Sidebar />)
    
    // Check if icons are rendered by looking for svg elements
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      const svg = link.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  it('applies correct responsive classes', () => {
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').parentElement
    expect(sidebar).toHaveClass('hidden', 'lg:fixed', 'lg:inset-y-0', 'lg:left-0', 'lg:block')
  })

  it('has correct width and positioning', () => {
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').parentElement
    expect(sidebar).toHaveClass('lg:w-64', 'lg:z-40')
  })

  it('has proper scrolling behavior', () => {
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').parentElement
    expect(sidebar).toHaveClass('lg:overflow-y-auto')
  })

  it('applies dark mode classes', () => {
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').parentElement
    expect(sidebar).toHaveClass('dark:lg:bg-gray-900', 'dark:lg:border-gray-800')
  })

  it('has correct padding and spacing', () => {
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('navigation').parentElement
    expect(sidebar).toHaveClass('lg:pt-16', 'lg:pb-4')
  })

  it('renders section headers with correct styling', () => {
    render(<Sidebar />)
    
    const sectionHeaders = screen.getAllByText(/Getting Started|Examples|Ad Formats|Features/)
    sectionHeaders.forEach(header => {
      expect(header).toHaveClass('text-xs', 'font-semibold', 'text-gray-500', 'uppercase')
    })
  })

  it('applies hover effects to navigation links', () => {
    mockPathname.mockReturnValue('/other-path')
    render(<Sidebar />)
    
    const demoLink = screen.getByText('Demo').closest('a')
    expect(demoLink).toHaveClass('hover:bg-gray-50', 'transition-colors')
  })

  it('shows active border for current page', () => {
    mockPathname.mockReturnValue('/mock-host')
    render(<Sidebar />)
    
    const demoLink = screen.getByText('Demo').closest('a')
    expect(demoLink).toHaveClass('border-r-2', 'border-primary')
  })

  it('applies correct icon styling for active items', () => {
    mockPathname.mockReturnValue('/')
    render(<Sidebar />)
    
    const overviewLink = screen.getByText('Overview').closest('a')
    const icon = overviewLink?.querySelector('svg')
    expect(icon).toHaveClass('text-primary')
  })

  it('applies correct icon styling for inactive items', () => {
    mockPathname.mockReturnValue('/')
    render(<Sidebar />)
    
    const demoLink = screen.getByText('Demo').closest('a')
    const icon = demoLink?.querySelector('svg')
    expect(icon).toHaveClass('text-gray-400', 'group-hover:text-gray-500')
  })

  it('maintains proper accessibility', () => {
    render(<Sidebar />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
    
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('handles different pathname scenarios', () => {
    const testPaths = [
      { path: '/', activeText: 'Overview' },
      { path: '/mock-host', activeText: 'Demo' },
      { path: '/api/ads', activeText: 'API' },
      { path: '/docs/banner', activeText: 'Banner Ads' },
      { path: '/docs/video', activeText: 'Video Ads' },
      { path: '/docs/native', activeText: 'Native Ads' },
      { path: '/docs/expandable', activeText: 'Expandable' },
    ]

    testPaths.forEach(({ path, activeText }) => {
      mockPathname.mockReturnValue(path)
      const { unmount } = render(<Sidebar />)
      
      const activeLink = screen.getByText(activeText).closest('a')
      expect(activeLink).toHaveClass('bg-primary/10', 'text-primary')
      
      unmount()
    })
  })
})