import { AdPayload } from '@/types/ad';

export const mockAds: AdPayload[] = [
  {
    id: 'banner-001',
    slot: 'header-leaderboard',
    format: 'banner',
    width: 728,
    height: 90,
    creativeUrl: 'https://placehold.co/728x90/0066CC/FFFFFF?text=Banner+Ad',
    clickUrl: 'https://example.com/banner-click',
    trackingUrls: [
      'https://example.com/impression?id=banner-001',
      'https://example.com/viewable?id=banner-001'
    ]
  },
  {
    id: 'banner-002',
    slot: 'sidebar-rectangle',
    format: 'banner',
    width: 300,
    height: 250,
    creativeUrl: 'https://placehold.co/300x250/FF6600/FFFFFF?text=Sidebar+Banner',
    clickUrl: 'https://example.com/sidebar-click',
    trackingUrls: [
      'https://example.com/impression?id=banner-002'
    ]
  },
  {
    id: 'video-001',
    slot: 'header-leaderboard',
    format: 'video',
    width: 640,
    height: 360,
    creativeUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    clickUrl: 'https://example.com/video-click',
    trackingUrls: [
      'https://example.com/video-impression?id=video-001',
      'https://example.com/video-start?id=video-001'
    ]
  },
  {
    id: 'native-001',
    slot: 'inline-native',
    format: 'native',
    width: 300,
    height: 250,
    creativeUrl: 'https://placehold.co/300x200/009900/FFFFFF?text=Native+Image',
    clickUrl: 'https://example.com/native-click',
    headline: 'Amazing Product Deal',
    body: 'Get 50% off on our premium products. Limited time offer!',
    trackingUrls: [
      'https://example.com/native-impression?id=native-001'
    ]
  },
  {
    id: 'expandable-001',
    slot: 'sidebar-rectangle',
    format: 'expandable',
    width: 300,
    height: 250,
    creativeUrl: 'https://placehold.co/300x250/CC0066/FFFFFF?text=Hover+to+Expand',
    clickUrl: 'https://example.com/expandable-click',
    markup: `
      <div class="bg-purple-600 text-white p-4 rounded-lg">
        <h3 class="text-xl font-bold">Expanded Content</h3>
        <p>This is the expanded view with more details and interactive elements.</p>
        <button class="mt-2 bg-white text-purple-600 px-4 py-2 rounded">Learn More</button>
      </div>
    `,
    trackingUrls: [
      'https://example.com/expandable-impression?id=expandable-001'
    ]
  }
];

export function getAdsBySlot(slot?: string): AdPayload[] {
  if (!slot) return mockAds;
  return mockAds.filter(ad => ad.slot === slot);
}

export function getAdsByFormat(format?: string): AdPayload[] {
  if (!format) return mockAds;
  return mockAds.filter(ad => ad.format === format);
}

export function getAds(slot?: string, format?: string): AdPayload[] {
  let filteredAds = mockAds;
  
  if (slot) {
    filteredAds = filteredAds.filter(ad => ad.slot === slot);
  }
  
  if (format) {
    filteredAds = filteredAds.filter(ad => ad.format === format);
  }
  
  return filteredAds;
}

export function getAdById(id: string): AdPayload | undefined {
  return mockAds.find(ad => ad.id === id);
}

export async function fireTrackingPixel(url: string): Promise<void> {
  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    console.log('Tracking pixel fired:', url);
  } catch (error) {
    console.error('Failed to fire tracking pixel:', url, error);
  }
}