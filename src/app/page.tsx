import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Code, Video, Image, Layers, Expand } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      {/* Main content area with sidebar offset */}
      <div className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Display Ads Prototype
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A modern ad-serving system built with Next.js 14 and SafeFrame v2 for secure, 
              cross-domain advertisement delivery and tracking.
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <Badge variant="secondary">Next.js 14</Badge>
              <Badge variant="secondary">SafeFrame v2</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <Card className="flex-1 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Mock Host Demo</CardTitle>
                  <CardDescription>Interactive ad display showcase</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                View the interactive demo page with three ad slots displaying different ad formats including 
                banner, video, native, and expandable advertisements.
              </p>
              <Button asChild>
                <Link href="/mock-host">
                  View Demo
                </Link>
              </Button>
            </CardContent>
          </Card>

            <Card className="flex-1 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">API Endpoint</CardTitle>
                  <CardDescription>Test ad-serving functionality</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Test the ad-serving API that returns mocked ad payloads with filtering by slot and format. 
                Perfect for integration testing.
              </p>
              <Button variant="secondary" asChild>
                <Link href="/api/ads">
                  Explore API
                </Link>
              </Button>
            </CardContent>
          </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Ad Format Features</CardTitle>
              <CardDescription className="text-center">
                Comprehensive support for modern advertising formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row flex-wrap gap-6">
                <div className="text-center flex-1 min-w-[200px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Banner Ads</h4>
                <p className="text-sm text-muted-foreground">Standard image advertisements with click tracking</p>
              </div>
                <div className="text-center flex-1 min-w-[200px]">
                <div className="w-16 h-16 bg-chart-1/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-chart-1" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Video Ads</h4>
                <p className="text-sm text-muted-foreground">Autoplay video content with overlay controls</p>
              </div>
                <div className="text-center flex-1 min-w-[200px]">
                <div className="w-16 h-16 bg-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-chart-2" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Native Ads</h4>
                <p className="text-sm text-muted-foreground">Content cards that blend with your site design</p>
              </div>
                <div className="text-center flex-1 min-w-[200px]">
                <div className="w-16 h-16 bg-chart-3/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Expand className="w-8 h-8 text-chart-3" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Expandable</h4>
                <p className="text-sm text-muted-foreground">Rich media ads that expand on user interaction</p>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}