import time
import os
from datetime import datetime
from utils.browser_factory import BrowserDriverFactory, BrowserUtils
from utils.test_utils import TestResultManager, TestResultPrinter
from utils.login_helper import LoginHelper
from config import ConfigManager

class BrowserAutomation:
    def __init__(self):
        env = os.getenv("ENVIRONMENT", "DEV")
        self.login_url = ConfigManager.get_default_login_url(env)

        self.result_manager = TestResultManager()
        self.credentials = ConfigManager.get_test_credentials("browser_login_test")
        
    def perform_login(self, driver, browser_name):
        try:
            login_helper = LoginHelper(driver)

            login_success, login_error = login_helper.perform_login(
                self.login_url,
                self.credentials['username'],
                self.credentials['password']
            )
            
            return {
                "browser": browser_name,
                "username": self.credentials['username'],
                "result": "SUCCESS" if login_success else "FAILED",
                "url": driver.current_url,
                "timestamp": datetime.now().isoformat(),
                "error": login_error if not login_success else None
            }
            
        except Exception as e:
            return {
                "browser": browser_name,
                "username": self.credentials['username'],
                "result": "ERROR",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def run_single_browser_test(self, browser_type="chrome", headless=True):
        driver = None
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless)
                
            result = self.perform_login(driver, browser_type.upper())
            
            TestResultPrinter.print_browser_test_result(browser_type.upper(), result)
            
            self.result_manager.add_result(result)
            time.sleep(3)
            
        except Exception as e:
            TestResultPrinter.print_browser_test_result(browser_type.upper(), {"result": "ERROR", "error": str(e)})
            
            self.result_manager.add_error_result(
                browser_type.upper(),
                "SETUP_ERROR", 
                str(e)
            )
        finally:
            BrowserUtils.safe_quit_driver(driver)
    
    def run_all_browsers_test(self, headless=True):
        browsers = ConfigManager.BROWSERS 

        for browser in browsers:
            try:
                self.run_single_browser_test(browser, headless)
                time.sleep(2)  
            except Exception as e:
                self.result_manager.add_error_result(
                    browser.upper(),
                    "BROWSER_ERROR",
                    str(e)
                )
                time.sleep(1)
    
    @property
    def results(self):
        return self.result_manager.results  
    

