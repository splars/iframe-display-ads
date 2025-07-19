# Display Ads Prototype - Next.js with SafeFrame v2

A proof-of-concept display ads system built with Next.js 14, TypeScript, and SafeFrame v2 for secure cross-domain ad serving.

## 🏗️ Architecture

This prototype demonstrates a complete ad-serving ecosystem with comprehensive data flow and secure cross-domain communication.

## 📊 Data Flow Architecture

### Complete System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                HOST WEBSITE                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   Navigation    │    │  Header Banner  │    │      Main Content          │  │
│  │     Menu        │    │   (728×90)      │    │   ┌─────────────────────┐   │  │
│  └─────────────────┘    └─────────────────┘    │   │   Article Content   │   │  │
│                                                 │   │                     │   │  │
│  ┌─────────────────┐    ┌─────────────────┐    │   │  ┌───────────────┐  │   │  │
│  │    Sidebar      │    │   Footer Ads    │    │   │  │ Native Ad     │  │   │  │
│  │  ┌───────────┐  │    │   (Multiple)    │    │   │  │ (300×250)     │  │   │  │
│  │  │Rectangle  │  │    └─────────────────┘    │   │  └───────────────┘  │   │  │
│  │  │Ad (300×   │  │                           │   └─────────────────────┘   │  │
│  │  │250)       │  │                           └─────────────────────────────┘  │
│  │  └───────────┘  │                                                            │
│  └─────────────────┘                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTP Requests
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AD SERVING SYSTEM                                 │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │   Next.js API   │    │  SafeFrame Host │    │      Ad Templates           │  │
│  │   /api/ads      │    │    Manager      │    │                             │  │
│  │                 │    │                 │    │  ┌─────────────────────┐    │  │
│  │ • Slot filtering│◄──►│ • Iframe mgmt   │◄──►│  │ BannerTemplate      │    │  │
│  │ • Format filter │    │ • Message relay │    │  │ VideoTemplate       │    │  │
│  │ • Mock data     │    │ • Event tracking│    │  │ NativeCardTemplate  │    │  │
│  │ • JSON response │    │ • Resize handling│   │  │ ExpandableTemplate  │    │  │
│  └─────────────────┘    └─────────────────┘    │  └─────────────────────┘    │  │
                                                 └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↕ SafeFrame PostMessage
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SANDBOXED IFRAME (/ad-frame)                         │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │ SafeFrame Guest │    │  Template       │    │     Creative Assets         │  │
│  │                 │    │  Renderer       │    │                             │  │
│  │ • Message recv  │◄──►│                 │◄──►│ • Images (placehold.co)     │  │
│  │ • Event firing  │    │ • Format detect │    │ • Videos (samplelib.com)    │  │
│  │ • Resize reqs   │    │ • Props passing │    │ • Custom markup             │  │
│  │ • Click tracking│    │ • Error handling│    │ • Click-through URLs        │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Data Flow Sequence

```
1. HOST PAGE INITIALIZATION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ AdSlot.tsx   │────►│ useEffect()  │────►│ fetchAds()   │
│ Component    │     │ Hook Fires   │     │ API Call     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
2. API REQUEST & RESPONSE                        
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ GET /api/ads │────►│ Route.ts     │────►│ getAds()     │
│ ?slot=header │     │ Handler      │     │ Filter Logic │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ JSON Response│◄────│ AdPayload[]  │
                     │ with Ad Data │     │ Mock Data    │
                     └──────────────┘     └──────────────┘

3. IFRAME CREATION & SAFEFRAME SETUP
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Create       │────►│ SafeFrame    │────►│ Register     │
│ <iframe>     │     │ Host.register│     │ Slot & ID    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
4. IFRAME LOAD & GUEST INITIALIZATION           
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ /ad-frame    │────►│ SafeFrame    │────►│ window.$sf   │
│ Page Loads   │     │ Guest.init() │     │ API Setup    │
└──────────────┘     └──────────────┘     └──────────────┘

5. AD PAYLOAD TRANSMISSION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ postMessage  │────►│ SafeFrame    │────►│ AdPayload    │
│ 'ad-payload' │     │ Guest.onMsg  │     │ Received     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
6. TEMPLATE SELECTION & RENDERING               
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ switch(      │────►│ Template     │────►│ React        │
│ ad.format)   │     │ Component    │     │ Rendering    │
└──────────────┘     └──────────────┘     └──────────────┘

7. EVENT TRACKING & COMMUNICATION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ User         │────►│ onClick/     │────►│ postMessage  │
│ Interaction  │     │ onImpression │     │ to Host      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ Console.log  │◄────│ Event        │
                     │ Tracking     │     │ Processing   │
                     └──────────────┘     └──────────────┘
```

## 🔧 Component Architecture

### 1. Ad-Serving API (`/api/ads`)
- **Route**: `GET /api/ads?slot={slot}&type={format}`
- **Purpose**: Serves mocked ad payloads for different ad formats
- **Formats**: Banner, Video, Native, Expandable
- **Filtering**: Supports filtering by slot name and ad format
- **Response Structure**: JSON with success flag, data array, count, and filters

### 2. SafeFrame v2 Implementation
- **Host (`SafeFrameHost`)**: Manages iframe communication and security
- **Guest (`SafeFrameGuest`)**: Handles ad rendering within secure sandbox
- **Features**: Resize handling, event tracking, expand/collapse for rich media
- **Communication**: PostMessage API with typed message interfaces

### 3. Ad Templates
- **BannerTemplate**: Standard image advertisements with click tracking
- **VideoTemplate**: Video ads with autoplay, mute, and click-through overlays
- **NativeCardTemplate**: Native content cards with headlines, body text, and CTAs
- **ExpandableTemplate**: Hover-to-expand rich media ads with smooth transitions

### 4. Demo Integration
- **Mock Host**: Realistic news portal layout with multiple ad placements
- **Ad Slots**: Header banner, sidebar rectangles, inline native content
- **Real-time Events**: Console logging for tracking and debugging
- **Responsive Design**: Mobile-friendly layout with adaptive ad sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd iframe-display-ads
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Quick Demo

1. **Visit the Demo Page**
   ```
   http://localhost:3000/mock-host
   ```

2. **Open Browser Console** to see event logs

3. **Interact with Ads**
   - Click on banner ads
   - Hover over expandable ads
   - Watch video ads play

## 📋 API Documentation

### Get All Ads
```bash
curl http://localhost:3000/api/ads
```

### Filter by Slot
```bash
curl "http://localhost:3000/api/ads?slot=header-leaderboard"
```

### Filter by Format
```bash
curl "http://localhost:3000/api/ads?type=banner"
```

### Combined Filters
```bash
curl "http://localhost:3000/api/ads?slot=sidebar-rectangle&type=expandable"
```

## 🔧 Configuration

### Ad Payload Structure
```typescript
interface AdPayload {
  id: string;
  slot: string;
  format: 'banner' | 'video' | 'native' | 'expandable';
  width: number;
  height: number;
  creativeUrl?: string;
  markup?: string;
  clickUrl: string;
  headline?: string;
  body?: string;
  trackingUrls: string[];
}
```

### SafeFrame Events
- `impression`: Fired when ad loads
- `click`: Fired when ad is clicked
- `expand`: Fired when expandable ad expands
- `collapse`: Fired when expandable ad collapses
- `creative-ready`: Fired when creative is rendered

## 🖼️ Iframe Deep Dive

### Iframe Architecture & Lifecycle

The `/ad-frame` route serves as the isolated rendering environment for all advertisements. Here's the detailed breakdown:

#### Iframe Page Structure (`/ad-frame`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    IFRAME (/ad-frame)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   React App Root                       │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │            AdFrame Component                    │    │    │
│  │  │                                                 │    │    │
│  │  │  ┌─────────────────────────────────────────┐    │    │    │
│  │  │  │         SafeFrame Guest                 │    │    │    │
│  │  │  │                                         │    │    │    │
│  │  │  │  • window.$sf API initialization       │    │    │    │
│  │  │  │  • PostMessage event listeners         │    │    │    │
│  │  │  │  • Host origin validation              │    │    │    │
│  │  │  │  • Message type routing                │    │    │    │
│  │  │  └─────────────────────────────────────────┘    │    │    │
│  │  │                                                 │    │    │
│  │  │  ┌─────────────────────────────────────────┐    │    │    │
│  │  │  │      Template Renderer                  │    │    │    │
│  │  │  │                                         │    │    │    │
│  │  │  │  switch(ad.format) {                    │    │    │    │
│  │  │  │    case 'banner':                       │    │    │    │
│  │  │  │      return <BannerTemplate />          │    │    │    │
│  │  │  │    case 'video':                        │    │    │    │
│  │  │  │      return <VideoTemplate />           │    │    │    │
│  │  │  │    case 'native':                       │    │    │    │
│  │  │  │      return <NativeCardTemplate />      │    │    │    │
│  │  │  │    case 'expandable':                   │    │    │    │
│  │  │  │      return <ExpandableTemplate />      │    │    │    │
│  │  │  │  }                                      │    │    │    │
│  │  │  └─────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │    │
│  └─────────────────────────────────────────────────────┘    │    │
└─────────────────────────────────────────────────────────────────┘
```

#### Iframe Initialization Sequence

```
1. IFRAME CREATION (Host Side)
   ┌─────────────────┐
   │ <iframe         │
   │   src="/ad-     │
   │   frame"        │
   │   sandbox="     │ ──► Secure sandbox with limited permissions
   │   allow-scripts │     • allow-scripts: JavaScript execution
   │   allow-same-   │     • allow-same-origin: Same-origin requests
   │   origin allow- │     • allow-popups: Click-through navigation
   │   popups"       │     • allow-popups-to-escape-sandbox: External links
   │ />              │
   └─────────────────┘

2. IFRAME LOAD EVENT
   ┌─────────────────┐     ┌─────────────────┐
   │ Iframe loads    │────►│ SafeFrame Guest │
   │ /ad-frame       │     │ constructor()   │
   └─────────────────┘     └─────────────────┘
                                    │
                                    ▼
3. SAFEFRAME GUEST SETUP            
   ┌─────────────────┐     ┌─────────────────┐
   │ window.$sf =    │────►│ PostMessage     │
   │ {               │     │ listener setup  │
   │   ext: {        │     │                 │
   │     register()  │     │ event.origin    │
   │     expand()    │     │ validation      │
   │     collapse()  │     └─────────────────┘
   │     geom()      │
   │     meta()      │
   │   }             │
   │ }               │
   └─────────────────┘

4. READY SIGNAL
   ┌─────────────────┐     ┌─────────────────┐
   │ iframe ready    │────►│ postMessage     │
   │ setTimeout()    │     │ 'frame-ready'   │
   └─────────────────┘     └─────────────────┘

5. AD PAYLOAD RECEPTION
   ┌─────────────────┐     ┌─────────────────┐
   │ onMessage()     │────►│ message.type    │
   │ handler         │     │ === 'ad-payload'│
   └─────────────────┘     └─────────────────┘
                                    │
                                    ▼
6. TEMPLATE RENDERING               
   ┌─────────────────┐     ┌─────────────────┐
   │ setAd(data)     │────►│ renderCreative()│
   │ state update    │     │ component       │
   └─────────────────┘     └─────────────────┘

7. CREATIVE READY SIGNAL
   ┌─────────────────┐     ┌─────────────────┐
   │ useEffect       │────►│ postMessage     │
   │ [ad, safeFrame] │     │ 'creative-ready'│
   └─────────────────┘     └─────────────────┘
```

#### Template-Specific Behaviors

Each ad template has unique interaction patterns within the iframe:

**BannerTemplate:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ <img onLoad>    │────►│ onImpression()  │────►│ postMessage     │
│ Image loads     │     │ callback        │     │ 'impression'    │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ <a onClick>     │────►│ onClick()       │────►│ window.open()   │
│ User clicks     │     │ callback        │     │ + tracking      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**VideoTemplate:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ <video          │────►│ onLoadedData    │────►│ Impression +    │
│ autoplay muted> │     │ + onPlay        │     │ Video Start     │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Overlay div     │────►│ Click handler   │────►│ Pause video +   │
│ onClick         │     │                 │     │ Open landing    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**ExpandableTemplate:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ onMouseEnter    │────►│ setIsExpanded   │────►│ postMessage     │
│ container       │     │ (true)          │     │ 'expand'        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Host receives   │────►│ iframe.style    │
                        │ expand message  │     │ resize          │
                        └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ onMouseLeave    │────►│ setIsExpanded   │────►│ postMessage     │
│ container       │     │ (false)         │     │ 'collapse'      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### Error Handling & States

The iframe implements comprehensive error handling:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ No ad payload   │────►│ Loading state   │────►│ "Waiting for    │
│ received        │     │ displayed       │     │ ad payload..."  │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Invalid format  │────►│ Error state     │────►│ "Unknown ad     │
│ in ad.format    │     │ setError()      │     │ format: X"      │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Image/Video     │────►│ onError handler │────►│ Fallback        │
│ load failure    │     │ in template     │     │ placeholder     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### Security & Isolation

The iframe operates under strict security constraints:

- **Sandbox Attributes**: Limited to essential permissions only
- **Origin Validation**: All postMessage communications validate sender origin
- **CSP Headers**: Content Security Policy prevents unauthorized script execution
- **No Direct DOM Access**: Host page cannot directly manipulate iframe contents
- **Controlled Communication**: Only predefined message types are processed

This architecture ensures that advertisements cannot compromise the host page security while maintaining rich interactive capabilities.

## 🏭 Production Considerations

### Security
- [ ] Implement proper CORS policies
- [ ] Add rate limiting to API endpoints
- [ ] Validate and sanitize ad markup
- [ ] Implement CSP headers

### Performance
- [ ] Add CDN for iframe renderer
- [ ] Implement ad caching strategies
- [ ] Optimize image loading with lazy loading
- [ ] Add performance monitoring

### Analytics
- [ ] Integrate with analytics platforms
- [ ] Implement viewability tracking
- [ ] Add conversion tracking
- [ ] Set up real-time reporting

### Scaling
- [ ] Add database for ad storage
- [ ] Implement ad targeting logic
- [ ] Add A/B testing capabilities
- [ ] Set up monitoring and alerts

## 📁 Project Structure

```
src/
├── app/
│   ├── api/ads/           # Ad-serving API
│   ├── ad-frame/          # Iframe renderer
│   ├── mock-host/         # Demo host page
│   └── page.tsx           # Landing page
├── components/
│   └── AdSlot.tsx         # Ad slot component
├── templates/
│   ├── BannerTemplate.tsx
│   ├── VideoTemplate.tsx
│   ├── NativeCardTemplate.tsx
│   └── ExpandableTemplate.tsx
├── lib/
│   ├── ads.ts             # Ad utilities
│   └── safeframe.ts       # SafeFrame implementation
└── types/
    └── ad.ts              # TypeScript definitions
```

## 🧪 Testing

### Manual Testing
1. **Test Ad Loading**
   - Visit `/mock-host`
   - Verify all three ad slots load
   - Check console for event logs

2. **Test SafeFrame Communication**
   - Hover over expandable ads
   - Verify expand/collapse events
   - Check iframe resize behavior

3. **Test API Endpoints**
   - Visit `/api/ads` directly
   - Test query parameters
   - Verify JSON response format

### Automated Testing (TODO)
```bash
# Run tests (to be implemented)
npm test

# Run linting
npm run lint

# Check TypeScript
npm run type-check
```

## 🔍 Debugging

### Common Issues

1. **Ads not loading**
   - Check browser console for errors
   - Verify API endpoint is responding
   - Check iframe sandbox permissions

2. **SafeFrame not working**
   - Verify postMessage communication
   - Check iframe source URL
   - Ensure proper event listeners

3. **Tracking not firing**
   - Check network tab for tracking pixels
   - Verify tracking URLs are valid
   - Check CORS configuration

### Debug Mode
Enable debug logging by opening browser console and running:
```javascript
localStorage.setItem('debug', 'true');
```

## 📊 Performance Monitoring

### Key Metrics to Track
- Ad load time
- Impression viewability
- Click-through rates
- Error rates
- SafeFrame handshake time

### Monitoring Tools (TODO)
- [ ] Add OpenTelemetry integration
- [ ] Set up performance budgets
- [ ] Implement real user monitoring
- [ ] Add custom metrics dashboard

## 🌐 CDN Deployment

### Iframe Renderer
The iframe renderer (`/ad-frame`) is designed to be deployed to a CDN for optimal performance:

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy iframe route** to CDN
3. **Update iframe src** in AdSlot component
4. **Configure proper headers** for cross-domain access

### Example CDN Configuration
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/ad-frame',
      headers: [
        { key: 'X-Frame-Options', value: 'ALLOWALL' },
        { key: 'Content-Security-Policy', value: 'frame-ancestors *;' }
      ]
    }
  ]
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when test suite is available)
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Documentation

- [SafeFrame Specification](https://iabtechlab.com/standards/safeframe/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Built with ❤️ using Next.js 14 and SafeFrame v2