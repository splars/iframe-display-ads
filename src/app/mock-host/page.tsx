'use client';

import AdSlot from '@/components/AdSlot';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Monitor, Calendar, Users, TrendingUp, MessageSquare } from 'lucide-react';

export default function MockHost() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      {/* Main content area with sidebar offset */}
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Header Banner Ad */}
          <div className="flex justify-center py-4 bg-muted/20 rounded-lg mb-8">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Header Leaderboard - 728×90</Badge>
              <AdSlot
                slotId="header-banner"
                slotName="header-leaderboard"
                width={728}
                height={90}
              />
            </div>
          </div>
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> This page shows how ads integrate into a real website layout. 
              Open developer console to see SafeFrame communication logs.
            </AlertDescription>
          </Alert>

          {/* Main Content Layout */}
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Main Content Area */}
            <main className="min-w-0 flex-1 xl:flex-[3] space-y-8">
            {/* Featured Article */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Breaking: Tech Innovation Drives Market Growth</CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    January 4, 2025
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    By Sarah Johnson
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Technology companies continue to lead market innovation with breakthrough developments 
                  in artificial intelligence, cloud computing, and sustainable energy solutions. 
                  Industry experts predict significant growth in the coming quarters.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The integration of AI-powered systems has revolutionized how businesses operate, 
                  leading to increased efficiency and new opportunities for growth across multiple sectors.
                </p>
                
                {/* Inline Native Ad */}
                <div className="my-8 p-4 bg-muted/20 rounded-lg">
                  <div className="text-center mb-4">
                    <Badge variant="outline">Sponsored Content</Badge>
                  </div>
                  <AdSlot
                    slotId="article-native"
                    slotName="inline-native"
                    width={300}
                    height={250}
                    className="mx-auto"
                  />
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Market analysts note that consumer adoption of new technologies has accelerated, 
                  particularly in the areas of mobile payments, streaming services, and smart home devices.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Looking ahead, experts anticipate continued innovation in areas such as quantum computing, 
                  renewable energy storage, and advanced manufacturing processes.
                </p>
              </CardContent>
            </Card>

            {/* Additional Articles Grid */}
            <div className="flex flex-col md:flex-row gap-6">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Financial Markets Update</CardTitle>
                  <CardDescription>
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Markets showing positive trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Global markets continue their upward trajectory as investors remain optimistic 
                    about economic recovery and technological advancement...
                  </p>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Industry Analysis</CardTitle>
                  <CardDescription>
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Expert commentary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Leading industry experts weigh in on the latest developments and their 
                    potential impact on future business strategies...
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Video Content Section */}
            <Card>
              <CardHeader>
                <CardTitle>Video Report: Technology Trends 2025</CardTitle>
                <CardDescription>
                  Watch our comprehensive analysis of emerging tech trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="w-12 h-12 mx-auto mb-2" />
                    <p>Video Player Placeholder</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Our technology correspondent explores the latest innovations that are reshaping 
                  industries and creating new opportunities for businesses worldwide.
                </p>
              </CardContent>
            </Card>
          </main>

            {/* Content Sidebar */}
            <aside className="xl:w-64 xl:flex-shrink-0 space-y-6 bg-muted/5 p-4 rounded-lg">
            {/* Sidebar Rectangle Ad */}
            <Card>
              <CardHeader className="text-center">
                <Badge variant="outline">Advertisement</Badge>
              </CardHeader>
              <CardContent>
                <AdSlot
                  slotId="sidebar-main"
                  slotName="sidebar-rectangle"
                  width={300}
                  height={250}
                />
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">AI Breakthrough</div>
                    <div className="text-muted-foreground text-xs">2 hours ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Market Rally Continues</div>
                    <div className="text-muted-foreground text-xs">4 hours ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">New Regulations</div>
                    <div className="text-muted-foreground text-xs">6 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Second Sidebar Ad */}
            <Card>
              <CardHeader className="text-center">
                <Badge variant="outline">Sponsored</Badge>
              </CardHeader>
              <CardContent>
                <AdSlot
                  slotId="sidebar-secondary"
                  slotName="sidebar-rectangle"
                  width={300}
                  height={250}
                />
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stay Updated</CardTitle>
                <CardDescription>
                  Get the latest news delivered to your inbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                  <Button className="w-full" size="sm">Subscribe</Button>
                </div>
              </CardContent>
            </Card>
          </aside>
          </div>

          <Card className="mt-16 text-center">
          <CardHeader>
            <CardTitle>Display Ads Prototype</CardTitle>
            <CardDescription>SafeFrame v2 Implementation with Next.js 14</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary">✅ Banner Ads</Badge>
              <Badge variant="secondary">✅ Video Ads</Badge>
              <Badge variant="secondary">✅ Native Ads</Badge>
              <Badge variant="secondary">✅ Expandable Ads</Badge>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}