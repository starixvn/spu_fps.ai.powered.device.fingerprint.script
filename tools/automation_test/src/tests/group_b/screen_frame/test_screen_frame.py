from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

SCREEN_FRAME_CONFIG = {
    'windows': {
        "name": "GB_TC044_Windows_ScreenFrame",
        "screen_width": 1920,
        "screen_height": 1080,
        "available_width": 1920,
        "available_height": 1040,
    },
    'macos': {
        "name": "GB_TC044_macOS_ScreenFrame",
        "screen_width": 1920,
        "screen_height": 1080,
        "available_width": 1920,
        "available_height": 1055,
    },
    'linux': {
        "name": "GB_TC044_Linux_ScreenFrame",
        "screen_width": 1920,
        "screen_height": 1080,
        "available_width": 1920,
        "available_height": 1056,
    }
}

CREDENTIALS_MAPPING = {
    'single': {
        'windows': 'gb_tc044_windows_test',
        'macos': 'gb_tc044_macos_test',
        'linux': 'gb_tc044_linux_test'
    }
}


class ScreenFrameTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='single'):
        if os_type is None:
            os_type = detect_current_os()
        
        self.os_type = os_type
        self.test_type = test_type
        
        credentials_key = CREDENTIALS_MAPPING[test_type].get(os_type, CREDENTIALS_MAPPING[test_type]['windows'])
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        if self.os_type in SCREEN_FRAME_CONFIG:
            return [SCREEN_FRAME_CONFIG[self.os_type]]
        return [SCREEN_FRAME_CONFIG['windows']]  # Default fallback
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)
    
    def get_test_description(self):
        current_os = detect_current_os()
        cross_platform = " (Cross-platform)" if self.os_type != current_os else ""
        test_desc = "Single Session" if self.test_type == 'single' else "Multi Session"
        return f"Screen Frame {test_desc} Test: {self.os_type.upper()} on {current_os.upper()}{cross_platform}"
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)


class ScreenFrameFingerprintMultiOSTest(ScreenFrameTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'single')
    
    def run_screen_frame_test_for_os(self, target_os, headless=True):
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
    
    def run_all_os_screen_frame_tests(self, headless=True):
        supported_os = ['windows', 'macos', 'linux']
        current_os = detect_current_os()
        
        for os_type in supported_os:
            try:
                if os_type != current_os:
                    print(f"\n⚠️  Cross-platform simulation: {os_type.upper()} settings on {current_os.upper()}")
                
                self.run_screen_frame_test_for_os(os_type, headless)
                    
            except Exception as e:
                print(f"Error running {os_type} screen frame tests: {e}")
                continue
