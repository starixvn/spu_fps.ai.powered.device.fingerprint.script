import os
import platform
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.safari.options import Options as SafariOptions
from config import ConfigManager

class BrowserDriverFactory:
    
    @staticmethod
    def create_chrome_driver(headless=False, custom_config=None):
        options = ChromeOptions()
        
        if headless:
            options.add_argument("--headless")
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--log-level=3")
        
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        options.add_argument(f"--window-size={default_resolution['width']},{default_resolution['height']}")
        
        if custom_config:
            BrowserDriverFactory._apply_chrome_config(options, custom_config)
        
        driver = webdriver.Chrome(options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    
    @staticmethod
    def _apply_chrome_config(options, config):
        if "language" in config:
            options.add_argument(f"--lang={config['language']}")
            prefs = {"intl.accept_languages": config['language']}
            options.add_experimental_option("prefs", prefs)
        
        if "user_agent" in config:
            options.add_argument(f"--user-agent={config['user_agent']}")

    @staticmethod
    def create_firefox_driver(headless=False, custom_config=None):
        options = FirefoxOptions()
        
        if headless:
            options.add_argument("--headless")
        
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")
        
        if custom_config:
            BrowserDriverFactory._apply_firefox_config(options, custom_config)
        
        return webdriver.Firefox(options=options)
    
    @staticmethod
    def _apply_firefox_config(options, config):

        if "user_agent" in config:
            options.set_preference("general.useragent.override", config['user_agent'])
        
        if "language" in config:
            lang_code = config['language']
            options.set_preference("intl.locale.requested", lang_code)
            options.set_preference("intl.accept_languages", f"{lang_code},en-US,en")

    @staticmethod
    def create_edge_driver(headless=False, custom_config=None):
        options = EdgeOptions()
        
        if headless:
            options.add_argument("--headless")
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--log-level=3")
        
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        options.add_argument(f"--window-size={default_resolution['width']},{default_resolution['height']}")
        
        if custom_config:
            BrowserDriverFactory._apply_edge_config(options, custom_config)
        
        driver = webdriver.Edge(options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    
    @staticmethod
    def _apply_edge_config(options, config):
        if "language" in config:
            options.add_argument(f"--lang={config['language']}")
            prefs = {"intl.accept_languages": config['language']}
            options.add_experimental_option("prefs", prefs)
        
        if "user_agent" in config:
            options.add_argument(f"--user-agent={config['user_agent']}")

    @staticmethod
    def create_safari_driver(headless=False, custom_config=None):
        if platform.system() != "Darwin":
            raise Exception("Safari WebDriver is only supported on macOS")
        
        options = SafariOptions()
        driver = webdriver.Safari(options=options)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        driver.set_window_size(default_resolution['width'], default_resolution['height'])
        
        try:
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        except:
            pass
        
        return driver

    @staticmethod
    def create_driver(browser_type, headless=False, custom_config=None):
        browser_type = browser_type.lower()
        
        if browser_type == "chrome":
            return BrowserDriverFactory.create_chrome_driver(headless, custom_config)
        elif browser_type == "firefox":
            return BrowserDriverFactory.create_firefox_driver(headless, custom_config)
        elif browser_type == "edge":
            return BrowserDriverFactory.create_edge_driver(headless, custom_config)
        elif browser_type == "safari":
            return BrowserDriverFactory.create_safari_driver(headless, custom_config)
        else:
            raise ValueError(f"Unsupported browser: {browser_type}")

class BrowserUtils:
    @staticmethod
    def safe_quit_driver(driver):
        if driver:
            try:
                driver.quit()
            except:
                pass

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

