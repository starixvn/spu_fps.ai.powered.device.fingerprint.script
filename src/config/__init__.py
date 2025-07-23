from .language_config import (
    LANGUAGE_CONFIGS, 
    DEFAULT_LANGUAGE,
    get_language_config,
    get_all_language_codes
)

from .user_agent_config import (
    USER_AGENT_CONFIGS, 
    MOBILE_USER_AGENT_CONFIGS
)

from .timezone_config import (
    TIMEZONE_CONFIGS, 
    POPULAR_TIMEZONES,
    get_timezone_config,
    get_popular_timezones,
    get_timezone_by_region,
    get_all_regions
)

from .general_config import (
    TEST_URLS,
    SUPPORTED_BROWSERS,
    TIMEOUTS,
    SCREEN_RESOLUTIONS,
    MOBILE_RESOLUTIONS,
    get_test_credentials,
    get_urls_for_environment
)

class ConfigManager:
    LANGUAGES = LANGUAGE_CONFIGS
    DEFAULT_LANG = DEFAULT_LANGUAGE
    
    USER_AGENTS = USER_AGENT_CONFIGS
    MOBILE_USER_AGENTS = MOBILE_USER_AGENT_CONFIGS
    BROWSERS = SUPPORTED_BROWSERS
    
    TIMEZONES = TIMEZONE_CONFIGS
    POPULAR_TZ = POPULAR_TIMEZONES
    
    URLS = TEST_URLS
    TIMEOUTS = TIMEOUTS
    SCREEN_SIZES = SCREEN_RESOLUTIONS
    MOBILE_SIZES = MOBILE_RESOLUTIONS
    
    @classmethod
    def get_default_login_url(cls, env="DEV"):
        return get_urls_for_environment(env)["login"]
    
    @classmethod
    def get_test_credentials(cls, prefix="test"):
        return get_test_credentials(prefix)
    
    @classmethod
    def get_language_by_code(cls, code):
        return get_language_config(code)
    
    @classmethod
    def get_timezone_by_name(cls, name):
        return get_timezone_config(name)

__all__ = [
    'LANGUAGE_CONFIGS', 'DEFAULT_LANGUAGE', 'get_language_config', 'get_all_language_codes',
    'USER_AGENT_CONFIGS', 'MOBILE_USER_AGENT_CONFIGS',
    'TIMEZONE_CONFIGS', 'POPULAR_TIMEZONES', 'get_timezone_config', 'get_popular_timezones',
    'get_timezone_by_region', 'get_all_regions',
    'TEST_URLS', 'SUPPORTED_BROWSERS', 'TIMEOUTS', 'SCREEN_RESOLUTIONS', 'MOBILE_RESOLUTIONS',
    'get_test_credentials', 'get_urls_for_environment',
    
    'ConfigManager'
]
