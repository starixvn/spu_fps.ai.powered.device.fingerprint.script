from ...base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)

# Centralized PDF viewer configurations by OS and browser
PDF_VIEWER_CONFIG = {
    'windows': {
        'chrome': {"name": "TC156_Windows_Chrome_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'firefox': {"name": "TC156_Windows_Firefox_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'edge': {"name": "TC156_Windows_Edge_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"}
    },
    'macos': {
        'chrome': {"name": "TC157_macOS_Chrome_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'firefox': {"name": "TC157_macOS_Firefox_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'safari': {"name": "TC157_macOS_Safari_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'edge': {"name": "TC157_macOS_Edge_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"}
    },
    'linux': {
        'chrome': {"name": "TC158_Linux_Chrome_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'firefox': {"name": "TC158_Linux_Firefox_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"},
        'chromium': {"name": "TC158_Linux_Chromium_PDFDisabled", "pdfViewerEnabled": False, "expected_pdf_value": "false"}
    }
}

CREDENTIALS_MAPPING = {
    'single': {
        'windows': 'gd_tc156_test',
        'macos': 'gd_tc157_test',
        'linux': 'gd_tc158_test'
    }
}


class PDFViewerTest(BaseAttributeTest):
    
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
            if browser in PDF_VIEWER_CONFIG.get(self.os_type, {}):
                config = PDF_VIEWER_CONFIG[self.os_type][browser].copy()
                configs.append(config)
        
        return configs
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_description(self):
        current_os = detect_current_os()
        cross_platform = " (Cross-platform)" if self.os_type != current_os else ""
        test_desc = "Single Session" if self.test_type == 'single' else "Dual Session"
        return f"PDF Viewer {test_desc} Test: {self.os_type.upper()} on {current_os.upper()}{cross_platform}"
    
    def run_single_browser_test(self, browser_type, headless=True):
        if browser_type not in PDF_VIEWER_CONFIG.get(self.os_type, {}):
            print(f"⚠️  No PDF viewer config found for {browser_type} on {self.os_type}")
            return
        
        test_config = PDF_VIEWER_CONFIG[self.os_type][browser_type]
        
        try:
            self.test_single_browser_attribute_combination(browser_type, test_config, headless)
        except Exception as e:
            print(f"Error in {browser_type} PDF viewer test: {e}")
    
    def run_single_session_test(self, headless=True):
        self.run_cross_browser_test(headless)
    
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


class ChangePDFViewerEnabledSameDeviceDiffBrowserTest(PDFViewerTest):
    
    def __init__(self, os_type=None):
        super().__init__(os_type, 'single')

