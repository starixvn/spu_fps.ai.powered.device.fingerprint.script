from .utils import (
    BrowserDriverFactory, 
    BrowserConfigTemplates, 
    FingerprintCollector,
    TestConfig, 
    TestExecutor,
    LoginHelper
)

class BrowserAttributeTest(TestExecutor):
    
    def __init__(self):
        self.test_url = TestConfig.DEFAULT_TEST_URL
        self.credentials = TestConfig.get_test_credentials("attr_test")
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
    
    def test_language_variations(self, browser_type="chrome", headless=True):
        print(f"\n{'='*60}")
        print(f"Testing Language Variations - {browser_type.upper()}")
        print(f"{'='*60}")
        
        test_configs = [
            BrowserConfigTemplates.get_language_config(lang['language'], lang['name'])
            for lang in TestConfig.LANGUAGE_CONFIGS
        ]
        
        for config in test_configs:
            print(f"🌐 Testing language: {config.get('language', 'Unknown')}")
            
            driver = None
            try:
                driver = BrowserDriverFactory.create_driver(browser_type, headless, config)
                
                print(f"🔍 Checking language setting...")
                temp_result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name']
                )
                
                if 'fingerprint' in temp_result and 'language' in temp_result['fingerprint']:
                    actual_lang = temp_result['fingerprint']['language']
                    expected_lang = config.get('language')
                    
                    if actual_lang == expected_lang:
                        print(f"✅ Language successfully set to: {actual_lang}")
                    else:
                        print(f"⚠️ Language mismatch - Expected: {expected_lang}, Got: {actual_lang}")
                
                login_result = self.perform_login_with_attributes(driver, browser_type, config['name'])
                
                result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name'], None  # Không load lại test_url
                )
                result['login_test'] = login_result
                
                if 'fingerprint' in result and 'language' in result['fingerprint']:
                    final_lang = result['fingerprint']['language']
                    print(f"🔍 Language after login: {final_lang}")
                
                self.test_results.append(result)
                
            except Exception as e:
                print(f"❌ Error testing language {config.get('language')}: {str(e)}")
            finally:
                if driver:
                    driver.quit()
    
    def test_user_agent_variations(self, browser_type="chrome", headless=True):
        test_configs = [
            BrowserConfigTemplates.get_user_agent_config(ua['ua'], ua['name'])
            for ua in TestConfig.USER_AGENT_CONFIGS
        ]
        
        for config in test_configs:
            print(f"🤖 Testing User Agent: {config.get('name', 'Unknown')}")
            
            driver = None
            try:
                driver = BrowserDriverFactory.create_driver(browser_type, headless, config)
                
                print(f"🔍 Checking user-agent setting...")
                temp_result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name']
                )
                
                if 'fingerprint' in temp_result and 'user_agent' in temp_result['fingerprint']:
                    actual_ua = temp_result['fingerprint']['user_agent']
                    expected_ua = config.get('user_agent')
                    if expected_ua in actual_ua:
                        print(f"✅ User Agent successfully applied")
                    else:
                        print(f"⚠️ User Agent mismatch")
                        print(f"Expected to contain: {expected_ua}")
                        print(f"Actual: {actual_ua}")
                
                login_result = self.perform_login_with_attributes(driver, browser_type, config['name'])
                
                result = FingerprintCollector.collect_comprehensive_fingerprint(
                    driver, browser_type, config['name'], None  # Không load lại test_url
                )
                result['login_test'] = login_result
                
                if 'fingerprint' in result and 'user_agent' in result['fingerprint']:
                    final_ua = result['fingerprint']['user_agent']
                    print(f"🔍 User-Agent after login: {final_ua[:100]}...")
                
                self.test_results.append(result)
                
            except Exception as e:
                print(f"❌ Error testing user agent {config.get('name')}: {str(e)}")
            finally:
                if driver:
                    driver.quit()
    
    def run_all_attribute_tests(self, browser_type="chrome", headless=True):
        print(f"\n🚀 Starting Browser Attribute Testing Suite")
        print(f"Browser: {browser_type.upper()}")
        print(f"Headless: {headless}")
        print(f"Target URL: {self.test_url}")
        print(f"📋 Test Cases: User-Agent & Language Only")
        
        self.test_results = []
        
        try:
            
            if browser_type.lower() == "chrome":
                self.test_user_agent_variations(browser_type, headless)
            else:
                print(f"⚠️ User-Agent testing skipped for {browser_type} (Chrome only)")
            
            print(f"\n🎉 All tests completed! Total results: {len(self.test_results)}")
            
        except Exception as e:
            print(f"Error in attribute testing suite: {str(e)}")
        
        return self.test_results
    
    def save_results(self, filename=None):
        if not filename:
            filename = "browser_attribute_test_results"
        return super().save_results(filename)
    
    def print_summary(self):
        super().print_summary("BROWSER ATTRIBUTE TEST SUMMARY")


def main():
    import sys
    
    test = BrowserAttributeTest()
    
    browser_type = "chrome"
    headless = False
    
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.lower() in ["chrome", "firefox"]:
                browser_type = arg.lower()
            elif arg.lower() == "headless":
                headless = True
            elif arg.lower() == "help":
                print("""
Browser Attribute Test - Usage:

python browser_attribute_test.py [browser] [options]

Browsers:
  chrome      - Use Chrome browser (default, supports all tests)
  firefox     - Use Firefox browser (limited features)

Options:
  headless    - Run in headless mode
  help        - Show this help message

Examples:
  python browser_attribute_test.py
  python browser_attribute_test.py chrome headless
  python browser_attribute_test.py firefox
                """)
                return
    
    test.run_all_attribute_tests(browser_type, headless)
    
    test.print_summary()
    test.save_results()


if __name__ == "__main__":
    main()
