from .browser_factory import BrowserDriverFactory
import json

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
        if exception_error:
            status = "❌ FAIL"
            message = f"Exception: {exception_error}"
            TestResultPrinter.test_results_log.append({
                "status": status,
                "test_name": test_name,
                "message": message
            })
            if print_console:
                print(f"{status}: {test_name} - {message}")
            return

        is_pass = TestResultPrinter._determine_test_success(result_dict)
        status = "✅ PASS" if is_pass else "❌ FAIL"
        message, details = TestResultPrinter._extract_message_and_details(result_dict)

        TestResultPrinter.test_results_log.append({
            "status": status,
            "test_name": test_name,
            "message": message
        })

        if print_console:
            print(f"{status}: {test_name} - {message}")
            if not is_pass and details:
                for detail in details[:3]:  
                    print(f"   🔍 {detail}")

    @staticmethod
    def save_test_results_report(output_path="test_results_report.txt"):
        if output_path.endswith(".json"):
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(TestResultPrinter.test_results_log, f, indent=2, ensure_ascii=False)
        else:
            with open(output_path, "w", encoding="utf-8") as f:
                for entry in TestResultPrinter.test_results_log:
                    f.write(f"{entry['status']}: {entry['test_name']} - {entry['message']}\n")
        print(f"Saved test results report to {output_path}")
    
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
    
    @staticmethod
    def _extract_message_and_details(result_dict):
        def append_ids(msg, trans_id=None, device_id=None):
            parts = []
            if trans_id and str(trans_id) != 'N/A':
                parts.append(f"TransID: {trans_id}")

            if device_id and str(device_id) != 'N/A':
                parts.append(f"DeviceID: {device_id}")

            if parts:
                return f"{msg} ({', '.join(parts)})"
            
            return msg

        if "transactions_identical" in result_dict:
            trans1_id = result_dict.get('trans1_id')
            trans2_id = result_dict.get('trans2_id')

            device1_id = result_dict.get('device1_id')
            device2_id = result_dict.get('device2_id')

            is_pass = TestResultPrinter._determine_test_success(result_dict)

            msg = "PASS" if is_pass else "FAIL"
            if trans1_id or trans2_id or device1_id or device2_id:
                ids = []
                if trans1_id:
                    ids.append(f"TransID1: {trans1_id}")

                if trans2_id:
                    ids.append(f"TransID2: {trans2_id}")

                if device1_id:
                    ids.append(f"DeviceID1: {device1_id}")

                if device2_id:
                    ids.append(f"DeviceID2: {device2_id}")

                return f"{msg} ({', '.join(ids)})", []
            
            trans_id = result_dict.get('transID', None)
            device_id = result_dict.get('deviceID', None)

            return append_ids(msg, trans_id, device_id), []

        login_result = result_dict.get('login_result')

        trans_id = result_dict.get('transID', None)

        device_id = result_dict.get('deviceID', None)

        if login_result == 'SUCCESS':
            msg = "Login successful"

            return append_ids(msg, trans_id, device_id), []
        
        elif login_result == 'FAILED':
            error_msg = result_dict.get('error', 'Unknown login error')
            msg = f"Login failed: {error_msg}"

            return append_ids(msg, trans_id, device_id), []
        
        elif login_result == 'ERROR':
            error_msg = result_dict.get('error', 'Unknown test error')
            msg = f"Test error: {error_msg}"

            return append_ids(msg, trans_id, device_id), []

        is_pass = TestResultPrinter._determine_test_success(result_dict)
        msg = "PASS" if is_pass else "FAIL"
        
        return append_ids(msg, trans_id, device_id), []
    
    @staticmethod
    def print_browser_test_result(browser_name, result_dict):

        test_name = f"{browser_name} Login Test"
        
        if result_dict.get('result') == 'SUCCESS':
            print(f"✅ PASS: {test_name} - Login successful")
        elif result_dict.get('result') == 'FAILED':
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"❌ FAIL: {test_name} - Login failed: {error_msg}")
        else:
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"⚠️ ERROR: {test_name} - Test error: {error_msg}")
