# SafeFrame Test Suite

This directory contains comprehensive unit tests for the SafeFrame system and iframe communication in the Next.js ad-serving application.

## Test Structure

### Core Library Tests (`lib/`)
- **`safeframe-host.test.ts`** - Tests for SafeFrameHost class
- **`safeframe-guest.test.ts`** - Tests for SafeFrameGuest class

### Component Tests (`components/`)
- **`AdSlot.test.tsx`** - Tests for AdSlot component

### Page Tests (`app/`)
- **`ad-frame.test.tsx`** - Tests for ad-frame page

### Test Utilities (`utils/`)
- **`safeframe-mocks.ts`** - Mock utilities for SafeFrame communication
- **`test-utils.tsx`** - Custom render utilities

## Test Coverage

### SafeFrameHost Class
✅ **Constructor & Initialization**
- Event listener registration
- Map initialization
- SSR compatibility

✅ **Slot Management**
- Slot registration
- Multiple slot handling
- Slot overwriting

✅ **Message Communication**
- Sending messages to iframes
- Message handler registration
- Cross-iframe message routing

✅ **Error Handling**
- Missing iframe handling
- Invalid slot handling
- Message handler errors

### SafeFrameGuest Class
✅ **Constructor & Initialization**
- Host origin detection from referrer
- SafeFrame global object setup
- Message event listener registration

✅ **SafeFrame API Implementation**
- `$sf.ext.register()` functionality
- `$sf.ext.expand()` and `$sf.ext.collapse()`
- `$sf.ext.geom()` geometry queries
- `$sf.ext.meta()` metadata retrieval

✅ **Host Communication**
- Message sending to parent window
- Origin-based security
- Ready state management

✅ **Message Handling**
- Incoming message processing
- Handler registration
- Error resilience

### AdSlot Component
✅ **Rendering & Initialization**
- Loading state display
- Iframe creation with correct attributes
- Custom className support

✅ **Ad Data Fetching**
- API calls to `/api/ads`
- Success/error response handling
- Dynamic iframe resizing

✅ **Iframe Communication**
- SafeFrame registration
- Message passing to/from iframe
- Ready state detection

✅ **SafeFrame Integration**
- Message routing between host and guest
- Expand/collapse functionality
- Impression and click tracking

✅ **Error Handling**
- Network failure recovery
- Missing ad data handling
- SafeFrame unavailability

### Ad-Frame Page
✅ **Initialization**
- SafeFrameGuest setup
- Frame-ready messaging
- Resize event handling

✅ **Message Processing**
- Ad payload reception
- Template selection by format
- Creative-ready notifications

✅ **Template Integration**
- Banner, video, native, expandable formats
- Event forwarding (impression, click)
- Error state rendering

✅ **SafeFrame Events**
- Impression tracking
- Click tracking
- Ready state communication

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- src/__tests__/lib/          # Library tests
npm test -- src/__tests__/components/   # Component tests
npm test -- src/__tests__/app/         # Page tests

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Scenarios Covered

### 1. Cross-Domain Communication
- ✅ PostMessage API usage
- ✅ Origin validation
- ✅ Message type checking
- ✅ Error boundary handling

### 2. SafeFrame v2 Compliance
- ✅ Standard API implementation
- ✅ Geometry and metadata queries
- ✅ Expand/collapse functionality
- ✅ Registration callbacks

### 3. Multi-Slot Management
- ✅ Concurrent slot registration
- ✅ Message routing by iframe source
- ✅ Independent slot lifecycle
- ✅ Slot cleanup and removal

### 4. Error Recovery
- ✅ Network failure handling
- ✅ Invalid message rejection
- ✅ Missing dependency graceful degradation
- ✅ Timeout handling

### 5. Browser Compatibility
- ✅ SSR environment detection
- ✅ Window/document availability checks
- ✅ Cross-origin iframe handling
- ✅ Message API fallbacks

## Mock Strategy

The test suite uses comprehensive mocking:

- **Window/Document APIs**: Mocked for SSR compatibility testing
- **PostMessage API**: Controlled message simulation
- **SafeFrame Global**: Complete $sf object implementation
- **Fetch API**: Ad data loading simulation
- **Template Components**: Simplified test doubles

## Key Testing Patterns

1. **Isolation**: Each test has clean mock state
2. **Integration**: End-to-end communication flows
3. **Edge Cases**: Error conditions and boundary testing
4. **Async Handling**: Proper waitFor and act usage
5. **Event Simulation**: Real browser event patterns

## Performance Considerations

- Fast test execution with minimal DOM operations
- Efficient mock setup and teardown
- Parallel test execution support
- Memory leak prevention through cleanup

This test suite ensures the SafeFrame system is robust, secure, and compliant with industry standards for ad serving.