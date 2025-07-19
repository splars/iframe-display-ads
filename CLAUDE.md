# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Testing & Development
- **Manual Testing**: Visit `/mock-host` to test all ad formats and SafeFrame communication
- **API Testing**: Use `/api/ads` with query params `?slot=<name>&type=<format>`
- **Console Debugging**: Open browser console when viewing `/mock-host` to see SafeFrame events

## Architecture Overview

This is a **SafeFrame v2 compliant ad-serving system** built with Next.js 14. The architecture implements secure cross-domain communication between ad hosts and ad creatives.

### Core Components

**SafeFrame Implementation** (`src/lib/safeframe.ts`):
- `SafeFrameHost`: Manages iframe communication from the host page side
- `SafeFrameGuest`: Handles communication from within the ad iframe
- Both classes handle postMessage communication and SSR compatibility

**Ad Serving Flow**:
1. `AdSlot` component fetches ads from `/api/ads` API
2. Creates iframe pointing to `/ad-frame` 
3. Sends ad payload via SafeFrame postMessage
4. Ad templates render within iframe sandbox
5. Events (impression, click, expand/collapse) bubble back to host

**Ad Templates** (`src/templates/`):
- Each template handles a specific ad format (banner, video, native, expandable)
- Templates listen for ad payloads via SafeFrame Guest
- Fire tracking pixels and SafeFrame events appropriately

### Key Architecture Patterns

**Cross-Domain Security**: 
- All ad rendering happens in sandboxed iframes at `/ad-frame`
- SafeFrame v2 protocol ensures secure host-guest communication
- Custom headers in `next.config.js` allow iframe embedding

**Event System**:
- SafeFrame messages: `ad-payload`, `creative-ready`, `impression`, `click`, `expand`, `collapse`
- Host listens for events and handles iframe resizing for expandable ads
- All tracking pixels fired asynchronously via `fireTrackingPixel()`

**Template Selection**:
- Ad format determines which template component renders
- Templates are dynamically selected in `/ad-frame` based on `AdPayload.format`
- Each template handles its own interaction patterns (hover-to-expand, video controls, etc.)

## Important Implementation Details

### SafeFrame Compatibility
- Both Host and Guest classes check `typeof window !== 'undefined'` for SSR
- SafeFrame global (`window.$sf`) is initialized in Guest constructor
- Message handlers are registered per ad slot to handle multiple ads on one page

### Ad Slot Management
- Each `AdSlot` component manages its own iframe lifecycle
- Slots are registered with unique IDs in the SafeFrame host
- Dynamic resizing is handled through SafeFrame expand/collapse events

### API Design
- `/api/ads` returns mocked ad data with filtering by slot name and format
- Ad payloads include tracking URLs, creative assets, and metadata
- API supports multiple ad formats: banner, video, native, expandable

### Production Considerations
- `/ad-frame` route configured with headers to allow cross-domain embedding
- Iframe renderer designed to be deployed to CDN separately from host
- All external tracking URLs use `no-cors` fetch mode

## File Structure Context

- `src/app/ad-frame/page.tsx`: The iframe renderer that displays ads
- `src/app/mock-host/page.tsx`: Demo page showing all ad slots  
- `src/components/AdSlot.tsx`: Host-side component that creates and manages ad iframes
- `src/lib/ads.ts`: Mock ad data and tracking utilities
- `src/types/ad.ts`: TypeScript interfaces for ad payloads and SafeFrame messages

## Development Notes

- Server runs on port 3000, may auto-increment if port is busy
- Console logging is extensive - check browser console when testing
- Expandable ads demonstrate iframe resizing via SafeFrame expand/collapse
- All placeholder images use placehold.co service
- Video ads use sample video from samplelib.com