from .attribute_tests import LanguageTest, UserAgentTest
from utils import TestExecutor

class BrowserAttributeTest(TestExecutor):
    
    def __init__(self):
        self.language_tester = LanguageTest()
        self.user_agent_tester = UserAgentTest()
        self.test_results = []
    
    def run_language_tests(self, browser_type="chrome", headless=True):
        return self.language_tester.run_language_tests(browser_type, headless)
    
    def run_user_agent_tests(self, browser_type="chrome", headless=True):
        return self.user_agent_tester.run_user_agent_tests(browser_type, headless)
    
    def run_all_attribute_tests(self, browser_type="chrome", headless=True):
        self.test_results = []
        
        try:
            language_results = self.run_language_tests(browser_type, headless)
            self.test_results.extend(language_results)
            
            user_agent_results = self.run_user_agent_tests(browser_type, headless)
            self.test_results.extend(user_agent_results)
            
        except Exception as e:
            print(f"Error in attribute testing suite: {str(e)}")
        
        return self.test_results
    
