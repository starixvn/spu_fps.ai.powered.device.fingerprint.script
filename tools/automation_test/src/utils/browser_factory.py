import platform
import asyncio
import threading
import sys
import subprocess
from playwright.async_api import async_playwright

from config import ConfigManager

class BrowserDriverFactory:
    
    @staticmethod
    def install_browsers():
        try:
            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium", "firefox", "webkit"], check=True)
            return True
        except:
            return False
    
    @staticmethod
    def _run_async(coro):
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                def run_in_thread():
                    new_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(new_loop)
                    try:
                        return new_loop.run_until_complete(coro)
                    finally:
                        new_loop.close()
                
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    return executor.submit(run_in_thread).result()
            else:
                return loop.run_until_complete(coro)
        except RuntimeError:
            return asyncio.run(coro)
    
    @staticmethod
    async def _create_chrome_driver_async(headless=False, custom_config=None):
        playwright = await async_playwright().start()
        
        try:
            browser = await playwright.chromium.launch(
                headless=headless,
                args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled', '--disable-features=VizDisplayCompositor']
            )
        except Exception:
            if BrowserDriverFactory.install_browsers():
                browser = await playwright.chromium.launch(headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
            
            elif platform.system() == "Windows":
                browser = await playwright.chromium.launch(channel='msedge', headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
            
            else:
                raise Exception("No browser available")
        
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
        
        context = await browser.new_context(**context_options)
        await context.add_init_script("delete Object.getPrototypeOf(navigator).webdriver;")
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'chrome')
    
    @staticmethod
    def create_chrome_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_chrome_driver_async(headless, custom_config)
        )

    @staticmethod
    async def _create_firefox_driver_async(headless=False, custom_config=None):
        playwright = await async_playwright().start()
        
        try:
            browser = await playwright.firefox.launch(headless=headless)
        except Exception:
            if BrowserDriverFactory.install_browsers():
                try:
                    browser = await playwright.firefox.launch(headless=headless)
                except:
                    browser = await playwright.chromium.launch(headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
            else:
                try:
                    browser = await playwright.chromium.launch(headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
                except:
                    if platform.system() == "Windows":
                        browser = await playwright.chromium.launch(channel='msedge', headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
                    else:
                        raise Exception("No browser available")
        
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
        
        context = await browser.new_context(**context_options)
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'firefox')

    @staticmethod
    def create_firefox_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_firefox_driver_async(headless, custom_config)
        )

    @staticmethod
    async def _create_edge_driver_async(headless=False, custom_config=None):
        if platform.system() != "Windows":
            raise Exception("Edge only supported on Windows")
        
        playwright = await async_playwright().start()
        
        try:
            browser = await playwright.chromium.launch(channel='msedge', headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
        except Exception:
            browser = await playwright.chromium.launch(headless=headless, args=['--no-sandbox', '--disable-dev-shm-usage'])
        
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
        
        context = await browser.new_context(**context_options)
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'edge')

    @staticmethod
    def create_edge_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_edge_driver_async(headless, custom_config)
        )


    @staticmethod
    async def _create_safari_driver_async(headless=False, custom_config=None):
        if platform.system() != "Darwin":
            raise Exception("Safari only supported on macOS")
        
        playwright = await async_playwright().start()
        browser = await playwright.webkit.launch(headless=headless)
        
        default_resolution = ConfigManager.SCREEN_SIZES[0] if ConfigManager.SCREEN_SIZES else {"width": 1920, "height": 1080}
        context_options = {
            'viewport': {'width': default_resolution['width'], 'height': default_resolution['height']},
            'locale': 'vi-VN'
        }
        
        if custom_config and "language" in custom_config:
            context_options['locale'] = custom_config["language"]
        
        context = await browser.new_context(**context_options)
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'safari')

    @staticmethod
    def create_safari_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_safari_driver_async(headless, custom_config)
        )
    

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


class AsyncPlaywrightDriverWrapper:
    def __init__(self, page, context, browser, playwright, browser_type):
        self.page = page
        self.context = context
        self.browser = browser
        self.playwright = playwright
        self.browser_type = browser_type
    
    def _run_async(self, coro):
        return BrowserDriverFactory._run_async(coro)
    
    def get(self, url):
        async def _get():
            await self.page.goto(url, wait_until='domcontentloaded', timeout=30000)
        return self._run_async(_get())
    
    def find_element(self, by, value):
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
            return AsyncPlaywrightElementWrapper(self.page.locator(f"xpath={value}"), self)
        else:
            selector = value
        return AsyncPlaywrightElementWrapper(self.page.locator(selector), self)
    
    def find_elements(self, by, value):
        element = self.find_element(by, value)
        async def _count():
            return await element.locator.count()
        count = self._run_async(_count())
        return [AsyncPlaywrightElementWrapper(self.page.locator(element.locator._selector).nth(i), self) for i in range(count)]
    
    @property
    def current_url(self):
        return self.page.url
    
    @property
    def title(self):
        return self._run_async(self.page.title())
    
    @property
    def page_source(self):
        return self._run_async(self.page.content())
    
    def execute_script(self, script, *args):
        try:
            return self._run_async(self.page.evaluate(script, args if args else None))
        except:
            return None
    
    def set_window_size(self, width, height):
        return self._run_async(self.page.set_viewport_size({"width": width, "height": height}))
    
    def quit(self):
        async def _quit():
            try:
                await self.page.close()
                await self.context.close()
                await self.browser.close()
                await self.playwright.stop()
            except:
                pass
        return self._run_async(_quit())
    
    def close(self):
        try:
            return self._run_async(self.page.close())
        except:
            pass


class AsyncPlaywrightElementWrapper:
    def __init__(self, locator, driver_wrapper):
        self.locator = locator
        self.driver = driver_wrapper
    
    def click(self):
        async def _click():
            await self.locator.wait_for(state='visible', timeout=10000)
            await self.locator.click(timeout=10000)
        return self.driver._run_async(_click())
    
    def send_keys(self, text):
        async def _fill():
            await self.locator.wait_for(state='visible', timeout=10000)
            await self.locator.fill(str(text))
        return self.driver._run_async(_fill())
    
    def clear(self):
        return self.driver._run_async(self.locator.fill(""))
    
    @property
    def text(self):
        try:
            return self.driver._run_async(self.locator.text_content()) or ""
        except:
            return ""
    
    def get_attribute(self, name):
        try:
            return self.driver._run_async(self.locator.get_attribute(name))
        except:
            return None
    
    @property
    def tag_name(self):
        try:
            return self.driver._run_async(self.locator.evaluate("el => el.tagName.toLowerCase()"))
        except:
            return ""
    
    def is_displayed(self):
        try:
            return self.driver._run_async(self.locator.is_visible())
        except:
            return False
    
    def is_enabled(self):
        try:
            return self.driver._run_async(self.locator.is_enabled())
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

