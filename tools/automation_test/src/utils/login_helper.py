import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginHelper:
    
    def __init__(self, driver):
        self.driver = driver
    
    def perform_login(self, test_url, username, password):
        try:
            self.driver.get(test_url)
            WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
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
            
            return self.driver.current_url != test_url, "Still on login page" if self.driver.current_url == test_url else None
            
        except Exception as e:
            return False, str(e)
    
    def _find_element(self, selectors, wait=True):
        for selector in selectors:
            try:
                if wait:
                    return WebDriverWait(self.driver, 2).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                else:
                    return self.driver.find_element(By.CSS_SELECTOR, selector)
            except:
                continue
        return None
