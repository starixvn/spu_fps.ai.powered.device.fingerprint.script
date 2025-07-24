import os
from utils.browser_factory import BrowserDriverFactory, BrowserConfigTemplates
from utils.fingerprint_collector import FingerprintCollector
from utils.test_utils import TestResultPrinter
from utils.login_helper import LoginHelper
from config import ConfigManager

class UserAgentTest:
    
    def __init__(self):
        env = os.getenv("ENVIRONMENT", "DEV")
        self.test_url = ConfigManager.get_default_login_url(env)
        self.credentials = ConfigManager.get_test_credentials("user_agent_test")
        self.test_results = []
    
    def perform_login_with_attributes(self, driver):
        try:
            login_helper = LoginHelper(driver)
            login_success, login_error = login_helper.perform_login(
                self.test_url,
                self.credentials['username'],
                self.credentials['password']
            )
            
            return {
                "login_result": "SUCCESS" if login_success else "FAILED",
                "error": login_error if not login_success else None,
                "final_url": driver.current_url,
                "username": self.credentials['username']
            }
                
        except Exception as e:
            return {
                "login_result": "ERROR",
                "error": str(e),
                "username": self.credentials['username']
            }

    def test_user_agent_variations(self, browser_type="chrome", headless=True):
        test_configs = [
            BrowserConfigTemplates.get_user_agent_config(ua['ua'], ua['name'])
            for ua in ConfigManager.USER_AGENTS
        ]
        
        for config in test_configs:
            driver = None
            test_name = f"{browser_type.upper()}-{config['name']}"
            
            try:
                driver = BrowserDriverFactory.create_driver(browser_type, headless, config)
                
                login_result = self.perform_login_with_attributes(driver)
                
                TestResultPrinter.print_test_result(test_name, login_result)
                
                result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name'], None 
                )
                result['login_test'] = login_result
                
                self.test_results.append(result)
                
            except Exception as e:
                TestResultPrinter.print_test_result(test_name, {}, str(e))

            finally:
                if driver:
                    driver.quit()

    def run_user_agent_tests(self, browser_type="chrome", headless=True):
        self.test_results = []
        
        try:
            self.test_user_agent_variations(browser_type, headless)
        except Exception:
            pass  
        
        return self.test_results
