import { AdSlot, SafeFrameMessage } from '@/types/ad';

declare global {
  interface Window {
    $sf?: {
      ext: {
        register: (id: string, callback: (status: string) => void) => void;
        expand: (obj: { push: boolean }) => void;
        collapse: () => void;
        geom: () => any;
        meta: () => any;
      };
    };
  }
}

export class SafeFrameHost {
  private slots: Map<string, AdSlot> = new Map();
  private messageHandlers: Map<string, (message: SafeFrameMessage) => void> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  registerSlot(slot: AdSlot): void {
    this.slots.set(slot.id, slot);
    console.log('SafeFrame slot registered:', slot.id);
  }

  sendToFrame(slotId: string, message: SafeFrameMessage): void {
    const slot = this.slots.get(slotId);
    if (slot?.iframe?.contentWindow) {
      slot.iframe.contentWindow.postMessage(message, '*');
    }
  }

  onMessage(slotId: string, handler: (message: SafeFrameMessage) => void): void {
    this.messageHandlers.set(slotId, handler);
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data && typeof event.data === 'object' && event.data.type) {
      const message = event.data as SafeFrameMessage;
      
      for (const [slotId, handler] of this.messageHandlers.entries()) {
        const slot = this.slots.get(slotId);
        if (slot?.iframe?.contentWindow === event.source) {
          handler(message);
          break;
        }
      }
    }
  }
}

export class SafeFrameGuest {
  private hostOrigin: string;
  private ready = false;

  constructor() {
    this.hostOrigin = typeof document !== 'undefined' && document.referrer ? new URL(document.referrer).origin : '*';
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
      this.initializeSafeFrame();
    }
  }

  private initializeSafeFrame(): void {
    if (typeof window !== 'undefined') {
      window.$sf = {
        ext: {
          register: (id: string, callback: (status: string) => void) => {
            console.log('SafeFrame registered:', id);
            callback('ok');
            this.ready = true;
          },
          expand: (obj: { push: boolean }) => {
            this.sendToHost({ type: 'expand', data: obj });
          },
          collapse: () => {
            this.sendToHost({ type: 'collapse' });
          },
          geom: () => {
            return {
              win: { w: window.innerWidth, h: window.innerHeight },
              self: { w: document.body?.offsetWidth || 0, h: document.body?.offsetHeight || 0 }
            };
          },
          meta: () => {
            return { url: window.location.href };
          }
        }
      };
    }
  }

  sendToHost(message: SafeFrameMessage): void {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(message, this.hostOrigin);
    }
  }

  onMessage(handler: (message: SafeFrameMessage) => void): void {
    this.messageHandler = handler;
  }

  private messageHandler?: (message: SafeFrameMessage) => void;

  private handleMessage(event: MessageEvent): void {
    if (event.data && typeof event.data === 'object' && event.data.type) {
      const message = event.data as SafeFrameMessage;
      if (this.messageHandler) {
        this.messageHandler(message);
      }
    }
  }

  isReady(): boolean {
    return this.ready;
  }
}

export const safeFrameHost = typeof window !== 'undefined' ? new SafeFrameHost() : null;