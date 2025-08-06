import pytest
from tests.base_test import BaseTest
from factories.browser_factory import BrowserConfigTemplates
import platform


class TestUserAgent(BaseTest):

#region Windows Only Tests

    #region GroupD_TC001  
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Windows", reason="Skipping user agent tests on non-Windows platforms")
    @pytest.mark.parametrize("browser_driver", [
        {
            "browser_type": "chrome",
            "test_case": "GroupD_TC001_chrome", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", "chrome_spoofed")
        },
        {
            "browser_type": "firefox", 
            "test_case": "GroupD_TC001_firefox", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "firefox_spoofed")
        },
        {
            "browser_type": "edge", 
            "test_case": "GroupD_TC001_edge", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", "edge_spoofed")
        }
    ], indirect=True, ids=["chrome", "firefox", "edge"])
    def test_cross_browser_user_agent_spoofing_windows(self, test_url, test_credentials, browser_driver):
        
        test_case = getattr(browser_driver, 'test_case', 'GroupD_TC001_chrome')
        custom_config = getattr(browser_driver, 'custom_config', None)

        credentials = test_credentials(test_case)
    
        result = self.perform_login_test(
            driver=browser_driver,
            test_url=test_url,
            credentials=credentials,
            test_name=test_case,        
            verify_transaction=True
        )

        self.assert_login_success(result, test_case)
        
        self.verify_single_fingerprint_attribute(
            login_name=credentials.get('username'),
            attribute_name="userAgent",
            expected_value=custom_config['user_agent'],
            test_name=test_case
        )

    #endregion GroupD_TC001

    #region GroupD_TC004
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Windows", reason="Skipping user agent tests on non-Windows platforms")
    @pytest.mark.parametrize("chrome_driver", [
        {
            "test_case": "GroupD_TC004",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", 
                "chrome_dual_spoofed"
            )
        }
    ], indirect=True)
    def test_dual_user_agent_chrome_login_windows(self, test_url, test_credentials, chrome_driver, browser_session_manager):
        
        test_case_base = getattr(chrome_driver, 'test_case', 'GroupD_TC004')

        result = self._dual_user_agent_login(
            driver=chrome_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC004

    #region GroupD_TC005
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Windows", reason="Skipping user agent tests on non-Windows platforms")
    @pytest.mark.parametrize("firefox_driver", [
        {
            "test_case": "GroupD_TC005",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "firefox_spoofed"
            )
        }
    ], indirect=True)
    def test_firefox_user_agent_spoofing_windows(self, test_url, test_credentials, firefox_driver, browser_session_manager):
        test_case_base = getattr(firefox_driver, 'test_case', 'GroupD_TC005')

        result = self._dual_user_agent_login(
            driver=firefox_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC005

    #region GroupD_TC006
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Windows", reason="Skipping user agent tests on non-Windows platforms")
    @pytest.mark.parametrize("edge_driver", [
        {
            "test_case": "GroupD_TC006",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "edge_spoofed"
            )
        }
    ], indirect=True)
    def test_edge_user_agent_spoofing_windows(self, test_url, test_credentials, edge_driver, browser_session_manager):
        test_case_base = getattr(edge_driver, 'test_case', 'GroupD_TC006')

        result = self._dual_user_agent_login(
            driver=edge_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC006

#endregion Windows Only Tests

#region MacOS Only Tests

    #region GroupD_TC002  
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Darwin", reason="Skipping user agent tests on MacOS platforms")
    @pytest.mark.parametrize("browser_driver", [
        {
            "browser_type": "safari",
            "test_case": "GroupD_TC002_safari",
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0.2 Safari/605.1.15", "safari_spoofed")
        },
        {
            "browser_type": "chrome",
            "test_case": "GroupD_TC002_chrome", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", "chrome_spoofed")
        },
        {
            "browser_type": "firefox", 
            "test_case": "GroupD_TC002_firefox", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "firefox_spoofed")
        },
        {
            "browser_type": "edge", 
            "test_case": "GroupD_TC002_edge", 
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", "edge_spoofed")
        },
    ], indirect=True, ids=["safari", "chrome", "firefox", "edge"])
    def test_cross_browser_user_agent_spoofing_macos(self, test_url, test_credentials, browser_driver):

        test_case = getattr(browser_driver, 'test_case', 'GroupD_TC002_safari')
        custom_config = getattr(browser_driver, 'custom_config', None)

        credentials = test_credentials(test_case)
    
        result = self.perform_login_test(
            driver=browser_driver,
            test_url=test_url,
            credentials=credentials,
            test_name=test_case,        
            verify_transaction=True
        )

        self.assert_login_success(result, test_case)
        
        self.verify_single_fingerprint_attribute(
            login_name=credentials.get('username'),
            attribute_name="userAgent",
            expected_value=custom_config['user_agent'],
            test_name=test_case
        )

    #endregion GroupD_TC002

    #region GroupD_TC007

    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Darwin", reason="Skipping user agent tests on non-MacOS platforms")
    @pytest.mark.parametrize("safari_driver", [
        {
            "test_case": "GroupD_TC007",
            "custom_config": BrowserConfigTemplates.get_user_agent_config("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0.2 Safari/605.1.15", "safari_spoofed")
        }
    ], indirect=True)
    def test_dual_user_agent_safari_login(self, test_url, test_credentials, safari_driver, browser_session_manager):

        test_case = getattr(safari_driver, 'test_case', 'GroupD_TC007')
        result = self._dual_user_agent_login(
            driver=safari_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC007

    #region GroupD_TC008
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Darwin", reason="Skipping user agent tests on non-MacOS platforms")
    @pytest.mark.parametrize("chrome_driver", [
        {
            "test_case": "GroupD_TC008",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", 
                "chrome_dual_spoofed"
            )
        }
    ], indirect=True)
    def test_dual_user_agent_chrome_login_macos(self, test_url, test_credentials, chrome_driver, browser_session_manager):
        
        test_case_base = getattr(chrome_driver, 'test_case', 'GroupD_TC008')

        result = self._dual_user_agent_login(
            driver=chrome_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC008

    #region GroupD_TC009
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Darwin", reason="Skipping user agent tests on non-MacOS platforms")
    @pytest.mark.parametrize("firefox_driver", [
        {
            "test_case": "GroupD_TC009",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "firefox_spoofed"
            )
        }
    ], indirect=True)
    def test_firefox_user_agent_spoofing_macos(self, test_url, test_credentials, firefox_driver, browser_session_manager):
        test_case_base = getattr(firefox_driver, 'test_case', 'GroupD_TC009')

        result = self._dual_user_agent_login(
            driver=firefox_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC009

    #region GroupD_TC010
    @pytest.mark.user_agent
    @pytest.mark.skipif(platform.system() != "Darwin", reason="Skipping user agent tests on non-MacOS platforms")
    @pytest.mark.parametrize("edge_driver", [
        {
            "test_case": "GroupD_TC010",
            "custom_config": BrowserConfigTemplates.get_user_agent_config(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "edge_spoofed"
            )
        }
    ], indirect=True)
    def test_edge_user_agent_spoofing_macos(self, test_url, test_credentials, edge_driver, browser_session_manager):
        test_case_base = getattr(edge_driver, 'test_case', 'GroupD_TC010')

        result = self._dual_user_agent_login(
            driver=edge_driver,
            test_url=test_url,
            test_credentials=test_credentials,
            browser_session_manager=browser_session_manager,
            test_case_base=test_case_base
        )

        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion GroupD_TC010

#endregion MacOS Only Tests


    def _dual_user_agent_login(self, driver, test_url, test_credentials, browser_session_manager, test_case_base):
        session_manager = browser_session_manager(driver)

        for attempt in range(2):
            self.perform_login_and_logout(
                driver=driver,
                test_url=test_url,
                credentials=test_credentials(f"{test_case_base}_Login{attempt + 1}"),
                test_name=test_case_base,
                session_manager=session_manager
            )
        result = self._verify_dual_transaction(credential1=test_credentials(f"{test_case_base}_Login1"),
                                      credential2=test_credentials(f"{test_case_base}_Login2"),
                                      test_name=test_case_base)
        return result