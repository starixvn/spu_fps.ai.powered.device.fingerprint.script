import time

class LoginHelper:
    
    def __init__(self, driver):
        self.driver = driver
    
    def perform_login(self, test_url, username, password):
        try:
            self.driver.get(test_url)
            
            self.driver.execute_script("return document.readyState === 'complete'")
            time.sleep(2)  # Simple wait instead of networkidle
            
            username_selectors = ["input[name='Username']", "input[id='Username']"]
            username_field = self._find_element(username_selectors)

            if not username_field:
                return False, "No username field found"
            
            username_field.clear()
            username_field.send_keys(username)
            
            password_selectors = ["input[name='Password']", "input[id='Password']", "input[type='password']"]
            password_field = self._find_element(password_selectors)

            if not password_field:
                return False, "No password field found"
            
            password_field.clear()
            password_field.send_keys(password)
            
            login_selectors = ["button[type='submit']", "input[type='submit']", "button[id='login']"]
            login_button = self._find_element(login_selectors, wait=False)

            if not login_button:
                return False, "No login button found"
            
            login_button.click()
            
            time.sleep(3)
            
            current_url = self.driver.current_url
            success = current_url != test_url
            error_msg = "Still on login page" if not success else None
            
            return success, error_msg
            
        except Exception as e:
            return False, str(e)
    
    def _find_element(self, selectors, wait=True):
        for selector in selectors:
            try:
                element = self.driver.find_element("css selector", selector)
                if element and element.is_displayed():
                    return element
                    
            except Exception:
                continue
        return None
    
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
    
    @staticmethod
    def perform_logout(driver):
        try:
            # Try to find logout link/button using multiple selectors
            logout_selectors = [
                "a[href='/Login/Logout']",
                "a[href*='Logout']", 
                "button[onclick*='logout']",
                "a[class*='logout']",
                ".btn:contains('Logout')",
                "a:contains('Logout')"
            ]
            
            logout_element = None
            for selector in logout_selectors:
                try:
                    if ":contains(" in selector:
                        elements = driver.execute_script(f"""
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
                except Exception:
                    continue
            
            if logout_element:
                logout_element.click()
                time.sleep(2)  # Wait for logout to complete
                return True, "Logout successful"
            else:
                current_url = driver.current_url
                base_url = current_url.split('/')[0] + '//' + current_url.split('/')[2]
                logout_url = f"{base_url}/Login/Logout"
                
                driver.get(logout_url)
                time.sleep(2)
                return True, "Logout via direct URL"
                
        except Exception as e:
            return False, f"Logout failed: {str(e)}"
