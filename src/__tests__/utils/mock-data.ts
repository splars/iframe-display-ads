import { AdPayload, AdSlot, SafeFrameMessage } from '@/types/ad'

// Mock ad payload generators
export const createMockAdPayload = (overrides: Partial<AdPayload> = {}): AdPayload => ({
  id: 'test-ad-1',
  slot: 'header-banner',
  format: 'banner',
  width: 300,
  height: 250,
  creativeUrl: 'https://placehold.co/300x250/0066cc/ffffff?text=Test+Ad',
  clickUrl: 'https://example.com/click',
  trackingUrls: ['https://example.com/impression'],
  ...overrides
})

export const createMockVideoAdPayload = (overrides: Partial<AdPayload> = {}): AdPayload => ({
  id: 'test-video-ad-1',
  slot: 'video-player',
  format: 'video',
  width: 640,
  height: 360,
  creativeUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  clickUrl: 'https://example.com/video-click',
  trackingUrls: ['https://example.com/video-impression'],
  ...overrides
})

export const createMockNativeAdPayload = (overrides: Partial<AdPayload> = {}): AdPayload => ({
  id: 'test-native-ad-1',
  slot: 'native-content',
  format: 'native',
  width: 320,
  height: 200,
  headline: 'Test Native Ad Headline',
  body: 'This is a test native ad body content that describes the promoted content.',
  creativeUrl: 'https://placehold.co/320x200/0066cc/ffffff?text=Native+Ad',
  clickUrl: 'https://example.com/native-click',
  trackingUrls: ['https://example.com/native-impression'],
  ...overrides
})

export const createMockExpandableAdPayload = (overrides: Partial<AdPayload> = {}): AdPayload => ({
  id: 'test-expandable-ad-1',
  slot: 'expandable-banner',
  format: 'expandable',
  width: 300,
  height: 250,
  creativeUrl: 'https://placehold.co/300x250/0066cc/ffffff?text=Expandable+Ad',
  clickUrl: 'https://example.com/expandable-click',
  trackingUrls: ['https://example.com/expandable-impression'],
  ...overrides
})

// Mock ad slot generators
export const createMockAdSlot = (overrides: Partial<AdSlot> = {}): AdSlot => ({
  id: 'test-slot-1',
  name: 'header-banner',
  width: 300,
  height: 250,
  ...overrides
})

// Mock SafeFrame message generators
export const createMockSafeFrameMessage = (
  type: SafeFrameMessage['type'],
  data?: any,
  adId?: string
): SafeFrameMessage => ({
  type,
  data,
  adId
})

// Mock API response for ads endpoint
export const createMockAdsApiResponse = (ads: AdPayload[] = []) => ({
  ok: true,
  json: async () => ({ ads }),
  status: 200,
  statusText: 'OK'
})

// Mock fetch responses
export const mockFetch = {
  ads: (ads: AdPayload[] = [createMockAdPayload()]) => {
    return Promise.resolve({
      ok: true,
      json: async () => ({ ads }),
      status: 200,
      statusText: 'OK'
    } as Response)
  },
  tracking: () => {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK'
    } as Response)
  }
}

// Test data collections
export const mockAdsByFormat = {
  banner: [
    createMockAdPayload({ format: 'banner' }),
    createMockAdPayload({ 
      id: 'banner-2', 
      format: 'banner',
      width: 728,
      height: 90,
      creativeUrl: 'https://placehold.co/728x90/0066cc/ffffff?text=Banner+Ad'
    })
  ],
  video: [
    createMockVideoAdPayload(),
    createMockVideoAdPayload({ 
      id: 'video-2',
      width: 320,
      height: 240
    })
  ],
  native: [
    createMockNativeAdPayload(),
    createMockNativeAdPayload({
      id: 'native-2',
      headline: 'Another Native Ad',
      body: 'Different native ad content for testing purposes.'
    })
  ],
  expandable: [
    createMockExpandableAdPayload(),
    createMockExpandableAdPayload({
      id: 'expandable-2',
      width: 160,
      height: 600
    })
  ]
}

// Mock slots by position
export const mockSlotsByPosition = {
  header: createMockAdSlot({ name: 'header-banner', width: 728, height: 90 }),
  sidebar: createMockAdSlot({ name: 'sidebar-banner', width: 160, height: 600 }),
  footer: createMockAdSlot({ name: 'footer-banner', width: 320, height: 50 }),
  content: createMockAdSlot({ name: 'content-native', width: 320, height: 200 })
}