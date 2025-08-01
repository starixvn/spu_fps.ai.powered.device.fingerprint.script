# 📝 Test Report Summary

## 📊 Overall Statistics

- **Test Cases (Unique LoginNames):** 10
- **Total Transactions:** 36
- **Unique DeviceIDs:** 30
- **Test Cases PASS:** 8
- **Test Cases FAIL:** 2

## ✅ Passed Test Cases

- **CP24029-AIDA_login_tc001_chrome** ✅
- **CP24029-AIDA_login_tc002_firefox** ✅
- **CP24029-AIDA_gd_tc001_test** ✅
- **CP24029-AIDA_gd_tc078_test** ✅
- **CP24029-AIDA_gd_tc156_test** ✅
- **CP24029-AIDA_ge_tc001_windows_test** ✅
- **CP24029-AIDA_ge_tc054_win** ✅
- **CP24029-AIDA_gb_tc044_windows_test** ✅

## ❌ Failed Test Cases

- **CP24029-AIDA_login_tc003_edge** ❌ 
- **CP24029-AIDA_gd_tc004-6_test** ❌ 

## 🔄 Device Recovery Statistics

- **New Device (Status=1):** 3 transactions
- **Recover by Tagging (Status=2):** 0 transactions
- **Recover by Fingerprint (Status=3):** 33 transactions

## 🌐 Browser Statistics

| Browser | Test Cases | Transactions | Unique Devices |
|---------|------------|--------------|----------------|
| Chrome | 6 | 13 | 9 |
| Firefox | 6 | 10 | 9 |
| Edge | 7 | 12 | 11 |
| HeadlessChrome | 1 | 1 | 1 |

## 💻 Operating System Distribution

| OS | Count |
|----|----- |
| Windows | 36 |

## 👥 Subscriber Distribution

| Subscriber | Count |
|------------|----- |
| Alpha | 36 |

## 🏆 Top 5 Most Common DeviceIDs

| DeviceID | Count |
|----------|-------|
| 1524 | 2 |
| 1525 | 2 |
| 1526 | 2 |
| 1515 | 2 |
| 1503 | 2 |

## 🧪 Attributes

- **OS**: Windows
- **Browser**: Chrome, Edge, Firefox, HeadlessChrome
- **Language**: [["ja-JP"],["ja-JP"]], [["ja-JP"]], [["vi-VN"],["vi-VN"]], [["vi-VN"]], [["zh-CN"],["zh-CN"]], [["zh-CN"]]
- **TimeZone**: "America/New_York", "Asia/Bangkok", "Asia/Saigon"
- **UserAgent**: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.6099.28 Safari/537.36, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0
- **Plugins**: [], [{"name":"Chrome PDF Plugin","description":"Portable Document Format","mimeTypes":[]}], [{"name":"Microsoft Edge PDF","description":"Portable Document Format","mimeTypes":[]}], [{"name":"OpenH264 Video Codec provided by Cisco Systems, Inc.","description":"OpenH264 Video Codec provided by Cisco Systems, Inc.","mimeTypes":[]}], [{"name":"PDF Viewer","description":"Portable Document Format","mimeTypes":[{"type":"application/pdf","suffixes":"pdf"},{"type":"text/pdf","suffixes":"pdf"}]},{"name":"Chrome PDF Viewer","description":"Portable Document Format","mimeTypes":[{"type":"application/pdf","suffixes":"pdf"},{"type":"text/pdf","suffixes":"pdf"}]},{"name":"Chromium PDF Viewer","description":"Portable Document Format","mimeTypes":[{"type":"application/pdf","suffixes":"pdf"},{"type":"text/pdf","suffixes":"pdf"}]},{"name":"Microsoft Edge PDF Viewer","description":"Portable Document Format","mimeTypes":[{"type":"application/pdf","suffixes":"pdf"},{"type":"text/pdf","suffixes":"pdf"}]},{"name":"WebKit built-in PDF","description":"Portable Document Format","mimeTypes":[{"type":"application/pdf","suffixes":"pdf"},{"type":"text/pdf","suffixes":"pdf"}]}]
- **screenframe**: [0,0,0,0], [0,0,40,0]
- **pdfViewerEnabled**: false, true

## 📋 Sample Test Cases

| TransactionID | DeviceID | Status Test | LoginName | OS | Browser | Language | TimeZone | UserAgent |
|---------------|----------|-------------|-----------|----|---------|----------|----------|----------|
| 22932812 | 1524 | PASS | CP24029-AIDA_login_tc001_chrome | Windows | Chrome | [["vi-VN"]] | "Asia/Saigon" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932811 | 1524 | PASS | CP24029-AIDA_login_tc001_chrome | Windows | Chrome | [["vi-VN"]] | "Asia/Saigon" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932814 | 1525 | PASS | CP24029-AIDA_login_tc002_firefox | Windows | Firefox | [["vi-VN"],["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932813 | 1525 | PASS | CP24029-AIDA_login_tc002_firefox | Windows | Firefox | [["vi-VN"],["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932816 | 1526 | FAIL | CP24029-AIDA_login_tc003_edge | Windows | Edge | [["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932815 | 1526 | FAIL | CP24029-AIDA_login_tc003_edge | Windows | Edge | [["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932817 | 1559 | PASS | CP24029-AIDA_gd_tc001_test | Windows | Firefox | [["vi-VN"]] | "Asia/Saigon" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932819 | 1560 | PASS | CP24029-AIDA_gd_tc001_test | Windows | Edge | [["vi-VN"]] | "Asia/Saigon" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932820 | 1561 | PASS | CP24029-AIDA_gd_tc001_test | Windows | Firefox | [["vi-VN"],["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |
| 22932821 | 1562 | PASS | CP24029-AIDA_gd_tc001_test | Windows | Edge | [["vi-VN"],["vi-VN"]] | "Asia/Bangkok" | Mozilla/5.0 (Windows NT 10.0; ... |