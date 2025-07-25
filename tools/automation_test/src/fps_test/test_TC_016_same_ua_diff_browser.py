import os
import time
from utils.browser_factory import BrowserDriverFactory, BrowserUtils
from utils.test_utils import TestResultPrinter
from utils.test_login_helper import TestLoginHelper
from utils.transaction_verifier import TransactionVerifier
from config import ConfigManager
from config.general_config import API_CONFIG

# ==================== TEST CONFIGURATION ====================
TEST_UA_CONFIG = {
    "name": "TC016_Chrome_120_Windows",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

DEFAULT_BROWSERS = ["chrome", "firefox", "edge"]

CREDENTIALS_KEY = "tc016_test"
# =============================================================

class TestTC016SameUADiffBrowser:
    
    def __init__(self):
        env = os.getenv("ENVIRONMENT", "DEV")
        self.test_url = ConfigManager.get_default_login_url(env)
        self.credentials = ConfigManager.get_test_credentials(CREDENTIALS_KEY)
        
        self.test_ua_config = TEST_UA_CONFIG
        self.transaction_verifier = TransactionVerifier(API_CONFIG["base_url"])

    def test_single_browser_with_ua(self, browser_type, headless=True):
        driver = None
        test_name = f"{browser_type.upper()}-{self.test_ua_config['name']}"
        
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless, self.test_ua_config)
            
            login_result = TestLoginHelper.perform_login_with_attributes(
                driver, self.test_url, self.credentials
            )
            
            if login_result.get("login_result") == "SUCCESS":
                time.sleep(10)
                self.verify_transaction_attributes(test_name)
            
        except Exception as e:
            TestResultPrinter.print_test_result(test_name, {}, str(e))

        finally:
            BrowserUtils.safe_quit_driver(driver)
    
    def verify_transaction_attributes(self, test_name):
        login_name = self.credentials['username']
        
        attribute_mappings = {
            "userAgent": self.test_ua_config["user_agent"],
            "subscriberID": API_CONFIG["subscriber_id"],
            "loginName": login_name
        }
        
        self.transaction_verifier.verify_multiple_attributes(
            test_name,
            API_CONFIG["subscriber_id"],
            login_name,
            attribute_mappings,
            max_retries=3,
            retry_delay=5
        )
    
    def run_cross_browser_test(self, browsers=None, headless=True):
        if browsers is None:
            browsers = DEFAULT_BROWSERS
        
        for browser in browsers:
            try:
                self.test_single_browser_with_ua(browser, headless)
            except Exception:
                pass

def main():
    test = TestTC016SameUADiffBrowser()
    test.run_cross_browser_test(DEFAULT_BROWSERS)

if __name__ == "__main__":
    main()
