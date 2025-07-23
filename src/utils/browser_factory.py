"""
Browser Driver Utilities
Common functions for setting up and configuring browser drivers
"""
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from config import ConfigManager

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

            default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
            options.add_argument(f"--window-size={default_resolution['width']},{default_resolution['height']}")
            
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
            
            driver = webdriver.Chrome(options=options)
            
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
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
            
            driver = webdriver.Firefox(options=options)
            
            if custom_config:
                BrowserDriverFactory._apply_firefox_post_config(driver, custom_config)
            
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
            # Get default screen resolution from config  
            default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
            options.add_argument(f"--window-size={default_resolution['width']},{default_resolution['height']}")
            
            if custom_config:
                BrowserDriverFactory._apply_edge_config(options, custom_config)
            
            driver = webdriver.Edge(options=options)
            
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
    """Browser configuration templates using centralized config"""
    
    @staticmethod
    def get_language_config(language_code, language_name):
        """Get language configuration template"""
        return {
            "name": f"Lang_{language_name}",
            "language": language_code
        }
    
    @staticmethod
    def get_user_agent_config(user_agent_string, config_name):
        """Get user agent configuration template"""
        return {
            "name": f"UA_{config_name}",
            "user_agent": user_agent_string
        }
    
    @staticmethod
    def get_timezone_config(timezone_name, display_name):
        """Get timezone configuration template"""
        return {
            "name": f"TZ_{display_name}",
            "timezone": timezone_name
        }
    
    @staticmethod
    def get_resolution_config(width, height, name):
        """Get screen resolution configuration template"""
        return {
            "name": f"Res_{name}",
            "resolution": {"width": width, "height": height}
        }
    
    @staticmethod
    def get_all_language_configs():
        """Get all language configurations from ConfigManager"""
        return [
            BrowserConfigTemplates.get_language_config(lang['language'], lang['name'])
            for lang in ConfigManager.LANGUAGES
        ]
    
    @staticmethod
    def get_all_user_agent_configs():
        """Get all user agent configurations from ConfigManager"""
        return [
            BrowserConfigTemplates.get_user_agent_config(ua['ua'], ua['name'])
            for ua in ConfigManager.USER_AGENTS
        ]
    
    @staticmethod
    def get_all_timezone_configs():
        """Get all timezone configurations from ConfigManager"""
        return [
            BrowserConfigTemplates.get_timezone_config(tz['timezone'], tz['name'])
            for tz in ConfigManager.TIMEZONES
        ]
    
    @staticmethod
    def get_all_resolution_configs():
        """Get all screen resolution configurations from ConfigManager"""
        return [
            BrowserConfigTemplates.get_resolution_config(res['width'], res['height'], res['name'])
            for res in ConfigManager.SCREEN_SIZES
        ]

class BrowserUtils:
    
    @staticmethod
    def get_computer_name():

        return os.environ.get('COMPUTERNAME', 'unknown')
    
    @staticmethod
    def safe_quit_driver(driver):
        if driver:
            try:
                driver.quit()
                
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
