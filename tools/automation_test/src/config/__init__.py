
from .general_config import (
    TEST_URLS,
    API_CONFIG,
    get_test_credentials,
    get_urls_for_environment,
    get_api_config_for_environment
)

class ConfigManager:
    
    URLS = TEST_URLS
    
    # Default screen sizes for browser testing
    SCREEN_SIZES = [
        {"width": 1920, "height": 1080},
        {"width": 1366, "height": 768},
        {"width": 1280, "height": 720}
    ]
    
    @classmethod
    def get_default_login_url(cls, env="DEV"):
        return get_urls_for_environment(env)["login"]
    
    @classmethod
    def get_test_credentials(cls, prefix="test"):
        return get_test_credentials(prefix)
    
    @classmethod
    def get_api_config(cls, env="DEV"):
        """Get API configuration for specific environment"""
        return get_api_config_for_environment(env)
    
__all__ = [
    'TEST_URLS', 'API_CONFIG',
    'get_test_credentials', 'get_urls_for_environment', 'get_api_config_for_environment',
    'ConfigManager'
]
