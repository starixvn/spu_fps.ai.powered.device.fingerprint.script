import os
import json
import time
from datetime import datetime

import os
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
    
    def get_success_rate(self):
        total = len(self.results)
        if total == 0:
            return 0.0
        
        return (self.get_success_count() / total) * 100
    
    def save_results(self, filename=None, prefix="test_results"):
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{prefix}_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({
                    "start_time": self.start_time.isoformat(),
                    "end_time": datetime.now().isoformat(),
                    "total_tests": len(self.results),
                    "successful_tests": self.get_success_count(),
                    "failed_tests": self.get_failure_count(),
                    "success_rate": self.get_success_rate(),
                    "results": self.results
                }, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Results saved to: {filename}")

            return filename
        
        except Exception as e:
            print(f"❌ Error saving results: {str(e)}")
            return None
    
    def print_summary(self, title="TEST SUMMARY"):
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        
        total = len(self.results)
        successful = self.get_success_count()
        failed = self.get_failure_count()
        
        print(f"Total Tests: {total}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {self.get_success_rate():.1f}%")
        
        if failed > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.results:
                if "error" in result:
                    browser = result.get('browser', 'Unknown')
                    config = result.get('config', 'Unknown')
                    error = result.get('error', 'Unknown error')
                    print(f"  - {browser} - {config}: {error}")


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
            error_msg = str(e)
            print(f"❌ Error in test {config.get('name', 'Unknown')}: {error_msg}")
            self.result_manager.add_error_result(
                browser_type.upper(), 
                config.get('name', 'Unknown'), 
                error_msg
            )
        finally:
            BrowserUtils.safe_quit_driver(driver)
            time.sleep(1)  # Small delay between tests
        
        return None
    
    def execute_test_suite(self, test_configs, test_func, browser_type="chrome", headless=False):
        total_configs = len(test_configs)

        print(f"\n🚀 Starting test suite with {total_configs} configurations")
        
        for i, config in enumerate(test_configs, 1):
            print(f"\n📋 Running test {i}/{total_configs}: {config.get('name', 'Unknown')}")

            self.execute_test_with_config(test_func, browser_type, config, headless)
            
            completed = (i / total_configs) * 100
            print(f"Progress: {completed:.1f}% ({i}/{total_configs})")
    
    def get_results(self):
        return self.result_manager.results
    
    def save_results(self, filename=None):
        return self.result_manager.save_results(filename)
    
    def print_summary(self, title=None):
        self.result_manager.print_summary(title)


class TestValidator:
    
    @staticmethod
    def check_url_accessible(url, timeout=5):
        try:
            import requests
            response = requests.get(url, timeout=timeout)
            return response.status_code == 200
        except:
            return False
    
    @staticmethod
    def check_selenium_installation():
        try:
            import selenium
            return True, selenium.__version__
        except ImportError:
            return False, None
    
    @staticmethod
    def check_webdriver_availability(browser_type):
        try:
            from .browser_factory import BrowserDriverFactory
            driver = BrowserDriverFactory.create_driver(browser_type, headless=True)
            driver.quit()
            return True, None
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def validate_test_environment(test_url=None, browsers=None):
        issues = []
        
        selenium_ok, selenium_version = TestValidator.check_selenium_installation()
        if not selenium_ok:
            issues.append("Selenium not installed")
        else:
            print(f"✅ Selenium: {selenium_version}")
        
        browsers = browsers or ["chrome", "firefox", "edge"]
        for browser in browsers:
            driver_ok, error = TestValidator.check_webdriver_availability(browser)
            if driver_ok:
                print(f"✅ {browser.title()} WebDriver: Available")
            else:
                issues.append(f"{browser.title()} WebDriver: {error}")
        
        if test_url:
            url_ok = TestValidator.check_url_accessible(test_url)
            if url_ok:
                print(f"✅ Test URL accessible: {test_url}")
            else:
                issues.append(f"Test URL not accessible: {test_url}")
        
        return len(issues) == 0, issues
