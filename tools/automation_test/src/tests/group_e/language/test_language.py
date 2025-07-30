from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

LANGUAGE_CONFIG = {
    'windows': [
        {
            "name": "GE_TC001_Windows_VI_VN",
            "language": "vi-VN",
        },
        {
            "name": "GE_TC001_Windows_EN_US",
            "language": "en-US",
        },
        {
            "name": "GE_TC001_Windows_ZH_CN",
            "language": "zh-CN", 
        },
        {
            "name": "GE_TC001_Windows_JA_JP",
            "language": "ja-JP",
        }
    ],
    'macos': [
        {
            "name": "GE_TC001_macOS_EN_US",
            "language": "en-US",
        }
    ],
    'linux': [
        {
            "name": "GE_TC001_Linux_EN_US",
            "language": "en-US",
        }
    ]
}

CREDENTIALS_MAPPING = {
    'single': {
        'windows': 'ge_tc001_windows_test',
        'macos': 'ge_tc001_macos_test',
        'linux': 'ge_tc001_linux_test'
    }
}

class LanguageTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='single'):
        if os_type is None:
            os_type = detect_current_os()
        
        self.os_type = os_type
        self.test_type = test_type
        
        credentials_key = CREDENTIALS_MAPPING[test_type].get(os_type, CREDENTIALS_MAPPING[test_type]['windows'])
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        if self.os_type in LANGUAGE_CONFIG:
            return LANGUAGE_CONFIG[self.os_type]
        return LANGUAGE_CONFIG['windows']  # Default fallback
        
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)
      
    def get_config_by_language(self, language_code):
        configs = self.get_test_configs()
        for config in configs:
            if config.get('language') == language_code:
                return config
        return None
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)
    
    def run_windows_language_tests(self, headless=True):
        """Run all Windows language test cases"""
        original_os_type = self.os_type
        try:
            self.os_type = 'windows'
            self.run_cross_browser_test(headless)
        finally:
            self.os_type = original_os_type
    
    def run_specific_language_test(self, language_code, headless=True):
        """Run test for a specific language code"""
        config = self.get_config_by_language(language_code)
        if config:
            browsers = self.get_test_browsers()
            for browser_type in browsers:
                self.test_single_browser_attribute_combination(browser_type, config, headless)
        else:
            print(f"Language {language_code} not found in configurations")
    
class ChangeLanguageMultiOSTest(LanguageTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'single')
    
    def run_language_test_for_os(self, headless=True):
        browsers = self.get_test_browsers_for_os(self.os_type)
        test_configs = self.get_test_configs()
            
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                for i, test_config in enumerate(test_configs, 1):
                    try:
                        self.test_single_browser_attribute_combination(browser_type, test_config, headless)
                        
                    except Exception as e:
                        print(f"Error in {browser_type} test {i}: {e}")
                        continue
                
            except Exception as e:
                print(f"Error in {browser_type} browser test: {e}")
                continue

    def run_all_os_language_tests(self, headless=True):
        supported_os = ['windows', 'macos', 'linux']
        current_os = detect_current_os()
        
        for os_type in supported_os:
            try:
                if os_type != current_os:
                    print(f"\n⚠️  Cross-platform simulation: {os_type.upper()} settings on {current_os.upper()}")
                
                self.run_language_test_for_os(os_type, headless)
                    
            except Exception as e:
                print(f"Error running {os_type} language tests: {e}")
                continue


