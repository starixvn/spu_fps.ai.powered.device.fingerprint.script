import sys
import json
from datetime import datetime
from fps_test import BrowserAutomation, BrowserAttributeTest
from config.general_config import SUPPORTED_BROWSERS

class TestRunner:
    def __init__(self):
        self.results = {
            "login_tests": [],
            "attribute_tests": []
        }
        self.start_time = datetime.now()
        
    def run_login_tests(self, headless=False):
        print(f"\n{'='*80}")
        print(f"RUNNING LOGIN TESTS")
        print(f"{'='*80}")
        
        try:
            login_test = BrowserAutomation()
            _ = login_test.run_all_browsers_test()

            print(f"\nLogin tests completed successfully")
            return True
            
        except Exception as e:
            print(f"Error running login tests: {str(e)}")
            self.results["login_tests"] = [{"error": str(e)}]
            return False
    
    def run_attribute_tests(self, browser_type="chrome", headless=False):

        if browser_type.lower() == "all":
            browsers_to_test = SUPPORTED_BROWSERS
        else:
            browsers_to_test = [browser_type]
        
        all_results = []
        
        for browser in browsers_to_test:
            print(f"\n{'-'*60}")
            print(f"Testing browser: {browser.upper()}")
            print(f"{'-'*60}")
            
            try:
                attribute_test = BrowserAttributeTest()
                results = attribute_test.run_all_attribute_tests(browser, headless)
                
            except Exception as e:
                print(f"Error running attribute tests for {browser.upper()}: {str(e)}")
        
        self.results["attribute_tests"] = all_results
    
    def run_all_tests(self, browser_type="chrome", headless=False):

        if browser_type.lower() == "all":
            print(f"Browsers: {', '.join([b.upper() for b in SUPPORTED_BROWSERS])}")
        else:
            print(f"Browser: {browser_type.upper()}")
        print(f"Headless: {headless}")
        
        self.run_login_tests(headless)
        self.run_attribute_tests(browser_type, headless)
        
def main():
    runner = TestRunner()
    
    browser_type = "all"
    headless = True

    runner.run_all_tests(browser_type, headless)

def run_all_tests():
    
    runner = TestRunner()
    runner.run_all_tests()

if __name__ == "__main__":
    main()
