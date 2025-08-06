# FPS Device Fingerprinting API

API TypeScript với TypeScript client bundling, sử dụng MurmurHash3 và SHA-256.

## 🚀 Tính năng

- **TypeScript Client Bundling**: Client code viết bằng TypeScript, tự động bundle thành JavaScript
- **Device Fingerprinting**: Thu thập thông tin thiết bị từ HTTP headers và browser data
- **Dual Hashing**: Sử dụng cả MurmurHash3 và SHA-256 để hash fingerprint
- **Simple Script Delivery**: Endpoint đơn giản `/script.js` để serve bundled script
- **Real-time Bundling**: Tự động rebuild TypeScript client khi có thay đổi (development)
- **RESTful API**: Express.js API với CORS support

## 📁 Cấu trúc Project

```
src/
├── index.ts                     # Main server file
├── client/
│   └── FingerprintClient.ts    # 🆕 TypeScript client (auto-bundled)
├── services/
│   ├── FingerprintService.ts   # Server-side fingerprinting logic
│   ├── HashService.ts          # MurmurHash3 + SHA-256 hashing
│   └── ScriptService.ts        # 🆕 TypeScript bundling & delivery
└── types/
    └── murmurhash3js.d.ts      # Type definitions
```

## 🌐 API Endpoints

### Core Fingerprinting
- `GET /api/fingerprint` - Server-side fingerprint
- `POST /api/fingerprint` - Combined client+server fingerprint

### Script Delivery
- `GET /script.js` - 🆕 Main bundled script endpoint
- `GET /script.min.js` - 🆕 Minified version
- `GET /api/script` - Alternative endpoint (same as /script.js)
- `GET /api/script-info` - 🆕 Script bundle information

### Utility
- `GET /health` - Health check

## 🔧 Development Workflow

1. **Edit Client Logic**: Modify `src/client/FingerprintClient.ts`
2. **Auto-Bundling**: ScriptService automatically compiles TS → JS
3. **Serve Script**: Available immediately at `/script.js`
4. **No Build Step**: Changes reflected in real-time (development mode)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Build project (TypeScript -> JavaScript)
npm run build

# Chạy development mode
npm run dev

# Chạy production mode
npm start
```

## API Endpoints

### GET /api/fingerprint
Tạo fingerprint từ server-side data (headers, IP, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "fingerprint": {
      "murmur": "a1b2c3d4",
      "sha256": "e5f6...",
      "combined": "789a..."
    },
    "timestamp": "2025-07-24T10:30:00.000Z"
  }
}
```

### POST /api/fingerprint
Xử lý fingerprint từ client + server data

**Request Body:**
```json
{
  "fingerprint": {
    "userAgent": "Mozilla/5.0...",
    "screen": { "width": 1920, "height": 1080 },
    "canvas": "data:image/png;base64,...",
    // ... other client data
  },
  "timestamp": "2025-07-24T10:30:00.000Z"
}
```

### GET /api/script
Cung cấp client-side fingerprinting script

**Response:** JavaScript code để embed vào website

## 📁 Project Structure

```
src/
├── index.ts                        # Main Express server
├── client/
│   └── FingerprintClient.ts       # TypeScript client fingerprinting
├── services/
│   ├── FingerprintService.ts      # Server-side fingerprinting
│   ├── HashService.ts             # MurmurHash3 + SHA-256 hashing  
│   └── ScriptService.ts           # TypeScript bundling & delivery
├── types/
│   └── murmurhash3js.d.ts         # Type definitions
├── demo.html                      # Basic demo page
└── examples.html                  # Advanced examples
```

## 🚀 Features

- ✅ **TypeScript to JavaScript**: Real-time compilation và bundling
- ✅ **Device Fingerprinting**: Comprehensive browser fingerprinting
- ✅ **Dual Hashing**: MurmurHash3 + SHA-256
- ✅ **Multiple Endpoints**: `/script.js`, `/script.min.js`, `/api/script`
- ✅ **Auto-collection**: Automatic fingerprint collection
- ✅ **CORS Support**: Cross-origin requests
- ✅ **Development Mode**: Real-time TypeScript recompilation
- ✅ **Demo Pages**: Ready-to-use examples

## 📝 License

MIT License

### Basic Integration
```html
<!-- Tích hợp đơn giản -->
<script src="http://localhost:3000/script.js"></script>
<script>
// Thu thập fingerprint
const fingerprint = window.FPSFingerprint.collect();
console.log('Fingerprint:', fingerprint);
</script>
```

### Auto-Collection
```html
<!-- Tự động thu thập khi trang load -->
<script src="http://localhost:3000/script.js?autoCollect=true&debug=true"></script>
<script>
window.FPSOnCollected = function(fingerprint) {
  console.log('Auto-collected:', fingerprint);
  // Xử lý fingerprint...
};
</script>
```

### Minified Version
```html
<!-- Phiên bản tối ưu -->
<script src="http://localhost:3000/script.min.js"></script>
```

### Custom Endpoint
```html
<!-- Custom API endpoint -->
<script src="http://localhost:3000/script.js?endpoint=/custom/api"></script>
```

## 🛠️ Development

### Real-time Development
1. Edit `src/client/FingerprintClient.ts`
2. Changes automatically bundled
3. Refresh browser to see updates
4. No manual build required

### Production Build
```bash
npm run build  # Build server-side TypeScript
# Client bundling happens automatically at runtime
```

## 🧪 Testing

### Development Demo
```bash
# Start server in development mode
npm run dev

# Open demo pages
http://localhost:3000/demo.html        # Basic demo
http://localhost:3000/examples.html    # Advanced examples
```

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Script info
curl http://localhost:3000/api/script-info

# Get server fingerprint
curl http://localhost:3000/api/fingerprint

# Post client fingerprint
curl -X POST http://localhost:3000/api/fingerprint \
  -H "Content-Type: application/json" \
  -d '{"fingerprint":{"userAgent":"Mozilla/5.0...","screen":{"width":1920,"height":1080}}}'
```

## 🏗️ Architecture

### TypeScript Bundling Workflow
```
src/client/FingerprintClient.ts
        ↓ (TypeScript Compiler)
    JavaScript ES6+
        ↓ (IIFE Wrapper)
    Bundled Script
        ↓ (Cache/Serve)
    /script.js endpoint
```

### Key Components
- **ScriptService**: Real-time TypeScript compilation và bundling
- **FingerprintService**: Server-side fingerprinting và request analysis  
- **HashService**: MurmurHash3 và SHA-256 hashing
- **FingerprintClient**: Comprehensive browser fingerprinting

**Example:**
```
http://localhost:3000/api/script?autoCollect=true&debug=true
```

### GET /api/script/minified
Phiên bản minified của client script (nhỏ gọn hơn)

### GET /health
Health check endpoint

## Hash Methods

### MurmurHash3
- Fast, non-cryptographic hash function
- Good distribution and performance
- Used for quick fingerprint comparison

### SHA-256
- Cryptographic hash function
- Higher security level
- Used for secure fingerprint storage

### Combined Hash
- SHA-256 of (MurmurHash3 + SHA-256)
- Best of both worlds
- Recommended for production use

## Environment Variables

```bash
PORT=3000  # Server port (default: 3000)
```

## Development

```bash
# Watch mode (auto-compile on changes)
npm run watch

# Development server with hot reload
npm run dev
```

## Build Output

Build tạo ra JavaScript ES6+ code trong thư mục `dist/`:

```
dist/
├── index.js
├── services/
│   ├── FingerprintService.js
│   ├── HashService.js
│   └── ScriptService.js
└── types/
    └── murmurhash3js.d.ts
```

## Security Notes

- Không lưu trữ raw fingerprint data
- Luôn sử dụng hashed values
- Implement rate limiting trong production
- Validate client input data
- Use HTTPS trong production environment
