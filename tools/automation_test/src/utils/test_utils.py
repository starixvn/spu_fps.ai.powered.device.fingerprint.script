import json
import time
from datetime import datetime
from config import ConfigManager

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


class TestExecutor:
    
    def __init__(self, test_url=None):
        self.test_url = test_url or ConfigManager.get_default_test_url("DEV")
        self.result_manager = TestResultManager()
        self.credentials = ConfigManager.get_test_credentials("login_test")

    def execute_test_with_config(self, test_func, browser_type, config, headless=False):
        from .browser_factory import BrowserDriverFactory, BrowserUtils
        
        driver = None
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless, config)
            result = test_func(driver, browser_type, config)
            
            if result:
                self.result_manager.add_result(result)
                return result
                
        except Exception as e:
            self.result_manager.add_error_result(
                browser_type.upper(), 
                config.get('name', 'Unknown'), 
                str(e)
            )
        finally:
            if driver:
                BrowserUtils.safe_quit_driver(driver)
            time.sleep(1)
        
        return None
    
    def execute_test_suite(self, test_configs, test_func, browser_type="chrome", headless=False):
        for config in test_configs:
            self.execute_test_with_config(test_func, browser_type, config, headless)
    
    def get_results(self):
        return self.result_manager.results
    
    def save_results(self, filename=None):
        return self.result_manager.save_results(filename)


class TestValidator:
    
    @staticmethod
    def check_webdriver_availability(browser_type):
        try:
            from .browser_factory import BrowserDriverFactory
            driver = BrowserDriverFactory.create_driver(browser_type, headless=True)
            driver.quit()
            return True, None
        except Exception as e:
            return False, str(e)

class TestResultPrinter:
    
    @staticmethod
    def print_test_result(test_name, login_result, exception_error=None):
       
        if exception_error:
            print(f"⚠️ ERROR: {test_name} - Exception: {exception_error}")

        elif login_result.get('login_result') == 'SUCCESS':
            print(f"✅ PASS: {test_name} - Login successful")

        elif login_result.get('login_result') == 'FAILED':
            error_msg = login_result.get('error', 'Unknown error')
            print(f"❌ FAIL: {test_name} - Login failed: {error_msg}")

        else:
            error_msg = login_result.get('error', 'Unknown error')
            print(f"⚠️ ERROR: {test_name} - Test error: {error_msg}")
    
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
