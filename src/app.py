import sys
import json
import os
from datetime import datetime

try:
    from test.cross_browser_automation import BrowserAutomation
    from test.browser_customization_tests import BrowserAttributeTest
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure test files are in the correct location")
    sys.exit(1)

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
            results = login_test.run_all_browsers_test()
            self.results["login_tests"] = results
            
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
    
    def generate_summary(self):
        end_time = datetime.now()
        total_duration = (end_time - self.start_time).total_seconds()
        
        login_tests = self.results.get("login_tests") or []
        attribute_tests = self.results.get("attribute_tests") or []
        
        summary = {
            "start_time": self.start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "total_duration_seconds": round(total_duration, 2),
            "login_tests": {
                "total": len(login_tests),
                "successful": len([r for r in login_tests if r and r.get("result") == "SUCCESS"]),
                "failed": len([r for r in login_tests if r and r.get("result") != "SUCCESS"])
            },
            "attribute_tests": {
                "total": len(attribute_tests),
                "successful": len([r for r in attribute_tests if r and "error" not in r]),
                "failed": len([r for r in attribute_tests if r and "error" in r])
            }
        }
        
        self.results["summary"] = summary
        return summary
    
    def print_final_report(self):
        summary = self.generate_summary()
        
        print(f"\n{'='*80}")
        print(f"TEST REPORT")
        print(f"{'='*80}")
        
        print(f"Test Duration: {summary['total_duration_seconds']}s")
        print(f"Started: {summary['start_time']}")
        print(f"Ended: {summary['end_time']}")
        
        print(f"\nLOGIN TESTS:")
        login_stats = summary['login_tests']
        print(f"   Total: {login_stats['total']}")
        print(f"   Successful: {login_stats['successful']}")
        print(f"   Failed: {login_stats['failed']}")
        if login_stats['total'] > 0:
            success_rate = (login_stats['successful'] / login_stats['total']) * 100
            print(f"   Success Rate: {success_rate:.1f}%")
        
        print(f"\nATTRIBUTE TESTS:")
        attr_stats = summary['attribute_tests']
        print(f"   Total: {attr_stats['total']}")
        print(f"   Successful: {attr_stats['successful']}")
        print(f"   Failed: {attr_stats['failed']}")
        if attr_stats['total'] > 0:
            success_rate = (attr_stats['successful'] / attr_stats['total']) * 100
            print(f"   Success Rate: {success_rate:.1f}%")
    
    def save_results(self, filename=None):
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_results_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
            print(f"\nResults saved to: {filename}")
        except Exception as e:
            print(f"Error saving results: {str(e)}")
    
    def run_all_tests(self, browser_type="chrome", headless=False):
        print(f"\nSTARTING BROWSER TESTING SUITE")
        print(f"Browser: {browser_type.upper()}")
        print(f"Headless: {headless}")
        
        self.run_login_tests(headless)
        self.run_attribute_tests(browser_type, headless)
        
        self.print_final_report()
        self.save_results()

def main():
    runner = TestRunner()
    
    browser_type = "chrome"
    headless = False
    
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.lower() in ["chrome", "firefox", "edge"]:
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
