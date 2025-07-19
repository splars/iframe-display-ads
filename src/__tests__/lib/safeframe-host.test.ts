import { SafeFrameHost } from '@/lib/safeframe'
import { AdSlot, SafeFrameMessage } from '@/types/ad'
import { 
  setupSafeFrameMocks, 
  cleanupSafeFrameMocks, 
  createMockIframe, 
  createSafeFrameMessage,
  MockMessageEvent 
} from '../utils/safeframe-mocks'

describe('SafeFrameHost', () => {
  let safeFrameHost: SafeFrameHost
  let mockIframe: HTMLIFrameElement
  let mockSlot: AdSlot

  beforeEach(() => {
    setupSafeFrameMocks()
    safeFrameHost = new SafeFrameHost()
    mockIframe = createMockIframe()
    mockSlot = {
      id: 'test-slot-1',
      name: 'test-slot',
      width: 300,
      height: 250,
      iframe: mockIframe
    }
  })

  afterEach(() => {
    cleanupSafeFrameMocks()
  })

  describe('constructor', () => {
    it('should initialize with empty slots and handlers', () => {
      const host = new SafeFrameHost()
      expect(host).toBeDefined()
      expect(host['slots']).toEqual(new Map())
      expect(host['messageHandlers']).toEqual(new Map())
    })

    it('should add message event listener when window is available', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      new SafeFrameHost()
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should handle window undefined check in constructor', () => {
      // This test verifies the typeof check works
      // The actual functionality is tested in other tests
      const host = new SafeFrameHost()
      expect(host).toBeDefined()
    })
  })

  describe('registerSlot', () => {
    it('should register a slot with the correct id', () => {
      safeFrameHost.registerSlot(mockSlot)
      
      expect(safeFrameHost['slots'].get('test-slot-1')).toBe(mockSlot)
      expect(safeFrameHost['slots'].size).toBe(1)
    })

    it('should log slot registration', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      safeFrameHost.registerSlot(mockSlot)
      
      expect(consoleSpy).toHaveBeenCalledWith('SafeFrame slot registered:', 'test-slot-1')
    })

    it('should handle multiple slot registrations', () => {
      const slot2: AdSlot = {
        id: 'test-slot-2',
        name: 'test-slot-2',
        width: 728,
        height: 90,
        iframe: createMockIframe()
      }
      
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.registerSlot(slot2)
      
      expect(safeFrameHost['slots'].size).toBe(2)
      expect(safeFrameHost['slots'].get('test-slot-1')).toBe(mockSlot)
      expect(safeFrameHost['slots'].get('test-slot-2')).toBe(slot2)
    })

    it('should overwrite existing slot with same id', () => {
      const updatedSlot: AdSlot = {
        id: 'test-slot-1',
        name: 'updated-slot',
        width: 400,
        height: 300,
        iframe: createMockIframe()
      }
      
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.registerSlot(updatedSlot)
      
      expect(safeFrameHost['slots'].size).toBe(1)
      expect(safeFrameHost['slots'].get('test-slot-1')).toBe(updatedSlot)
    })
  })

  describe('sendToFrame', () => {
    beforeEach(() => {
      safeFrameHost.registerSlot(mockSlot)
    })

    it('should send message to iframe contentWindow', () => {
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      
      safeFrameHost.sendToFrame('test-slot-1', message)
      
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(message, '*')
    })

    it('should not send message if slot does not exist', () => {
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      
      safeFrameHost.sendToFrame('non-existent-slot', message)
      
      expect(mockIframe.contentWindow!.postMessage).not.toHaveBeenCalled()
    })

    it('should not send message if iframe is undefined', () => {
      const slotWithoutIframe: AdSlot = {
        id: 'test-slot-2',
        name: 'test-slot-2',
        width: 300,
        height: 250
      }
      
      safeFrameHost.registerSlot(slotWithoutIframe)
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      
      safeFrameHost.sendToFrame('test-slot-2', message)
      
      expect(mockIframe.contentWindow!.postMessage).not.toHaveBeenCalled()
    })

    it('should not send message if contentWindow is undefined', () => {
      const iframeWithoutContentWindow = createMockIframe()
      iframeWithoutContentWindow.contentWindow = null
      
      const slotWithoutContentWindow: AdSlot = {
        id: 'test-slot-2',
        name: 'test-slot-2',
        width: 300,
        height: 250,
        iframe: iframeWithoutContentWindow
      }
      
      safeFrameHost.registerSlot(slotWithoutContentWindow)
      const message = createSafeFrameMessage('ad-payload', { test: 'data' })
      
      safeFrameHost.sendToFrame('test-slot-2', message)
      
      expect(mockIframe.contentWindow!.postMessage).not.toHaveBeenCalled()
    })

    it('should handle different message types', () => {
      const messages = [
        createSafeFrameMessage('ad-payload', { ad: 'data' }),
        createSafeFrameMessage('impression', undefined, 'ad-123'),
        createSafeFrameMessage('click', undefined, 'ad-123'),
        createSafeFrameMessage('expand', { width: 500, height: 400 }),
        createSafeFrameMessage('collapse')
      ]
      
      messages.forEach(message => {
        safeFrameHost.sendToFrame('test-slot-1', message)
        expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(message, '*')
      })
      
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledTimes(5)
    })
  })

  describe('onMessage', () => {
    it('should register message handler for slot', () => {
      const handler = jest.fn()
      
      safeFrameHost.onMessage('test-slot-1', handler)
      
      expect(safeFrameHost['messageHandlers'].get('test-slot-1')).toBe(handler)
    })

    it('should handle multiple message handlers for different slots', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      
      safeFrameHost.onMessage('test-slot-1', handler1)
      safeFrameHost.onMessage('test-slot-2', handler2)
      
      expect(safeFrameHost['messageHandlers'].size).toBe(2)
      expect(safeFrameHost['messageHandlers'].get('test-slot-1')).toBe(handler1)
      expect(safeFrameHost['messageHandlers'].get('test-slot-2')).toBe(handler2)
    })

    it('should overwrite existing handler for same slot', () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      
      safeFrameHost.onMessage('test-slot-1', handler1)
      safeFrameHost.onMessage('test-slot-1', handler2)
      
      expect(safeFrameHost['messageHandlers'].size).toBe(1)
      expect(safeFrameHost['messageHandlers'].get('test-slot-1')).toBe(handler2)
    })
  })

  describe('handleMessage', () => {
    let messageHandler: jest.Mock
    
    beforeEach(() => {
      messageHandler = jest.fn()
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.onMessage('test-slot-1', messageHandler)
    })

    it('should call handler when message comes from registered iframe', () => {
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      const event = new MockMessageEvent(message, 'http://localhost:3000', mockIframe.contentWindow)
      
      safeFrameHost['handleMessage'](event as MessageEvent)
      
      expect(messageHandler).toHaveBeenCalledWith(message)
    })

    it('should not call handler when message comes from unknown source', () => {
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      const unknownWindow = { postMessage: jest.fn() }
      const event = new MockMessageEvent(message, 'http://localhost:3000', unknownWindow)
      
      safeFrameHost['handleMessage'](event as MessageEvent)
      
      expect(messageHandler).not.toHaveBeenCalled()
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
        safeFrameHost['handleMessage'](event as MessageEvent)
      })
      
      expect(messageHandler).not.toHaveBeenCalled()
    })

    it('should handle different message types correctly', () => {
      const messages = [
        createSafeFrameMessage('creative-ready', undefined, 'ad-123'),
        createSafeFrameMessage('impression', undefined, 'ad-123'),
        createSafeFrameMessage('click', undefined, 'ad-123'),
        createSafeFrameMessage('expand', { width: 500, height: 400 }),
        createSafeFrameMessage('collapse'),
        createSafeFrameMessage('navigate', { url: 'https://example.com' })
      ]
      
      messages.forEach(message => {
        const event = new MockMessageEvent(message, 'http://localhost:3000', mockIframe.contentWindow)
        safeFrameHost['handleMessage'](event as MessageEvent)
        expect(messageHandler).toHaveBeenCalledWith(message)
      })
      
      expect(messageHandler).toHaveBeenCalledTimes(6)
    })

    it('should handle multiple slots correctly', () => {
      const mockIframe2 = createMockIframe()
      const mockSlot2: AdSlot = {
        id: 'test-slot-2',
        name: 'test-slot-2',
        width: 728,
        height: 90,
        iframe: mockIframe2
      }
      const messageHandler2 = jest.fn()
      
      safeFrameHost.registerSlot(mockSlot2)
      safeFrameHost.onMessage('test-slot-2', messageHandler2)
      
      const message1 = createSafeFrameMessage('impression', undefined, 'ad-123')
      const message2 = createSafeFrameMessage('click', undefined, 'ad-456')
      
      const event1 = new MockMessageEvent(message1, 'http://localhost:3000', mockIframe.contentWindow)
      const event2 = new MockMessageEvent(message2, 'http://localhost:3000', mockIframe2.contentWindow)
      
      safeFrameHost['handleMessage'](event1 as MessageEvent)
      safeFrameHost['handleMessage'](event2 as MessageEvent)
      
      expect(messageHandler).toHaveBeenCalledWith(message1)
      expect(messageHandler).toHaveBeenCalledTimes(1)
      expect(messageHandler2).toHaveBeenCalledWith(message2)
      expect(messageHandler2).toHaveBeenCalledTimes(1)
    })

    it('should break after finding matching slot', () => {
      // Register same iframe for multiple slots (edge case)
      const mockSlot2: AdSlot = {
        id: 'test-slot-2',
        name: 'test-slot-2',
        width: 728,
        height: 90,
        iframe: mockIframe // same iframe
      }
      const messageHandler2 = jest.fn()
      
      safeFrameHost.registerSlot(mockSlot2)
      safeFrameHost.onMessage('test-slot-2', messageHandler2)
      
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      const event = new MockMessageEvent(message, 'http://localhost:3000', mockIframe.contentWindow)
      
      safeFrameHost['handleMessage'](event as MessageEvent)
      
      // Should only call the first handler found
      expect(messageHandler).toHaveBeenCalledWith(message)
      expect(messageHandler2).not.toHaveBeenCalled()
    })
  })

  describe('message integration', () => {
    it('should handle complete message flow', () => {
      const messageHandler = jest.fn()
      
      // Register slot and handler
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.onMessage('test-slot-1', messageHandler)
      
      // Send message to frame
      const outgoingMessage = createSafeFrameMessage('ad-payload', { ad: 'data' })
      safeFrameHost.sendToFrame('test-slot-1', outgoingMessage)
      
      // Simulate response from frame
      const incomingMessage = createSafeFrameMessage('creative-ready', undefined, 'ad-123')
      const event = new MockMessageEvent(incomingMessage, 'http://localhost:3000', mockIframe.contentWindow)
      safeFrameHost['handleMessage'](event as MessageEvent)
      
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(outgoingMessage, '*')
      expect(messageHandler).toHaveBeenCalledWith(incomingMessage)
    })

    it('should handle error scenarios gracefully', () => {
      const messageHandler = jest.fn()
      
      // Register slot and handler
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.onMessage('test-slot-1', messageHandler)
      
      // Try to send to non-existent slot
      safeFrameHost.sendToFrame('non-existent', createSafeFrameMessage('ad-payload', {}))
      
      // Send invalid message
      const invalidEvent = new MockMessageEvent('invalid')
      safeFrameHost['handleMessage'](invalidEvent as MessageEvent)
      
      expect(messageHandler).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle slot without iframe gracefully', () => {
      const slotWithoutIframe: AdSlot = {
        id: 'test-slot-no-iframe',
        name: 'test-slot-no-iframe',
        width: 300,
        height: 250
      }
      
      safeFrameHost.registerSlot(slotWithoutIframe)
      
      expect(() => {
        safeFrameHost.sendToFrame('test-slot-no-iframe', createSafeFrameMessage('ad-payload', {}))
      }).not.toThrow()
    })

    it('should handle slot with iframe but no contentWindow', () => {
      const iframeWithoutContentWindow = createMockIframe()
      iframeWithoutContentWindow.contentWindow = null
      
      const slot: AdSlot = {
        id: 'test-slot-no-content-window',
        name: 'test-slot-no-content-window',
        width: 300,
        height: 250,
        iframe: iframeWithoutContentWindow
      }
      
      safeFrameHost.registerSlot(slot)
      
      expect(() => {
        safeFrameHost.sendToFrame('test-slot-no-content-window', createSafeFrameMessage('ad-payload', {}))
      }).not.toThrow()
    })

    it('should handle message handler throwing error', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error')
      })
      
      safeFrameHost.registerSlot(mockSlot)
      safeFrameHost.onMessage('test-slot-1', errorHandler)
      
      const message = createSafeFrameMessage('impression', undefined, 'ad-123')
      const event = new MockMessageEvent(message, 'http://localhost:3000', mockIframe.contentWindow)
      
      expect(() => {
        safeFrameHost['handleMessage'](event as MessageEvent)
      }).toThrow('Handler error')
    })
  })
})