import time

from ...base_test.base_attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

PDF_VIEWER_DISABLED_CONFIGS = [
    # Windows
    {"name": "TC156_Windows_Chrome_PDFDisabled", "os": "windows", "target_browser": "chrome", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC156_Windows_Firefox_PDFDisabled", "os": "windows", "target_browser": "firefox", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC156_Windows_Edge_PDFDisabled", "os": "windows", "target_browser": "edge", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    
    # macOS
    {"name": "TC157_macOS_Chrome_PDFDisabled", "os": "macos", "target_browser": "chrome", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC157_macOS_Firefox_PDFDisabled", "os": "macos", "target_browser": "firefox", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC157_macOS_Safari_PDFDisabled", "os": "macos", "target_browser": "safari", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC157_macOS_Edge_PDFDisabled", "os": "macos", "target_browser": "edge", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    
    # Linux
    {"name": "TC158_Linux_Chrome_PDFDisabled", "os": "linux", "target_browser": "chrome", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC158_Linux_Firefox_PDFDisabled", "os": "linux", "target_browser": "firefox", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
    {"name": "TC158_Linux_Chromium_PDFDisabled", "os": "linux", "target_browser": "chromium", "pdfViewerEnabled": False, "expected_pdf_value": "false"}
]


class ChangePDFViewerEnabledSameDeviceDiffBrowserTest(BaseAttributeTest):
    
    def __init__(self, os_type=None):
        if os_type is None:
            os_type = detect_current_os()
        
        credentials_mapping = {
            ('windows', 'chrome'): 'gd_tc156_test',
            ('windows', 'firefox'): 'gd_tc156_test',
            ('windows', 'edge'): 'gd_tc156_test',
            ('macos', 'chrome'): 'gd_tc157_test',
            ('macos', 'firefox'): 'gd_tc157_test',
            ('macos', 'safari'): 'gd_tc157_test',
            ('macos', 'edge'): 'gd_tc157_test',
            ('linux', 'chrome'): 'gd_tc158_test',
            ('linux', 'firefox'): 'gd_tc158_test',
            ('linux', 'chromium'): 'gd_tc158_test'
        }
        
        default_key = f'gd_tc156_test' if os_type == 'windows' else f'gd_tc157_test' if os_type == 'macos' else 'gd_tc158_test'
        credentials_key = credentials_mapping.get((os_type, 'chrome'), default_key)
        
        super().__init__(credentials_key)
        
        self.os_type = os_type
        self.test_pdf_configs = self._get_pdf_config_by_os(os_type)
    
    def _get_pdf_config_by_os(self, os_type):
        return [config for config in PDF_VIEWER_DISABLED_CONFIGS if config["os"] == os_type]
    
    def get_test_configs(self):
        return self.test_pdf_configs
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def run_single_browser_test(self, browser_type, headless=True):
        test_configs = self.get_test_configs()
        
        browser_configs = [
            config for config in test_configs 
            if config.get('target_browser') == browser_type
        ]
        
        if not browser_configs:
            print(f"⚠️  No PDF viewer configs found for {browser_type}")
            return
        
        for i, test_config in enumerate(browser_configs, 1):
            try:
                self.test_single_browser_attribute_combination(browser_type, test_config, headless)
                
                if i < len(browser_configs):
                    time.sleep(3)
                    
            except Exception as e:
                print(f"Error in {browser_type} test {i}: {e}")
                continue
    
    def _prepare_browser_config(self, test_config):
        browser_config = super()._prepare_browser_config(test_config)
        
        if "pdfViewerEnabled" in test_config:
            browser_config["pdfViewerEnabled"] = test_config["pdfViewerEnabled"]
            
        return browser_config
    
    def verify_transaction_attributes(self, test_name, browser_type, test_config):
        login_name = self.credentials['username']
        
        expected_transaction_data = {
            "subscriberID": self.api_config["subscriber_id"],
            "loginName": login_name,
            "url": self.test_url
        }
        
        attributes = {}
        
        if "expected_pdf_value" in test_config:
            attributes["pdfViewerEnabled"] = test_config["expected_pdf_value"]
            
        attributes.update({
            "cookiesEnabled": "true",
            "localStorage": "true", 
            "sessionStorage": "true"
        })
        
        if attributes:
            expected_transaction_data["attributes"] = attributes
        
        self.transaction_verifier.verify_complete_transaction(
            test_name,
            expected_transaction_data,
            max_retries=3,
            retry_delay=5,
            batch_size=10
        )
    
    def get_test_description(self):
        return f"Change PDF Viewer Enabled Cross Platform: {self.os_type.upper()} OS PDF Testing"

