from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

# Centralized plugin configurations by OS and browser
PLUGINS_CONFIG = {
    'windows': {
        'chrome': {
            "name": "TC089_Plugins_Windows_Chrome",
            "plugins": [{"name": "Chrome PDF Plugin", "description": "Portable Document Format", "mimeTypes": []}]
        },
        'firefox': {
            "name": "TC089_Plugins_Windows_Firefox_Plugins",
            "plugins": [{"name": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "description": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "mimeTypes": []}]
        },
        'edge': {
            "name": "TC089_Plugins_Windows_Edge_Plugins",
            "plugins": [{"name": "Microsoft Edge PDF", "description": "Portable Document Format", "mimeTypes": []}]
        }
    },
    'macos': {
        'chrome': {
            "name": "TC090_Plugins_macOS_Chrome_Plugins",
            "plugins": [{"name": "Chrome PDF Plugin", "description": "Portable Document Format", "mimeTypes": []}]
        },
        'firefox': {
            "name": "TC090_Plugins_macOS_Firefox_Plugins",
            "plugins": [{"name": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "description": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "mimeTypes": []}]
        },
        'safari': {
            "name": "TC090_Plugins_macOS_Safari_Plugins",
            "plugins": [{"name": "Safari PDF Plugin", "description": "Safari PDF Plugin", "mimeTypes": []}]
        },
        'edge': {
            "name": "TC090_Plugins_macOS_Edge_Plugins",
            "plugins": [{"name": "Microsoft Edge PDF", "description": "Portable Document Format", "mimeTypes": []}]
        }
    },
    'linux': {
        'chrome': {
            "name": "TC091_Linux_Chrome_Plugins",
            "plugins": [{"name": "Chrome PDF Plugin", "description": "Portable Document Format", "mimeTypes": []}]
        },
        'firefox': {
            "name": "TC091_Linux_Firefox_Plugins",
            "plugins": [{"name": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "description": "OpenH264 Video Codec provided by Cisco Systems, Inc.", "mimeTypes": []}]
        },
        'chromium': {
            "name": "TC091_Linux_Chromium_Plugins",
            "plugins": [{"name": "Chromium PDF Plugin", "description": "Portable Document Format", "mimeTypes": []}]
        }
    }
}

CREDENTIALS_MAPPING = {
    'single': {
        'windows': 'gd_tc078_test',
        'macos': 'gd_tc079_test',
        'linux': 'gd_tc080_test'
    }
}

class PluginsTest(BaseAttributeTest):
    
    def __init__(self, os_type=None, test_type='single'):
        if os_type is None:
            os_type = detect_current_os()
        
        self.os_type = os_type
        self.test_type = test_type
        
        credentials_key = CREDENTIALS_MAPPING[test_type].get(os_type, CREDENTIALS_MAPPING[test_type]['windows'])
        super().__init__(credentials_key)
    
    def get_test_configs(self):
        browsers = get_browsers_by_os(self.os_type)
        configs = []
        
        for browser in browsers:
            if browser in PLUGINS_CONFIG.get(self.os_type, {}):
                config = PLUGINS_CONFIG[self.os_type][browser].copy()
                configs.append(config)
        
        return configs
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def run_single_browser_test(self, browser_type, headless=True):
        if browser_type not in PLUGINS_CONFIG.get(self.os_type, {}):
            print(f"⚠️  No plugin config found for {browser_type} on {self.os_type}")
            return
        
        test_config = PLUGINS_CONFIG[self.os_type][browser_type]
        
        try:
            self.test_single_browser_attribute_combination(browser_type, test_config, headless)
        except Exception as e:
            print(f"Error in {browser_type} plugin test: {e}")
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)


class ChangePluginsSameDeviceDiffBrowserTest(PluginsTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'single')