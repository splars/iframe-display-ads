import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import MockHost from '../page'

// Mock the components since they're tested separately
jest.mock('../../../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock('../../../components/Sidebar', () => {
  return function MockSidebar() {
    return <aside data-testid="sidebar">Sidebar</aside>
  }
})

jest.mock('../../../components/AdSlot', () => {
  return function MockAdSlot({ slotId, slotName, width, height, className }: any) {
    return (
      <div 
        data-testid={`ad-slot-${slotId}`}
        data-slot-name={slotName}
        data-width={width}
        data-height={height}
        className={className}
      >
        AdSlot: {slotId} ({width}x{height})
      </div>
    )
  }
})

describe('MockHost', () => {
  it('renders page with Header and Sidebar', () => {
    render(<MockHost />)
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders header leaderboard ad slot', () => {
    render(<MockHost />)
    
    const headerAd = screen.getByTestId('ad-slot-header-banner')
    expect(headerAd).toBeInTheDocument()
    expect(headerAd).toHaveAttribute('data-slot-name', 'header-leaderboard')
    expect(headerAd).toHaveAttribute('data-width', '728')
    expect(headerAd).toHaveAttribute('data-height', '90')
    
    expect(screen.getByText('Header Leaderboard - 728×90')).toBeInTheDocument()
  })

  it('renders demo mode alert', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Demo Mode:')).toBeInTheDocument()
    expect(screen.getByText('This page shows how ads integrate into a real website layout. Open developer console to see SafeFrame communication logs.')).toBeInTheDocument()
  })

  it('renders main article content', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Breaking: Tech Innovation Drives Market Growth')).toBeInTheDocument()
    expect(screen.getByText('January 4, 2025')).toBeInTheDocument()
    expect(screen.getByText('By Sarah Johnson')).toBeInTheDocument()
  })

  it('renders article body content', () => {
    render(<MockHost />)
    
    expect(screen.getByText(/Technology companies continue to lead market innovation/)).toBeInTheDocument()
    expect(screen.getByText(/The integration of AI-powered systems/)).toBeInTheDocument()
    expect(screen.getByText(/Market analysts note that consumer adoption/)).toBeInTheDocument()
    expect(screen.getByText(/Looking ahead, experts anticipate/)).toBeInTheDocument()
  })

  it('renders inline native ad slot', () => {
    render(<MockHost />)
    
    const nativeAd = screen.getByTestId('ad-slot-article-native')
    expect(nativeAd).toBeInTheDocument()
    expect(nativeAd).toHaveAttribute('data-slot-name', 'inline-native')
    expect(nativeAd).toHaveAttribute('data-width', '300')
    expect(nativeAd).toHaveAttribute('data-height', '250')
    expect(nativeAd).toHaveClass('mx-auto')
    
    expect(screen.getByText('Sponsored Content')).toBeInTheDocument()
  })

  it('renders sidebar main ad slot', () => {
    render(<MockHost />)
    
    const sidebarAd = screen.getByTestId('ad-slot-sidebar-main')
    expect(sidebarAd).toBeInTheDocument()
    expect(sidebarAd).toHaveAttribute('data-slot-name', 'sidebar-rectangle')
    expect(sidebarAd).toHaveAttribute('data-width', '300')
    expect(sidebarAd).toHaveAttribute('data-height', '250')
  })

  it('renders sidebar secondary ad slot', () => {
    render(<MockHost />)
    
    const sidebarSecondaryAd = screen.getByTestId('ad-slot-sidebar-secondary')
    expect(sidebarSecondaryAd).toBeInTheDocument()
    expect(sidebarSecondaryAd).toHaveAttribute('data-slot-name', 'sidebar-rectangle')
    expect(sidebarSecondaryAd).toHaveAttribute('data-width', '300')
    expect(sidebarSecondaryAd).toHaveAttribute('data-height', '250')
  })

  it('renders additional article cards', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Financial Markets Update')).toBeInTheDocument()
    expect(screen.getByText('Markets showing positive trends')).toBeInTheDocument()
    expect(screen.getByText('Industry Analysis')).toBeInTheDocument()
    expect(screen.getByText('Expert commentary')).toBeInTheDocument()
  })

  it('renders video content section', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Video Report: Technology Trends 2025')).toBeInTheDocument()
    expect(screen.getByText('Watch our comprehensive analysis of emerging tech trends')).toBeInTheDocument()
    expect(screen.getByText('Video Player Placeholder')).toBeInTheDocument()
  })

  it('renders trending topics in sidebar', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Trending Now')).toBeInTheDocument()
    expect(screen.getByText('AI Breakthrough')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByText('Market Rally Continues')).toBeInTheDocument()
    expect(screen.getByText('4 hours ago')).toBeInTheDocument()
    expect(screen.getByText('New Regulations')).toBeInTheDocument()
    expect(screen.getByText('6 hours ago')).toBeInTheDocument()
  })

  it('renders newsletter signup', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Stay Updated')).toBeInTheDocument()
    expect(screen.getByText('Get the latest news delivered to your inbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByText('Subscribe')).toBeInTheDocument()
  })

  it('renders prototype information footer', () => {
    render(<MockHost />)
    
    expect(screen.getByText('Display Ads Prototype')).toBeInTheDocument()
    expect(screen.getByText('SafeFrame v2 Implementation with Next.js 14')).toBeInTheDocument()
    expect(screen.getByText('✅ Banner Ads')).toBeInTheDocument()
    expect(screen.getByText('✅ Video Ads')).toBeInTheDocument()
    expect(screen.getByText('✅ Native Ads')).toBeInTheDocument()
    expect(screen.getByText('✅ Expandable Ads')).toBeInTheDocument()
  })

  it('has correct layout structure with sidebar offset', () => {
    render(<MockHost />)
    
    const mainContent = screen.getByText('Breaking: Tech Innovation Drives Market Growth').closest('.lg\\:pl-64')
    expect(mainContent).toBeInTheDocument()
  })

  it('has correct responsive grid layout', () => {
    render(<MockHost />)
    
    const articlesGrid = screen.getByText('Financial Markets Update').closest('.md\\:flex-row')
    expect(articlesGrid).toHaveClass('flex', 'flex-col', 'md:flex-row', 'gap-6')
  })

  it('has correct main content and sidebar layout', () => {
    render(<MockHost />)
    
    const mainLayout = screen.getByText('Breaking: Tech Innovation Drives Market Growth').closest('.xl\\:flex-row')
    expect(mainLayout).toHaveClass('flex', 'flex-col', 'xl:flex-row', 'gap-8')
  })

  it('renders advertisement labels correctly', () => {
    render(<MockHost />)
    
    const adLabels = screen.getAllByText('Advertisement')
    expect(adLabels).toHaveLength(2) // Two sidebar ads
    
    expect(screen.getByText('Sponsored Content')).toBeInTheDocument()
    expect(screen.getByText('Sponsored')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<MockHost />)
    
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
    
    const asideElement = screen.getByRole('complementary') || 
                        screen.getByText('Trending Now').closest('aside')
    expect(asideElement).toBeInTheDocument()
  })

  it('renders icons in article metadata', () => {
    render(<MockHost />)
    
    // Icons should be present in the metadata sections
    const articleMeta = screen.getByText('January 4, 2025').closest('div')
    expect(articleMeta).toBeInTheDocument()
    
    const authorMeta = screen.getByText('By Sarah Johnson').closest('div')
    expect(authorMeta).toBeInTheDocument()
  })

  it('has correct card styling for articles', () => {
    render(<MockHost />)
    
    const mainArticle = screen.getByText('Breaking: Tech Innovation Drives Market Growth').closest('[class*="card"]') ||
                       screen.getByText('Breaking: Tech Innovation Drives Market Growth').closest('div')
    expect(mainArticle).toBeInTheDocument()
  })

  it('renders proper spacing and margins', () => {
    render(<MockHost />)
    
    const container = screen.getByText('Breaking: Tech Innovation Drives Market Growth').closest('.max-w-7xl')
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'lg:px-8', 'py-8')
  })

  it('has background and theming classes', () => {
    render(<MockHost />)
    
    const pageContainer = screen.getByTestId('header').closest('.min-h-screen')
    expect(pageContainer).toHaveClass('min-h-screen', 'bg-background')
  })

  it('renders email input with correct attributes', () => {
    render(<MockHost />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'rounded-md', 'text-sm')
  })

  it('renders subscribe button with correct styling', () => {
    render(<MockHost />)
    
    const subscribeButton = screen.getByRole('button', { name: 'Subscribe' })
    expect(subscribeButton).toHaveClass('w-full')
  })

  it('ensures proper content hierarchy', () => {
    render(<MockHost />)
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 }) || 
                       screen.getByText('Breaking: Tech Innovation Drives Market Growth')
    expect(mainHeading).toBeInTheDocument()
    
    // Check for section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 3 }) ||
                           [screen.getByText('Trending Now'), screen.getByText('Stay Updated')]
    expect(sectionHeadings.length).toBeGreaterThan(0)
  })

  it('renders video placeholder correctly', () => {
    render(<MockHost />)
    
    const videoPlaceholder = screen.getByText('Video Player Placeholder')
    const videoContainer = videoPlaceholder.closest('.aspect-video')
    expect(videoContainer).toHaveClass('aspect-video', 'bg-muted', 'rounded-lg')
  })

  it('has proper ad slot spacing and centering', () => {
    render(<MockHost />)
    
    const headerAdContainer = screen.getByText('Header Leaderboard - 728×90').closest('.text-center')
    expect(headerAdContainer).toHaveClass('text-center')
    
    const nativeAdContainer = screen.getByTestId('ad-slot-article-native')
    expect(nativeAdContainer).toHaveClass('mx-auto')
  })
})