import time
from ...base_test.base_attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

WINDOWS_LANGUAGE_CONFIG = [
    {
        "name": "GE_TC001_Windows_EN_US",
        "language": "en-US",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
]

MACOS_LANGUAGE_CONFIG = [
    {
        "name": "GE_TC001_macOS_EN_US",
        "language": "en-US",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
]

LINUX_LANGUAGE_CONFIG = [
    {
        "name": "GE_TC001_Linux_EN_US",
        "language": "en-US",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
]

class ChangeLanguageMultiOSTest(BaseAttributeTest):
    
    def __init__(self, os_type=None):
        if os_type is None:
            os_type = detect_current_os()
        
        credentials_mapping = {
            'windows': 'ge_tc001_windows_test',
            'macos': 'ge_tc001_macos_test', 
            'linux': 'ge_tc001_linux_test'
        }
        credentials_key = credentials_mapping.get(os_type, 'ge_tc001_windows_test')  
        
        super().__init__(credentials_key)

        self.os_type = os_type
        self.test_language_configs = self._get_language_config_by_os(os_type)
    
    def _get_language_config_by_os(self, os_type):
        language_mapping = {
            'windows': WINDOWS_LANGUAGE_CONFIG,
            'macos': MACOS_LANGUAGE_CONFIG,
            'linux': LINUX_LANGUAGE_CONFIG
        }
        
        return language_mapping.get(os_type, WINDOWS_LANGUAGE_CONFIG)  
    
    def get_test_configs(self):
        return self.test_language_configs
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)
    
    def display_browser_mapping(self):
        for os_type in ['windows', 'macos', 'linux']:
            browsers = get_browsers_by_os(os_type)
            print(f"{os_type.upper():<10}: {', '.join(browsers)}")
    
    def get_test_description(self):
        current_os = detect_current_os()
        test_os = self.os_type or current_os
        cross_platform = " (Cross-platform)" if test_os != current_os else ""
        return f"Change Language Multi OS Test: {test_os.upper()} languages on {current_os.upper()}{cross_platform}"
    
    def run_language_test_for_os(self, target_os, headless=True):
        original_os_type = self.os_type
        original_configs = self.test_language_configs
        
        try:
            self.os_type = target_os
            self.test_language_configs = self._get_language_config_by_os(target_os)
            
            browsers = self.get_test_browsers_for_os(target_os)
            test_configs = self.get_test_configs()
            
            for browser_idx, browser_type in enumerate(browsers, 1):
                try:
                    for i, test_config in enumerate(test_configs, 1):
                        try:
                            self.test_single_browser_attribute_combination(browser_type, test_config, headless)
                            
                            if i < len(test_configs):
                                time.sleep(3)
                                
                        except Exception as e:
                            print(f"Error in {browser_type} test {i}: {e}")
                            continue
                    
                    if browser_idx < len(browsers):
                        time.sleep(5)
                        
                except Exception as e:
                    print(f"Error in {browser_type} browser test: {e}")
                    continue
            
        finally:
            self.os_type = original_os_type
            self.test_language_configs = original_configs
    
    def run_all_os_language_tests(self, headless=True):
        supported_os = ['windows', 'macos', 'linux']
        current_os = detect_current_os()
        
        for os_type in supported_os:
            try:
                if os_type != current_os:
                    print(f"\n⚠️  Cross-platform simulation: {os_type.upper()} settings on {current_os.upper()}")
                
                self.run_language_test_for_os(os_type, headless)
                
                if os_type != supported_os[-1]:
                    time.sleep(5)
                    
            except Exception as e:
                print(f"Error running {os_type} language tests: {e}")
                continue


def main():
    import sys
    
    current_os = detect_current_os()
    print(f"Detected OS: {current_os}")
    
    test = ChangeLanguageMultiOSTest()
    test.display_browser_mapping()
    
    if len(sys.argv) > 1:
        if sys.argv[1].lower() == 'all':
            test.run_all_os_language_tests(headless=True)
            return
        else:
            os_type = sys.argv[1].lower()
            if os_type not in ['windows', 'macos', 'linux']:
                print(f"Invalid OS parameter: {os_type}")
                print("Usage: python test_change_language_multi_os.py [windows|macos|linux|all]")
                return
            else:
                # Update test instance for specific OS
                test = ChangeLanguageMultiOSTest(os_type)
    else:
        os_type = None
    
    if os_type and os_type != current_os:
        print("⚠️  Cross-platform language simulation")
    
    print(f"\n{test.get_test_description()}")
    test.run_cross_browser_test(headless=True)


if __name__ == "__main__":
    main()
