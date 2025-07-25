
from .general_config import (
    TEST_URLS,
    API_CONFIG,
    SUPPORTED_BROWSERS,
    SCREEN_RESOLUTIONS,
    MOBILE_RESOLUTIONS,
    get_test_credentials,
    get_urls_for_environment
)

class ConfigManager:
    BROWSERS = SUPPORTED_BROWSERS
    
    URLS = TEST_URLS
    SCREEN_SIZES = SCREEN_RESOLUTIONS
    MOBILE_SIZES = MOBILE_RESOLUTIONS
    
    @classmethod
    def get_default_login_url(cls, env="DEV"):
        return get_urls_for_environment(env)["login"]
    
    @classmethod
    def get_test_credentials(cls, prefix="test"):
        return get_test_credentials(prefix)
    
__all__ = [
    'TEST_URLS', 'API_CONFIG', 'SUPPORTED_BROWSERS', 'SCREEN_RESOLUTIONS', 'MOBILE_RESOLUTIONS',
    'get_test_credentials', 'get_urls_for_environment',
    'ConfigManager'
]
