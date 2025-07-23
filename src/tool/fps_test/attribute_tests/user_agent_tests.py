import os
from utils import BrowserDriverFactory, BrowserConfigTemplates, FingerprintCollector, TestExecutor, LoginHelper
from config import ConfigManager

class UserAgentTest(TestExecutor):
    
    def __init__(self):
        env = os.getenv("ENVIRONMENT", "DEV")
        self.test_url = ConfigManager.get_default_login_url(env)
        
        self.credentials = ConfigManager.get_test_credentials("attr_test")
        self.test_results = []
    
    def perform_login_with_attributes(self, driver, browser_name, config_name):
        try:
            login_helper = LoginHelper(driver)
            login_success, login_error = login_helper.perform_login(
                self.test_url,
                self.credentials['username'],
                self.credentials['password']
            )
            
            if login_success:
                print(f"[{browser_name}-{config_name}] ✅ Login successful!")
                return {
                    "login_result": "SUCCESS",
                    "final_url": driver.current_url,
                    "username": self.credentials['username']
                }
            else:
                print(f"[{browser_name}-{config_name}] ⚠️ Login failed: {login_error}")
                return {
                    "login_result": "FAILED",
                    "error": login_error,
                    "final_url": driver.current_url,
                    "username": self.credentials['username']
                }
                
        except Exception as e:
            print(f"[{browser_name}-{config_name}] ❌ Error during login: {str(e)}")
            return {
                "login_result": "ERROR",
                "error": str(e),
                "username": self.credentials['username']
            }

    def test_user_agent_variations(self, browser_type="chrome", headless=True):
        print(f"\n{'='*60}")
        print(f"Test Case Change UserAgent Of - {browser_type.upper()}")
        print(f"{'='*60}")

        test_configs = [
            BrowserConfigTemplates.get_user_agent_config(ua['ua'], ua['name'])
            for ua in ConfigManager.USER_AGENTS
        ]
        
        for config in test_configs:
            print(f"🤖 Testing User Agent: {config.get('name', 'Unknown')}")
            
            driver = None
            try:
                driver = BrowserDriverFactory.create_driver(browser_type, headless, config)
                
                login_result = self.perform_login_with_attributes(driver, browser_type, config['name'])
                
                result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name'], None 
                )
                result['login_test'] = login_result
                
                self.test_results.append(result)
                
            except Exception as e:
                print(f"❌ Error testing user agent {config.get('name')}: {str(e)}")
            finally:
                if driver:
                    driver.quit()

    def run_user_agent_tests(self, browser_type="chrome", headless=True):
        """Run all user agent variation tests"""
        self.test_results = []
        
        try:
            self.test_user_agent_variations(browser_type, headless)
        except Exception as e:
            print(f"Error in user agent testing suite: {str(e)}")
        
        return self.test_results
