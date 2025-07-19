import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AdPayload } from './types/ad'

// Mock ad payload for testing
export const mockAdPayload: AdPayload = {
  id: 'test-ad-1',
  slot: 'test-slot',
  format: 'banner',
  width: 300,
  height: 250,
  creativeUrl: 'https://via.placeholder.com/300x250',
  clickUrl: 'https://example.com/click',
  headline: 'Test Headline',
  body: 'Test description for ad',
  trackingUrls: ['https://example.com/impression', 'https://example.com/click']
}

// Mock video ad payload
export const mockVideoAdPayload: AdPayload = {
  ...mockAdPayload,
  format: 'video',
  width: 640,
  height: 480,
  creativeUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
}

// Mock native ad payload
export const mockNativeAdPayload: AdPayload = {
  ...mockAdPayload,
  format: 'native',
  width: 400,
  height: 300,
  creativeUrl: 'https://via.placeholder.com/400x300',
  headline: 'Amazing Product Review',
  body: 'This product will change your life. Read our comprehensive review.'
}

// Mock expandable ad payload
export const mockExpandableAdPayload: AdPayload = {
  ...mockAdPayload,
  format: 'expandable',
  width: 300,
  height: 250,
  creativeUrl: 'https://via.placeholder.com/300x250'
}

// Mock SafeFrame object
export const mockSafeFrame = {
  ext: {
    expand: jest.fn(),
    collapse: jest.fn(),
    register: jest.fn(),
    meta: jest.fn(),
    cookie: jest.fn(),
    geom: jest.fn(),
    inViewPercentage: jest.fn()
  }
}

// Custom render function with common providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

// Mock window postMessage
export const mockPostMessage = jest.fn()

// Mock SafeFrame Host
export const mockSafeFrameHost = {
  registerAdSlot: jest.fn(),
  sendAdPayload: jest.fn(),
  handleMessage: jest.fn(),
  resizeIframe: jest.fn()
}

// Mock SafeFrame Guest
export const mockSafeFrameGuest = {
  ready: jest.fn(),
  fireImpression: jest.fn(),
  fireClick: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
  sendMessage: jest.fn()
}

// Helper to mock window.postMessage
export const setupPostMessageMock = () => {
  const originalPostMessage = window.postMessage
  window.postMessage = mockPostMessage
  return () => {
    window.postMessage = originalPostMessage
  }
}

// Helper to mock parent.postMessage
export const setupParentPostMessageMock = () => {
  const originalPostMessage = window.parent.postMessage
  window.parent.postMessage = mockPostMessage
  return () => {
    window.parent.postMessage = originalPostMessage
  }
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to create mock event
export const createMockEvent = (type: string, data?: any) => ({
  data: {
    type,
    ...data
  },
  origin: 'https://example.com',
  source: window
})

export * from '@testing-library/react'
export { customRender as render }