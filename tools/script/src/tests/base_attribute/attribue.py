import os
import time
import json
import platform
from abc import ABC, abstractmethod
from dotenv import load_dotenv
from utils.browser_factory import BrowserDriverFactory
from utils.test_utils import TestResultPrinter
from utils.login_helper import TestLoginHelper
from utils.transaction_verifier import TransactionVerifier
from config import ConfigManager

load_dotenv()

def get_browsers_by_os(os_type):
    return ConfigManager.BROWSER_MAPPING.get(os_type, ["chrome", "firefox", "edge"])

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

    def _get_browser_dual_configs(self, browser_type):
        all_configs = self.get_test_configs()
        browser_configs = [config for config in all_configs if browser_type.lower() in config.get('name', '').lower()]
        
        if browser_configs:
            return browser_configs
        return all_configs if all_configs else [{'name': f'{browser_type}_default_config'}]

    def test_single_browser_attribute_combination(self, browser_type, test_config, headless=True, is_verification=True):
        test_name = f"{browser_type.upper()}-{test_config['name']}"
        
        try:
            browser_config = self._prepare_browser_config(test_config)
            driver = BrowserDriverFactory.create_driver(browser_type, headless, browser_config)

            login_result = TestLoginHelper.perform_login_with_attributes(
                driver, self.test_url, self.credentials
            )
            TestResultPrinter.print_test_result(test_name, login_result)
            
            if login_result.get("login_result") == "SUCCESS" and is_verification:
                self.verify_transaction_attributes(test_name, browser_type, test_config)

            driver.quit()

        except Exception as e:
            TestResultPrinter.print_test_result(test_name, {}, str(e))
    
    def _prepare_browser_config(self, test_config):
        """Prepare browser configuration from test config"""
        browser_config = {}
        config_keys = ["user_agent", "language", "timezone", "expected_os", "expected_platform", 
                      "plugins", "screen_width", "screen_height", "available_width", "available_height"]
        
        for key in config_keys:
            if key in test_config:
                browser_config[key] = test_config[key]
                
        return browser_config
    
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
        attribute_mappings = {
            "user_agent": lambda x: {"userAgent": x},
            "timezone": lambda x: {"timezone": f'"{x}"'},
            "expected_os": lambda x: {"osname": f'"{x}"'},
            "expected_platform": lambda x: {"platform": f'"{x}"'},
            "plugins": lambda x: {"plugins": json.dumps(x)},
            "pdfViewerEnabled": lambda x: {"pdfViewerEnabled": x}
        }
        
        for key, mapper in attribute_mappings.items():
            if key in test_config:
                attributes.update(mapper(test_config[key]))
        
        if "screen_width" in test_config and "screen_height" in test_config:
            attributes["screenResolution"] = f"[{test_config['screen_width']},{test_config['screen_height']}]"

        if attributes:
            expected_transaction_data["attributes"] = attributes

        self.transaction_verifier.verify_complete_transaction(
            test_name, expected_transaction_data, max_retries=3, retry_delay=10, batch_size=10
        )

    def run_dual_session_test(self, headless=False, session_delay=15):
        browsers = self.get_test_browsers()
        
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                browser_configs = self._get_browser_dual_configs(browser_type)
                if not browser_configs:
                    continue
                
                session_results = []
                
                for session_num, test_config in enumerate(browser_configs, 1):  
                    try:
                        test_name = f"{browser_type.upper()}-{test_config['name']}-SESSION{session_num}"
                        self.test_single_browser_attribute_combination(browser_type, test_config, headless, is_verification=False)
                        session_results.append((test_name, browser_configs, test_config))

                        if session_num < 2:
                            time.sleep(session_delay)
                    except Exception as e:
                        print(f"Error in session {session_num}: {e}")
                        continue

                if len(session_results) == 2:
                    self._verify_dual_session_transactions(session_results, browser_type)
                
                if browser_idx < len(browsers):
                    time.sleep(10)
                    
            except Exception as e:
                print(f"Error in {browser_type} dual session test: {e}")
                continue
    
    def _verify_dual_session_transactions(self, session_results, browser_type):
        if len(session_results) != 2:
            print(f"Expected 2 transactions for {browser_type}, got {len(session_results)}")
            return
            
        login_name = self.credentials['username']
        subscriber_id = self.api_config["subscriber_id"]
        
        transactions = self.transaction_verifier.get_transactions(
            subscriber_id, login_name, max_retries=3, retry_delay=10, batch_size=10)
        
        if not transactions or len(transactions) < 2:
            print(f"Could not retrieve 2 transactions for dual session verification of {browser_type}")
            return
            
        trans1, trans2 = transactions[0], transactions[1]
        
        comparison_result = self.transaction_verifier.compare_transactions(
            trans1, trans2, 
            ignore_fields=['transID', 'deviceCode', 'deviceStatus', 'fP_DeviceMappingID', 'insertTime', 'transTime'],
            comparison_name=f"{browser_type.upper()} Dual Session"
        )
        
        TestResultPrinter.print_test_result(
            f"{browser_type.upper()}-{self.credentials['username']}-VERIFY", 
            comparison_result
        )
    



