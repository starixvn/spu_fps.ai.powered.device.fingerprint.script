from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

UA_CONFIG = {
    'windows': {
        "name": "UA_TC001_Windows",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    'macos': {
        "name": "UA_TC002_macOS",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    'linux': {
        "name": "UA_TC003_Linux",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
}

COMMON_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

CREDENTIALS_MAPPING = {
    'single': {
        'windows': 'gd_tc001_test',
        'macos': 'gd_tc002_test',
        'linux': 'gd_tc003_test'
    },
    'dual': {
        'windows': 'gd_tc004-6_test',
        'macos': 'gd_tc007-10_test',
        'linux': 'gd_tc011-13_test'
    }
}

class UserAgentTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='single'):
        if os_type is None:
            os_type = detect_current_os()
        
        self.os_type = os_type
        self.test_type = test_type 
        
        credentials_key = CREDENTIALS_MAPPING[test_type].get(os_type, CREDENTIALS_MAPPING[test_type]['windows'])
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        if self.test_type == 'single':
            return [UA_CONFIG[self.os_type]]
        else:
            return self._get_dual_session_configs()
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)

    def get_browser_dual_configs(self, browser_type):
        all_configs = self._get_dual_session_configs()
        browser_configs = []
        
        for config in all_configs:
            if browser_type.title() in config['name']:
                browser_configs.append(config)
        
        return browser_configs   
    
    def _get_dual_session_configs(self):
        browsers = self.get_test_browsers()
        configs = []
        
        tc_mapping = {
            'windows': {'chrome': 'TC004', 'firefox': 'TC005', 'edge': 'TC006'},
            'macos': {'chrome': 'TC008', 'firefox': 'TC009', 'safari': 'TC007', 'edge': 'TC010'},
            'linux': {'chrome': 'TC011', 'firefox': 'TC012', 'chromium': 'TC013'}
        }
        
        for browser in browsers:
            if browser in tc_mapping.get(self.os_type, {}):
                tc_num = tc_mapping[self.os_type][browser]
                configs.extend([
                    {"name": f"{tc_num}_{self.os_type.title()}_{browser.title()}", "user_agent": COMMON_USER_AGENT},
                    {"name": f"{tc_num}_{self.os_type.title()}_{browser.title()}", "user_agent": COMMON_USER_AGENT}
                ])
        
        return configs
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)
    
    def run_dual_session_test(self, headless=False, session_delay=15):
        super().run_dual_session_test(headless, session_delay)

class ChangeUASameOSDiffBrowserTest(UserAgentTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'single')


class DualTransUATest(UserAgentTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'dual')
    
    def run_dual_session_test_with_verification(self, headless=False, session_delay=15):
        return self.run_dual_session_test(headless, session_delay)

