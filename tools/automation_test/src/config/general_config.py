import os

TEST_URLS = {
    "DEV": {
        "login": "http://localhost:60207/Login"
    },
    "LOCAL": {
        "login": "https://fps-demo-standard.nexdev.net/Login",
    },
    "UAT": {
        "login": "https://fps-demo-standard.nexdev.net/Login"
    }
}

SUPPORTED_BROWSERS = ["chrome", "firefox", "edge"]

TIMEOUTS = {
    "page_load": 30,
    "element_wait": 10,
    "implicit_wait": 5,
    "script_timeout": 30
}

SCREEN_RESOLUTIONS = [
    {"width": 1920, "height": 1080, "name": "1080p"},
    {"width": 1366, "height": 768, "name": "HD"},
    {"width": 1280, "height": 720, "name": "720p"},
    {"width": 1024, "height": 768, "name": "XGA"},
    {"width": 800, "height": 600, "name": "SVGA"}
]

MOBILE_RESOLUTIONS = [
    {"width": 375, "height": 667, "name": "iPhone_SE"},
    {"width": 390, "height": 844, "name": "iPhone_12"},
    {"width": 360, "height": 640, "name": "Android_Small"},
    {"width": 412, "height": 892, "name": "Android_Large"}
]

def get_test_credentials(prefix="test"):
    computer_name = os.environ.get('COMPUTERNAME', 'unknown')

    return {
        "username": f"{computer_name}_{prefix}",
        "password": "1234aa"
    }

def get_urls_for_environment(env="DEV"):
    
    return TEST_URLS.get(env, TEST_URLS["DEV"])

def get_resolution_by_name(name):
    all_resolutions = SCREEN_RESOLUTIONS + MOBILE_RESOLUTIONS
    for resolution in all_resolutions:
        if resolution["name"] == name:
            return resolution
    return None
