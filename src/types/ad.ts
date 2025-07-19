export interface AdPayload {
  id: string;
  slot: string;
  format: 'banner' | 'video' | 'native' | 'expandable';
  width: number;
  height: number;
  creativeUrl?: string;
  markup?: string;
  clickUrl: string;
  headline?: string;
  body?: string;
  trackingUrls: string[];
}

export interface SafeFrameMessage {
  type: 'ad-payload' | 'creative-ready' | 'impression' | 'click' | 'expand' | 'collapse' | 'frame-ready' | 'navigate';
  data?: any;
  adId?: string;
}

export interface AdSlot {
  id: string;
  name: string;
  width: number;
  height: number;
  element?: HTMLElement;
  iframe?: HTMLIFrameElement;
}