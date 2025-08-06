# 🚀 Hướng dẫn chạy Test Case dễ dàng

## 🛠️ Setup ban đầu (chỉ cần làm 1 lần)

1. **Chạy setup environment:**
   ```bash
   setup_env.bat
   ```

## 🎯 Các cách chạy test dễ dàng

### 1. **Interactive Menu (Khuyến nghị cho người mới)**
```bash
run_tests.bat
```
- Menu tương tác, chọn số để chạy test
- Tự động activate virtual environment
- Hiển thị kết quả rõ ràng

### 2. **Quick Commands (Cho người có kinh nghiệm)**
```bash
quick_test.bat
```
- Các lệnh test nhanh
- Chạy test cụ thể
- Live output

### 3. **Direct Commands (Advanced)**

#### Chạy tất cả test:
```bash
pytest src/tests/ -v
```

#### Chạy test login only:
```bash
pytest src/tests/ -m login -v
```

#### Chạy test theo browser:
```bash
pytest -k "chrome" -v          # Chrome tests
pytest -k "firefox" -v         # Firefox tests  
pytest -k "edge" -v            # Edge tests
```

#### Chạy test cụ thể:
```bash
pytest src/tests/login/test_login.py::TestLogin::test_chrome_dual_login -v -s
```

#### Chạy với HTML report:
```bash
pytest src/tests/ --html=reports/report.html --self-contained-html
```

## 📊 Các tùy chọn hữu ích

### Output Options:
- `-v` : Verbose output (hiển thị chi tiết)
- `-s` : Show print statements (hiển thị print)
- `--tb=short` : Ngắn gọn traceback
- `--tb=long` : Chi tiết traceback

### Filtering Options:
- `-k "pattern"` : Chạy test theo pattern
- `-m marker` : Chạy test theo marker
- `--lf` : Chỉ chạy test failed lần trước
- `--maxfail=3` : Dừng sau 3 test fail

### Performance Options:
- `--durations=10` : Hiển thị 10 test chậm nhất
- `--timeout=300` : Timeout 5 phút cho mỗi test

## 🏷️ Test Markers có sẵn

- `@pytest.mark.login` : Test login functionality
- `@pytest.mark.fingerprint` : Test fingerprint
- `@pytest.mark.chrome` : Chrome browser tests
- `@pytest.mark.firefox` : Firefox browser tests
- `@pytest.mark.edge` : Edge browser tests
- `@pytest.mark.dual_login` : Dual login tests
- `@pytest.mark.smoke` : Smoke tests
- `@pytest.mark.slow` : Slow running tests

## 🎯 Examples thực tế

### Test một function cụ thể:
```bash
pytest src/tests/login/test_login.py::TestLogin::test_login -v -s
```

### Test tất cả dual login:
```bash
pytest -k "dual_login" -v
```

### Test với logging live:
```bash
pytest src/tests/ -v -s --log-cli-level=INFO
```

### Test Chrome browser only:
```bash
pytest -k "chrome" -v -s
```

### Chạy test và lưu report:
```bash
pytest src/tests/ --html=reports/my_report.html --self-contained-html
```

## 🔧 Troubleshooting

### Nếu có lỗi environment:
```bash
setup_env.bat
```

### Nếu có lỗi browser:
```bash
playwright install
```

### Nếu muốn clean cache:
```bash
pytest --cache-clear
```

## 💡 Tips & Tricks

1. **Development workflow:**
   ```bash
   # 1. Quick test khi develop
   pytest src/tests/login/test_login.py::TestLogin::test_login -v -s
   
   # 2. Test toàn bộ module
   pytest src/tests/login/ -v
   
   # 3. Full regression
   pytest src/tests/ -v
   ```

2. **Debug mode:**
   ```bash
   pytest src/tests/ -v -s --log-cli-level=DEBUG --tb=long
   ```

3. **Parallel execution (nếu cài pytest-xdist):**
   ```bash
   pytest src/tests/ -n auto
   ```

4. **Watch mode (nếu cài pytest-watch):**
   ```bash
   ptw src/tests/
   ```
