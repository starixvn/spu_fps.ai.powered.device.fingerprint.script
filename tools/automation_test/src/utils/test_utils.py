from .browser_factory import BrowserDriverFactory
import csv
from collections import Counter

class TestValidator:
    
    @staticmethod
    def check_webdriver_availability(browser_type):
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless=True)
            driver.quit()

            return True, None
        
        except Exception as e:
            return False, str(e)

class TestResultPrinter:
    test_results_log = []
    
    @staticmethod
    def print_test_result(test_name, result_dict, exception_error=None, print_console=True):
        def extract_fields(t, status):
            # t: transaction dict
            if not isinstance(t, dict):
                return {}
            attr = t.get('attributes', {})
            return {
                "TransactionID": t.get('transID') or t.get('transaction'),
                "DeviceID": t.get('deviceID'),
                "DeviceStatus": t.get('deviceStatus'),
                "Status Test": status,
                "TransTime": t.get('transTime'),
                "LoginName": t.get('loginName'),
                "Action": t.get('action'),
                "Subscriber": t.get('subscriberName') or t.get('subscriberID'),
                "IP": t.get('ip'),
                "Flagged": t.get('flagged'),
                "OS": t.get('osName'),
                "Browser": t.get('browserName'),
                "Language": attr.get('languages'),
                "TimeZone": attr.get('timezone'),
                "UserAgent": t.get('userAgent'),
                "Plugins": attr.get('plugins'),
                "screenframe": attr.get('screenFrame'),
                "pdfViewerEnabled": attr.get('pdfViewerEnabled'),
            }

        if exception_error:
            status = "FAIL"
            TestResultPrinter.test_results_log.append({
                "TransactionID": '',
                "DeviceID": '',
                "DeviceStatus": '',
                "Status Test": status,
                "TransTime": '',
                "LoginName": test_name,
                "Action": '',
                "Subscriber": '',
                "IP": '',
                "Flagged": '',
                "OS": '',
                "Browser": '',
                "Language": '',
                "TimeZone": '',
                "UserAgent": '',
                "Plugins": '',
                "screenframe": '',
                "pdfViewerEnabled": '',
            })
            if print_console:
                print(f"❌ FAIL: {test_name} - Exception: {exception_error}")
            return

        if "transactions_identical" in result_dict:
            is_pass = TestResultPrinter._determine_test_success(result_dict)
            status = "PASS" if is_pass else "FAIL"
            for idx in [1, 2]:
                t = result_dict.get(f'transaction{idx}', {})
                if not t:
                    continue
                row = extract_fields(t, status)
                TestResultPrinter.test_results_log.append(row)
                if print_console:
                    print(f"{'✅' if is_pass else '❌'} {status}: {test_name} - transaction: {row.get('TransactionID')}, DeviceID: {row.get('DeviceID')}")
            return

        transaction = result_dict.get('transaction')
        if not transaction:
            return
        is_pass = TestResultPrinter._determine_test_success(result_dict)
        status = "PASS" if is_pass else "FAIL"
        row = extract_fields(transaction, status)
        TestResultPrinter.test_results_log.append(row)
        if print_console:
            print(f"{'✅' if is_pass else '❌'} {status}: {test_name} - transaction: {row.get('TransactionID')}, DeviceID: {row.get('DeviceID')}")

    @staticmethod
    def save_test_results_report(output_path="test_results_report.csv"):

        fieldnames = [
            "TransactionID", "DeviceID", "DeviceStatus", "Status Test", "TransTime", "LoginName", "Action", "Subscriber", "IP", "Flagged", "OS", "Browser", "Language", "TimeZone", "UserAgent", "Plugins", "screenframe", "pdfViewerEnabled"
        ]

        with open(output_path, "w", encoding="utf-8", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for entry in TestResultPrinter.test_results_log:
                writer.writerow({k: entry.get(k, '') for k in fieldnames})
        print(f"Saved test results report to {output_path}")

        total_cases = len(TestResultPrinter.test_results_log)
        device_ids = [entry.get("DeviceID", "") for entry in TestResultPrinter.test_results_log if entry.get("DeviceID")]
        unique_devices = set(device_ids)
        num_unique_devices = len(unique_devices)
        num_pass = sum(1 for entry in TestResultPrinter.test_results_log if entry.get("Status Test") == "PASS")
        num_fail = sum(1 for entry in TestResultPrinter.test_results_log if entry.get("Status Test") == "FAIL")
       
        tested_values = {}
        for key in ["OS", "Browser", "Language", "TimeZone", "UserAgent", "Plugins", "screenframe", "pdfViewerEnabled"]:
            vals = [str(entry.get(key, "")) for entry in TestResultPrinter.test_results_log if entry.get(key, "") not in [None, ""]]
            if vals:
                tested_values[key] = sorted(set(vals))

        # Top 5 most common DeviceIDs (optional)
        device_counter = Counter(device_ids)
        top_devices = device_counter.most_common(5)

        md_lines = [
            "# 📝 Test Report Summary",
            "",
            "## 📊 Statistics",
            "",
            f"- **Total test cases:** {total_cases}",
            f"- **Unique DeviceIDs:** {num_unique_devices}",
            f"- **Number of PASS:** {num_pass}",
            f"- **Number of FAIL:** {num_fail}",
            "",
            "## 🏆 Top 5 Most Common DeviceIDs",
            "",
            "| DeviceID | Count |",
            "|----------|-------|",
        ]
        for dev, count in top_devices:
            md_lines.append(f"| {dev} | {count} |")
        if not top_devices:
            md_lines.append("| _No data_ | 0 |")

        md_lines += [
            "",
            "## 🧪 Tested Values",
            "",
        ]
        for k, v in tested_values.items():
            md_lines.append(f"- **{k}**: {', '.join(v)}")

        # Optional: show a sample of test cases
        md_lines += [
            "",
            "## 📋 Sample Test Cases",
            "",
            "| TransactionID | DeviceID | Status Test | LoginName | OS | Browser | Language | TimeZone | UserAgent |",
            "|---------------|----------|-------------|-----------|----|---------|----------|----------|----------|",
        ]
        for entry in TestResultPrinter.test_results_log[:10]:
            md_lines.append(
                f"| {entry.get('TransactionID','')} | {entry.get('DeviceID','')} | {entry.get('Status Test','')} | {entry.get('LoginName','')} | {entry.get('OS','')} | {entry.get('Browser','')} | {entry.get('Language','')} | {entry.get('TimeZone','')} | {str(entry.get('UserAgent',''))[:30]}... |"
            )
        if not TestResultPrinter.test_results_log:
            md_lines.append("| _No data_ | | | | | | | | | |")

        md_path = output_path.replace(".csv", "_README_report.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write("\n".join(md_lines))
        print(f"Saved markdown summary report to {md_path}")
    
    @staticmethod
    def _determine_test_success(result_dict):
        
        if result_dict.get('login_result') == 'SUCCESS':
            return True
        if result_dict.get('result') == 'SUCCESS':
            return True
        if result_dict.get('overall_success') is True:
            return True
        
        if "verification_results" in result_dict:
            return result_dict.get('overall_success', False)
        
        if "transactions_identical" in result_dict:
            identical = result_dict.get('transactions_identical', False)
            if result_dict.get('test_type') == 'dual_tabs':
                return result_dict.get('dual_tabs_success', False)
            return identical
        
        if "dual_tabs_success" in result_dict:
            return result_dict.get('dual_tabs_success', False)
        
        if result_dict.get('login_result') in ['FAILED', 'ERROR']:
            return False
        if result_dict.get('result') in ['FAILED', 'ERROR']:
            return False
        if "error" in result_dict and result_dict.get('error'):
            return False
        
        return not bool(result_dict.get('error'))
