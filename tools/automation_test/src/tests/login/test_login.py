import pytest
from models.exceptions import LoginTestException, BrowserException, CredentialsException
from factories.browser_factory import BrowserDriverFactory
from tests.base_test import BaseTest


class TestLogin(BaseTest):
    
    @pytest.mark.login
    def test_login(self, browser_driver, test_url, test_credentials):
        
        test_name = "Init Transaction"
        credential_key = "login_test"
        
        try:
            credentials = test_credentials(credential_key)
            
            result = self.perform_login_test(browser_driver, test_url, credentials, test_name)
            
            self.assert_login_success(result, test_name)
            
        except (LoginTestException, BrowserException, CredentialsException) as e:
            pytest.fail(str(e))
        except Exception as e:
            error_msg = f"Unexpected exception in {test_name}: {str(e)}"
            pytest.fail(error_msg)
    
    @pytest.mark.login
    def test_multiple_browser_dual_login(self, test_url, test_credentials, supported_browsers, browser_session_manager):
        
        for browser_type in supported_browsers:
            self._test_browser_dual_login(browser_type, test_url, test_credentials, browser_session_manager)
    
    def _test_browser_dual_login(self, browser_type, test_url, test_credentials, browser_session_manager):
        
        credential_numbers = {
            "chrome": "TC001",
            "firefox": "TC002", 
            "edge": "TC003"
        }
        
        tc_number = credential_numbers.get(browser_type, "TC001")
        credential_key = f"{browser_type}_{tc_number}"
    
        driver = None
        try:
            driver = self._create_browser_driver(browser_type)
            
            if not driver:
                pytest.fail(f"Failed to create {browser_type} driver")
            
            session_manager = browser_session_manager(driver)

            first_credentials = test_credentials(f"{credential_key}_Login1")
            second_credentials = test_credentials(f"{credential_key}_Login2")
            test_name = f"NormalTrans_{tc_number}"
            
            session_manager.prepare_for_new_login(test_url)
            
            first_result = self.perform_login_test(
                driver=driver,
                test_url=test_url,
                credentials=first_credentials,
                test_name=test_name,
                verify_transaction=False
            )
            
            self.assert_login_success(first_result, test_name)
            
            session_manager.perform_logout()
            
            session_manager.prepare_for_new_login(test_url)
            
            second_result = self.perform_login_test(
                driver=driver,
                test_url=test_url,
                credentials=second_credentials,
                test_name=test_name,
                verify_transaction=False
            )
            
            self.assert_login_success(second_result, test_name)
            
        except Exception as e:
            pytest.fail(f"Dual login failed for {browser_type}: {str(e)}")
        finally:
            if driver:
                try:
                    driver.quit()
                except Exception:
                    pass
    
    def _create_browser_driver(self, browser_type):
        
        try:
            if browser_type == "chrome":
                return BrowserDriverFactory.create_chrome_driver(headless=False)
            elif browser_type == "firefox":
                return BrowserDriverFactory.create_firefox_driver(headless=False)
            elif browser_type == "edge":
                return BrowserDriverFactory.create_edge_driver(headless=False)
            else:
                raise Exception(f"Unsupported browser type: {browser_type}")
        except Exception as e:
            print(f"Failed to create {browser_type} driver: {str(e)}")
            return None
    
    



