from utils.login_helper import LoginHelper

class TestLoginHelper:
    
    @staticmethod
    def perform_login_with_attributes(driver, test_url, credentials):
        try:
            login_helper = LoginHelper(driver)
            login_success, login_error = login_helper.perform_login(
                test_url,
                credentials['username'],
                credentials['password']
            )
            
            return {
                "login_result": "SUCCESS" if login_success else "FAILED",
                "error": login_error if not login_success else None,
                "final_url": driver.current_url,
                "username": credentials['username']
            }
                
        except Exception as e:
            return {
                "login_result": "ERROR",
                "error": str(e),
                "username": credentials['username']
            }
