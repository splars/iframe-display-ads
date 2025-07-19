import { NextRequest, NextResponse } from 'next/server';
import { getAds } from '@/lib/ads';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slot = searchParams.get('slot');
    const format = searchParams.get('type');

    const ads = getAds(slot || undefined, format || undefined);

    return NextResponse.json({
      success: true,
      data: ads,
      count: ads.length,
      filters: {
        slot: slot || 'all',
        format: format || 'all'
      }
    });
  } catch (error) {
    console.error('Error in ads API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        data: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}