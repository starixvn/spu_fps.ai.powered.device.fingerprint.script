import pytest
from models.exceptions import LoginTestException, BrowserException, CredentialsException
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

            if result.get("transaction_verification"):
                assert result["transaction_verification"]["success"], f"Transaction verification failed: {result['transaction_verification']['message']}"
            
        except (LoginTestException, BrowserException, CredentialsException) as e:
            pytest.fail(str(e))
        except Exception as e:
            error_msg = f"Unexpected exception in {test_name}: {str(e)}"
            pytest.fail(error_msg)
    
    #region NormalTrans TC_001
    @pytest.mark.login
    def test_chrome_dual_login(self, test_url, test_credentials, chrome_driver, browser_session_manager):
        
        session_manager = browser_session_manager(chrome_driver)

        for attempt in range(2):
            self.perform_login_and_logout(
                driver=chrome_driver,
                test_url=test_url,
                credentials=test_credentials(f"NormalTrans_TC001_Chrome_Login{attempt + 1}"),
                test_name="NormalTrans_TC001_Chrome",
                session_manager=session_manager
            )
        result = self._verify_dual_transaction(credential1=test_credentials(f"NormalTrans_TC001_Chrome_Login1"),
                                      credential2=test_credentials(f"NormalTrans_TC001_Chrome_Login2"),
                                      test_name="NormalTrans_TC001_Chrome")
        
        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion NormalTrans TC_001

    #region NormalTrans TC_002
    @pytest.mark.login
    def test_firefox_dual_login(self, test_url, test_credentials, firefox_driver, browser_session_manager):

        session_manager = browser_session_manager(firefox_driver)       

        for attempt in range(2):
            self.perform_login_and_logout(
                driver=firefox_driver,
                test_url=test_url,
                credentials=test_credentials(f"NormalTrans_TC002_Firefox_Login{attempt + 1}"),
                test_name="NormalTrans_TC002_Firefox",
                session_manager=session_manager
            )
        result = self._verify_dual_transaction(credential1=test_credentials(f"NormalTrans_TC002_Firefox_Login1"),
                                      credential2=test_credentials(f"NormalTrans_TC002_Firefox_Login2"),
                                      test_name="NormalTrans_TC002_Firefox")
        
        assert result.success, f"Dual transaction verification failed: {result.message}"

    #endregion NormalTrans TC_002

    #region NormalTrans TC_003
    @pytest.mark.login
    def test_edge_dual_login(self, test_url, test_credentials, edge_driver, browser_session_manager):

        session_manager = browser_session_manager(edge_driver)

        for attempt in range(2):
            self.perform_login_and_logout(
                driver=edge_driver,
                test_url=test_url,
                credentials=test_credentials(f"NormalTrans_TC003_Edge_Login{attempt + 1}"),
                test_name="NormalTrans_TC003_Edge",
                session_manager=session_manager
            )
        result = self._verify_dual_transaction(credential1=test_credentials(f"NormalTrans_TC003_Edge_Login1"),
                                      credential2=test_credentials(f"NormalTrans_TC003_Edge_Login2"),
                                      test_name="NormalTrans_TC003_Edge")

        assert result.success, f"Dual transaction verification failed: {result.message}"
    #endregion NormalTrans TC_003


