import time
from datetime import datetime
from .utils import BrowserDriverFactory, BrowserUtils, TestConfig, TestResultManager, LoginHelper

class BrowserAutomation:
    def __init__(self):
        self.login_url = TestConfig.DEFAULT_LOGIN_URL
        self.result_manager = TestResultManager()
        self.credentials = TestConfig.get_test_credentials("login_test")
        
    def setup_chrome_driver(self, headless=False):
        try:
            return BrowserDriverFactory.create_chrome_driver(headless)
        
        except Exception as e:
            print(f"Chrome setup error: {e}")
            raise e
    
    def setup_firefox_driver(self, headless=False):
        try:
            return BrowserDriverFactory.create_firefox_driver(headless)
        
        except Exception as e:
            print(f"Firefox setup error: {e}")

            raise e
    
    def setup_edge_driver(self, headless=False):
        try:
            return BrowserDriverFactory.create_edge_driver(headless)
        
        except Exception as e:
            print(f"Edge setup error: {e}")

            raise e
    
    def perform_login(self, driver, browser_name):
        try:
            login_helper = LoginHelper(driver)
            
            login_success, login_error = login_helper.perform_login(
                self.login_url,
                self.credentials['username'],
                self.credentials['password']
            )
            
            if login_success:
                print(f"[{browser_name}] Login successful!")
                result = "SUCCESS"
                error = None
            else:
                print(f"[{browser_name}] Login failed: {login_error}")
                result = "FAILED"
                error = login_error
                
            return {
                "browser": browser_name,
                "username": self.credentials['username'],
                "result": result,
                "url": driver.current_url,
                "timestamp": datetime.now().isoformat(),
                "error": error
            }
            
        except Exception as e:
            print(f"[{browser_name}] Error during login: {str(e)}")
            return {
                "browser": browser_name,
                "username": self.credentials['username'],
                "result": "ERROR",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def run_single_browser_test(self, browser_type="chrome", headless=True):
        print(f"\n{'='*50}")
        print(f"Starting {browser_type.upper()} browser test (headless: {headless})")
        print(f"{'='*50}")
        
        driver = None
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless)
            
            result = self.perform_login(driver, browser_type.upper())
            self.result_manager.add_result(result)
            
            time.sleep(3)
            
        except Exception as e:
            print(f"Error setting up {browser_type}: {str(e)}")
            self.result_manager.add_error_result(
                browser_type.upper(),
                "SETUP_ERROR", 
                str(e)
            )
        finally:
            BrowserUtils.safe_quit_driver(driver)
    
    def run_all_browsers_test(self, headless=True):
        browsers = ["chrome", "firefox"]
        
        print("Starting automated browser testing...")
        print(f"Target URL: {self.login_url}")
        print(f"Headless mode: {headless}")
        print(f"Testing browsers: {', '.join(browsers)}")
        
        for browser in browsers:
            try:
                print(f"\nAttempting to test {browser.upper()}...")
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
    
if __name__ == "__main__":
    import sys
    
    automation = BrowserAutomation()
    
    if len(sys.argv) > 1:
        if sys.argv[1].lower() == "visible":
            automation.run_all_browsers_test(headless=False)
        elif sys.argv[1].lower() in ["chrome", "firefox"]:
            visible = len(sys.argv) > 2 and sys.argv[2].lower() == "visible"
            automation.run_single_browser_test(sys.argv[1].lower(), headless=not visible)
        else:
            print("Usage: python cross_browser_automation.py [chrome|firefox|edge|visible]")
            print("       python cross_browser_automation.py <browser> visible")
            print("       Default: headless mode (no browser window)")
    else:
        automation.run_all_browsers_test()
