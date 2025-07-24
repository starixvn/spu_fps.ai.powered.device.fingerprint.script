import platform
import asyncio
import threading
from playwright.sync_api import sync_playwright

from config import ConfigManager

class BrowserDriverFactory:
    
    @staticmethod
    def create_chrome_driver(headless=False, custom_config=None):
        
        playwright = sync_playwright().start()
        browser = playwright.chromium.launch(
            headless=headless,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=VizDisplayCompositor'
            ]
        )
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        context_options = {
            'viewport': {'width': default_resolution['width'], 'height': default_resolution['height']},
            'locale': 'vi-VN',
            'timezone_id': 'Asia/Ho_Chi_Minh'
        }
        
        if custom_config:
            if "user_agent" in custom_config:
                context_options['user_agent'] = custom_config["user_agent"]
            if "language" in custom_config:
                context_options['locale'] = custom_config["language"]
        
        context = browser.new_context(**context_options)
        
        context.add_init_script("""
            delete Object.getPrototypeOf(navigator).webdriver;
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5].map((i) => ({
                    name: `Plugin ${i}`,
                    description: `Description ${i}`,
                    filename: `plugin${i}.so`
                }))
            });
            
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        """)
        
        page = context.new_page()
        return PlaywrightDriverWrapper(page, context, browser, playwright, 'chrome')
    

    @staticmethod
    def create_firefox_driver(headless=False, custom_config=None):

        playwright = sync_playwright().start()
        browser = playwright.firefox.launch(headless=headless)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        context_options = {
            'viewport': {'width': default_resolution['width'], 'height': default_resolution['height']},
            'locale': 'vi-VN'
        }
        
        if custom_config:
            if "user_agent" in custom_config:
                context_options['user_agent'] = custom_config["user_agent"]

            if "language" in custom_config:
                context_options['locale'] = custom_config["language"]
        
        context = browser.new_context(**context_options)
        page = context.new_page()

        return PlaywrightDriverWrapper(page, context, browser, playwright, 'firefox')
    

    @staticmethod
    def create_edge_driver(headless=False, custom_config=None):
        
        if platform.system() != "Windows":
            raise Exception("Edge only supported on Windows")
        
        playwright = sync_playwright().start()
        
        try:
            browser = playwright.chromium.launch(
                channel='msedge',
                headless=headless,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
        except Exception:
            browser = playwright.chromium.launch(
                headless=headless,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        
        context_options = {
            'viewport': {'width': default_resolution['width'], 'height': default_resolution['height']},
            'locale': 'vi-VN'
        }
        
        if custom_config:
            if "user_agent" in custom_config:
                context_options['user_agent'] = custom_config["user_agent"]

            if "language" in custom_config:
                context_options['locale'] = custom_config["language"]
        
        context = browser.new_context(**context_options)
        page = context.new_page()

        return PlaywrightDriverWrapper(page, context, browser, playwright, 'edge')


    @staticmethod
    def create_safari_driver(headless=False, custom_config=None):
        
        if platform.system() != "Darwin":
            raise Exception("Safari (WebKit) only supported on macOS")
        
        playwright = sync_playwright().start()
        browser = playwright.webkit.launch(headless=headless)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        context_options = {
            'viewport': {'width': default_resolution['width'], 'height': default_resolution['height']},
            'locale': 'vi-VN'
        }
        
        if custom_config:
            if "language" in custom_config:
                context_options['locale'] = custom_config["language"]
        
        context = browser.new_context(**context_options)
        page = context.new_page()
        return PlaywrightDriverWrapper(page, context, browser, playwright, 'safari')
    

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


class PlaywrightDriverWrapper:
    
    def __init__(self, page, context, browser, playwright, browser_type):
        self.page = page
        self.context = context
        self.browser = browser
        self.playwright = playwright
        self.browser_type = browser_type
    
    def get(self, url):
        try:
            self.page.goto(url, wait_until='domcontentloaded', timeout=30000)
        except Exception as e:
            raise
    
    def find_element(self, by, value):
        try:
            if by == "id":
                selector = f"#{value}"
            elif by == "name":
                selector = f"[name='{value}']" 
            elif by == "class name":
                selector = f".{value}"
            elif by == "tag name":
                selector = value
            elif by == "css selector":
                selector = value
            elif by == "xpath":
                return PlaywrightElementWrapper(self.page.locator(f"xpath={value}"))
            else:
                selector = value
            
            return PlaywrightElementWrapper(self.page.locator(selector))
        except Exception as e:
            raise
    
    def find_elements(self, by, value):
        element = self.find_element(by, value)
        count = element.locator.count()
        return [PlaywrightElementWrapper(self.page.locator(element.locator._selector).nth(i)) 
                for i in range(count)]
    
    @property
    def current_url(self):
        return self.page.url
    
    @property
    def title(self):
        return self.page.title()
    
    @property
    def page_source(self):
        return self.page.content()
    
    def execute_script(self, script, *args):
        try:
            return self.page.evaluate(script, args if args else None)
        except Exception:
            return None
    
    def set_window_size(self, width, height):
        self.page.set_viewport_size({"width": width, "height": height})
    
    def quit(self):
        try:
            if self.page:
                self.page.close()
        except:
            pass
        
        try:
            if self.context:
                self.context.close()
        except:
            pass
        
        try:
            if self.browser:
                self.browser.close()
        except:
            pass
        
        try:
            if self.playwright:
                self.playwright.stop()
        except:
            pass
    
    def close(self):
        try:
            self.page.close()
        except:
            pass


class PlaywrightElementWrapper:
    
    def __init__(self, locator):
        self.locator = locator
    
    def click(self):
        try:
            self.locator.wait_for(state='visible', timeout=10000)
            self.locator.click(timeout=10000)
        except Exception as e:
            raise
    
    def send_keys(self, text):
        try:
            self.locator.wait_for(state='visible', timeout=10000)
            self.locator.fill(str(text))
        except Exception as e:
            raise
    
    def clear(self):
        self.locator.fill("")
    
    @property
    def text(self):
        try:
            return self.locator.text_content() or ""
        except:
            return ""
    
    def get_attribute(self, name):
        try:
            return self.locator.get_attribute(name)
        except:
            return None
    
    @property
    def tag_name(self):
        try:
            return self.locator.evaluate("el => el.tagName.toLowerCase()")
        except:
            return ""
    
    def is_displayed(self):
        try:
            return self.locator.is_visible()
        except:
            return False
    
    def is_enabled(self):
        try:
            return self.locator.is_enabled()
        except:
            return False

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

