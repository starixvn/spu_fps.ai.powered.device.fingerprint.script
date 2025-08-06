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
            
            if not credentials or not credentials.get('username'):
                raise CredentialsException(
                    "Failed to retrieve valid test credentials",
                    test_name=test_name,
                    credentials_key=self.CREDENTIAL_KEY
                )
            
            result = TestLoginHelper.perform_login_with_attributes(
                driver, test_url, credentials
            )
            
            if result.get('error'):
                return result
            
            if verify_transaction and result["login_result"] == "SUCCESS":
                verification_result = self.verify_login_transaction(credentials.get('username'), test_name)

                result["transaction_verification"] = {
                    "success": verification_result.success,
                    "message": verification_result.message
                }
            
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
        
    def perform_login_and_logout(self, driver, test_url, credentials, test_name, session_manager=None):

        login_result = self.perform_login_test(driver, test_url, credentials, test_name, verify_transaction=False)

        if login_result["login_result"] == "SUCCESS":
            logout_success = False
            logout_message = ""
            
            try:
                if session_manager:
                    logout_success, logout_message = session_manager.perform_logout()
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
            
            return verification_result
        except Exception as e:
            if isinstance(e, LoginTestException):
                raise
            
            raise LoginTestException(
                f"Transaction verification error: {str(e)}. Subscriber ID: {self.__class__.subscriber_id}",
                test_name=test_name,
                username=login_name
            )
    
    def verify_fingerprint_attributes(self, login_name: str, expected_attributes: dict, test_name: str):
        
        try:
            verification_result = self.__class__.transaction_verifier.verify_transaction_exists(
                subscriber_id=self.__class__.subscriber_id,
                login_name=login_name
            )
            
            if not verification_result.success:
                raise LoginTestException(
                    f"Cannot verify attributes - no transaction found for login: {login_name}",
                    test_name=test_name,
                    username=login_name
                )
            
            latest_transaction = verification_result.latest_transaction
            verification_results = {}
            all_passed = True
            
            for attribute_name, expected_value in expected_attributes.items():
                try:
                    actual_value = getattr(latest_transaction, attribute_name, None)
                    
                    if actual_value is None and latest_transaction.attributes:
                        actual_value = getattr(latest_transaction.attributes, attribute_name, None)
                    
                    if actual_value is None:
                        verification_results[attribute_name] = {
                            "success": False,
                            "expected": expected_value,
                            "actual": None,
                            "error": f"Attribute '{attribute_name}' not found in transaction data"
                        }
                        all_passed = False
                        continue
                    
                    matches = str(actual_value) == str(expected_value)
                    verification_results[attribute_name] = {
                        "success": matches,
                        "expected": expected_value,
                        "actual": actual_value,
                        "error": None if matches else f"Value mismatch: expected '{expected_value}', got '{actual_value}'"
                    }
                    
                    if not matches:
                        all_passed = False
                        
                except Exception as attr_error:
                    verification_results[attribute_name] = {
                        "success": False,
                        "expected": expected_value,
                        "actual": None,
                        "error": f"Error verifying attribute: {str(attr_error)}"
                    }
                    all_passed = False
            
            if not all_passed:
                failed_attrs = [attr for attr, result in verification_results.items() if not result["success"]]
                error_details = []
                for attr in failed_attrs:
                    error_details.append(f"{attr}: {verification_results[attr]['error']}")
                
                raise LoginTestException(
                    f"Attribute verification failed for login '{login_name}'. Failed attributes: {', '.join(failed_attrs)}. Details: {'; '.join(error_details)}",
                    test_name=test_name,
                    username=login_name
                )
            
            return verification_results
            
        except Exception as e:
            if isinstance(e, LoginTestException):
                raise
            
            raise LoginTestException(
                f"Attribute verification error: {str(e)}",
                test_name=test_name,
                username=login_name
            )
    
    def verify_single_fingerprint_attribute(self, login_name: str, attribute_name: str, expected_value: str, test_name: str):

        return self.verify_fingerprint_attributes(login_name, {attribute_name: expected_value}, test_name)
        
    def _verify_dual_transaction(self, credential1: str, credential2: str, test_name: str):
        
        try:
            result = self.__class__.transaction_verifier.verify_dual_transaction(
                subscriber_id=self.__class__.subscriber_id,
                login_name1=credential1.get('username'),
                login_name2=credential2.get('username')
            )
            
            if not result.success:
                raise LoginTestException(
                    f"Dual transaction verification failed: {result.message}",
                    test_name=test_name,
                    username=f"{credential1.get('username')} vs {credential2.get('username')}"
                )
            
            return result
            
        except Exception as e:
            if isinstance(e, LoginTestException):
                raise
            
            raise LoginTestException(
                f"Dual transaction verification error: {str(e)}",
                test_name=test_name,
                username=f"{credential1.get('username')} vs {credential2.get('username')}"
            )
