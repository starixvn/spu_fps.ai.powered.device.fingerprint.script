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
