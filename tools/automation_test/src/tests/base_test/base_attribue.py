import os
import time
import platform
import json
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from utils.browser_factory import BrowserDriverFactory, BrowserUtils
from utils.test_utils import TestResultPrinter
from utils.login_helper import TestLoginHelper
from utils.transaction_verifier import TransactionVerifier
from config import ConfigManager

load_dotenv()

def get_browsers_by_os(os_type):
    browsers_mapping = {
        'windows': ["chrome", "firefox", "edge"],
        'macos': ["chrome", "firefox", "edge", "safari"],
        'linux': ["chrome", "firefox", "chromium"]
    }
    return browsers_mapping.get(os_type, ["chrome", "firefox", "edge"])  

def detect_current_os():
    system = platform.system().lower()
    
    if system == "windows":
        return "windows"
    elif system == "darwin":
        return "macos"
    elif system == "linux":
        return "linux"
    else:
        return "windows"


class BaseAttributeTest(ABC):
    
    def __init__(self, credentials_key):
        env = os.getenv("ENVIRONMENT", "DEV")
        
        self.test_url = ConfigManager.get_default_login_url(env)
        self.credentials = ConfigManager.get_test_credentials(credentials_key)
        
        self.api_config = ConfigManager.get_api_config(env)
        self.transaction_verifier = TransactionVerifier(self.api_config["base_url"])
    
    @abstractmethod
    def get_test_configs(self):
        pass
    
    @abstractmethod  
    def get_test_browsers(self):
        pass
    
    def get_browser_display_name(self, browser_type):
        browser_names = {
            "chrome": "Chrome",
            "firefox": "Firefox", 
            "edge": "Edge",
            "safari": "Safari",
            "chromium": "Chromium"
        }
        return browser_names.get(browser_type.lower(), browser_type.title())
    
    def get_platform_from_ua(self, user_agent):
        if "Windows" in user_agent:
            return "\"Win32\""
        elif "Macintosh" in user_agent or "Mac OS" in user_agent:
            return "\"MacIntel\""
        elif "Linux" in user_agent or "X11" in user_agent:
            return "\"Linux x86_64\""
        else:
            return "\"Win32\""
    
    def get_vendor_from_browser(self, browser_type):
        vendors = {
            "chrome": "\"Google Inc.\"",
            "firefox": "\"\"",
            "edge": "\"Microsoft Corporation\"",
            "safari": "\"Apple Computer, Inc.\"",
            "chromium": "\"Google Inc.\""
        }
        return vendors.get(browser_type.lower(), "\"\"")
    
    def test_single_browser_attribute_combination(self, browser_type, test_config, headless=True, is_verification=True):
        driver = None
        test_name = f"{browser_type.upper()}-{test_config['name']}"
        
        try:
            browser_config = self._prepare_browser_config(test_config)
            driver = BrowserDriverFactory.create_driver(browser_type, headless, browser_config)
            
            login_result = TestLoginHelper.perform_login_with_attributes(
                driver, self.test_url, self.credentials
            )
            TestResultPrinter.print_test_result(test_name, login_result)
            
            if login_result.get("login_result") == "SUCCESS" and is_verification:
                time.sleep(10)
                self.verify_transaction_attributes(test_name, browser_type, test_config)
                
        except Exception as e:
            TestResultPrinter.print_test_result(test_name, {}, str(e))

        finally:
            if driver is not None:
                BrowserUtils.safe_quit_driver(driver)
    
    def _prepare_browser_config(self, test_config):
        browser_config = {}
        
        if "user_agent" in test_config:
            browser_config["user_agent"] = test_config["user_agent"]
        
        if "language" in test_config:
            browser_config["language"] = test_config["language"]
            
        if "timezone" in test_config:
            browser_config["timezone"] = test_config["timezone"]
            
        if "expected_os" in test_config:
            browser_config["expected_os"] = test_config["expected_os"]
            
        if "expected_platform" in test_config:
            browser_config["expected_platform"] = test_config["expected_platform"]
            
        if "plugins" in test_config:
            browser_config["plugins"] = test_config["plugins"]
            
        return browser_config
    
    def verify_transaction_attributes(self, test_name, browser_type, test_config):
        login_name = self.credentials['username']
        
        expected_transaction_data = {
            "subscriberID": self.api_config["subscriber_id"],
            "loginName": login_name,
            "url": self.test_url
        }
        
        if "user_agent" in test_config:
            expected_transaction_data["userAgent"] = test_config["user_agent"]
        
        attributes = {}
        
        if "user_agent" in test_config:
            if "expected_platform" not in test_config:
                attributes["platform"] = self.get_platform_from_ua(test_config["user_agent"])
            attributes["vendor"] = self.get_vendor_from_browser(browser_type)
        
        if "language" in test_config:
            attributes["language"] = f'"{test_config["language"]}"'
            
        if "timezone" in test_config:
            attributes["timezone"] = f'"{test_config["timezone"]}"'
            
        if "expected_os" in test_config:
            attributes["osname"] = f'"{test_config["expected_os"]}"'
            
        if "expected_platform" in test_config:
            attributes["platform"] = f'"{test_config["expected_platform"]}"'
            
        if "plugins" in test_config:
            attributes["plugins"] = json.dumps(test_config["plugins"])
        
        attributes.update({
            "cookiesEnabled": "true",
            "localStorage": "true",
            "sessionStorage": "true"
        })
        
        if attributes:
            expected_transaction_data["attributes"] = attributes
        
        self.transaction_verifier.verify_complete_transaction(
            test_name,
            expected_transaction_data,
            max_retries=3,
            retry_delay=5,
            batch_size=10
        )
    
    def run_single_browser_test(self, browser_type, headless=True):
        test_configs = self.get_test_configs()
        
        for i, test_config in enumerate(test_configs, 1):
            try:
                self.test_single_browser_attribute_combination(browser_type, test_config, headless)
                
                if i < len(test_configs):
                    time.sleep(3)
                    
            except Exception as e:
                print(f"Error in {browser_type} test {i}: {e}")
                continue
    
    def run_cross_browser_test(self, headless=True):
        browsers = self.get_test_browsers()
        
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                self.run_single_browser_test(browser_type, headless)
                
                if browser_idx < len(browsers):
                    time.sleep(5)
                    
            except Exception as e:
                print(f"Error in {browser_type} browser test: {e}")
                continue
    
    def get_ua_configs(self):
        return self.get_test_configs()
    
    def test_single_browser_ua_combination(self, browser_type, ua_config, headless=True, is_verification=True):
        return self.test_single_browser_attribute_combination(browser_type, ua_config, headless, is_verification)
    
    def run_dual_session_test(self, headless=False, session_delay=15):
        browsers = self.get_test_browsers()
        
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                browser_configs = self.get_browser_dual_configs(browser_type)
                
                if not browser_configs:
                    print(f"No configurations found for {browser_type}")
                    continue
                
                session_results = []
                
                for session_num, test_config in enumerate(browser_configs, 1):
                    try:
                        test_name = f"{browser_type.upper()}-{test_config['name']}"
                        self.test_single_browser_attribute_combination(browser_type, test_config, headless, is_verification=False)
                        session_results.append((test_name, browser_type, test_config))
                        
                        if session_num < len(browser_configs):
                            time.sleep(session_delay)
                            
                    except Exception as e:
                        print(f"Error in session {session_num} with config {test_config['name']}: {e}")
                        continue

                if len(session_results) == 2:
                    self.verify_dual_session_transactions(session_results, browser_type)
                
                if browser_idx < len(browsers):
                    time.sleep(10)
                    
            except Exception as e:
                print(f"Error in {browser_type} dual session test: {e}")
                continue
    
    def get_browser_dual_configs(self, browser_type):
        all_configs = self.get_test_configs()
        browser_configs = []
        
        for config in all_configs:
            if browser_type.lower() in config.get('name', '').lower():
                browser_configs.append(config)
        
        return browser_configs
    
    def verify_dual_session_transactions(self, session_results, browser_type):
        if len(session_results) != 2:
            print(f"Expected 2 transactions for {browser_type}, got {len(session_results)}")
            return
            
        login_name = self.credentials['username']
        subscriber_id = self.api_config["subscriber_id"]
        
        transactions = self.transaction_verifier.get_transactions(
            subscriber_id, login_name, max_retries=3, retry_delay=5, batch_size=10)
        
        if not transactions or len(transactions) < 2:
            print(f"Could not retrieve 2 transactions for dual session verification of {browser_type}")
            return
            
        trans1 = transactions[-2]  # Second to last (first session)
        trans2 = transactions[-1]  # Last (second session)
        
        comparison_result = self.transaction_verifier.compare_transactions(
            trans1, trans2, 
            ignore_fields=['transID', 'timestamp', 'createdAt', 'updatedAt', 'loginTime', 'insertTime'],
            comparison_name=f"{browser_type.upper()} Dual Session"
        )
        
        TestResultPrinter.print_test_result(
            f"{browser_type.upper()}-DUAL_SESSION_VERIFY", 
            comparison_result
        )



