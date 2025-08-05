import time
from selenium.common.exceptions import WebDriverException, NoSuchElementException, TimeoutException
from models.exceptions import LoginTestException, BrowserException, CredentialsException


class LoginHelper:
    
    def __init__(self, driver):
        if not driver:
            raise BrowserException("Driver cannot be None", browser_type="unknown")
        self.driver = driver
    
    def perform_login(self, test_url, username, password):
       
        try:
            if not test_url or not test_url.startswith(('http://', 'https://')):
                raise BrowserException(
                    f"Invalid test URL: {test_url}",
                    url=test_url
                )
            
            if not username:
                raise CredentialsException(
                    "Username cannot be empty"
                )
            
            try:
                self.driver.get(test_url)
            except WebDriverException as e:
                raise BrowserException(
                    f"Failed to navigate to URL: {str(e)}",
                    url=test_url
                )
            
            try:
                self.driver.execute_script("return document.readyState === 'complete'")
                time.sleep(2)
            except WebDriverException as e:
                raise BrowserException(
                    f"Page load check failed: {str(e)}",
                    url=test_url
                )
            
            username_selectors = ["input[name='Username']", "input[id='Username']", "input[type='text']"]
            username_field = self._find_element(username_selectors)

            if not username_field:
                raise LoginTestException(
                    "No username field found on the page",
                    username=username
                )
            
            try:
                username_field.clear()
                username_field.send_keys(username)
            except WebDriverException as e:
                raise LoginTestException(
                    f"Failed to enter username: {str(e)}",
                    username=username
                )
            
            password_selectors = ["input[name='Password']", "input[id='Password']", "input[type='password']"]
            password_field = self._find_element(password_selectors)

            if not password_field:
                raise LoginTestException(
                    "No password field found on the page",
                    username=username
                )
            
            try:
                password_field.clear()
                password_field.send_keys(password)
            except WebDriverException as e:
                raise LoginTestException(
                    f"Failed to enter password: {str(e)}",
                    username=username
                )
            
            login_selectors = ["button[type='submit']", "input[type='submit']", "button[id='login']", "button:contains('Login')"]
            login_button = self._find_element(login_selectors, wait=False)

            if not login_button:
                raise LoginTestException(
                    "No login button found on the page",
                    username=username
                )
            
            try:
                login_button.click()
            except WebDriverException as e:
                raise LoginTestException(
                    f"Failed to click login button: {str(e)}",
                    username=username
                )
            
            time.sleep(3)
            
            current_url = self.driver.current_url
            success = current_url != test_url
            error_msg = "Still on login page - login may have failed" if not success else None
            
            return success, error_msg
            
        except (BrowserException, LoginTestException, CredentialsException):
            raise
        except Exception as e:
            raise LoginTestException(
                f"Unexpected error during login: {str(e)}",
                username=username
            )
    
    def _find_element(self, selectors, wait=True):
        
        for selector in selectors:
            try:
                element = self.driver.find_element("css selector", selector)
                if element and element.is_displayed():
                    return element
            except NoSuchElementException:
                continue
            except WebDriverException as e:
                raise BrowserException(
                    f"Error finding element with selector '{selector}': {str(e)}"
                )
        return None


class TestLoginHelper:
    
    @staticmethod
    def perform_login_with_attributes(driver, test_url, credentials):
       
        try:
            if not driver:
                raise BrowserException("Driver cannot be None")
            
            if not credentials:
                raise CredentialsException("Credentials cannot be None")
            
            if not credentials.get('username'):
                raise CredentialsException(
                    "Username is required in credentials",
                    credentials_key=str(credentials)
                )
            
            login_helper = LoginHelper(driver)
            login_success, login_error = login_helper.perform_login(
                test_url,
                credentials['username'],
                credentials.get('password', '')
            )

            return {
                "login_result": "SUCCESS" if login_success else "FAILED",
                "error": login_error if not login_success else None,
                "final_url": driver.current_url,
                "username": credentials['username']
            }
                
        except (BrowserException, LoginTestException, CredentialsException) as e:
            return {
                "login_result": "ERROR",
                "error": str(e),
                "exception_type": e.__class__.__name__,
                "exception_details": e.to_dict() if hasattr(e, 'to_dict') else str(e),
                "username": credentials.get('username', 'Unknown') if credentials else 'Unknown'
            }
        except Exception as e:
            return {
                "login_result": "ERROR",
                "error": f"Unexpected error: {str(e)}",
                "exception_type": "UnexpectedException",
                "username": credentials.get('username', 'Unknown') if credentials else 'Unknown'
            }
    
    @staticmethod
    def perform_logout(driver):
       
        try:
            if not driver:
                raise BrowserException("Driver cannot be None for logout")
            
            logout_selectors = [
                "a[href='/Login/Logout']",
                "a[href*='Logout']", 
                "button[onclick*='logout']",
                "a[class*='logout']",
                "button:contains('Logout')",
                "a:contains('Logout')"
            ]
            
            logout_element = None
            for selector in logout_selectors:
                try:
                    if ":contains(" in selector:
                        # Use JavaScript to find elements containing text
                        elements = driver.execute_script("""
                            return Array.from(document.querySelectorAll('a, button')).filter(el => 
                                el.textContent.toLowerCase().includes('logout')
                            );
                        """)
                        if elements:
                            logout_element = elements[0]
                            break
                    else:
                        element = driver.find_element("css selector", selector)
                        if element and element.is_displayed():
                            logout_element = element
                            break
                except NoSuchElementException:
                    continue
                except WebDriverException as e:
                    raise BrowserException(
                        f"Error finding logout element: {str(e)}"
                    )
            
            if logout_element:
                try:
                    logout_element.click()
                    time.sleep(2)  # Wait for logout to complete
                    return True, "Logout successful"
                except WebDriverException as e:
                    raise BrowserException(
                        f"Failed to click logout element: {str(e)}"
                    )
            else:
                try:
                    current_url = driver.current_url
                    base_url = current_url.split('/')[0] + '//' + current_url.split('/')[2]
                    logout_url = f"{base_url}/Login/Logout"
                    
                    driver.get(logout_url)
                    time.sleep(2)
                    return True, "Logout via direct URL"
                except WebDriverException as e:
                    raise BrowserException(
                        f"Failed to navigate to logout URL: {str(e)}"
                    )
                
        except BrowserException:
            raise
        except Exception as e:
            raise BrowserException(
                f"Unexpected error during logout: {str(e)}"
            )
