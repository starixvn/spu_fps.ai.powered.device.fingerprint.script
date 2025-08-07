from selenium.common.exceptions import WebDriverException
from services.login_service import TestLoginHelper
from services.transaction_service import TransactionAPIHelper, TransactionVerifier
from models.exceptions import LoginTestException, BrowserException, CredentialsException
from config.settings import get_api_config_for_environment
import os


class BaseTest:
    
    CREDENTIAL_KEY = "login_test"  

    @classmethod
    def setup_class(cls):
        env = os.getenv("ENVIRONMENT", "DEV")
        api_config = get_api_config_for_environment(env)
        cls.transaction_api = TransactionAPIHelper(api_config["base_url"])
        cls.transaction_verifier = TransactionVerifier(cls.transaction_api)
        cls.subscriber_id = api_config["subscriber_id"]
    
    def perform_login_test(self, driver, test_url, credentials, test_name, verify_transaction=True):
       
        try:
            if not driver:
                raise BrowserException(
                    "Browser driver is None or not initialized",
                    test_name=test_name
                )
            
            if not test_url or not test_url.startswith(('http://', 'https://')):
                raise BrowserException(
                    f"Invalid test URL: {test_url}",
                    test_name=test_name,
                    url=test_url
                )
            if not credentials or not credentials.get('username'):
                raise CredentialsException(
                    "Failed to retrieve valid test credentials",
                    test_name=test_name,
                    credentials_key=self.CREDENTIAL_KEY
                )
            
            result = TestLoginHelper.perform_login_with_attributes(
                driver, test_url, credentials
            )
            
            if not result:
                raise LoginTestException(
                    "Login helper returned None result",
                    test_name=test_name,
                    username=credentials.get('username')
                )
            
            if result.get('error'):
                return result
            
            if verify_transaction and result["login_result"] == "SUCCESS":
                self.verify_login_transaction(credentials.get('username'), test_name)
            
            return result
            
        except WebDriverException as e:
            raise BrowserException(
                f"WebDriver exception: {str(e)}",
                test_name=test_name,
                url=test_url
            )
        except Exception as e:
            if isinstance(e, (BrowserException, LoginTestException, CredentialsException)):
                raise
            
            raise LoginTestException(
                f"Unexpected exception during login: {str(e)}",
                test_name=test_name,
                username=credentials.get('username', 'Unknown')
            )
    
    def verify_login_transaction(self, login_name: str, test_name: str):
       
        try:
            verification_result = self.__class__.transaction_verifier.verify_transaction_exists(
                subscriber_id=self.__class__.subscriber_id,
                login_name=login_name
            )
            
            if not verification_result.success:
                raise LoginTestException(
                    f"Transaction verification failed: {verification_result.message}. No transaction found for subscriber_id: {self.__class__.subscriber_id}",
                    test_name=test_name,
                    username=login_name
                )
            
            latest_transaction = verification_result.latest_transaction
            if latest_transaction:
                if latest_transaction.loginName != login_name:
                    raise LoginTestException(
                        f"Transaction login name mismatch: expected '{login_name}', got '{latest_transaction.loginName}'",
                        test_name=test_name,
                        username=login_name
                    )
                
                if latest_transaction.action != "login":
                    raise LoginTestException(
                        f"Transaction action mismatch: expected 'login', got '{latest_transaction.action}'",
                        test_name=test_name,
                        username=login_name
                    )
                
                if latest_transaction.actionResult != "successfull":  
                    raise LoginTestException(
                        f"Transaction result mismatch: expected 'successfull', got '{latest_transaction.actionResult}'",
                        test_name=test_name,
                        username=login_name,
                        login_result=latest_transaction.actionResult
                    )
            else:
                raise LoginTestException(
                    "Transaction verification failed: No transaction details available",
                    test_name=test_name,
                    username=login_name
                )
                
        except Exception as e:
            if isinstance(e, LoginTestException):
                raise
            
            raise LoginTestException(
                f"Transaction verification error: {str(e)}. Subscriber ID: {self.__class__.subscriber_id}",
                test_name=test_name,
                username=login_name
            )
    
    def verify_fingerprint_attribute(self, login_name: str, attribute_name: str, expected_value: str, test_name: str):
        """Verify fingerprint attribute in transaction data"""
        
        try:
            verification_result = self.__class__.transaction_verifier.verify_transaction_exists(
                subscriber_id=self.__class__.subscriber_id,
                login_name=login_name
            )
            
            if not verification_result.success:
                raise LoginTestException(
                    f"Cannot verify attribute - no transaction found for login: {login_name}",
                    test_name=test_name,
                    username=login_name
                )
            
            latest_transaction = verification_result.latest_transaction
            if not latest_transaction:
                raise LoginTestException(
                    f"Cannot verify attribute - no transaction data found for login: {login_name}",
                    test_name=test_name,
                    username=login_name
                )
            
            actual_value = getattr(latest_transaction, attribute_name, None)
            
            if actual_value is None and latest_transaction.attributes:
                actual_value = getattr(latest_transaction.attributes, attribute_name, None)
            
            if actual_value is None:
                main_attrs = [attr for attr in dir(latest_transaction) if not attr.startswith('_')]
                attr_attrs = [attr for attr in dir(latest_transaction.attributes) if not attr.startswith('_')] if latest_transaction.attributes else []
                
                raise LoginTestException(
                    f"Attribute '{attribute_name}' not found in transaction data for login: {login_name} | Available main fields: {main_attrs[:10]}... | Available attribute fields: {attr_attrs[:10]}...",
                    test_name=test_name,
                    username=login_name
                )
            
            if str(actual_value) != str(expected_value):
                raise LoginTestException(
                    f"Attribute '{attribute_name}' mismatch for login '{login_name}': expected '{expected_value}', got '{actual_value}'",
                    test_name=test_name,
                    username=login_name
                )
            
            return True
            
        except Exception as e:
            if isinstance(e, LoginTestException):
                raise
            
            raise LoginTestException(
                f"Attribute verification error for '{attribute_name}': {str(e)}",
                test_name=test_name,
                username=login_name
            )
    
    def perform_login_and_logout(self, driver, test_url, credentials, test_name, session_manager=None):
       
        login_result = self.perform_login_test(driver, test_url, credentials, test_name)
        
        if login_result["login_result"] == "SUCCESS":
            logout_success = False
            logout_message = ""
            
            try:
                if session_manager:
                    logout_success = session_manager.perform_logout()
                    logout_message = "Logout completed via session manager"
                else:
                    logout_success, logout_message = TestLoginHelper.perform_logout(driver)
                
                login_result["logout_result"] = "SUCCESS" if logout_success else "FAILED"
                login_result["logout_message"] = logout_message
                
            except Exception as logout_error:
                login_result["logout_result"] = "ERROR"
                login_result["logout_message"] = str(logout_error)
        
        return login_result
    
    def assert_login_success(self, result, test_name):
       
        if result["login_result"] != "SUCCESS":
            raise LoginTestException(
                f"Login failed: {result.get('error', 'Unknown error')}",
                test_name=test_name,
                login_result=result.get('login_result'),
                final_url=result.get('final_url')
            )
        
        assert result["login_result"] == "SUCCESS"
