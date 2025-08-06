# 📝 Test Report Summary On 3 Browsers: Chrome, Firefox, Edge

---

## Init Data Statistics

| Metric | Count |
|--------|-------|
| **Total Transactions** | 3 |

### Init Device Recovery Breakdown
| Status | Count | Percentage | 
|--------|-------|------------|
| New Device (Status=1) | 3 | 100.0% |
| Recover by Tagging (Status=2) | 0 | 0.0% |
| Recover by Fingerprint (Status=3) | 0 | 0.0% |
| Empty Device (Status=0) | 0 | 0.0% |

---

### ✅ Test Cases Group 1: Keep Same Browser Session Open (Login-Logout-Login Pattern)
| # | Test Case Name | Description |
|---|----------------|-------------|
| 1 | **233595_NormalTrans_TC-001** | Verify 2 transactions on the same window device + Chrome: the same all attributes 	|
| 2 | **233595_NormalTrans_TC-002** | Verify 2 transactions on the same window device + Firefox: the same all attributes	|
| 3 | **233595_NormalTrans_TC-003** | Verify 2 transactions on the same window device + Edge: the same all attributes	|

**Group 1 Device Recovery Statistics (6 transactions):**
| Status | Count | Percentage |
|--------|-------|------------|
| New Device (Status=1) | 0 | 0.0% |
| Recover by Tagging (Status=2) | 0 | 0.0% |
| Recover by Fingerprint (Status=3) | 6 | 100.0% |
| Empty Device (Status=0) | 0 | 0.0% |

### ❌ Failed Test Cases
- _No failed test cases_
  
---

### ✅ Test Cases Group 2: Open New Browser Instance For Each Test (Fresh Session Every Time)
| # | Test Case Name | Description |
|---|----------------|-------------|
| 4 | **233595_GroupD_TC-001** | Verify transactions changing UserAgent on the same window device but different browsers: Chrome, Firefox, Edge |
| 5 | **233595_GroupD_TC-004** | Verify 2 transactions changing UserAgent on the same window device + Chrome (open browser 2 times)	 |
| 6 | **233595_GroupD_TC-005** | Verify 2 transactions changing UserAgent on the same window device + FireFox  (open browser 2 times)	 |
| 7 | **233595_GroupD_TC-020** | Verify 2 transactions changing UserAgent on the same window device + Edge  (open browser 2 times)	 |
| 8 | **233595_GroupD_TC-089** | Verify transactions changing Plugins on the same window device but different browsers: Chrome, Firefox, Edge	 |
| 9 | **233595_GroupD_TC-167** | Verify transactions changing PdfViewerEnabled on the same window device but different browsers: Chrome, Firefox, Edge	 |
| 10 | **233595_GroupE_TC-001** | Verify transactions changing Languages on the same window device but different browsers: Chrome, Firefox, Edge	 |
| 11 | **233595_GroupE_TC-054** | Verify transactions changing Timezone on the same window device but different browsers: Chrome, Firefox, Edge	 |
| 12 | **233595_GroupB_TC-044** | Verify transactions changing ScreenFrame on the same window device but different browsers: Chrome, Firefox, Edge	 |

**Group 2 Device Recovery Statistics (30 transactions):**
| Status | Count | Percentage |
|--------|-------|------------|
| New Device (Status=1) | 28 | 93.33% |
| Recover by Tagging (Status=2) | 0 | 0.0% |
| Recover by Fingerprint (Status=3) | 2 | 6.67% |
| Empty Device (Status=0) | 0 | 0.0% |

### ❌ Failed Test Cases
- _No failed test cases_

---

## 📊 Overall Test Execution Summary

### Combined Device Recovery Statistics (All 36 transactions)
| Status | Count | Percentage |
|--------|-------|------------|
| New Device (Status=1) | 28 | 77.78% |
| Recover by Tagging (Status=2) | 0 | 0.0% |
| Recover by Fingerprint (Status=3) | 8 | 22.22% |
| Empty Device (Status=0) | 0 | 0.0% |

**💡 Overall Device Recovery Success Rate: 22.22% (8/36 transactions recovered existing devices)**

### Key Insights:
- **Group 1 (With Cookies)**: 100.0% recovery rate (6/6 via fingerprinting only)
- **Group 2 (New Cookies)**: 6.67% recovery rate (2/30 via fingerprinting only)
- Cookies dramatically improve fingerprinting performance (100% vs 6.67%)

---

