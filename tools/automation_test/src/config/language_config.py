LANGUAGE_CONFIGS = [
    {"language": "en-US", "name": "English_US"},
    {"language": "vi-VN", "name": "Vietnamese"},
    # {"language": "ja-JP", "name": "Japanese"},
    # {"language": "de-DE", "name": "German"},
    # {"language": "fr-FR", "name": "French"},
    # {"language": "es-ES", "name": "Spanish"},
    # {"language": "zh-CN", "name": "Chinese_Simplified"},
    # {"language": "ko-KR", "name": "Korean"},
    # {"language": "th-TH", "name": "Thai"},
    # {"language": "ru-RU", "name": "Russian"}
]

DEFAULT_LANGUAGE = "en-US"

def get_language_config(language_code):
    for config in LANGUAGE_CONFIGS:
        if config["language"] == language_code:
            return config
        
    return None

def get_all_language_codes():
    return [config["language"] for config in LANGUAGE_CONFIGS]
