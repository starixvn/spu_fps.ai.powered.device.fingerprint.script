from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

TIMEZONE_CONFIG = {
    'windows': {
        "name": "GE_TC054_Windows_UTC_Plus_7",
        "timezone": "Asia/Ho_Chi_Minh",
    },
    'macos': {
        "name": "GE_TC055_macOS_UTC_Plus_7",
        "timezone": "Asia/Ho_Chi_Minh",
    },
    'linux': {
        "name": "GE_TC056_Linux_UTC_Plus_7",
        "timezone": "Asia/Ho_Chi_Minh",
    }
}

CREDENTIALS_MAPPING = {
    'single': {
        'windows': {
            'chrome': 'ge_tc054_win_chrome',
            'firefox': 'ge_tc054_win_firefox',
            'edge': 'ge_tc054_win_edge'
        },
        'macos': {
            'chrome': 'ge_tc055_mac_chrome',
            'firefox': 'ge_tc055_mac_firefox',
            'edge': 'ge_tc055_mac_edge',
            'safari': 'ge_tc055_mac_safari'
        },
        'linux': {
            'chrome': 'ge_tc056_linux_chrome',
            'firefox': 'ge_tc056_linux_firefox',
            'chromium': 'ge_tc056_linux_chromium'
        }
    }
}


class TimezoneTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='single', browser_type='chrome'):
        if os_type is None:
            os_type = detect_current_os()
        
        self.os_type = os_type
        self.test_type = test_type
        self.browser_type = browser_type
        
        platform_mapping = CREDENTIALS_MAPPING[test_type].get(os_type, CREDENTIALS_MAPPING[test_type]['windows'])
        credentials_key = platform_mapping.get(browser_type)
        
        if not credentials_key:
            for platform, browsers in CREDENTIALS_MAPPING[test_type].items():
                if browser_type in browsers:
                    credentials_key = browsers[browser_type]
                    break
        
        if not credentials_key:
            credentials_key = 'ge_tc054_win_chrome' 
            
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        if self.os_type in TIMEZONE_CONFIG:
            return [TIMEZONE_CONFIG[self.os_type]]
        return [TIMEZONE_CONFIG['windows']]  
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)
    
    def get_test_description(self):
        current_os = detect_current_os()
        cross_platform = " (Cross-platform)" if self.os_type != current_os else ""
        test_desc = "Single Session" if self.test_type == 'single' else "Multi Session"
        return f"Timezone {test_desc} Test: {self.os_type.upper()} on {current_os.upper()}{cross_platform}"
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)


class ChangeTimezoneMultiOSTest(TimezoneTest):
    
    def __init__(self, os_type=None, browser_type='chrome'):
        super().__init__(os_type, 'single', browser_type)
    
    def run_timezone_test_for_os(self, target_os, headless=True):
        original_os_type = self.os_type
        
        try:
            self.os_type = target_os
            
            browsers = self.get_test_browsers_for_os(target_os)
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
            
        finally:
            self.os_type = original_os_type
    
    def run_all_os_timezone_tests(self, headless=True):
        supported_os = ['windows', 'macos', 'linux']
        current_os = detect_current_os()
        
        for os_type in supported_os:
            try:
                if os_type != current_os:
                    print(f"\n⚠️  Cross-platform simulation: {os_type.upper()} settings on {current_os.upper()}")
                
                self.run_timezone_test_for_os(os_type, headless)
                    
            except Exception as e:
                print(f"Error running {os_type} timezone tests: {e}")
                continue

