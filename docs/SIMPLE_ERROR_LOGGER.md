# Simple Error Logger

## 📝 Tổng Quan

ErrorLogger là một công cụ đơn giản để log errors, warnings, và info messages. Tất cả logs được tự động lưu vào `window.fpsLogs`.

## 🚀 Cách Sử Dụng

### Import

```typescript
import { ErrorLogger } from './utils/errorLogger';
```

### Log Errors

```typescript
// Log error
try {
  doSomething();
} catch (error) {
  ErrorLogger.error('Failed to do something', error, 'MyClass.method');
}

// Log warning
ErrorLogger.warn('This is deprecated', null, 'MyClass.oldMethod');

// Log info
ErrorLogger.info('Operation completed', null, 'MyClass.operation');
```

## 📊 Xem Logs

### 1. Trong Browser Console

```javascript
// Xem tất cả logs
console.log(window.fpsLogs);

// Xem chỉ errors
console.log(window.fpsLogs.filter(log => log.level === 'error'));

// Xem chỉ warnings
console.log(window.fpsLogs.filter(log => log.level === 'warn'));
```

### 2. Trên Demo Page

- Click nút **"📊 View FPS Client Logs"** để xem tất cả logs
- Logs sẽ hiển thị với summary và chi tiết

### 3. Export Logs

```javascript
// Download logs as JSON
const logsJson = JSON.stringify(window.fpsLogs, null, 2);
const blob = new Blob([logsJson], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'fps-logs.json';
a.click();
```

## 📋 Log Entry Structure

Mỗi log entry có format:

```typescript
{
  timestamp: string;      // ISO 8601 format
  level: 'error' | 'warn' | 'info';
  message: string;        // Mô tả lỗi
  context?: string;       // Nơi xảy ra lỗi (ClassName.method)
  error?: Error | any;    // Error object
}
```

## 💡 Examples

### Example 1: Basic Error Logging

```typescript
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  ErrorLogger.error('JSON parse failed', error, 'DataParser.parse');
}
```

### Example 2: Warning for Deprecated Usage

```typescript
function oldMethod() {
  ErrorLogger.warn('oldMethod is deprecated, use newMethod instead', null, 'MyClass.oldMethod');
  // ... old implementation
}
```

### Example 3: Info Logging

```typescript
async function loadData() {
  const data = await fetchData();
  ErrorLogger.info('Data loaded successfully', null, 'DataLoader.load');
  return data;
}
```

### Example 4: Enable/Disable Logging

```typescript
// Disable logging in production
if (process.env.NODE_ENV === 'production') {
  ErrorLogger.disable();
}

// Enable for debugging
if (localStorage.getItem('debug') === 'true') {
  ErrorLogger.enable();
}

// Check status
console.log('Logging enabled:', ErrorLogger.isEnabled());

// Temporarily disable
ErrorLogger.disable();
doSomethingWithoutLogging();
ErrorLogger.enable();
```

## 🎯 Best Practices

### ✅ DO:

```typescript
// 1. Always provide context
ErrorLogger.error('Failed', error, 'ClassName.methodName');

// 2. Use appropriate level
ErrorLogger.error('Critical issue');  // For errors
ErrorLogger.warn('Deprecated');       // For warnings
ErrorLogger.info('Success');          // For info

// 3. Provide clear messages
ErrorLogger.error('Failed to fetch user data from API', error, 'UserService.fetchUser');
```

### ❌ DON'T:

```typescript
// 1. Don't log sensitive data
ErrorLogger.error('Login failed', { password: userPassword }, 'Auth');  // ❌

// 2. Don't use vague messages
ErrorLogger.error('Error', error);  // ❌ Too vague

// 3. Don't log too frequently in loops
for (let i = 0; i < 1000; i++) {
  ErrorLogger.info('Processing item ' + i);  // ❌ Too many logs
}
```

## 🔧 API Reference

### `ErrorLogger.error(message, error?, context?)`

Log an error.

- **message**: Error message (string)
- **error**: Error object or details (optional)
- **context**: Where the error occurred (optional)

### `ErrorLogger.warn(message, error?, context?)`

Log a warning.

- **message**: Warning message (string)
- **error**: Additional details (optional)
- **context**: Where the warning occurred (optional)

### `ErrorLogger.info(message, error?, context?)`

Log an info message.

- **message**: Info message (string)
- **error**: Additional details (optional)
- **context**: Context information (optional)

### `ErrorLogger.getLogs()`

Get all logs.

Returns: `LogEntry[]`

### `ErrorLogger.clear()`

Clear all logs.

### `ErrorLogger.enable()`

Enable logging (default is enabled).

```typescript
ErrorLogger.enable();
```

### `ErrorLogger.disable()`

Disable logging. No logs will be recorded when disabled.

```typescript
ErrorLogger.disable();
```

### `ErrorLogger.isEnabled()`

Check if logging is currently enabled.

Returns: `boolean`

```typescript
if (ErrorLogger.isEnabled()) {
  console.log('Logging is active');
}
```

## 🌐 Access from Browser

```javascript
// View all logs
window.errorLogger

// Examples:
window.errorLogger.length                              // Total logs
window.errorLogger.filter(l => l.level === 'error')   // Only errors
window.errorLogger[window.errorLogger.length - 1]     // Last log
```

## 🎛️ Control from Browser Console

ErrorLogger được expose trực tiếp qua `window.ErrorLogger` để dễ dàng control từ browser console:

```javascript
// Disable logging
window.ErrorLogger.disable();

// Enable logging
window.ErrorLogger.enable();

// Check status
window.ErrorLogger.isEnabled();  // Returns true or false

// Get all logs
window.ErrorLogger.getLogs();

// Clear logs
window.ErrorLogger.clear();

// View logs array in window
console.log(window.errorLogger);  // Array of log entries

// Examples:
window.ErrorLogger.disable();  // Stop logging
window.ErrorLogger.enable();   // Resume logging

// Check current status
if (window.ErrorLogger.isEnabled()) {
  console.log('✅ Logging is active');
} else {
  console.log('❌ Logging is disabled');
}
```

## 📦 Integration

ErrorLogger được sử dụng trong:
- `src/client/index.ts` - Main client initialization
- `examples/basic/demo.html` - Demo page integration

Tất cả errors từ FPS Client sẽ tự động được log và hiển thị trên `window.fpsLogs`.

