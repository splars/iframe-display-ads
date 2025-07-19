'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Monitor, Code, Home, Image, Video, Layers, Expand, Calendar, Users, TrendingUp } from 'lucide-react';

const navigation = [
  {
    name: 'Getting Started',
    items: [
      { name: 'Overview', href: '/', icon: Home },
      { name: 'Demo', href: '/mock-host', icon: Monitor },
      { name: 'API', href: '/api/ads', icon: Code },
    ],
  },
  {
    name: 'Examples',
    items: [
      { name: 'Product Page', href: '/product/demo-product?adId=demo&source=navigation', icon: Users },
    ],
  },
  {
    name: 'Ad Formats',
    items: [
      { name: 'Banner Ads', href: '/docs/banner', icon: Image },
      { name: 'Video Ads', href: '/docs/video', icon: Video },
      { name: 'Native Ads', href: '/docs/native', icon: Layers },
      { name: 'Expandable', href: '/docs/expandable', icon: Expand },
    ],
  },
  {
    name: 'Features',
    items: [
      { name: 'SafeFrame', href: '/docs/safeframe', icon: Monitor },
      { name: 'Tracking', href: '/docs/tracking', icon: TrendingUp },
      { name: 'Events', href: '/docs/events', icon: Calendar },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200 lg:pt-16 lg:pb-4 lg:block dark:lg:bg-gray-900 dark:lg:border-gray-800">
      <div className="px-6">
        <nav className="mt-6">
          <div className="space-y-8">
            {navigation.map((section) => (
              <div key={section.name}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {section.name}
                </h3>
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                        )}
                      >
                        <Icon
                          className={cn(
                            'mr-3 h-4 w-4',
                            isActive
                              ? 'text-primary'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                          )}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}