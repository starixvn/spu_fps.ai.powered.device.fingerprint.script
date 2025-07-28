from ...base_test.base_attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

WINDOWS_OS_CONFIG = [
    {
        "name": "TC039_Windows_OS",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "expected_os": "Windows",
        "expected_platform": "Win32"
    }
]

MACOS_OS_CONFIG = [
    {
        "name": "TC040_macOS_OS", 
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "expected_os": "macOS",
        "expected_platform": "MacIntel"
    }
]

LINUX_OS_CONFIG = [
    {
        "name": "TC041_Linux_OS",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", 
        "expected_os": "Linux",
        "expected_platform": "Linux x86_64"
    }
]


class ChangeOSSameDeviceDiffBrowserTest(BaseAttributeTest):
    
    def __init__(self, os_type=None):
        if os_type is None:
            os_type = detect_current_os()
        
        credentials_mapping = {
            'windows': 'gd_tc039_test',
            'macos': 'gd_tc040_test', 
            'linux': 'gd_tc041_test'
        }
        credentials_key = credentials_mapping.get(os_type, 'gd_tc039_test')
        
        super().__init__(credentials_key)

        self.os_type = os_type
        self.test_os_configs = self._get_os_config_by_type(os_type)
    
    def _get_os_config_by_type(self, os_type):
        os_mapping = {
            'windows': WINDOWS_OS_CONFIG,
            'macos': MACOS_OS_CONFIG,
            'linux': LINUX_OS_CONFIG
        }
        return os_mapping.get(os_type, WINDOWS_OS_CONFIG)
    
    def get_test_configs(self):
        return self.test_os_configs
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_description(self):
        current_os = detect_current_os()
        test_os = self.os_type or current_os
        cross_platform = " (Cross-platform)" if test_os != current_os else ""
        return f"Change OS Name Same Device Diff Browser: {test_os.upper()} OS Detection{cross_platform}"
