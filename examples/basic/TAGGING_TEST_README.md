# 🧪 Tagging Module Test Suite

## Tổng quan

Bộ test suite toàn diện cho Tagging Module được tích hợp vào `demo.html` để đảm bảo script chạy nhanh và thành công 100% khi integrate vào website của bên thứ 3.

## 🚀 Cách sử dụng

### 1. Mở file test
```bash
# Mở demo.html trong browser
open examples/basic/demo.html
```

### 2. Chạy test tự động
- File sẽ tự động chạy basic test khi load
- Hoặc click "Run All Tests" để chạy tất cả test

### 3. Test riêng lẻ
- **Basic Functionality**: Test chức năng cơ bản
- **Storage Methods**: Test tất cả storage methods
- **Error Handling**: Test xử lý lỗi
- **Performance**: Test hiệu suất
- **Browser Compatibility**: Test tương thích browser
- **Network Failure**: Test xử lý lỗi network
- **Stress Test**: Test với tải cao

## 📊 Các loại test

### 1. 🚀 Basic Functionality Test
- **Mục đích**: Đảm bảo tagging module hoạt động cơ bản
- **Test**: 
  - Khởi tạo tagging
  - Lấy tagging value
  - Kiểm tra session ID, timestamp, user agent
- **Kết quả mong đợi**: ✅ Thành công với thời gian < 2s

### 2. 💾 Storage Methods Test
- **Mục đích**: Test tất cả phương thức lưu trữ
- **Test**:
  - LocalStorage
  - IndexedDB
  - Cookies
  - Cache API
  - Window Name
  - ETag
- **Kết quả mong đợi**: ✅ Ít nhất 80% storage methods hoạt động

### 3. ⚠️ Error Handling Test
- **Mục đích**: Test xử lý lỗi và fallback
- **Test**:
  - Invalid data handling
  - Timeout scenarios
  - Storage disabled scenarios
- **Kết quả mong đợi**: ✅ Graceful degradation

### 4. ⚡ Performance Test
- **Mục đích**: Test hiệu suất và thời gian phản hồi
- **Test**:
  - Average response time
  - Concurrent requests
  - Memory usage
- **Kết quả mong đợi**: ✅ Average < 1s, Max < 2s

### 5. 🌐 Browser Compatibility Test
- **Mục đích**: Test tương thích browser
- **Test**:
  - Feature detection
  - Browser capabilities
  - User agent parsing
- **Kết quả mong đợi**: ✅ 80% features available

### 6. 🌍 Network Failure Test
- **Mục đích**: Test xử lý lỗi network
- **Test**:
  - Network failure simulation
  - Timeout handling
  - Retry mechanism
- **Kết quả mong đợi**: ✅ Fallback to generated value

### 7. 🔥 Stress Test
- **Mục đích**: Test với tải cao
- **Test**:
  - 50 iterations
  - Rapid requests (20 concurrent)
  - Long running test
- **Kết quả mong đợi**: ✅ > 80% success rate

## 📈 Test Statistics

Test suite cung cấp thống kê real-time:
- **Total Tests**: Tổng số test đã chạy
- **Passed**: Số test thành công
- **Failed**: Số test thất bại
- **Success Rate**: Tỷ lệ thành công (%)

## 🎯 Success Criteria

### ✅ Pass Criteria
- **Basic Functionality**: 100% success
- **Storage Methods**: ≥ 80% available
- **Error Handling**: Graceful degradation
- **Performance**: Average < 1s, Max < 2s
- **Browser Compatibility**: ≥ 80% features
- **Network Failure**: Fallback working
- **Stress Test**: ≥ 80% success rate

### ❌ Fail Criteria
- Basic functionality không hoạt động
- Performance > 2s average
- Stress test < 80% success rate
- Critical storage methods không available

## 🔧 Debug & Troubleshooting

### 1. Xem Error Logs
```javascript
// Trong browser console
console.log(window.errorLogger);
```

### 2. Debug Tagging
```javascript
// Kiểm tra tagging status
console.log(window.history.tag);
console.log(window.enabledTag);
```

### 3. Manual Testing
```javascript
// Test manual trong console
testTaggingBasic();
testTaggingStorage();
testTaggingPerformance();
```

## 📋 Test Checklist

### Pre-deployment Testing
- [ ] Chạy tất cả test cases
- [ ] Kiểm tra trên Chrome, Firefox, Safari, Edge
- [ ] Test trên mobile browser
- [ ] Test với network throttling
- [ ] Test với storage disabled
- [ ] Stress test với 100+ requests
- [ ] Performance test < 1s average

### Production Monitoring
- [ ] Monitor success rate
- [ ] Track performance metrics
- [ ] Log error patterns
- [ ] Monitor storage availability
- [ ] Check network failure handling

## 🚨 Common Issues & Solutions

### 1. Tagging không khởi tạo
**Nguyên nhân**: `window.enabledTag` không được set
**Giải pháp**: Đảm bảo set `window.enabledTag = true` trước khi load script

### 2. Storage methods fail
**Nguyên nhân**: Browser không support hoặc bị block
**Giải pháp**: Implement fallback mechanisms

### 3. Performance chậm
**Nguyên nhân**: Network timeout hoặc storage chậm
**Giải pháp**: Thêm timeout và retry mechanism

### 4. Network failure không handle
**Nguyên nhân**: Không có fallback cho network requests
**Giải pháp**: Implement graceful degradation

## 📊 Export Results

Test suite có thể export kết quả:
```javascript
// Export test results
exportTaggingResults();
```

File JSON sẽ chứa:
- Timestamp
- Test statistics
- Individual test results
- Performance metrics

## 🔄 Continuous Testing

### Automated Testing
```bash
# Chạy test automation
npm run test:automation
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Tagging Tests
  run: |
    npm install
    npm run test:automation
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra browser console logs
2. Chạy individual test cases
3. Export test results để debug
4. Check browser compatibility
5. Verify network connectivity

## 🎯 Best Practices

1. **Luôn chạy test trước khi deploy**
2. **Monitor performance metrics**
3. **Test trên nhiều browser**
4. **Kiểm tra error logs thường xuyên**
5. **Implement proper fallbacks**
6. **Document test results**

---

**Lưu ý**: Test suite này được thiết kế để đảm bảo tagging module hoạt động ổn định và hiệu quả trong mọi môi trường production.
