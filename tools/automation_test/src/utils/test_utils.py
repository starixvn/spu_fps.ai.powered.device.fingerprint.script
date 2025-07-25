import json
import time
from datetime import datetime
from config import ConfigManager
from .browser_factory import BrowserDriverFactory, BrowserUtils
class TestResultManager:
    
    def __init__(self):
        self.results = []
        self.start_time = datetime.now()
    
    def add_result(self, result):
        if isinstance(result, dict):
            result["timestamp"] = datetime.now().isoformat()
        self.results.append(result)
    
    def add_error_result(self, browser, config, error):
        self.results.append({
            "browser": browser,
            "config": config,
            "error": str(error),
            "timestamp": datetime.now().isoformat()
        })
    
    def get_success_count(self):
        return len([r for r in self.results if "error" not in r])
    
    def get_failure_count(self):
        return len([r for r in self.results if "error" in r])
    
    def save_results(self, filename=None):
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_results_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    "start_time": self.start_time.isoformat(),
                    "end_time": datetime.now().isoformat(),
                    "total_tests": len(self.results),
                    "successful_tests": self.get_success_count(),
                    "failed_tests": self.get_failure_count(),
                    "results": self.results
                }, f, indent=2, ensure_ascii=False)
            return filename
        except Exception:
            return None

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
    
    @staticmethod
    def print_test_result(test_name, result_dict, exception_error=None):

        if exception_error:
            print(f"⚠️ ERROR: {test_name} - Exception: {exception_error}")
            return

        # Handle verification results (UA verification, transaction verification, etc.)
        if "ua_match" in result_dict:
            has_trans = result_dict.get('has_transactions', False)
            ua_match = result_dict.get('ua_match', False)
            
            if not has_trans:
                print(f"⚠️ WARN: {test_name} - No transactions found")
            elif ua_match:
                print(f"✅ PASS: {test_name} - User Agent verification successful")
            else:
                expected = result_dict.get('expected_ua', 'N/A')[:50] + "..."
                actual = result_dict.get('actual_ua', 'N/A')[:50] + "..."
                print(f"❌ FAIL: {test_name} - User Agent mismatch")
                print(f"   Expected: {expected}")
                print(f"   Actual:   {actual}")
            return

        # Handle attribute verification results (new)
        if "attribute_match" in result_dict:
            has_trans = result_dict.get('has_transactions', False)
            attr_match = result_dict.get('attribute_match', False)
            attr_name = result_dict.get('attribute_name', 'Unknown')
            
            if not has_trans:
                print(f"⚠️ WARN: {test_name} - No transactions found")
            elif attr_match:
                print(f"✅ PASS: {test_name} - {attr_name} verification successful")
            else:
                expected = str(result_dict.get('expected_value', 'N/A'))
                actual = str(result_dict.get('actual_value', 'N/A'))
                print(f"❌ FAIL: {test_name} - {attr_name} mismatch")
                print(f"   Expected: {expected}")
                print(f"   Actual:   {actual}")
            return

        # Handle login results
        login_result = result_dict.get('login_result')
        if login_result == 'SUCCESS':
            print(f"✅ PASS: {test_name} - Login successful")

        elif login_result == 'FAILED':
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"❌ FAIL: {test_name} - Login failed: {error_msg}")

        elif login_result == 'ERROR':
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"⚠️ ERROR: {test_name} - Test error: {error_msg}")

        else:
            message = result_dict.get('message', 'Unknown result')
            print(f"ℹ️ INFO: {test_name} - {message}")
    
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
