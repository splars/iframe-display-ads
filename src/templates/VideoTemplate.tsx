'use client';

import { AdPayload } from '@/types/ad';
import { fireTrackingPixel } from '@/lib/ads';
import { useRef, useEffect } from 'react';

interface VideoTemplateProps {
  ad: AdPayload;
  onImpression: () => void;
  onClick: () => void;
}

export default function VideoTemplate({ ad, onImpression, onClick }: VideoTemplateProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      onImpression();
      ad.trackingUrls.forEach(url => {
        if (url.includes('impression')) {
          fireTrackingPixel(url);
        }
      });
    };

    const handlePlay = () => {
      ad.trackingUrls.forEach(url => {
        if (url.includes('start')) {
          fireTrackingPixel(url);
        }
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
    };
  }, [ad, onImpression]);

  const handleClick = () => {
    onClick();
    ad.trackingUrls.forEach(url => {
      if (url.includes('click')) {
        fireTrackingPixel(url);
      }
    });
    
    // Send navigation message to parent instead of opening new window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'navigate',
        data: {
          adId: ad.id,
          clickUrl: ad.clickUrl,
          productId: `product-${ad.id}`,
          source: 'video-ad'
        }
      }, '*');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={ad.creativeUrl}
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Video failed to load:', ad.creativeUrl);
        }}
      />
      <div
        className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center"
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Click to learn more
        </div>
      </div>
    </div>
  );
}