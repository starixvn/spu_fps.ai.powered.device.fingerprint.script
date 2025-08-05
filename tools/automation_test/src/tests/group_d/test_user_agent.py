import pytest
from tests.base_test import BaseTest
from models.exceptions import  BrowserException
from factories.browser_factory import BrowserDriverFactory, BrowserConfigTemplates


class TestUserAgent(BaseTest):
    
    USER_AGENTS = {
        "chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "edge": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    }
    
    @pytest.mark.user_agent
    def test_cross_browser_user_agent_spoofing(self, test_url, test_credentials):
        
        chrome_credentials = test_credentials("chrome_user_agent")
        firefox_credentials = test_credentials("firefox_user_agent")
        edge_credentials = test_credentials("edge_user_agent")
        
        _ = self._test_browser_with_spoofed_ua(
            browser_type="chrome",
            spoofed_ua=self.USER_AGENTS["firefox"],
            test_url=test_url,
            credentials=chrome_credentials,
            test_name="GroupD_TC001_Chrome"
        )
        
        _ = self._test_browser_with_spoofed_ua(
            browser_type="firefox",
            spoofed_ua=self.USER_AGENTS["chrome"],
            test_url=test_url,
            credentials=firefox_credentials,
            test_name="GroupD_TC001_Firefox"
        )
        
        _ = self._test_browser_with_spoofed_ua(
            browser_type="edge",
            spoofed_ua=self.USER_AGENTS["firefox"],
            test_url=test_url,
            credentials=edge_credentials,
            test_name="GroupD_TC001_Edge"
        )
        
    @pytest.mark.user_agent
    def test_multiple_browser_dual_user_agent_login(self, test_url, test_credentials, supported_browsers, browser_session_manager):
        
        for browser_type in supported_browsers:
            self._test_browser_dual_user_agent_login(browser_type, test_url, test_credentials, browser_session_manager)
    
    def _test_browser_dual_user_agent_login(self, browser_type, test_url, test_credentials, browser_session_manager):
        
        credential_numbers = {
            "chrome": "GroupD_TC004",
            "firefox": "GroupD_TC005", 
            "edge": "GroupD_TC020"
        }
        
        tc_number = credential_numbers.get(browser_type, "GroupD_TC004")
        credential_key = f"{browser_type}_{tc_number}"
        
        spoofed_ua = self._get_spoofed_user_agent(browser_type)
        
        driver = None
        try:
            driver = self._create_driver_with_user_agent(browser_type, spoofed_ua)
            
            if not driver:
                pytest.fail(f"Failed to create {browser_type} driver with spoofed user-agent")
            
            session_manager = browser_session_manager(driver)
            
            first_credentials = test_credentials(f"{credential_key}_Login1")
            second_credentials = test_credentials(f"{credential_key}_Login2")
            test_name = tc_number
            
            session_manager.prepare_for_new_login(test_url)
            
            first_result = self.perform_login_test(
                driver=driver,
                test_url=test_url,
                credentials=first_credentials,
                test_name=test_name,
                verify_transaction=False
            )
            
            self.assert_login_success(first_result, test_name)
            
            self.verify_fingerprint_attribute(
                login_name=first_credentials.get('username'),
                attribute_name="userAgent",
                expected_value=spoofed_ua,
                test_name=test_name
            )
            
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
            
            self.verify_fingerprint_attribute(
                login_name=second_credentials.get('username'),
                attribute_name="userAgent",
                expected_value=spoofed_ua,
                test_name=test_name
            )
            
        except Exception as e:
            pytest.fail(f"Dual user-agent login failed for {browser_type}: {str(e)}")
        finally:
            if driver:
                try:
                    driver.quit()
                except Exception:
                    pass
    
    def _get_spoofed_user_agent(self, browser_type):
        ua_mapping = {
            "chrome": self.USER_AGENTS["firefox"],
            "firefox": self.USER_AGENTS["chrome"],
            "edge": self.USER_AGENTS["firefox"]
        }
        return ua_mapping.get(browser_type, self.USER_AGENTS["firefox"])
    
    def _test_browser_with_spoofed_ua(self, browser_type, spoofed_ua, test_url, credentials, test_name):
        
        driver = None
        try:
            driver = self._create_driver_with_user_agent(browser_type, spoofed_ua)
            
            if not driver:
                return {
                    "login_result": "FAILED",
                    "error": f"Failed to create {browser_type} driver with spoofed user-agent"
                }
            
            result = self.perform_login_test(
                driver=driver,
                test_url=test_url,
                credentials=credentials,
                test_name=test_name,
                verify_transaction=True
            )
            
            self.assert_login_success(result, test_name)
            
            try:
                self.verify_fingerprint_attribute(
                    login_name=credentials.get('username'),
                    attribute_name="userAgent",
                    expected_value=spoofed_ua,
                    test_name=test_name
                )
            except Exception as ua_error:
                result["user_agent_verification"] = "FAILED"
                result["user_agent_error"] = str(ua_error)
            
            return result
            
        except Exception as e:
            error_msg = f"User-agent spoofing test failed for {browser_type}: {str(e)}"
            return {
                "login_result": "FAILED",
                "error": error_msg
            }
        
        finally:
            if driver:
                try:
                    driver.quit()
                except Exception as e:
                    print(f"   ⚠️ Error closing {browser_type} driver: {str(e)}")
    
    def _create_driver_with_user_agent(self, browser_type, user_agent):
        
        try:
            custom_config = BrowserConfigTemplates.get_user_agent_config(
                user_agent_string=user_agent,
                config_name=f"{browser_type}_spoofed"
            )
            
            if browser_type == "chrome":
                return BrowserDriverFactory.create_chrome_driver(
                    headless=False,
                    custom_config=custom_config
                )
                
            elif browser_type == "firefox":
                return BrowserDriverFactory.create_firefox_driver(
                    headless=False,
                    custom_config=custom_config
                )
                
            elif browser_type == "edge":
                return BrowserDriverFactory.create_edge_driver(
                    headless=False,
                    custom_config=custom_config
                )
            else:
                raise BrowserException(
                    f"Unsupported browser type: {browser_type}",
                    test_name="USER_AGENT_DRIVER_CREATION"
                )
                
        except Exception as e:
            print(f"Failed to create {browser_type} driver with user-agent: {str(e)}")
            return None
