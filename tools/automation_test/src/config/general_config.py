import os

TEST_URLS = {
    "DEV": {
        "login": "http://fps-demo-standard.nexdev.net"
    },
    "LOCAL": {
        "login": "http://fps-demo-standard.nexdev.net",
    },
    "UAT": {
        "login": ""
    }
}

API_CONFIG = {
    "subscriber_id": 2,
    "DEV": {
        "base_url": "https://spu-fps-int-api.nexdev.net"
    },
    "LOCAL": {
        "base_url": "https://spu-fps-int-api.nexdev.net"
    },
    "UAT": {
        "base_url": ""
    }
}

def get_test_credentials(prefix="test"):
    computer_name = os.environ.get('COMPUTERNAME', 'unknown')

    return {
        "username": f"{computer_name}_{prefix}",
        "password": ""
    }

def get_urls_for_environment(env="DEV"):
    return TEST_URLS.get(env, TEST_URLS["DEV"])

def get_api_config_for_environment(env="DEV"):
    env_config = API_CONFIG.get(env, API_CONFIG["DEV"])
    return {
        "subscriber_id": API_CONFIG["subscriber_id"],
        "base_url": env_config["base_url"]
    }
