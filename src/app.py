import sys
import json
from datetime import datetime
from fps_test import BrowserAutomation, BrowserAttributeTest

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
        print(f"\n{'='*80}")
        print(f"RUNNING BROWSER ATTRIBUTE TESTS")
        print(f"{'='*80}")
        
        try:
            attribute_test = BrowserAttributeTest()
            results = attribute_test.run_all_attribute_tests(browser_type, headless)
            self.results["attribute_tests"] = results
            
            print(f"\nAttribute tests completed successfully")
            return True
            
        except Exception as e:
            print(f"Error running attribute tests: {str(e)}")
            self.results["attribute_tests"] = [{"error": str(e)}]
            return False
    
    def run_all_tests(self, browser_type="chrome", headless=False):
        print(f"\nSTARTING BROWSER TESTING SUITE")
        print(f"Browser: {browser_type.upper()}")
        print(f"Headless: {headless}")
        
        self.run_login_tests(headless)
        self.run_attribute_tests(browser_type, headless)


def main():
    runner = TestRunner()
    
    browser_type = "chrome"
    headless = True
    
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.lower() in ["chrome", "firefox"]:
                browser_type = arg.lower()
            elif arg.lower() == "headless":
                headless = True
            elif arg.lower() in ["help", "-h", "--help"]:
                print("""
Browser Testing Suite - Usage:

python test_runner.py [browser] [options]

Browsers:
  chrome      - Use Chrome browser (default)
  firefox     - Use Firefox browser  
  edge        - Use Edge browser

Options:
  headless    - Run in headless mode
  help        - Show this help message

Examples:
  python test_runner.py
  python test_runner.py chrome headless
  python test_runner.py firefox
                """)
                return
    
    runner.run_all_tests(browser_type, headless)

def run_all_tests():
    """Standalone function for running all tests via entry point"""
    runner = TestRunner()
    runner.run_all_tests()

if __name__ == "__main__":
    main()
