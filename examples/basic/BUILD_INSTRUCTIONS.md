# 🔧 Build Instructions for Tagging Script

## Quick Start

If you're getting the error `GET http://localhost:3000/dist/client/index.js net::ERR_ABORTED 404 (Not Found)`, it means the script hasn't been built yet.

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Script
```bash
# Build only client script
npm run build:client

# Or build everything
npm run build
```

### 3. Verify Build
After building, you should see:
```
dist/
  client/
    index.js
    index.d.ts
    fingerprint/
      index.js
      modules/
        ...
```

### 4. Test the Script
Open `demo.html` in your browser and the script should load automatically.

## Troubleshooting

### Script Not Found
If the script still can't be found:

1. **Check file exists**: Look for `dist/client/index.js`
2. **Check path**: Make sure you're in the project root
3. **Check build output**: Look for any build errors
4. **Try different paths**: The test will try multiple paths automatically

### Build Errors
If you get build errors:

1. **Check TypeScript**: `npx tsc --version`
2. **Check dependencies**: `npm list`
3. **Clear cache**: `npm run clean` (if available)
4. **Reinstall**: `rm -rf node_modules && npm install`

### Alternative: Manual Script Loading
If automatic loading fails, you can manually include the script:

```html
<script src="../../dist/client/index.js"></script>
```

## File Structure
```
project-root/
├── dist/
│   └── client/
│       ├── index.js          ← Main script
│       └── fingerprint/
│           └── modules/
├── examples/
│   └── basic/
│       ├── demo.html         ← Test page
│       └── tagging-test.html ← Standalone test
└── src/
    └── client/
        └── tagging/
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build everything |
| `npm run build:client` | Build only client script |
| `npm run build:server` | Build only server script |
| `npm test` | Run tests |
| `npm run test:tagging` | Run tagging tests |

## Notes

- The script is built from TypeScript source files
- Output is in the `dist/` directory
- The test pages automatically detect and load the script
- If script is missing, build instructions will be shown
