"""
Browser Driver Utilities
Common functions for setting up and configuring browser drivers
"""
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions

class BrowserDriverFactory:
    
    @staticmethod
    def create_chrome_driver(headless=False, custom_config=None):
       
        try:
            options = ChromeOptions()
            
            if headless:
                options.add_argument("--headless")
            
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--window-size=1920,1080")  # Default size
            
            options.add_argument("--enable-unsafe-swiftshader")
            options.add_argument("--disable-software-rasterizer")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-plugins")
            options.add_argument("--disable-logging")
            options.add_argument("--log-level=3")  # Chỉ hiển thị lỗi nghiêm trọng
            
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            if custom_config:
                BrowserDriverFactory._apply_chrome_config(options, custom_config)
            
            print(f"Setting up Chrome driver with config: {custom_config.get('name', 'Default') if custom_config else 'Default'}")
            
            driver = webdriver.Chrome(options=options)
            
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            print("✓ Chrome driver setup successful")
            return driver
            
        except Exception as e:
            print(f"Chrome setup error: {e}")
            raise e
    
    @staticmethod
    def _apply_chrome_config(options, config):

        if "language" in config:
            options.add_argument(f"--lang={config['language']}")
            prefs = options.experimental_options.get("prefs", {})
            prefs["intl.accept_languages"] = config['language']
            options.add_experimental_option("prefs", prefs)
        
        if "user_agent" in config:
            options.add_argument(f"--user-agent={config['user_agent']}")
        
        if "resolution" in config:
            res = config['resolution']
            options.add_argument(f"--window-size={res['width']},{res['height']}")
        
        if "timezone" in config:
            prefs = options.experimental_options.get("prefs", {})
            prefs["profile.default_content_setting_values.geolocation"] = 1
    
    @staticmethod
    def create_firefox_driver(headless=False, custom_config=None):
        
        try:
            options = FirefoxOptions()
            
            if headless:
                options.add_argument("--headless")
            
            options.add_argument("--width=1920")
            options.add_argument("--height=1080")
            
            if custom_config:
                BrowserDriverFactory._apply_firefox_config(options, custom_config)
            
            print(f"Setting up Firefox driver with config: {custom_config.get('name', 'Default') if custom_config else 'Default'}")
            
            driver = webdriver.Firefox(options=options)
            
            if custom_config:
                BrowserDriverFactory._apply_firefox_post_config(driver, custom_config)
            
            print("✓ Firefox driver setup successful")
            return driver
            
        except Exception as e:
            print(f"Firefox setup error: {e}")
            raise e
    
    @staticmethod
    def _apply_firefox_config(options, config):
        
        if "resolution" in config:
            res = config['resolution']
            options.add_argument(f"--width={res['width']}")
            options.add_argument(f"--height={res['height']}")
        
        if "additional_args" in config:
            for arg in config['additional_args']:
                options.add_argument(arg)
        
        if "prefs" in config:
            for key, value in config['prefs'].items():
                options.set_preference(key, value)
    
    @staticmethod
    def _apply_firefox_post_config(driver, config):
       
        if "language" in config:
            try:
                driver.execute_script(f"""
                    try {{
                        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);
                        prefs.setCharPref("intl.locale.requested", "{config['language']}");
                    }} catch(e) {{
                        // Firefox may not allow this in some versions
                        console.log("Could not set language preference:", e);
                    }}
                """)
            except:
                pass
    
    @staticmethod
    def create_edge_driver(headless=False, custom_config=None):
       
        try:
            options = EdgeOptions()
            
            if headless:
                options.add_argument("--headless")
            
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--window-size=1920,1080")  # Default size
            
            if custom_config:
                BrowserDriverFactory._apply_edge_config(options, custom_config)
            
            print(f"Setting up Edge driver with config: {custom_config.get('name', 'Default') if custom_config else 'Default'}")
            
            driver = webdriver.Edge(options=options)
            
            print("✓ Edge driver setup successful")
            return driver
            
        except Exception as e:
            print(f"Edge setup error: {e}")
            raise e
    
    @staticmethod
    def _apply_edge_config(options, config):
        
        if "resolution" in config:
            res = config['resolution']
            options.add_argument(f"--window-size={res['width']},{res['height']}")
        
        if "additional_args" in config:
            for arg in config['additional_args']:
                options.add_argument(arg)
    
    @staticmethod
    def create_driver(browser_type, headless=False, custom_config=None):
       
        browser_type = browser_type.lower()
        
        if browser_type == "chrome":
            return BrowserDriverFactory.create_chrome_driver(headless, custom_config)
        elif browser_type == "firefox":
            return BrowserDriverFactory.create_firefox_driver(headless, custom_config)
        elif browser_type == "edge":
            return BrowserDriverFactory.create_edge_driver(headless, custom_config)
        else:
            raise ValueError(f"Unsupported browser type: {browser_type}")


class BrowserConfigTemplates:
    
    @staticmethod
    def get_language_config(language_code, language_name):
        return {
            "name": f"Lang_{language_name}",
            "language": language_code
        }
    
    @staticmethod
    def get_user_agent_config(user_agent_string, config_name):
        return {
            "name": f"UA_{config_name}",
            "user_agent": user_agent_string
        }

class BrowserUtils:
    
    @staticmethod
    def get_computer_name():

        return os.environ.get('COMPUTERNAME', 'unknown')
    
    @staticmethod
    def safe_quit_driver(driver):
        if driver:
            try:
                driver.quit()
                print("✓ Browser driver closed successfully")
            except Exception as e:
                print(f"⚠️ Warning: Error closing driver: {e}")
    
    @staticmethod
    def apply_anti_detection(driver):
        try:
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})")
            
            driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']})")
            
            print("✓ Anti-detection measures applied")
        except Exception as e:
            print(f"⚠️ Warning: Could not apply all anti-detection measures: {e}")
