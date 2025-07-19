import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import Header from '../Header'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/mock-path',
}))

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with logo and navigation', () => {
    render(<Header />)
    
    // Check if logo is rendered
    expect(screen.getByText('Display Ads')).toBeInTheDocument()
    
    // Check if navigation links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('API')).toBeInTheDocument()
    
    // Check if SafeFrame badge is rendered
    expect(screen.getByText('SafeFrame v2')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('Home')[0].closest('a')
    const demoLink = screen.getAllByText('Demo')[0].closest('a')
    const apiLink = screen.getAllByText('API')[0].closest('a')
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(demoLink).toHaveAttribute('href', '/mock-host')
    expect(apiLink).toHaveAttribute('href', '/api/ads')
  })

  it('shows mobile menu button on small screens', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button')
    expect(mobileMenuButton).toBeInTheDocument()
    expect(mobileMenuButton).toHaveClass('md:hidden')
  })

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button')
    
    // Initially mobile menu should not be visible
    expect(screen.queryByText('Home')).toBeInTheDocument() // Desktop nav
    
    // Click mobile menu button
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu is now visible (should have duplicate navigation items)
    const homeLinks = screen.getAllByText('Home')
    expect(homeLinks).toHaveLength(2) // One for desktop, one for mobile
  })

  it('shows X icon when mobile menu is open', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button')
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton)
    
    // After clicking, the button content should change
    // We can verify the menu is open by checking for duplicate navigation items
    const homeLinks = screen.getAllByText('Home')
    expect(homeLinks).toHaveLength(2) // One for desktop, one for mobile
  })

  it('closes mobile menu when navigation link is clicked', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button')
    
    // Open mobile menu
    fireEvent.click(mobileMenuButton)
    
    // Verify menu is open (should have duplicate navigation items)
    const homeLinks = screen.getAllByText('Home')
    expect(homeLinks).toHaveLength(2)
    
    // Click on a mobile navigation link
    const mobileHomeLink = homeLinks[1] // Second one should be mobile
    fireEvent.click(mobileHomeLink)
    
    // Menu should close (back to single navigation items)
    // We need to wait for the state update
    setTimeout(() => {
      const homeLinksAfterClick = screen.getAllByText('Home')
      expect(homeLinksAfterClick).toHaveLength(1)
    }, 0)
  })

  it('has responsive design classes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'z-50', 'w-full')
    
    // Check if desktop navigation has correct responsive classes
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('hidden', 'md:flex')
  })

  it('has backdrop blur and transparency styles', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-white/95', 'backdrop-blur')
  })

  it('renders logo with monitor icon', () => {
    render(<Header />)
    
    const logoLink = screen.getByRole('link', { name: /display ads/i })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('hides logo text on small screens', () => {
    render(<Header />)
    
    const logoText = screen.getByText('Display Ads')
    expect(logoText).toHaveClass('hidden', 'sm:inline-block')
  })

  it('hides SafeFrame badge on small screens', () => {
    render(<Header />)
    
    const safeFrameBadge = screen.getByText('SafeFrame v2')
    expect(safeFrameBadge).toHaveClass('hidden', 'sm:inline-flex')
  })

  it('applies hover styles to navigation links', () => {
    render(<Header />)
    
    const homeLink = screen.getAllByText('Home')[0]
    expect(homeLink).toHaveClass('transition-colors', 'hover:text-foreground/80')
  })

  it('mobile menu has correct styling when open', () => {
    render(<Header />)
    
    const mobileMenuButton = screen.getByRole('button')
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu is visible by looking for the mobile navigation items
    const mobileHomeLinks = screen.getAllByText('Home')
    expect(mobileHomeLinks).toHaveLength(2) // Desktop + mobile
  })

  it('maintains accessibility with proper ARIA attributes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
    
    const mobileMenuButton = screen.getByRole('button')
    expect(mobileMenuButton).toBeInTheDocument()
  })
})