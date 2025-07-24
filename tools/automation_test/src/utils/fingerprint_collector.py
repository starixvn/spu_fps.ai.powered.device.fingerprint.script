import time
from datetime import datetime

class FingerprintCollector:
    
    @staticmethod
    def collect_basic_info(driver):

        return {
            'user_agent': driver.execute_script("return navigator.userAgent;"),
            'language': driver.execute_script("return navigator.language;"),
            'languages': driver.execute_script("return navigator.languages;"),
            'platform': driver.execute_script("return navigator.platform;"),
            'cookie_enabled': driver.execute_script("return navigator.cookieEnabled;"),
            'do_not_track': driver.execute_script("return navigator.doNotTrack;"),
            'hardware_concurrency': driver.execute_script("return navigator.hardwareConcurrency;"),
            'max_touch_points': driver.execute_script("return navigator.maxTouchPoints;")
        }
    
    @staticmethod
    def collect_timezone_info(driver):

        return {
            'timezone_offset': driver.execute_script("return new Date().getTimezoneOffset();"),
            'timezone': driver.execute_script("return Intl.DateTimeFormat().resolvedOptions().timeZone;"),
            'timezone_name': driver.execute_script("return Intl.DateTimeFormat().resolvedOptions().timeZoneName;")
        }
    
    @staticmethod
    def collect_comprehensive_fingerprint(driver, browser_name, config_name, test_url=None):
        try:
            fingerprint_data = {}
            
            if test_url:
                driver.get(test_url)
                time.sleep(2)
            
            fingerprint_data.update(FingerprintCollector.collect_basic_info(driver))
            
            return {
                "browser": browser_name,
                "config": config_name,
                "fingerprint": fingerprint_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error collecting fingerprint for {browser_name} - {config_name}: {str(e)}")
            return {
                "browser": browser_name,
                "config": config_name,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }