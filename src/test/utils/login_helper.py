"""
Login utilities for browser testing
"""
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginHelper:
    
    def __init__(self, driver):
        self.driver = driver
    
    def perform_login(self, test_url, username, password):
        try:
            print(f"Navigating to login page...")
            self.driver.get(test_url)
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            username_selectors = [
                "input[name='Username']",
                "input[id='Username']",
            ]
            
            username_field = None
            for selector in username_selectors:
                try:
                    username_field = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    break
                except:
                    continue
            
            if username_field:
                print(f"Found username field, entering: {username}")
                username_field.clear()
                username_field.send_keys(username)
                
                password_selectors = [
                    "input[name='Password']",
                    "input[id='Password']",
                    "input[type='password']"
                ]
                
                password_field = None
                for selector in password_selectors:
                    try:
                        password_field = WebDriverWait(self.driver, 2).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        break
                    except:
                        continue
                
                if password_field:
                    print(f"Found password field, entering password")
                    password_field.clear()
                    password_field.send_keys(password)
                
                login_selectors = [
                    "button[type='submit']",  
                ]        
                
                login_button = None
                for selector in login_selectors:
                    try:
                        login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        break
                    except:
                        continue
                
                if login_button:
                    print(f"Clicking login button...")
                    login_button.click()
                    time.sleep(3)
                    
                    current_url = self.driver.current_url
                    if current_url != test_url:
                        print(f"✅ Login successful! Redirected to: {current_url}")
                        return True, None
                    else:
                        print(f"⚠️ Login may have failed - still on login page")
                        return False, "Still on login page"
                else:
                    print(f"❌ Could not find login button")
                    return False, "No login button found"
            else:
                print(f"❌ Could not find username field")
                return False, "No username field found"
                
        except Exception as e:
            print(f"❌ Error during login: {str(e)}")
            return False, str(e)
