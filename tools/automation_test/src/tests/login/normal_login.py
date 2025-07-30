from ..base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)
import time

CONSISTENCY_CONFIG = {
    'windows': {
        "name": "LOGIN_Test",
    },
    'macos': {
        "name": "LOGIN_Test",
    },
    'linux': {
        "name": "LOGIN_Test",
    }
}

CREDENTIALS_MAPPING = {
    'consistency': {
        'windows': {
            'chrome': 'login_tc001_chrome',
            'firefox': 'login_tc002_firefox', 
            'edge': 'login_tc003_edge'
        },
        'macos': {
            'chrome': 'login_tc004_chrome',
            'firefox': 'login_tc005_firefox',
            'edge': 'login_tc006_edge',
            'safari': 'login_tc007_safari'
        },
        'linux': {
            'chrome': 'login_tc008_chrome',
            'firefox': 'login_tc009_firefox',
            'chromium': 'login_tc010_chromium'
        }
    }
}


class LoginConsistencyTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='consistency', browser_type='chrome'):
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
            credentials_key = 'login_tc001_chrome'  
            
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        if self.os_type in CONSISTENCY_CONFIG:
            return [CONSISTENCY_CONFIG[self.os_type]]
        return [CONSISTENCY_CONFIG['windows']]  
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)
    
    def get_test_description(self):
        current_os = detect_current_os()
        cross_platform = " (Cross-platform)" if self.os_type != current_os else ""
        return f"Login Consistency Test: {self.os_type.upper()} on {current_os.upper()}{cross_platform}"
    
    def get_browser_dual_configs(self, browser_type):
        base_config = self.get_test_configs()[0]
        
        config1 = {
            **base_config,
            "name": f"{base_config['name']}_Session1_{browser_type.upper()}"
        }
        config2 = {
            **base_config,
            "name": f"{base_config['name']}_Session2_{browser_type.upper()}"
        }
        
        return [config1, config2]
    
    def run_consistency_test(self, headless=True, session_delay=15):
        self.run_dual_session_test(headless, session_delay)


class LoginConsistencyMultiBrowserTest(LoginConsistencyTest):
    
    def __init__(self, os_type=None, browser_type='chrome'):
        super().__init__(os_type, 'consistency', browser_type)

    def run_single_browser_consistency_test(self, browser_type, headless=True, session_delay=15):
        test_instance = LoginConsistencyTest(self.os_type, 'consistency', browser_type)
        
        original_get_test_browsers = test_instance.get_test_browsers
        test_instance.get_test_browsers = lambda: [browser_type]
        
        try:
            test_instance.run_dual_session_test(headless, session_delay)
        finally:
            test_instance.get_test_browsers = original_get_test_browsers
    
    def run_dual_trans_login_test(self, headless=True, session_delay=5):
        browsers = get_browsers_by_os(self.os_type)
        
        for browser_type in browsers:
            try:
                print(f"\n🌐 Testing {browser_type.upper()} browser consistency")
                self.run_single_browser_consistency_test(browser_type, headless, session_delay)
                
            except Exception as e:
                print(f"❌ Error in {browser_type} browser consistency test: {e}")
                continue
    






