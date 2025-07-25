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

API_CONFIG = {
    "subscriber_id": 2,  
    "base_url": "http://localhost:5001"
}

SUPPORTED_BROWSERS = ["chrome", "firefox", "edge"]

def get_test_credentials(prefix="test"):
    computer_name = os.environ.get('COMPUTERNAME', 'unknown')

    return {
        "username": f"{computer_name}_{prefix}",
        "password": ""
    }

def get_urls_for_environment(env="DEV"):
    
    return TEST_URLS.get(env, TEST_URLS["DEV"])
