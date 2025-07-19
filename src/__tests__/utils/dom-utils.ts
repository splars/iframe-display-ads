/**
 * DOM testing utilities for iframe and postMessage testing
 */

// Create a mock iframe element for testing
export const createMockIframe = (id: string, src: string = '/ad-frame'): HTMLIFrameElement => {
  const iframe = document.createElement('iframe')
  iframe.id = id
  iframe.src = src
  iframe.style.width = '300px'
  iframe.style.height = '250px'
  iframe.style.border = 'none'
  
  // Mock contentWindow
  const mockContentWindow = {
    postMessage: jest.fn(),
    location: { href: src },
    document: {
      body: { offsetWidth: 300, offsetHeight: 250 }
    }
  }
  
  Object.defineProperty(iframe, 'contentWindow', {
    value: mockContentWindow,
    writable: true,
    configurable: true
  })
  
  return iframe
}

// Create a mock element for ad slot container
export const createMockAdSlotElement = (id: string): HTMLElement => {
  const element = document.createElement('div')
  element.id = id
  element.className = 'ad-slot'
  element.style.width = '300px'
  element.style.height = '250px'
  element.style.position = 'relative'
  return element
}

// Simulate iframe load event
export const simulateIframeLoad = (iframe: HTMLIFrameElement): void => {
  const loadEvent = new Event('load')
  iframe.dispatchEvent(loadEvent)
}

// Simulate postMessage event
export const simulatePostMessage = (
  target: Window | HTMLIFrameElement,
  data: any,
  origin: string = 'http://localhost:3000'
): void => {
  const messageEvent = new MessageEvent('message', {
    data,
    origin,
    source: window
  })
  
  if (target instanceof HTMLIFrameElement) {
    window.dispatchEvent(messageEvent)
  } else {
    target.dispatchEvent(messageEvent)
  }
}

// Mock window dimensions for responsive testing
export const mockWindowDimensions = (width: number, height: number): void => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
}

// Mock viewport meta tag for responsive testing
export const mockViewportMeta = (content: string): void => {
  const meta = document.createElement('meta')
  meta.name = 'viewport'
  meta.content = content
  document.head.appendChild(meta)
}

// Clean up DOM elements after tests
export const cleanupDOM = (): void => {
  // Remove all dynamically created elements
  const adSlots = document.querySelectorAll('.ad-slot')
  adSlots.forEach(slot => slot.remove())
  
  const iframes = document.querySelectorAll('iframe')
  iframes.forEach(iframe => iframe.remove())
  
  // Clear body
  document.body.innerHTML = ''
}

// Wait for DOM updates (useful for async operations)
export const waitForDOMUpdate = (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

// Mock scroll behavior for testing visibility
export const mockScrollBehavior = (scrollTop: number = 0, scrollLeft: number = 0): void => {
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: scrollTop
  })
  
  Object.defineProperty(window, 'scrollX', {
    writable: true,
    configurable: true,
    value: scrollLeft
  })
  
  Object.defineProperty(document.documentElement, 'scrollTop', {
    writable: true,
    configurable: true,
    value: scrollTop
  })
  
  Object.defineProperty(document.documentElement, 'scrollLeft', {
    writable: true,
    configurable: true,
    value: scrollLeft
  })
}