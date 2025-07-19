'use client';

import { useEffect, useState } from 'react';
import { AdPayload, SafeFrameMessage } from '@/types/ad';
import { SafeFrameGuest } from '@/lib/safeframe';
import BannerTemplate from '@/templates/BannerTemplate';
import VideoTemplate from '@/templates/VideoTemplate';
import NativeCardTemplate from '@/templates/NativeCardTemplate';
import ExpandableTemplate from '@/templates/ExpandableTemplate';

export default function AdFrame() {
  const [ad, setAd] = useState<AdPayload | null>(null);
  const [safeFrame, setSafeFrame] = useState<SafeFrameGuest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Ad frame initializing...');
    const sf = new SafeFrameGuest();
    setSafeFrame(sf);

    sf.onMessage((message: SafeFrameMessage) => {
      console.log('Received message in ad frame:', message);
      
      if (message.type === 'ad-payload' && message.data) {
        console.log('Setting ad data:', message.data);
        setAd(message.data);
        setError(null);
      }
    });

    const handleResize = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'resize',
          data: {
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
          }
        }, '*');
      }
    };

    window.addEventListener('resize', handleResize);

    // Initialize SafeFrame register immediately
    if (window.$sf?.ext?.register) {
      window.$sf.ext.register('ad-frame', (status) => {
        console.log('SafeFrame registration status:', status);
      });
    }

    setTimeout(() => {
      console.log('SafeFrame ready check:', sf.isReady());
      if (window.parent && window.parent !== window) {
        console.log('Sending frame-ready message');
        window.parent.postMessage({
          type: 'frame-ready'
        }, '*');
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (ad && safeFrame) {
      safeFrame.sendToHost({
        type: 'creative-ready',
        adId: ad.id
      });
    }
  }, [ad, safeFrame]);

  const handleImpression = () => {
    if (ad && safeFrame) {
      console.log('Impression fired for ad:', ad.id);
      safeFrame.sendToHost({
        type: 'impression',
        adId: ad.id
      });
    }
  };

  const handleClick = () => {
    if (ad && safeFrame) {
      console.log('Click fired for ad:', ad.id);
      safeFrame.sendToHost({
        type: 'click',
        adId: ad.id
      });
    }
  };

  const renderCreative = () => {
    if (!ad) return null;

    const props = {
      ad,
      onImpression: handleImpression,
      onClick: handleClick
    };

    switch (ad.format) {
      case 'banner':
        return <BannerTemplate {...props} />;
      case 'video':
        return <VideoTemplate {...props} />;
      case 'native':
        return <NativeCardTemplate {...props} />;
      case 'expandable':
        return <ExpandableTemplate {...props} />;
      default:
        setError(`Unknown ad format: ${ad.format}`);
        return null;
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 p-4">
        <div className="text-center">
          <h3 className="font-bold">Ad Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
          <p className="text-sm">Waiting for ad payload...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {renderCreative()}
    </div>
  );
}