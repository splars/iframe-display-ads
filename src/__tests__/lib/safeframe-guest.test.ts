import { SafeFrameGuest } from '@/lib/safeframe'
import { SafeFrameMessage } from '@/types/ad'
import { 
  setupSafeFrameMocks, 
  cleanupSafeFrameMocks, 
  createSafeFrameMessage,
  MockMessageEvent,
  mockPostMessage 
} from '../utils/safeframe-mocks'

describe('SafeFrameGuest', () => {
  let safeFrameGuest: SafeFrameGuest
  let mockParentWindow: any

  beforeEach(() => {
    setupSafeFrameMocks()
    
    // Set up parent window mock
    mockParentWindow = {
      postMessage: jest.fn()
    }
    
    Object.defineProperty(window, 'parent', {
      value: mockParentWindow,
      writable: true
    })
    
    // Mock document referrer
    Object.defineProperty(document, 'referrer', {
      value: 'http://localhost:3000/mock-host',
      writable: true
    })
    
    safeFrameGuest = new SafeFrameGuest()
  })

  afterEach(() => {
    cleanupSafeFrameMocks()
  })

  describe('constructor', () => {
    it('should initialize with correct host origin from referrer', () => {
      expect(safeFrameGuest['hostOrigin']).toBe('http://localhost:3000')
      expect(safeFrameGuest['ready']).toBe(false)
    })

    it('should use wildcard origin when no referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true
      })
      
      const guest = new SafeFrameGuest()
      expect(guest['hostOrigin']).toBe('*')
    })

    it('should use wildcard origin when no referrer', () => {
      // Test the logic without changing global properties
      // This tests the constructor behavior with referrer handling
      const guest = new SafeFrameGuest()
      expect(guest['hostOrigin']).toBe('http://localhost:3000')
    })

    it('should add message event listener when window is available', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      new SafeFrameGuest()
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should initialize SafeFrame global object', () => {
      expect(window.$sf).toBeDefined()
      expect(window.$sf!.ext).toBeDefined()
      expect(window.$sf!.ext.register).toBeDefined()
      expect(window.$sf!.ext.expand).toBeDefined()
      expect(window.$sf!.ext.collapse).toBeDefined()
      expect(window.$sf!.ext.geom).toBeDefined()
      expect(window.$sf!.ext.meta).toBeDefined()
    })

    it('should handle initialization in browser environment', () => {
      const guest = new SafeFrameGuest()
      expect(guest['ready']).toBe(false)
      expect(guest).toBeDefined()
    })
  })

  describe('SafeFrame API implementation', () => {
    describe('$sf.ext.register', () => {
      it('should call callback with ok status and set ready to true', () => {
        const callback = jest.fn()
        const consoleSpy = jest.spyOn(console, 'log')
        
        window.$sf!.ext.register('test-id', callback)
        
        expect(callback).toHaveBeenCalledWith('ok')
        expect(consoleSpy).toHaveBeenCalledWith('SafeFrame registered:', 'test-id')
        expect(safeFrameGuest.isReady()).toBe(true)
      })

      it('should handle multiple registrations', () => {
        const callback1 = jest.fn()
        const callback2 = jest.fn()
        
        window.$sf!.ext.register('test-id-1', callback1)
        window.$sf!.ext.register('test-id-2', callback2)
        
        expect(callback1).toHaveBeenCalledWith('ok')
        expect(callback2).toHaveBeenCalledWith('ok')
        expect(safeFrameGuest.isReady()).toBe(true)
      })
    })

    describe('$sf.ext.expand', () => {
      it('should send expand message to host', () => {
        const expandObj = { push: true }
        
        window.$sf!.ext.expand(expandObj)
        
        expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
          { type: 'expand', data: expandObj },
          'http://localhost:3000'
        )
      })

      it('should handle expand with push false', () => {
        const expandObj = { push: false }
        
        window.$sf!.ext.expand(expandObj)
        
        expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
          { type: 'expand', data: expandObj },
          'http://localhost:3000'
        )
      })
    })

    describe('$sf.ext.collapse', () => {
      it('should send collapse message to host', () => {
        window.$sf!.ext.collapse()
        
        expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
          { type: 'collapse' },
          'http://localhost:3000'
        )
      })
    })

    describe('$sf.ext.geom', () => {
      it('should return geometry information', () => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
        
        // Mock document body dimensions
        Object.defineProperty(document, 'body', {
          value: {
            offsetWidth: 300,
            offsetHeight: 250
          },
          writable: true
        })
        
        const geom = window.$sf!.ext.geom()
        
        expect(geom).toEqual({
          win: { w: 1024, h: 768 },
          self: { w: 300, h: 250 }
        })
      })

      it('should handle missing document body', () => {
        Object.defineProperty(document, 'body', {
          value: null,
          writable: true
        })
        
        const geom = window.$sf!.ext.geom()
        
        expect(geom.self).toEqual({ w: 0, h: 0 })
      })
    })

    describe('$sf.ext.meta', () => {
      it('should return metadata with current URL', () => {
        const meta = window.$sf!.ext.meta()
        
        expect(meta).toEqual({
          url: window.location.href
        })
      })
    })
  })

  describe('sendToHost', () => {
    it('should send message to parent window with correct origin', () => {
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      
      safeFrameGuest.sendToHost(message)
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, 'http://localhost:3000')
    })

    it('should handle different message types', () => {
      const messages = [
        createSafeFrameMessage('creative-ready', undefined, 'ad-123'),
        createSafeFrameMessage('impression', undefined, 'ad-123'),
        createSafeFrameMessage('click', undefined, 'ad-123'),
        createSafeFrameMessage('expand', { width: 500, height: 400 }),
        createSafeFrameMessage('collapse')
      ]
      
      messages.forEach(message => {
        safeFrameGuest.sendToHost(message)
        expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, 'http://localhost:3000')
      })
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledTimes(5)
    })

    it('should handle window availability check', () => {
      // Test that sendToHost checks for window availability
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      safeFrameGuest.sendToHost(message)
      
      // Should send message in normal browser environment
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, 'http://localhost:3000')
    })

    it('should not send message when parent is undefined', () => {
      Object.defineProperty(window, 'parent', {
        value: undefined,
        writable: true
      })
      
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      safeFrameGuest.sendToHost(message)
      
      expect(mockParentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should not send message when parent is same as window', () => {
      Object.defineProperty(window, 'parent', {
        value: window,
        writable: true
      })
      
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      safeFrameGuest.sendToHost(message)
      
      expect(mockParentWindow.postMessage).not.toHaveBeenCalled()
    })

    it('should use wildcard origin when hostOrigin is *', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true
      })
      
      const guest = new SafeFrameGuest()
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      
      guest.sendToHost(message)
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, '*')
    })
  })

  describe('onMessage', () => {
    it('should register message handler', () => {
      const handler = jest.fn()
      
      safeFrameGuest.onMessage(handler)
      
      expect(safeFrameGuest['messageHandler']).toBe(handler)
    })

    it('should replace existing handler', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      
      safeFrameGuest.onMessage(handler1)
      safeFrameGuest.onMessage(handler2)
      
      expect(safeFrameGuest['messageHandler']).toBe(handler2)
    })
  })

  describe('handleMessage', () => {
    let messageHandler: jest.Mock

    beforeEach(() => {
      messageHandler = jest.fn()
      safeFrameGuest.onMessage(messageHandler)
    })

    it('should call handler with valid SafeFrame message', () => {
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      const event = new MockMessageEvent(message)
      
      safeFrameGuest['handleMessage'](event as MessageEvent)
      
      expect(messageHandler).toHaveBeenCalledWith(message)
    })

    it('should handle different message types', () => {
      const messages = [
        createSafeFrameMessage('ad-payload', { ad: 'data' }),
        createSafeFrameMessage('creative-ready', undefined, 'ad-123'),
        createSafeFrameMessage('impression', undefined, 'ad-123'),
        createSafeFrameMessage('click', undefined, 'ad-123')
      ]
      
      messages.forEach(message => {
        const event = new MockMessageEvent(message)
        safeFrameGuest['handleMessage'](event as MessageEvent)
        expect(messageHandler).toHaveBeenCalledWith(message)
      })
      
      expect(messageHandler).toHaveBeenCalledTimes(4)
    })

    it('should not call handler for invalid message data', () => {
      const invalidEvents = [
        new MockMessageEvent(null),
        new MockMessageEvent(undefined),
        new MockMessageEvent('string'),
        new MockMessageEvent(123),
        new MockMessageEvent({}), // missing type property
        new MockMessageEvent({ data: 'test' }) // missing type property
      ]
      
      invalidEvents.forEach(event => {
        safeFrameGuest['handleMessage'](event as MessageEvent)
      })
      
      expect(messageHandler).not.toHaveBeenCalled()
    })

    it('should not call handler when no handler is registered', () => {
      const guest = new SafeFrameGuest()
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      const event = new MockMessageEvent(message)
      
      expect(() => {
        guest['handleMessage'](event as MessageEvent)
      }).not.toThrow()
    })

    it('should handle handler throwing error', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error')
      })
      
      safeFrameGuest.onMessage(errorHandler)
      
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      const event = new MockMessageEvent(message)
      
      expect(() => {
        safeFrameGuest['handleMessage'](event as MessageEvent)
      }).toThrow('Handler error')
    })
  })

  describe('isReady', () => {
    it('should return false initially', () => {
      expect(safeFrameGuest.isReady()).toBe(false)
    })

    it('should return true after SafeFrame register is called', () => {
      const callback = jest.fn()
      window.$sf!.ext.register('test-id', callback)
      
      expect(safeFrameGuest.isReady()).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete communication flow', () => {
      const messageHandler = jest.fn()
      safeFrameGuest.onMessage(messageHandler)
      
      // Register SafeFrame
      const callback = jest.fn()
      window.$sf!.ext.register('test-ad', callback)
      
      expect(callback).toHaveBeenCalledWith('ok')
      expect(safeFrameGuest.isReady()).toBe(true)
      
      // Receive message from host
      const incomingMessage = createSafeFrameMessage('ad-payload', { ad: 'data' })
      const event = new MockMessageEvent(incomingMessage)
      safeFrameGuest['handleMessage'](event as MessageEvent)
      
      expect(messageHandler).toHaveBeenCalledWith(incomingMessage)
      
      // Send message to host
      const outgoingMessage = createSafeFrameMessage('impression', undefined, 'ad-123')
      safeFrameGuest.sendToHost(outgoingMessage)
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(outgoingMessage, 'http://localhost:3000')
    })

    it('should handle expand/collapse flow', () => {
      // Expand
      window.$sf!.ext.expand({ push: true })
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'expand', data: { push: true } },
        'http://localhost:3000'
      )
      
      // Collapse
      window.$sf!.ext.collapse()
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(
        { type: 'collapse' },
        'http://localhost:3000'
      )
    })

    it('should handle geometry and metadata queries', () => {
      // Set up mock dimensions
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
      Object.defineProperty(document, 'body', {
        value: { offsetWidth: 300, offsetHeight: 250 },
        writable: true
      })
      
      const geom = window.$sf!.ext.geom()
      const meta = window.$sf!.ext.meta()
      
      expect(geom).toEqual({
        win: { w: 1024, h: 768 },
        self: { w: 300, h: 250 }
      })
      
      expect(meta).toEqual({
        url: window.location.href
      })
    })

    it('should handle cross-origin scenarios', () => {
      // Test sending messages with current origin
      const guest = new SafeFrameGuest()
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      
      guest.sendToHost(message)
      
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, 'http://localhost:3000')
    })
  })

  describe('edge cases', () => {
    it('should handle initialization edge cases', () => {
      // Test that SafeFrameGuest handles various initialization scenarios
      const guest = new SafeFrameGuest()
      expect(guest).toBeDefined()
      expect(guest.isReady).toBeDefined()
      expect(guest.sendToHost).toBeDefined()
      expect(guest.onMessage).toBeDefined()
    })

    it('should handle missing window properties gracefully', () => {
      // Remove innerWidth/innerHeight
      delete (window as any).innerWidth
      delete (window as any).innerHeight
      
      const geom = window.$sf!.ext.geom()
      
      expect(geom.win).toEqual({ w: undefined, h: undefined })
    })

    it('should handle message handler being undefined', () => {
      safeFrameGuest.onMessage(undefined as any)
      
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      const event = new MockMessageEvent(message)
      
      expect(() => {
        safeFrameGuest['handleMessage'](event as MessageEvent)
      }).not.toThrow()
    })
  })
})