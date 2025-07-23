USER_AGENT_CONFIGS = [
    # {
    #     "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    #     "name": "Chrome_120_Windows",
    #     "platform": "Windows",
    #     "browser": "Chrome",
    #     "version": "120"
    # },
    {
        "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "name": "Chrome_120_Mac",
        "platform": "macOS",
        "browser": "Chrome",
        "version": "120"
    },
    {
        "ua": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "name": "Chrome_120_Linux",
        "platform": "Linux",
        "browser": "Chrome",
        "version": "120"
    },
    # {
    #     "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    #     "name": "Firefox_121_Windows",
    #     "platform": "Windows",
    #     "browser": "Firefox",
    #     "version": "121"
    # },
    # {
    #     "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
    #     "name": "Firefox_121_Mac",
    #     "platform": "macOS",
    #     "browser": "Firefox",
    #     "version": "121"
    # },
    # {
    #     "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    #     "name": "Edge_120_Windows",
    #     "platform": "Windows",
    #     "browser": "Edge",
    #     "version": "120"
    # }
]

MOBILE_USER_AGENT_CONFIGS = [
    {
        "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "name": "Safari_iOS_17",
        "platform": "iOS",
        "browser": "Safari",
        "device": "iPhone"
    },
    {
        "ua": "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "name": "Chrome_Android_10",
        "platform": "Android",
        "browser": "Chrome",
        "device": "Samsung Galaxy S10"
    }
]

def get_user_agent_by_platform(platform):
    return [config for config in USER_AGENT_CONFIGS if config["platform"] == platform]

def get_user_agent_by_browser(browser):
    return [config for config in USER_AGENT_CONFIGS if config["browser"] == browser]

def get_random_user_agent():
    import random
    return random.choice(USER_AGENT_CONFIGS)
