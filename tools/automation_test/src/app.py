from fps_test import BrowserAutomation, BrowserAttributeTest
from config.general_config import SUPPORTED_BROWSERS

class TestRunner:
    def __init__(self):
        self.results = {"login_tests": [], "attribute_tests": []}
        
    def run_login_tests(self, headless=False):
        try:
            login_test = BrowserAutomation()
            login_test.run_all_browsers_test()

            return True
        
        except Exception as e:
            self.results["login_tests"] = [{"error": str(e)}]

            return False
    
    def run_attribute_tests(self, browser_type="chrome", headless=False):
        browsers_to_test = SUPPORTED_BROWSERS if browser_type.lower() == "all" else [browser_type]
        
        for browser in browsers_to_test:
            try:
                attribute_test = BrowserAttributeTest()
                attribute_test.run_all_attribute_tests(browser, headless)
                
            except Exception:
                pass  
    
    def run_all_tests(self, browser_type="chrome", headless=False):
        self.run_login_tests(headless)
        self.run_attribute_tests(browser_type, headless)

def main():
    runner = TestRunner()
    runner.run_all_tests("all", True)

if __name__ == "__main__":
    main()
