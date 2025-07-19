import { AdPayload } from '@/types/ad'
import { createMockAdPayload, mockAdsByFormat } from './mock-data'

// Mock Next.js API routes
export const mockApiRoutes = {
  '/api/ads': {
    GET: (searchParams: URLSearchParams) => {
      const slot = searchParams.get('slot')
      const type = searchParams.get('type') as AdPayload['format']
      
      let ads: AdPayload[] = []
      
      if (type && mockAdsByFormat[type]) {
        ads = mockAdsByFormat[type]
      } else {
        ads = [createMockAdPayload()]
      }
      
      if (slot) {
        ads = ads.map(ad => ({ ...ad, slot }))
      }
      
      return {
        ok: true,
        status: 200,
        json: async () => ({ ads })
      }
    }
  }
}

// Mock fetch for API routes
export const mockFetchApi = (url: string, options?: RequestInit) => {
  const urlObj = new URL(url, 'http://localhost:3000')
  const method = options?.method || 'GET'
  const routePath = urlObj.pathname
  
  if (mockApiRoutes[routePath as keyof typeof mockApiRoutes]) {
    const routeHandler = mockApiRoutes[routePath as keyof typeof mockApiRoutes]
    if (routeHandler[method as keyof typeof routeHandler]) {
      return Promise.resolve(
        routeHandler[method as keyof typeof routeHandler](urlObj.searchParams)
      )
    }
  }
  
  // Default 404 response
  return Promise.resolve({
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  })
}

// Mock tracking pixel requests
export const mockTrackingFetch = (url: string) => {
  // Simulate successful tracking pixel request
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK'
  })
}

// Setup global fetch mock
export const setupFetchMocks = () => {
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    // Check if it's a tracking URL
    if (url.includes('tracking') || url.includes('impression') || url.includes('click')) {
      return mockTrackingFetch(url)
    }
    
    // Check if it's an API route
    if (url.startsWith('/api/') || url.includes('/api/')) {
      return mockFetchApi(url, options)
    }
    
    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => ''
    })
  })
}

// Reset fetch mocks
export const resetFetchMocks = () => {
  jest.clearAllMocks()
}

// Helper to assert tracking calls
export const expectTrackingCall = (url: string, times: number = 1) => {
  expect(global.fetch).toHaveBeenCalledWith(
    url,
    expect.objectContaining({
      method: 'GET',
      mode: 'no-cors'
    })
  )
  expect(global.fetch).toHaveBeenCalledTimes(times)
}

// Helper to assert API calls
export const expectApiCall = (endpoint: string, params?: Record<string, string>) => {
  let expectedUrl = endpoint
  if (params) {
    const searchParams = new URLSearchParams(params)
    expectedUrl = `${endpoint}?${searchParams.toString()}`
  }
  
  expect(global.fetch).toHaveBeenCalledWith(
    expectedUrl,
    expect.objectContaining({
      method: 'GET'
    })
  )
}