'use client';

import { useEffect, useRef, useState } from 'react';
import { AdPayload, SafeFrameMessage } from '@/types/ad';
import { safeFrameHost } from '@/lib/safeframe';

interface AdSlotProps {
  slotId: string;
  slotName: string;
  width: number;
  height: number;
  className?: string;
}

export default function AdSlot({ slotId, slotName, width, height, className }: AdSlotProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adData, setAdData] = useState<AdPayload | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Fetch ad data
  useEffect(() => {
    const fetchAd = async () => {
      try {
        console.log(`Fetching ad for slot: ${slotName}`);
        const response = await fetch(`/api/ads?slot=${slotName}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          const ad = result.data[0];
          console.log(`Ad data received for ${slotName}:`, ad);
          setAdData(ad);
        } else {
          setError('No ads available for this slot');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to load ad');
        setIsLoading(false);
        console.error('Error fetching ad:', err);
      }
    };

    fetchAd();
  }, [slotName]);

  // Listen for iframe messages directly
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (iframe && event.source === iframe.contentWindow) {
        if (event.data?.type === 'frame-ready') {
          console.log(`Received frame-ready message for ${slotId}`);
          setIframeLoaded(true);
        } else if (event.data?.type === 'navigate') {
          console.log(`Received navigate message for ${slotId}:`, event.data);
          handleAdNavigation(event.data.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [slotId]);

  // Handle ad navigation
  const handleAdNavigation = (navigationData: any) => {
    const { adId, clickUrl, productId, source } = navigationData;
    
    console.log(`Navigating from ad ${adId} to product page`);
    
    // Navigate to product page with query parameters
    const productUrl = `/product/${productId}?adId=${adId}&source=${source}&originalUrl=${encodeURIComponent(clickUrl)}`;
    
    // Use window.location to navigate within the same tab
    window.location.href = productUrl;
  };

  // Set up SafeFrame communication when we have both ad data and iframe
  useEffect(() => {
    if (!adData || !iframeLoaded) {
      console.log(`Waiting for prerequisites - adData: ${!!adData}, iframeLoaded: ${iframeLoaded}`);
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe || !safeFrameHost) {
      console.log(`Missing requirements - iframe: ${!!iframe}, safeFrameHost: ${!!safeFrameHost}`);
      return;
    }

    console.log(`Setting up SafeFrame for ${slotId} with ad:`, adData);

    safeFrameHost.registerSlot({
      id: slotId,
      name: slotName,
      width: adData.width,
      height: adData.height,
      iframe
    });

    safeFrameHost.onMessage(slotId, (message: SafeFrameMessage) => {
      console.log(`Message from ${slotId}:`, message);
      
      switch (message.type) {
        case 'creative-ready':
          setIsLoading(false);
          console.log(`Creative ready for ${slotId}`);
          break;
        case 'impression':
          console.log(`Impression logged for ${slotId}`);
          break;
        case 'click':
          console.log(`Click logged for ${slotId}`);
          break;
        case 'navigate':
          console.log(`Navigate message received for ${slotId}:`, message.data);
          if (message.data) {
            handleAdNavigation(message.data);
          }
          break;
        case 'expand':
          console.log(`Expand requested for ${slotId}`, message.data);
          if (iframe && message.data) {
            iframe.style.width = `${message.data.width}px`;
            iframe.style.height = `${message.data.height}px`;
            iframe.style.zIndex = '9999';
            iframe.style.position = 'relative';
          }
          break;
        case 'collapse':
          console.log(`Collapse requested for ${slotId}`);
          if (iframe) {
            iframe.style.width = `${width}px`;
            iframe.style.height = `${height}px`;
            iframe.style.zIndex = 'auto';
            iframe.style.position = 'static';
          }
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    });

    // Send ad payload to iframe
    setTimeout(() => {
      if (iframe.contentWindow && safeFrameHost) {
        console.log(`Sending ad payload to ${slotId}:`, adData);
        safeFrameHost.sendToFrame(slotId, {
          type: 'ad-payload',
          data: adData
        });
      } else {
        console.error(`Failed to send ad payload - contentWindow: ${!!iframe.contentWindow}, safeFrameHost: ${!!safeFrameHost}`);
      }
    }, 500);

  }, [adData, iframeLoaded, slotId, slotName, width, height]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log(`Iframe onLoad event fired for ${slotId}`);
    setIframeLoaded(true);
  };

  // Alternative iframe ready detection using useEffect
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    console.log(`Setting up iframe ready detection for ${slotId}`);

    const checkIframeReady = () => {
      try {
        // Check if iframe document is ready
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.readyState === 'complete') {
          console.log(`Iframe detected as ready via document check for ${slotId}`);
          setIframeLoaded(true);
          return true;
        }
      } catch (e) {
        // Cross-origin security error - iframe is likely ready but we can't access it
        console.log(`Iframe cross-origin detected for ${slotId}, assuming ready`);
        setIframeLoaded(true);
        return true;
      }
      return false;
    };

    // Immediate check
    if (checkIframeReady()) return;

    // Polling fallback
    const pollInterval = setInterval(() => {
      if (checkIframeReady()) {
        clearInterval(pollInterval);
      }
    }, 100);

    // Fallback timeout - assume ready after 2 seconds
    const fallbackTimeout = setTimeout(() => {
      console.log(`Iframe fallback timeout reached for ${slotId}, assuming ready`);
      setIframeLoaded(true);
      clearInterval(pollInterval);
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(fallbackTimeout);
    };
  }, [slotId]);

  const displayWidth = adData?.width || width;
  const displayHeight = adData?.height || height;

  if (error) {
    return (
      <div 
        className={`border-2 border-dashed border-destructive/50 bg-destructive/10 flex items-center justify-center rounded-lg ${className}`}
        style={{ width: displayWidth, height: displayHeight }}
      >
        <div className="text-center text-destructive p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-sm font-semibold">Ad Slot Error</div>
          <div className="text-xs opacity-75">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: displayWidth, height: displayHeight }}>
      {isLoading && (
        <div 
          className="absolute inset-0 border-2 border-dashed border-border bg-muted/50 flex items-center justify-center rounded-lg"
          style={{ width: displayWidth, height: displayHeight }}
        >
          <div className="text-center text-muted-foreground p-4">
            <div className="loading-spinner rounded-full h-8 w-8 border-4 border-border border-t-primary mx-auto mb-3"></div>
            <div className="text-sm font-medium">Loading Ad...</div>
            <div className="text-xs opacity-75 mt-1">{slotName}</div>
            <div className="text-xs opacity-50 mt-2">{displayWidth}×{displayHeight}</div>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src="/ad-frame"
        width={displayWidth}
        height={displayHeight}
        onLoad={handleIframeLoad}
        style={{ 
          border: 'none',
          display: 'block',
          transition: 'all 0.3s ease-in-out',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title={`Ad slot: ${slotName}`}
      />
    </div>
  );
}