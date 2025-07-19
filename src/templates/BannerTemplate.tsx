'use client';

import { AdPayload } from '@/types/ad';
import { fireTrackingPixel } from '@/lib/ads';

interface BannerTemplateProps {
  ad: AdPayload;
  onImpression: () => void;
  onClick: () => void;
}

export default function BannerTemplate({ ad, onImpression, onClick }: BannerTemplateProps) {
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
          source: 'banner-ad'
        }
      }, '*');
    }
  };

  const handleLoad = () => {
    onImpression();
    ad.trackingUrls.forEach(url => {
      if (url.includes('impression')) {
        fireTrackingPixel(url);
      }
    });
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <a
        href={ad.clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className="block w-full h-full cursor-pointer"
      >
        <img
          src={ad.creativeUrl}
          alt="Banner Advertisement"
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={(e) => {
            console.error('Banner image failed to load:', ad.creativeUrl);
            e.currentTarget.src = `https://placehold.co/${ad.width}x${ad.height}/CCCCCC/666666?text=Ad+Failed+to+Load`;
          }}
        />
      </a>
    </div>
  );
}