import platform
import asyncio
from playwright.async_api import async_playwright

from config import ConfigManager

class BrowserDriverFactory:
    
    @staticmethod
    async def _configure_plugins(context, plugins_config, browser_type):
        if not plugins_config:
            return
        
        plugins_script = "(() => {"
        plugins_script += f"  const plugins = {BrowserDriverFactory._format_plugins_for_js(plugins_config)};"
        plugins_script += """
          Object.defineProperty(navigator, 'plugins', {
            get: () => plugins,
            configurable: true
          });
          
          // Build mimeTypes from plugins
          const mimeTypes = [];
          plugins.forEach(plugin => {
            if (plugin.mimeTypes && plugin.mimeTypes.length > 0) {
              plugin.mimeTypes.forEach(mimeType => {
                mimeTypes.push({
                  type: mimeType.type,
                  description: mimeType.description,
                  suffixes: mimeType.suffixes,
                  enabledPlugin: plugin
                });
              });
            }
          });
          
          Object.defineProperty(navigator, 'mimeTypes', {
            get: () => mimeTypes,
            configurable: true
          });
        })();"""
        
        await context.add_init_script(plugins_script)
    
    @staticmethod
    async def _configure_pdf_viewer(context, pdf_enabled, browser_type):
        """Configure PDF viewer enabled/disabled state"""
        if pdf_enabled is None:
            return
        
        pdf_script = f"""
        (function() {{
          // Override navigator.pdfViewerEnabled
          try {{
            Object.defineProperty(navigator, 'pdfViewerEnabled', {{
              get: function() {{ return {str(pdf_enabled).lower()}; }},
              configurable: true,
              enumerable: true
            }});
          }} catch (e) {{
            console.warn('PDF viewer configuration warning:', e);
          }}
          
          // Additional PDF-related configurations for different browsers
          if ('{browser_type}' === 'chrome' || '{browser_type}' === 'chromium') {{
            // Chrome-specific PDF configuration
            if (navigator.plugins) {{
              try {{
                // Add or remove PDF plugin based on setting
                const pdfPluginExists = Array.from(navigator.plugins).some(p => 
                  p.name.toLowerCase().includes('pdf') || 
                  p.description.toLowerCase().includes('pdf')
                );
                
                if ({str(pdf_enabled).lower()} && !pdfPluginExists) {{
                  console.log('PDF viewer enabled for Chrome');
                }} else if (!{str(pdf_enabled).lower()} && pdfPluginExists) {{
                  console.log('PDF viewer disabled for Chrome');
                }}
              }} catch (e) {{
                console.warn('Chrome PDF plugin configuration warning:', e);
              }}
            }}
          }}
          
          // Set PDF viewer state in window for debugging
          window.pdfViewerEnabled = {str(pdf_enabled).lower()};
        }})();
        """
        
        await context.add_init_script(pdf_script)
    
    @staticmethod
    def _format_plugins_for_js(plugins_config):
        """Format plugins configuration for JavaScript injection"""
        js_plugins = []
        
        for i, plugin in enumerate(plugins_config):
            # Format mimeTypes if provided
            mime_types_js = "[]"
            if "mimeTypes" in plugin and plugin["mimeTypes"]:
                mime_types_list = []
                for mime_type in plugin["mimeTypes"]:
                    mime_js = f"""{{
                      type: "{mime_type.get('type', '')}",
                      description: "{mime_type.get('description', '')}",
                      suffixes: "{mime_type.get('suffixes', '')}"
                    }}"""
                    mime_types_list.append(mime_js)
                mime_types_js = f"[{', '.join(mime_types_list)}]"
            
            js_plugin = f"""{{
              name: "{plugin.get('name', '')}",
              filename: "{plugin.get('filename', '')}",
              description: "{plugin.get('description', '')}",
              mimeTypes: {mime_types_js},
              length: 0,
              item: function(index) {{ return null; }},
              namedItem: function(name) {{ return null; }},
              refresh: function() {{ }}
            }}"""
            js_plugins.append(js_plugin)
        
        return f"[{', '.join(js_plugins)}]"
    
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
            if platform.system() == "Windows":
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
            if "timezone" in custom_config:
                context_options['timezone_id'] = custom_config["timezone"]
            if "resolution" in custom_config:
                res = custom_config["resolution"]
                context_options['viewport'] = {'width': res['width'], 'height': res['height']}
        
        context = await browser.new_context(**context_options)
        
        if custom_config and "plugins" in custom_config:
            await BrowserDriverFactory._configure_plugins(context, custom_config["plugins"], 'chrome')
        
        if custom_config and "pdfViewerEnabled" in custom_config:
            await BrowserDriverFactory._configure_pdf_viewer(context, custom_config["pdfViewerEnabled"], 'chrome')
            
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
            if "timezone" in custom_config:
                context_options['timezone_id'] = custom_config["timezone"]
            if "resolution" in custom_config:
                res = custom_config["resolution"]
                context_options['viewport'] = {'width': res['width'], 'height': res['height']}
        
        context = await browser.new_context(**context_options)
        
        if custom_config and "plugins" in custom_config:
            await BrowserDriverFactory._configure_plugins(context, custom_config["plugins"], 'firefox')
        
        if custom_config and "pdfViewerEnabled" in custom_config:
            await BrowserDriverFactory._configure_pdf_viewer(context, custom_config["pdfViewerEnabled"], 'firefox')
            
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
            if "timezone" in custom_config:
                context_options['timezone_id'] = custom_config["timezone"]
            if "resolution" in custom_config:
                res = custom_config["resolution"]
                context_options['viewport'] = {'width': res['width'], 'height': res['height']}
        
        context = await browser.new_context(**context_options)
        
        if custom_config and "plugins" in custom_config:
            await BrowserDriverFactory._configure_plugins(context, custom_config["plugins"], 'edge')
        
        if custom_config and "pdfViewerEnabled" in custom_config:
            await BrowserDriverFactory._configure_pdf_viewer(context, custom_config["pdfViewerEnabled"], 'edge')
            
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
        
        if custom_config:
            if "language" in custom_config:
                context_options['locale'] = custom_config["language"]
            if "user_agent" in custom_config:
                context_options['user_agent'] = custom_config["user_agent"]
            if "timezone" in custom_config:
                context_options['timezone_id'] = custom_config["timezone"]
            if "resolution" in custom_config:
                res = custom_config["resolution"]
                context_options['viewport'] = {'width': res['width'], 'height': res['height']}
        
        context = await browser.new_context(**context_options)
        
        if custom_config and "plugins" in custom_config:
            await BrowserDriverFactory._configure_plugins(context, custom_config["plugins"], 'safari')
        
        if custom_config and "pdfViewerEnabled" in custom_config:
            await BrowserDriverFactory._configure_pdf_viewer(context, custom_config["pdfViewerEnabled"], 'safari')
            
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'safari')

    @staticmethod
    def create_safari_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_safari_driver_async(headless, custom_config)
        )
    
    @staticmethod
    async def _create_chromium_driver_async(headless=False, custom_config=None):
        playwright = await async_playwright().start()
        
        try:
            # Try to launch Chromium
            browser = await playwright.chromium.launch(
                headless=headless,
                args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
            )
        except Exception:
            # Fallback to Chrome if Chromium not available
            try:
                browser = await playwright.chromium.launch(
                    headless=headless,
                    args=['--no-sandbox', '--disable-dev-shm-usage']
                )
            except Exception:
                raise Exception("No Chromium browser available")
        
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
            if "timezone" in custom_config:
                context_options['timezone_id'] = custom_config["timezone"]
            if "resolution" in custom_config:
                res = custom_config["resolution"]
                context_options['viewport'] = {'width': res['width'], 'height': res['height']}
        
        context = await browser.new_context(**context_options)
        
        if custom_config and "plugins" in custom_config:
            await BrowserDriverFactory._configure_plugins(context, custom_config["plugins"], 'chromium')
        
        if custom_config and "pdfViewerEnabled" in custom_config:
            await BrowserDriverFactory._configure_pdf_viewer(context, custom_config["pdfViewerEnabled"], 'chromium')
            
        await context.add_init_script("delete Object.getPrototypeOf(navigator).webdriver;")
        page = await context.new_page()
        return AsyncPlaywrightDriverWrapper(page, context, browser, playwright, 'chromium')

    @staticmethod
    def create_chromium_driver(headless=False, custom_config=None):
        return BrowserDriverFactory._run_async(
            BrowserDriverFactory._create_chromium_driver_async(headless, custom_config)
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
        
        elif browser_type == "chromium":
            return BrowserDriverFactory.create_chromium_driver(headless, custom_config)
        
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
    
    @staticmethod
    def get_plugins_config(plugins_list, config_name):
        return {
            "name": f"Plugins_{config_name}",
            "plugins": plugins_list
        }
    
    @staticmethod
    def get_timezone_config(timezone_id, config_name):
        return {
            "name": f"Timezone_{config_name}",
            "timezone": timezone_id
        }
    
    @staticmethod
    def get_resolution_config(width, height, config_name):
        return {
            "name": f"Resolution_{config_name}",
            "resolution": {"width": width, "height": height}
        }

