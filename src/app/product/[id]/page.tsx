'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const productId = params.id as string;
  const adId = searchParams.get('adId');
  const source = searchParams.get('source') || 'unknown';

  // Mock product data based on ad context
  const getProductData = () => {
    if (adId?.includes('banner')) {
      return {
        id: productId,
        name: 'Premium Tech Bundle',
        price: '$299.99',
        originalPrice: '$399.99',
        rating: 4.8,
        reviews: 1247,
        image: 'https://placehold.co/600x400/0066CC/FFFFFF?text=Premium+Tech+Bundle',
        description: 'A comprehensive technology bundle featuring the latest gadgets and accessories.',
        features: [
          'Latest wireless technology',
          'Premium build quality',
          '2-year warranty included',
          'Free shipping worldwide'
        ],
        category: 'Technology'
      };
    } else if (adId?.includes('native')) {
      return {
        id: productId,
        name: 'Amazing Product Deal',
        price: '$149.99',
        originalPrice: '$299.99',
        rating: 4.6,
        reviews: 892,
        image: 'https://placehold.co/600x400/009900/FFFFFF?text=Amazing+Product',
        description: 'Get 50% off on our premium products. Limited time offer with exceptional value.',
        features: [
          '50% off limited time offer',
          'Premium quality materials',
          'Customer satisfaction guaranteed',
          'Fast delivery available'
        ],
        category: 'Special Offers'
      };
    } else if (adId?.includes('expandable')) {
      return {
        id: productId,
        name: 'Interactive Experience Kit',
        price: '$199.99',
        originalPrice: '$249.99',
        rating: 4.9,
        reviews: 567,
        image: 'https://placehold.co/600x400/CC0066/FFFFFF?text=Interactive+Kit',
        description: 'An expandable, interactive product that grows with your needs.',
        features: [
          'Expandable design',
          'Interactive components',
          'Multiple configuration options',
          'Future-proof technology'
        ],
        category: 'Interactive'
      };
    } else {
      return {
        id: productId,
        name: 'Featured Product',
        price: '$99.99',
        originalPrice: '$129.99',
        rating: 4.5,
        reviews: 324,
        image: 'https://placehold.co/600x400/666666/FFFFFF?text=Featured+Product',
        description: 'A high-quality product with excellent features and competitive pricing.',
        features: [
          'High-quality construction',
          'Competitive pricing',
          'Reliable performance',
          'Great customer support'
        ],
        category: 'General'
      };
    }
  };

  const product = getProductData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      {/* Main content area with sidebar offset */}
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mock-host">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Demo
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">Product Details</span>
          </div>

          {/* Ad Context Info */}
          {adId && (
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Ad Click Navigation</Badge>
                  <span className="text-sm text-muted-foreground">
                    Navigated from ad: {adId} (source: {source})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Product Images */}
            <div className="xl:w-1/2">
              <Card>
                <CardContent className="p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Product Info */}
            <div className="xl:w-1/2 space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">{product.category}</Badge>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-foreground">{product.price}</span>
                  <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>
                  <Badge variant="destructive">Save {Math.round((1 - parseFloat(product.price.slice(1)) / parseFloat(product.originalPrice.slice(1))) * 100)}%</Badge>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Key Features:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <Button className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Guarantees */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>Free shipping on orders over $99</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span>2-year warranty included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product ID:</span>
                    <span>{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span>{product.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviews:</span>
                    <span>{product.reviews} customer reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>What our customers are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-sm text-muted-foreground">
                      "Excellent product with great value for money. Highly recommended!"
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">- Sarah J.</span>
                    </div>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <p className="text-sm text-muted-foreground">
                      "Fast delivery and exactly as described. Will buy again."
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                      <Star className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-muted-foreground ml-2">- Mike R.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}