from runner import AllTestRunner
from config.general_config import SUPPORTED_BROWSERS
from fps_test.test_TC_016_same_ua_diff_browser import TestTC016SameUADiffBrowser

class TestRunner:
    def __init__(self):
        self.all_runner = AllTestRunner()
        self.tc_016_test = TestTC016SameUADiffBrowser()

    def run_login_tests(self, headless=False):
        try:
            return self.all_runner.run_all_browsers_tests(headless)
        except Exception:
            return []
    
    def run_attribute_tests(self, browser_type="chrome", headless=False):
        browsers_to_test = SUPPORTED_BROWSERS if browser_type.lower() == "all" else [browser_type]
        
        for browser in browsers_to_test:
            try:
                self.all_runner.run_all_attribute_tests(browser, headless)
            except Exception:
                pass
    
    def run_all_tests(self, browser_type="chrome", headless=False):
        # self.run_login_tests(headless)
        self.tc_016_test.run_cross_browser_test()
        # self.run_attribute_tests(browser_type, headless)

def main():
    runner = TestRunner()
    runner.run_all_tests("all", True)

if __name__ == "__main__":
    main()
