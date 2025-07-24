import time
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

class LoginHelper:
    
    def __init__(self, driver):
        self.driver = driver
    
    def perform_login(self, test_url, username, password):
        try:
            self.driver.page.goto(test_url)
            
            self.driver.page.wait_for_load_state("networkidle")
            
            username_selectors = ["input[name='Username']", "input[id='Username']"]
            username_field = self._find_element(username_selectors)

            if not username_field:
                return False, "No username field found"
            
            username_field.fill("") 
            username_field.fill(username)
            
            password_selectors = ["input[name='Password']", "input[id='Password']", "input[type='password']"]
            password_field = self._find_element(password_selectors)

            if not password_field:
                return False, "No password field found"
            
            password_field.fill("")  # Clear field
            password_field.fill(password)
            
            login_selectors = ["button[type='submit']", "input[type='submit']", "button[id='login']"]
            login_button = self._find_element(login_selectors, wait=False)

            if not login_button:
                return False, "No login button found"
            
            login_button.click()
            
            time.sleep(3)
            
            current_url = self.driver.page.url
            success = current_url != test_url
            error_msg = "Still on login page" if not success else None
            
            return success, error_msg
            
        except Exception as e:
            return False, str(e)
    
    def _find_element(self, selectors, wait=True):
        for selector in selectors:
            try:
                if wait:
                    element = self.driver.page.wait_for_selector(selector, timeout=2000)
                    return element
                
                else:
                    element = self.driver.page.query_selector(selector)
                    if element:
                        return element
                    
            except PlaywrightTimeoutError:
                continue
            except Exception:
                continue
        return None
