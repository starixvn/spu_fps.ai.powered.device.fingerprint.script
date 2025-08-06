import pytest
import os
import platform
from dotenv import load_dotenv
from factories.browser_factory import BrowserDriverFactory
from factories.browser_factory import BrowserConfigTemplates

from services.login_service import TestLoginHelper
from config.settings import (
    BROWSER_MAPPING,
    get_test_credentials,
    get_urls_for_environment,
    get_api_config_for_environment
)

load_dotenv(override=True)

def detect_current_os():
    system = platform.system().lower()
    
    if system == "windows":
        return "windows"
    elif system == "darwin":
        return "macos"
    elif system == "linux":
        return "linux"
    else:
        return "windows"

def get_browsers_by_os(os_type):
    return BROWSER_MAPPING.get(os_type, ["chrome", "firefox", "edge"])

@pytest.fixture(scope="session")
def test_environment():
    env = os.getenv("ENVIRONMENT", "DEV")
    return env

@pytest.fixture(scope="session")
def current_os():
    return detect_current_os()

@pytest.fixture(scope="session")
def supported_browsers(current_os):
    return get_browsers_by_os(current_os)

@pytest.fixture(scope="session")
def test_url(test_environment):
    urls = get_urls_for_environment(test_environment)
    login_url = urls["login"]
    return login_url

@pytest.fixture(scope="session")
def api_config(test_environment):
    return get_api_config_for_environment(test_environment)

@pytest.fixture(scope="function")
def test_credentials():
    def _get_credentials(credentials_key):
        return get_test_credentials(credentials_key)
    
    return _get_credentials

def pytest_generate_tests(metafunc):
    if "auto_browser_type" in metafunc.fixturenames:
        current_os = detect_current_os()
        browsers = get_browsers_by_os(current_os)
        metafunc.parametrize("auto_browser_type", browsers)

@pytest.fixture(scope="function")
def auto_browser_type(request):
    return request.param

@pytest.fixture(scope="function") 
def browser_type(request):
    if hasattr(request, 'param'):
        return request.param
    else:
        return "chrome"  # Default browser type

@pytest.fixture(scope="function")
def browser_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        param_browser_type = request.param.get('browser_type', 'chrome')
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        param_browser_type = 'chrome'  # Default browser type
        custom_config = None
        test_case = None

    driver = BrowserDriverFactory.create_driver(
        param_browser_type, 
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = param_browser_type
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def chrome_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        custom_config = getattr(request, 'param', None)
        test_case = None
    
    driver = BrowserDriverFactory.create_chrome_driver(
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = "chrome"
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="class")
def chrome_driver_class(request):
    headless = request.config.getoption("--headless", default=True)
    custom_config = getattr(request, 'param', None)

    driver = BrowserDriverFactory.create_chrome_driver(headless=headless, custom_config=custom_config)

    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def firefox_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        custom_config = getattr(request, 'param', None)
        test_case = None
    
    driver = BrowserDriverFactory.create_firefox_driver(
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = "firefox"
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="class")
def firefox_driver_class(request):
    headless = request.config.getoption("--headless", default=True)
    
    driver = BrowserDriverFactory.create_firefox_driver(headless=headless)
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def edge_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        custom_config = getattr(request, 'param', None)
        test_case = None
    
    driver = BrowserDriverFactory.create_edge_driver(
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = "edge"
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="class")
def edge_driver_class(request):
    """Edge driver that persists for the entire test class"""
    headless = request.config.getoption("--headless", default=True)
    
    driver = BrowserDriverFactory.create_edge_driver(headless=headless)
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def safari_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        custom_config = getattr(request, 'param', None)
        test_case = None
    
    driver = BrowserDriverFactory.create_safari_driver(
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = "safari"
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="function")
def chromium_driver(request):
    headless = request.config.getoption("--headless", default=True)
    
    if hasattr(request, 'param') and isinstance(request.param, dict):
        custom_config = request.param.get('custom_config', None)
        test_case = request.param.get('test_case', None)
    else:
        custom_config = getattr(request, 'param', None)
        test_case = None
    
    driver = BrowserDriverFactory.create_chromium_driver(
        headless=headless, 
        custom_config=custom_config
    )
    
    driver.browser_type = "chromium"
    driver.custom_config = custom_config
    driver.test_case = test_case
    
    yield driver
    
    try:
        driver.quit()
    except Exception:
        pass

@pytest.fixture(scope="class")
def browser_session_manager(request):
    
    class BrowserSessionManager:
        def __init__(self, driver):
            self.driver = driver
            self.login_count = 0
            self.logout_count = 0
        
        def clear_session(self):
            try:
                self.driver.context.clear_cookies()
                self.driver.evaluate("() => { localStorage.clear(); }")
                self.driver.evaluate("() => { sessionStorage.clear(); }")
            except AttributeError:
                try:
                    self.driver.delete_all_cookies()
                    self.driver.execute_script("localStorage.clear();")
                    self.driver.execute_script("sessionStorage.clear();")
                except Exception as e:
                    print(f"Warning: Could not clear session: {e}")
        
        def navigate_to_login_page(self, url):
            self.clear_session()
            try:
                self.driver.goto(url)
            except AttributeError:
                self.driver.get(url)
        
        def prepare_for_new_login(self, url):
            self.login_count += 1
            self.navigate_to_login_page(url)
        
        def perform_logout(self):
            try:
                self.logout_count += 1
                
                logout_success, logout_message = TestLoginHelper.perform_logout(self.driver)
                
                if logout_success:
                    return True, logout_message
                else:
                    print(f"⚠️ Logout failed: {logout_message}")
                    return False, logout_message
                    
            except Exception as e:
                error_msg = f"Logout error: {str(e)}"
                return False, error_msg
            
        def get_login_count(self):
            return self.login_count
            
        def get_logout_count(self):
            return self.logout_count
    
    return BrowserSessionManager

@pytest.fixture(scope="function")
def test_login_helper():
    return TestLoginHelper

@pytest.fixture(scope="function")
def browser_config_factory():
    return BrowserConfigTemplates
    
def pytest_addoption(parser):
    parser.addoption(
        "--headless",
        action="store_true",
        default=False,
        help="Run browsers in headless mode"
    )
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        choices=["chrome", "firefox", "edge", "safari"],
        help="Browser to run tests with"
    )
    parser.addoption(
        "--environment",
        action="store",
        default="DEV",
        choices=["DEV", "LOCAL", "UAT"],
        help="Test environment"
    )

def pytest_configure(config):
    if config.getoption("--environment"):
        os.environ["ENVIRONMENT"] = config.getoption("--environment")
    
    config.addinivalue_line(
        "markers", "browser: mark test to run with specific browser"
    )
    config.addinivalue_line(
        "markers", "login: mark test as login functionality test"
    )
    config.addinivalue_line(
        "markers", "fingerprint: mark test as fingerprint test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )

def pytest_collection_modifyitems(config, items):
    browser_option = config.getoption("--browser")
    
    for item in items:
        if hasattr(item, "get_closest_marker"):
            browser_marker = item.get_closest_marker("browser")
            if browser_marker and browser_option not in browser_marker.args:
                item.add_marker(pytest.mark.skip(
                    reason=f"Test not compatible with {browser_option}"
                ))

@pytest.fixture(scope="function", autouse=True)
def test_info(request):
    test_name = request.node.name
    test_file = request.fspath.basename
    
    yield {
        "name": test_name,
        "file": test_file,
        "node": request.node
    }
