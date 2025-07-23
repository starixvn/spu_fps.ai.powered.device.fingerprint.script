TIMEZONE_CONFIGS = [
    {"timezone": "America/New_York", "name": "UTC-5_NewYork", "offset": "-05:00", "region": "North America"},
    {"timezone": "Europe/London", "name": "UTC+0_London", "offset": "+00:00", "region": "Europe"},
    {"timezone": "Asia/Tokyo", "name": "UTC+9_Tokyo", "offset": "+09:00", "region": "Asia"},
    {"timezone": "Asia/Ho_Chi_Minh", "name": "UTC+7_Vietnam", "offset": "+07:00", "region": "Asia"},
    # {"timezone": "Australia/Sydney", "name": "UTC+10_Sydney", "offset": "+10:00", "region": "Oceania"},
    # {"timezone": "America/Los_Angeles", "name": "UTC-8_LosAngeles", "offset": "-08:00", "region": "North America"},
    # {"timezone": "Europe/Berlin", "name": "UTC+1_Berlin", "offset": "+01:00", "region": "Europe"},
    # {"timezone": "Asia/Shanghai", "name": "UTC+8_Shanghai", "offset": "+08:00", "region": "Asia"},
    # {"timezone": "America/Sao_Paulo", "name": "UTC-3_SaoPaulo", "offset": "-03:00", "region": "South America"},
    # {"timezone": "Asia/Dubai", "name": "UTC+4_Dubai", "offset": "+04:00", "region": "Middle East"}
]

POPULAR_TIMEZONES = [
    "America/New_York",
    "Europe/London", 
    "Asia/Tokyo",
    "Asia/Ho_Chi_Minh"
]

def get_timezone_by_region(region):
    return [config for config in TIMEZONE_CONFIGS if config["region"] == region]

def get_timezone_config(timezone_name):
    for config in TIMEZONE_CONFIGS:
        if config["timezone"] == timezone_name:
            return config
        
    return None

def get_popular_timezones():
    return [config for config in TIMEZONE_CONFIGS if config["timezone"] in POPULAR_TIMEZONES]

def get_all_regions():
    return list(set(config["region"] for config in TIMEZONE_CONFIGS))
