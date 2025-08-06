import csv
from collections import Counter

class TestResultPrinter:
    test_results_log = []
    
    @staticmethod
    def print_test_result(test_name, result_dict, exception_error=None, print_console=True):
        """Print and log test results for single or dual transactions"""
        
        if exception_error:
            TestResultPrinter._log_exception(test_name, exception_error, print_console)
            return

        if "transactions_identical" in result_dict:
            TestResultPrinter._log_dual_transactions(test_name, result_dict, print_console)
            return

        transaction = result_dict.get('transaction')
        if transaction:
            TestResultPrinter._log_single_transaction(test_name, transaction, result_dict, print_console)

    @staticmethod
    def _extract_transaction_fields(transaction, status):
        """Extract fields from transaction dict"""
        if not isinstance(transaction, dict):
            return {}
        
        attr = transaction.get('attributes', {})
        return {
            "TransactionID": transaction.get('transID') or transaction.get('transaction'),
            "DeviceID": transaction.get('deviceID'),
            "DeviceStatus": transaction.get('deviceStatus'),
            "Status Test": status,
            "TransTime": transaction.get('transTime'),
            "LoginName": transaction.get('loginName'),
            "Action": transaction.get('action'),
            "Subscriber": transaction.get('subscriberName') or transaction.get('subscriberID'),
            "IP": transaction.get('ip'),
            "Flagged": transaction.get('flagged'),
            "OS": transaction.get('osName'),
            "Browser": transaction.get('browserName'),
            "Language": attr.get('languages'),
            "TimeZone": attr.get('timezone'),
            "UserAgent": transaction.get('userAgent'),
            "Plugins": attr.get('plugins'),
            "screenframe": attr.get('screenFrame'),
            "pdfViewerEnabled": attr.get('pdfViewerEnabled'),
        }

    @staticmethod
    def _log_exception(test_name, exception_error, print_console):
        """Log exception as failed test case"""
        empty_record = {
            "TransactionID": '', "DeviceID": '', "DeviceStatus": '', "Status Test": "FAIL",
            "TransTime": '', "LoginName": test_name, "Action": '', "Subscriber": '',
            "IP": '', "Flagged": '', "OS": '', "Browser": '', "Language": '',
            "TimeZone": '', "UserAgent": '', "Plugins": '', "screenframe": '', "pdfViewerEnabled": ''
        }
        TestResultPrinter.test_results_log.append(empty_record)
        if print_console:
            print(f"❌ FAIL: {test_name} - Exception: {exception_error}")

    @staticmethod
    def _log_dual_transactions(test_name, result_dict, print_console):
        """Log dual transaction results"""
        is_pass = TestResultPrinter._determine_test_success(result_dict)
        status = "PASS" if is_pass else "FAIL"
        
        for idx in [1, 2]:
            transaction = result_dict.get(f'transaction{idx}', {})
            if transaction:
                row = TestResultPrinter._extract_transaction_fields(transaction, status)
                TestResultPrinter.test_results_log.append(row)
                if print_console:
                    print(f"{'✅' if is_pass else '❌'} {status}: {test_name} - transaction: {row.get('TransactionID')}, DeviceID: {row.get('DeviceID')}")

    @staticmethod
    def _log_single_transaction(test_name, transaction, result_dict, print_console):
        """Log single transaction result"""
        is_pass = TestResultPrinter._determine_test_success(result_dict)
        status = "PASS" if is_pass else "FAIL"
        row = TestResultPrinter._extract_transaction_fields(transaction, status)
        TestResultPrinter.test_results_log.append(row)
        if print_console:
            print(f"{'✅' if is_pass else '❌'} {status}: {test_name} - transaction: {row.get('TransactionID')}, DeviceID: {row.get('DeviceID')}")

    @staticmethod
    def save_test_results_report(output_path="test_results_report.csv"):
        """Save CSV and markdown reports"""
        TestResultPrinter._save_csv_report(output_path)
        TestResultPrinter._save_markdown_report(output_path)

    @staticmethod  
    def _save_csv_report(output_path):
        """Save test results to CSV file"""
        fieldnames = [
            "TransactionID", "DeviceID", "DeviceStatus", "Status Test", "TransTime", "LoginName", 
            "Action", "Subscriber", "IP", "Flagged", "OS", "Browser", "Language", "TimeZone", 
            "UserAgent", "Plugins", "screenframe", "pdfViewerEnabled"
        ]

        with open(output_path, "w", encoding="utf-8", newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for entry in TestResultPrinter.test_results_log:
                writer.writerow({k: entry.get(k, '') for k in fieldnames})
        print(f"Saved test results report to {output_path}")

    @staticmethod
    def _save_markdown_report(output_path):
        """Generate and save markdown summary report"""
        stats = TestResultPrinter._calculate_statistics()
        
        md_lines = [
            "# 📝 Test Report Summary",
            "",
            "## 📊 Overall Statistics", 
            "",
            f"- **Test Cases (Unique LoginNames):** {stats['num_test_cases']}",
            f"- **Total Transactions:** {stats['total_transactions']}",
            f"- **Unique DeviceIDs:** {stats['num_unique_devices']}",
            f"- **Test Cases PASS:** {stats['num_test_case_pass']}",
            f"- **Test Cases FAIL:** {stats['num_test_case_fail']}",
            "",
            "## ✅ Passed Test Cases",
            "",
        ]
        
        if stats['passed_test_cases']:
            for login_name in stats['passed_test_cases']:
                md_lines.append(f"- **{login_name}** ✅")
        else:
            md_lines.append("- _No passed test cases_")
        
        md_lines += ["", "## ❌ Failed Test Cases", ""]
        
        if stats['failed_test_cases']:
            for login_name in stats['failed_test_cases']:
                login_trans = [e for e in TestResultPrinter.test_results_log if e.get("LoginName") == login_name]
                pass_count = sum(1 for e in login_trans if e.get("Status Test") == "PASS")
                fail_count = sum(1 for e in login_trans if e.get("Status Test") == "FAIL")
                md_lines.append(f"- **{login_name}** ❌ ({pass_count} PASS, {fail_count} FAIL)")
        else:
            md_lines.append("- _No failed test cases_")
        
        md_lines += [
            "",
            "## 🔄 Device Recovery Statistics",
            "",
            f"- **New Device (Status=1):** {stats['device_status_stats']['1']} transactions",
            f"- **Recover by Tagging (Status=2):** {stats['device_status_stats']['2']} transactions",
            f"- **Recover by Fingerprint (Status=3):** {stats['device_status_stats']['3']} transactions",
            "",
            "## 🌐 Browser Statistics",
            "",
            "| Browser | Test Cases | Transactions | Unique Devices |",
            "|---------|------------|--------------|----------------|"
        ]
        
        for browser, browser_stats in stats['browser_stats'].items():
            if browser != "Unknown" and browser_stats["transactions"] > 0:
                md_lines.append(f"| {browser} | {len(browser_stats['test_cases'])} | {browser_stats['transactions']} | {len(browser_stats['devices'])} |")
        
        md_lines += [
            "",
            "## 📋 Sample Test Cases",
            "",
            "| TransactionID | DeviceID | Status Test | LoginName | OS | Browser | Language | TimeZone | UserAgent |",
            "|---------------|----------|-------------|-----------|----|---------|----------|----------|----------|"
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
    def _calculate_statistics():
        """Calculate comprehensive test statistics"""
        total_transactions = len(TestResultPrinter.test_results_log)
        
        # Test case statistics (based on LoginName)
        unique_login_names = {entry.get("LoginName", "") for entry in TestResultPrinter.test_results_log if entry.get("LoginName")}
        
        test_case_results = {}
        for entry in TestResultPrinter.test_results_log:
            login_name = entry.get("LoginName", "")
            status = entry.get("Status Test", "")
            if login_name:
                test_case_results.setdefault(login_name, []).append(status)
        
        passed_test_cases = [name for name, statuses in test_case_results.items() if all(s == "PASS" for s in statuses)]
        failed_test_cases = [name for name, statuses in test_case_results.items() if not all(s == "PASS" for s in statuses)]
        
        # Device statistics
        device_ids = [entry.get("DeviceID", "") for entry in TestResultPrinter.test_results_log if entry.get("DeviceID")]
        unique_devices = set(device_ids)
        
        # Device recovery statistics
        device_status_stats = {"1": 0, "2": 0, "3": 0}
        for entry in TestResultPrinter.test_results_log:
            status = str(entry.get("DeviceStatus", ""))
            if status in device_status_stats:
                device_status_stats[status] += 1
        
        # Browser statistics
        browser_stats = {}
        for entry in TestResultPrinter.test_results_log:
            browser = entry.get("Browser", "Unknown")
            if browser not in browser_stats:
                browser_stats[browser] = {"transactions": 0, "devices": set(), "test_cases": set()}
            browser_stats[browser]["transactions"] += 1
            if entry.get("DeviceID"):
                browser_stats[browser]["devices"].add(entry.get("DeviceID"))
            if entry.get("LoginName"):
                browser_stats[browser]["test_cases"].add(entry.get("LoginName"))
        
        return {
            'total_transactions': total_transactions,
            'num_test_cases': len(unique_login_names),
            'num_unique_devices': len(unique_devices),
            'num_test_case_pass': len(passed_test_cases),
            'num_test_case_fail': len(failed_test_cases),
            'passed_test_cases': passed_test_cases,
            'failed_test_cases': failed_test_cases,
            'device_status_stats': device_status_stats,
            'browser_stats': browser_stats
        }

    @staticmethod
    def _determine_test_success(result_dict):
        """Determine if test is successful based on result dictionary"""
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
