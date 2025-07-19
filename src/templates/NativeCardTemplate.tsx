'use client';

import { AdPayload } from '@/types/ad';
import { fireTrackingPixel } from '@/lib/ads';

interface NativeCardTemplateProps {
  ad: AdPayload;
  onImpression: () => void;
  onClick: () => void;
}

export default function NativeCardTemplate({ ad, onImpression, onClick }: NativeCardTemplateProps) {
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
          source: 'native-ad'
        }
      }, '*');
    }
  };

  const handleImageLoad = () => {
    onImpression();
    ad.trackingUrls.forEach(url => {
      if (url.includes('impression')) {
        fireTrackingPixel(url);
      }
    });
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="relative">
        <img
          src={ad.creativeUrl}
          alt="Native Ad"
          className="w-full h-32 object-cover"
          onLoad={handleImageLoad}
          onError={(e) => {
            console.error('Native image failed to load:', ad.creativeUrl);
            e.currentTarget.src = `https://placehold.co/${ad.width}x200/CCCCCC/666666?text=Image+Failed`;
          }}
        />
        <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {ad.headline || 'Native Advertisement'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {ad.body || 'This is a native advertisement that blends seamlessly with your content.'}
        </p>
        
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}