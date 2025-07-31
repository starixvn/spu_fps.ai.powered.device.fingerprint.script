from ..base_attribute.attribue import (
    BaseAttributeTest,
    get_browsers_by_os,
    detect_current_os
)
from utils.browser_factory import BrowserDriverFactory
from utils.login_helper import TestLoginHelper
from config import ConfigManager

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

class LoginConsistencyTest(BaseAttributeTest):
    
    def __init__(self, browser_type='chrome'):
        
        self.os_type = detect_current_os()
        credentials_key = self._get_credentials_key(browser_type, 'login_tc001_chrome')
        super().__init__(credentials_key)
    
    def _get_credentials_key(self, browser_type, default_key):
        platform_mapping = CREDENTIALS_MAPPING.get(self.os_type, CREDENTIALS_MAPPING['windows'])

        return platform_mapping.get(browser_type, default_key)
    
    def get_test_configs(self):
        if self.os_type in CONSISTENCY_CONFIG:
            return [CONSISTENCY_CONFIG[self.os_type]]
        return [CONSISTENCY_CONFIG['windows']]  
    
    def get_test_browsers(self):
        return get_browsers_by_os(self.os_type)
    
    def get_test_browsers_for_os(self, os_type):
        return get_browsers_by_os(os_type)

class LoginConsistencyMultiBrowserTest(LoginConsistencyTest):

    def __init__(self, browser_type='chrome'):

        super().__init__(browser_type)

    def _create_driver(self, browser_type, headless):
        return BrowserDriverFactory.create_driver(browser_type, headless)

    def run_login_transaction_test(self, headless=True):
        for browser_type in self.get_test_browsers():

            test_instance = LoginConsistencyTest(browser_type=browser_type)
            driver = self._create_driver(browser_type, headless)

            try:
                test_name = f"{browser_type}_login_transaction"
                login_result = TestLoginHelper.perform_login_with_attributes(
                    driver, self.test_url, test_instance.credentials
                )
                if login_result.get("login_result") == "SUCCESS":
                    test_instance.verify_transaction_attributes(test_name, browser_type, [])
            finally:
                driver.quit()

    def run_dual_trans_login_test(self, headless=True):
        for browser_type in self.get_test_browsers():

            test_instance = LoginConsistencyTest(browser_type=browser_type)

            driver = self._create_driver(browser_type, headless)

            session_results = []
            try:
                for i in range(2):
                    login_result = TestLoginHelper.perform_login_with_attributes(
                        driver, self.test_url, test_instance.credentials
                    )
                    if login_result.get("login_result") == "SUCCESS":
                        TestLoginHelper.perform_logout(driver)

                    session_results.append(login_result)
                if len(session_results) == 2:
                    test_instance.verify_dual_session_transactions(session_results, browser_type)
            finally:
                driver.quit()


    






