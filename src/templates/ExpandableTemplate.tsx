'use client';

import { AdPayload } from '@/types/ad';
import { fireTrackingPixel } from '@/lib/ads';
import { useState, useRef, useEffect } from 'react';

interface ExpandableTemplateProps {
  ad: AdPayload;
  onImpression: () => void;
  onClick: () => void;
}

export default function ExpandableTemplate({ ad, onImpression, onClick }: ExpandableTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      setIsExpanded(true);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'expand',
          data: { width: 600, height: 400, adId: ad.id }
        }, '*');
      }
    };

    const handleMouseLeave = () => {
      setIsExpanded(false);
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'collapse',
          data: { adId: ad.id }
        }, '*');
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ad.id]);

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
          source: 'expandable-ad'
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
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-[600px] h-[400px] z-50' : 'w-full h-full'
      }`}
      style={{
        transformOrigin: 'top left',
      }}
    >
      {!isExpanded ? (
        <div className="w-full h-full relative" onClick={handleClick}>
          <img
            src={ad.creativeUrl}
            alt="Expandable Ad"
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={(e) => {
              console.error('Expandable image failed to load:', ad.creativeUrl);
              e.currentTarget.src = `https://placehold.co/${ad.width}x${ad.height}/CCCCCC/666666?text=Hover+to+Expand`;
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Hover to expand
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Expanded Content</h2>
            <p className="text-lg mb-6">
              This is the expanded view with rich interactive content and detailed information about our amazing product.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold">Feature 1</h3>
                <p className="text-sm">Amazing functionality</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold">Feature 2</h3>
                <p className="text-sm">Incredible performance</p>
              </div>
            </div>
            <button
              onClick={handleClick}
              className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Learn More
            </button>
          </div>
          <div className="absolute top-2 right-2 text-xs opacity-50">
            Move mouse away to collapse
          </div>
        </div>
      )}
    </div>
  );
}