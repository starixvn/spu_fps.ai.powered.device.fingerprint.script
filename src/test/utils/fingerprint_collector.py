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
    def collect_screen_info(driver):

        return {
            'screen_width': driver.execute_script("return screen.width;"),
            'screen_height': driver.execute_script("return screen.height;"),
            'screen_color_depth': driver.execute_script("return screen.colorDepth;"),
            'screen_pixel_depth': driver.execute_script("return screen.pixelDepth;"),
            'screen_available_width': driver.execute_script("return screen.availWidth;"),
            'screen_available_height': driver.execute_script("return screen.availHeight;"),
            'window_width': driver.execute_script("return window.innerWidth;"),
            'window_height': driver.execute_script("return window.innerHeight;"),
            'window_outer_width': driver.execute_script("return window.outerWidth;"),
            'window_outer_height': driver.execute_script("return window.outerHeight;"),
            'device_pixel_ratio': driver.execute_script("return window.devicePixelRatio;")
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


class FingerprintAnalyzer:
    
    @staticmethod
    def compare_fingerprints(fp1, fp2):
        if "fingerprint" not in fp1 or "fingerprint" not in fp2:
            return 0.0
        
        f1 = fp1["fingerprint"]
        f2 = fp2["fingerprint"]
        
        total_attributes = 0
        matching_attributes = 0
        
        key_attrs = ['user_agent', 'language']
        for attr in key_attrs:
            if attr in f1 and attr in f2:
                total_attributes += 1
                if f1[attr] == f2[attr]:
                    matching_attributes += 1
        
        return matching_attributes / total_attributes if total_attributes > 0 else 0.0
    
    @staticmethod
    def get_uniqueness_score(fingerprint_data):
        if "fingerprint" not in fingerprint_data:
            return 0.0
        
        fp = fingerprint_data["fingerprint"]
        uniqueness_factors = []
        
        if 'user_agent' in fp and fp['user_agent']:
            uniqueness_factors.append(min(len(fp['user_agent']) / 100.0, 1.0))
        
        if 'language' in fp and fp['language']:

            common_languages = ['en-US', 'en', 'zh-CN', 'es', 'fr', 'de', 'ja', 'pt']
            if fp['language'] in common_languages:
                uniqueness_factors.append(0.2)
            else:
                uniqueness_factors.append(0.8)
        
        return sum(uniqueness_factors) / len(uniqueness_factors) if uniqueness_factors else 0.0
