import os
import time
import platform
import json
import asyncio

from abc import ABC, abstractmethod
from datetime import datetime
from dotenv import load_dotenv
from utils.browser_factory import BrowserDriverFactory, BrowserUtils
from utils.test_utils import TestResultPrinter
from utils.login_helper import TestLoginHelper
from utils.transaction_verifier import TransactionVerifier
from config import ConfigManager

load_dotenv()

def get_browsers_by_os(os_type):
    browsers_mapping = {
        'windows': ["chrome", "firefox", "edge"],
        'macos': ["chrome", "firefox", "edge", "safari"],
        'linux': ["chrome", "firefox", "chromium"]
    }
    return browsers_mapping.get(os_type, ["chrome", "firefox", "edge"])  

def detect_current_os():
    system = platform.system().lower()
    
    if system == "windows":
        return "windows"
    elif system == "darwin":
        return "macos"
    elif system == "linux":
        return "linux"
    else:
        return "windows"


class BaseAttributeTest(ABC):
    
    def __init__(self, credentials_key):
        env = os.getenv("ENVIRONMENT", "DEV")
        
        self.test_url = ConfigManager.get_default_login_url(env)
        self.credentials = ConfigManager.get_test_credentials(credentials_key)
        
        self.api_config = ConfigManager.get_api_config(env)
        self.transaction_verifier = TransactionVerifier(self.api_config["base_url"])
        
        self._current_driver = None
        self._current_browser_type = None
        self._current_page = None
        self._last_test_config = None
        
        self._current_language = None
        self._current_timezone = None
        self._current_screen_width = None
        self._current_screen_height = None
    
    @abstractmethod
    def get_test_configs(self):
        pass
    
    @abstractmethod  
    def get_test_browsers(self):
        pass
    
    def get_browser_display_name(self, browser_type):
        browser_names = {
            "chrome": "Chrome",
            "firefox": "Firefox", 
            "edge": "Edge",
            "safari": "Safari",
            "chromium": "Chromium"
        }
        return browser_names.get(browser_type.lower(), browser_type.title())
    
    def get_platform_from_ua(self, user_agent):
        if "Windows" in user_agent:
            return "\"Win32\""
        elif "Macintosh" in user_agent or "Mac OS" in user_agent:
            return "\"MacIntel\""
        elif "Linux" in user_agent or "X11" in user_agent:
            return "\"Linux x86_64\""
        else:
            return "\"Win32\""
    
    def get_vendor_from_browser(self, browser_type):
        vendors = {
            "chrome": "\"Google Inc.\"",
            "firefox": "\"\"",
            "edge": "\"Microsoft Corporation\"",
            "safari": "\"Apple Computer, Inc.\"",
            "chromium": "\"Google Inc.\""
        }
        return vendors.get(browser_type.lower(), "\"\"")
    
    def _requires_new_driver(self, browser_type, test_config):
        if self._current_driver is None or self._current_browser_type != browser_type:
            return True
            
        if self._last_test_config is None:
            return True
            
        critical_attributes = ['user_agent', 'plugins']
        
        for attr in critical_attributes:
            if (test_config.get(attr) != self._last_test_config.get(attr)):
                return True
        
        dynamic_attributes = ['language', 'timezone', 'screen_width', 'screen_height']
        
        changes_count = 0
        for attr in dynamic_attributes:
            if (test_config.get(attr) != self._last_test_config.get(attr)):
                changes_count += 1
        
        if changes_count > 1:
            return True
                
        return False
    
    def _get_or_create_driver(self, browser_type, test_config, headless=True):
        if self._requires_new_driver(browser_type, test_config):
            if self._current_driver is not None:
                BrowserUtils.safe_quit_driver(self._current_driver)
                self._current_driver = None
                self._current_page = None
            
            browser_config = self._prepare_browser_config(test_config)
            self._current_driver = BrowserDriverFactory.create_driver(browser_type, headless, browser_config)
            self._current_browser_type = browser_type
            self._current_page = self._current_driver.page if hasattr(self._current_driver, 'page') else self._current_driver
        else:

            self._update_browser_attributes_dynamically(test_config)
            time.sleep(1)
        
        self._last_test_config = test_config.copy()
        return self._current_driver
    
    def _update_browser_attributes_dynamically(self, test_config):
        if self._current_page is None or self._last_test_config is None:
            return
            
        dynamic_attributes = ['language', 'timezone', 'screen_width', 'screen_height']
        changed_attribute = None
        new_value = None
        
        for attr in dynamic_attributes:
            old_val = self._last_test_config.get(attr)
            new_val = test_config.get(attr)
            if old_val != new_val:
                changed_attribute = attr
                new_value = new_val
                break
        
        if changed_attribute:
            try:
                async def update_attribute():
                    if changed_attribute == 'language':
                        if hasattr(self._current_driver, 'context'):
                            await self._current_driver.context.set_extra_http_headers({"Accept-Language": new_value})
                        
                        if hasattr(self._current_page, 'evaluate'):
                            js_code = f"""
                            () => {{
                                // Override navigator.language
                                Object.defineProperty(navigator, 'language', {{
                                    get: function() {{ return '{new_value}'; }},
                                    configurable: true
                                }});
                                
                                // Override navigator.languages
                                Object.defineProperty(navigator, 'languages', {{
                                    get: function() {{ return ['{new_value}']; }},
                                    configurable: true
                                }});
                                
                                console.log('Language changed to:', '{new_value}');
                                return navigator.language;
                            }}
                            """
                            result = await self._current_page.evaluate(js_code)
                            print(f"  Language updated to: {result}")
                        
                        self._current_language = new_value
                        
                    elif changed_attribute == 'timezone':
                        if hasattr(self._current_page, 'evaluate'):
                            js_code = f"""
                            () => {{
                                // Override Intl.DateTimeFormat to return new timezone
                                const originalDateTimeFormat = Intl.DateTimeFormat;
                                Intl.DateTimeFormat = function(...args) {{
                                    const formatter = new originalDateTimeFormat(...args);
                                    const originalResolvedOptions = formatter.resolvedOptions;
                                    formatter.resolvedOptions = function() {{
                                        const options = originalResolvedOptions.call(this);
                                        options.timeZone = '{new_value}';
                                        return options;
                                    }};
                                    return formatter;
                                }};
                                
                                // Override Date.prototype.getTimezoneOffset if needed
                                console.log('Timezone changed to:', '{new_value}');
                                return '{new_value}';
                            }}
                            """
                            result = await self._current_page.evaluate(js_code)
                        else:
                            print(f"  Timezone preference updated to: {new_value} (requires driver recreation for full effect)")
                        
                        self._current_timezone = new_value
                        
                    elif changed_attribute in ['screen_width', 'screen_height']:
                        new_width = test_config.get('screen_width', self._current_screen_width)
                        new_height = test_config.get('screen_height', self._current_screen_height)
                        
                        if hasattr(self._current_page, 'set_viewport_size'):
                            await self._current_page.set_viewport_size({
                                "width": int(new_width) if new_width else 1920,
                                "height": int(new_height) if new_height else 1080
                            })
                            print(f"  Viewport updated to: {new_width}x{new_height}")
                        
                        self._current_screen_width = new_width
                        self._current_screen_height = new_height
                
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.create_task(update_attribute())
                    else:
                        loop.run_until_complete(update_attribute())
                except RuntimeError:
                    asyncio.run(update_attribute())
                    
            except Exception as e:
                print(f"  Warning: Could not update {changed_attribute} dynamically: {e}")
                print(f"  Driver will continue with original configuration")
                if changed_attribute == 'language':
                    self._current_language = new_value
                elif changed_attribute == 'timezone':
                    self._current_timezone = new_value
                elif changed_attribute in ['screen_width', 'screen_height']:
                    self._current_screen_width = test_config.get('screen_width', self._current_screen_width)
                    self._current_screen_height = test_config.get('screen_height', self._current_screen_height)
        
        time.sleep(0.5)
    
    def _cleanup_driver(self):
        if self._current_driver is not None:
            BrowserUtils.safe_quit_driver(self._current_driver)
            self._current_driver = None
            self._current_browser_type = None
            self._current_page = None
            self._last_test_config = None
            
            self._current_language = None
            self._current_timezone = None
            self._current_screen_width = None
            self._current_screen_height = None
    
    def test_single_browser_attribute_combination(self, browser_type, test_config, headless=True, is_verification=True):
        test_name = f"{browser_type.upper()}-{test_config['name']}"
        
        try:
            driver = self._get_or_create_driver(browser_type, test_config, headless)
            
            login_result = TestLoginHelper.perform_login_with_attributes(
                driver, self.test_url, self.credentials
            )
            TestResultPrinter.print_test_result(test_name, login_result)
            
            if login_result.get("login_result") == "SUCCESS" and is_verification:
                try:
                    TestLoginHelper.perform_logout(driver)
                except Exception as logout_error:
                    print(f"Logout error: {logout_error}")
                    pass

                self.verify_transaction_attributes(test_name, browser_type, test_config)

        except Exception as e:
            TestResultPrinter.print_test_result(test_name, {}, str(e))
    
    def _prepare_browser_config(self, test_config):
        browser_config = {}
        
        if "user_agent" in test_config:
            browser_config["user_agent"] = test_config["user_agent"]
        
        if "language" in test_config:
            browser_config["language"] = test_config["language"]
            
        if "timezone" in test_config:
            browser_config["timezone"] = test_config["timezone"]
            
        if "expected_os" in test_config:
            browser_config["expected_os"] = test_config["expected_os"]
            
        if "expected_platform" in test_config:
            browser_config["expected_platform"] = test_config["expected_platform"]
            
        if "plugins" in test_config:
            browser_config["plugins"] = test_config["plugins"]
            
        if "screen_width" in test_config:
            browser_config["screen_width"] = test_config["screen_width"]
            
        if "screen_height" in test_config:
            browser_config["screen_height"] = test_config["screen_height"]
            
        if "available_width" in test_config:
            browser_config["available_width"] = test_config["available_width"]
            
        if "available_height" in test_config:
            browser_config["available_height"] = test_config["available_height"]
            
        return browser_config
    
    def verify_transaction_attributes(self, test_name, browser_type, test_config):
        login_name = self.credentials['username']
        
        expected_transaction_data = {
            "subscriberID": self.api_config["subscriber_id"],
            "loginName": login_name,
            "url": self.test_url
        }
        
        if "user_agent" in test_config:
            expected_transaction_data["userAgent"] = test_config["user_agent"]
        
        attributes = {}
        
        if "user_agent" in test_config:
            if "expected_platform" not in test_config:
                attributes["platform"] = self.get_platform_from_ua(test_config["user_agent"])
            attributes["vendor"] = self.get_vendor_from_browser(browser_type)
        
        if "language" in test_config:
            attributes["languages"] = f'"{test_config["language"]}"'
            
        if "timezone" in test_config:
            attributes["timezone"] = f'"{test_config["timezone"]}"'
            
        if "expected_os" in test_config:
            attributes["osname"] = f'"{test_config["expected_os"]}"'
            
        if "expected_platform" in test_config:
            attributes["platform"] = f'"{test_config["expected_platform"]}"'
            
        if "plugins" in test_config:
            attributes["plugins"] = json.dumps(test_config["plugins"])
        
        if "screen_width" in test_config and "screen_height" in test_config:
            screen_resolution = f"[{test_config['screen_width']},{test_config['screen_height']}]"
            attributes["screenResolution"] = screen_resolution
            
        if "available_width" in test_config and "available_height" in test_config:
            screen_frame = f"[0,0,{test_config['available_width']},{test_config['available_height']}]"
            attributes["screenFrame"] = screen_frame
        
        attributes.update({
            "cookiesEnabled": "true",
            "localStorage": "true",
            "sessionStorage": "true"
        })
        
        if attributes:
            expected_transaction_data["attributes"] = attributes
        
        self.transaction_verifier.verify_complete_transaction(
            test_name,
            expected_transaction_data,
            max_retries=3,
            retry_delay=5,
            batch_size=10
        )
    
    def run_single_browser_test(self, browser_type, headless=True):
        test_configs = self.get_test_configs()
        
        try:
            for i, test_config in enumerate(test_configs, 1):
                try:
                    self.test_single_browser_attribute_combination(browser_type, test_config, headless)
                    
                    if i < len(test_configs):
                        time.sleep(3)
                        
                except Exception as e:
                    print(f"Error in {browser_type} test {i}: {e}")
                    continue
        finally:
            self._cleanup_driver()
    
    def run_cross_browser_test(self, headless=True):
        browsers = self.get_test_browsers()
        
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                self.run_single_browser_test(browser_type, headless)
                
                if browser_idx < len(browsers):
                    time.sleep(5)
                    
            except Exception as e:
                print(f"Error in {browser_type} browser test: {e}")
                self._cleanup_driver()
                continue
        
        self._cleanup_driver()
    
    def get_ua_configs(self):
        return self.get_test_configs()
    
    def test_single_browser_ua_combination(self, browser_type, ua_config, headless=True, is_verification=True):
        return self.test_single_browser_attribute_combination(browser_type, ua_config, headless, is_verification)
    
    def run_dual_session_test(self, headless=False, session_delay=15):
        browsers = self.get_test_browsers()
        
        for browser_idx, browser_type in enumerate(browsers, 1):
            try:
                browser_configs = self.get_browser_dual_configs(browser_type)
                
                if not browser_configs:
                    continue
                
                session_results = []
                
                first_config = browser_configs[0]
                driver = self._get_or_create_driver(browser_type, first_config, headless)
                
                configs_to_use = browser_configs[:2] if len(browser_configs) >= 2 else [first_config, first_config]
                
                for session_num, test_config in enumerate(configs_to_use, 1):  
                    try:
                        test_name = f"{browser_type.upper()}-{test_config['name']}-SESSION{session_num}"
                        
                        if session_num > 1 and test_config != configs_to_use[0]:
                            self._update_browser_attributes_dynamically(test_config)
                        
                        login_result = TestLoginHelper.perform_login_with_attributes(
                            driver, self.test_url, self.credentials
                        )
                        TestResultPrinter.print_test_result(test_name, login_result)
                        
                        if login_result.get("login_result") == "SUCCESS":
                            session_results.append((test_name, browser_type, test_config))
                            
                            if session_num < 2:
                                try:
                                    TestLoginHelper.perform_logout(driver)
                                except Exception as logout_error:
                                    print(f"Logout error after session {session_num}: {logout_error}")
                        
                        if session_num < 2:
                            time.sleep(session_delay)
                            
                    except Exception as e:
                        print(f"Error in session {session_num}: {e}")
                        continue

                if len(session_results) == 2:
                    self.verify_dual_session_transactions(session_results, browser_type)
                
                if browser_idx < len(browsers):
                    time.sleep(10)
                    
            except Exception as e:
                print(f"Error in {browser_type} dual session test: {e}")
                continue

            finally:
                self._cleanup_driver()
    
    def get_browser_dual_configs(self, browser_type):
        all_configs = self.get_test_configs()
        browser_configs = []
        
        for config in all_configs:
            if browser_type.lower() in config.get('name', '').lower():
                browser_configs.append(config)
        
        if browser_configs:
            return browser_configs
        
        if all_configs:
            return all_configs
        
        return [{'name': f'{browser_type}_default_config'}]
    
    def verify_dual_session_transactions(self, session_results, browser_type):
        if len(session_results) != 2:
            print(f"Expected 2 transactions for {browser_type}, got {len(session_results)}")
            return
            
        login_name = self.credentials['username']
        subscriber_id = self.api_config["subscriber_id"]
        
        transactions = self.transaction_verifier.get_transactions(
            subscriber_id, login_name, max_retries=3, retry_delay=10, batch_size=10)
        
        if not transactions or len(transactions) < 2:
            print(f"Could not retrieve 2 transactions for dual session verification of {browser_type}")
            return
            
        trans1 = transactions[0]  # Second to last (first session)
        trans2 = transactions[1]  # Last (second session)
        
        comparison_result = self.transaction_verifier.compare_transactions(
            trans1, trans2, 
            ignore_fields=['transID', 'timestamp', 'createdAt', 'updatedAt', 'loginTime', 'insertTime', 'transTime'],
            comparison_name=f"{browser_type.upper()} Dual Session"
        )
        
        TestResultPrinter.print_test_result(
            f"{browser_type.upper()}-DUAL_SESSION_VERIFY", 
            comparison_result
        )
    
    def generate_comprehensive_test_report(self, output_dir="reports"):
        """Generate comprehensive test report with driver optimization statistics"""
        try:
            # Create reports directory if it doesn't exist
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # Generate timestamp for unique report filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_filename = f"browser_test_report_{timestamp}.json"
            report_path = os.path.join(output_dir, report_filename)
            
            # Collect all transactions for each browser
            browsers = self.get_test_browsers()
            login_name = self.credentials['username']
            subscriber_id = self.api_config["subscriber_id"]
            
            # Get all transactions
            all_transactions = self.transaction_verifier.get_transactions(
                subscriber_id, login_name, max_retries=3, retry_delay=5, batch_size=50
            )
            
            if not all_transactions:
                print("No transactions found for report generation")
                return None
            
            # Group transactions by browser type (inferred from user agent)
            browser_transactions = {browser: [] for browser in browsers}
            unclassified_transactions = []
            
            for trans in all_transactions:
                user_agent = trans.get('userAgent', '').lower()
                classified = False
                
                for browser in browsers:
                    if browser.lower() in user_agent:
                        browser_transactions[browser].append(trans)
                        classified = True
                        break
                
                if not classified:
                    unclassified_transactions.append(trans)
            
            # Generate report data
            report_data = {
                "test_session": {
                    "timestamp": datetime.now().isoformat(),
                    "test_url": self.test_url,
                    "subscriber_id": subscriber_id,
                    "username": login_name
                },
                "optimization_stats": {
                    "driver_reuse_enabled": True,
                    "dynamic_attribute_updates": True,
                    "note": "Driver reuse optimized for performance - same driver used across compatible attribute tests"
                },
                "browser_results": {},
                "summary": {
                    "total_browsers_tested": len([b for b in browsers if browser_transactions[b]]),
                    "total_transactions": len(all_transactions),
                    "unclassified_count": len(unclassified_transactions)
                }
            }
            
            # Generate detailed report for each browser
            for browser_type in browsers:
                browser_trans = browser_transactions[browser_type]
                
                if not browser_trans:
                    continue
                
                browser_report = {
                    "browser_name": self.get_browser_display_name(browser_type),
                    "transaction_count": len(browser_trans),
                    "transactions": [],
                    "unique_attributes": set(),
                    "attributes_summary": {}
                }
                
                # Process each transaction
                for idx, trans in enumerate(browser_trans, 1):
                    trans_data = {
                        "transaction_id": trans.get('transID', f'unknown_{idx}'),
                        "timestamp": trans.get('timestamp', ''),
                        "login_time": trans.get('loginTime', ''),
                        "url": trans.get('url', ''),
                        "user_agent": trans.get('userAgent', ''),
                        "attributes": trans.get('attributes', {}),
                        "status": "SUCCESS" if trans.get('loginTime') else "FAILED"
                    }
                    
                    browser_report["transactions"].append(trans_data)
                    
                    # Collect unique attributes
                    if trans.get('attributes'):
                        for attr_key in trans['attributes'].keys():
                            browser_report["unique_attributes"].add(attr_key)
                
                # Convert set to list for JSON serialization
                browser_report["unique_attributes"] = list(browser_report["unique_attributes"])
                
                # Generate attributes summary
                if browser_trans:
                    attrs_summary = {}
                    for trans in browser_trans:
                        if trans.get('attributes'):
                            for attr_key, attr_value in trans['attributes'].items():
                                if attr_key not in attrs_summary:
                                    attrs_summary[attr_key] = {"values": set(), "count": 0}
                                attrs_summary[attr_key]["values"].add(str(attr_value))
                                attrs_summary[attr_key]["count"] += 1
                    
                    # Convert sets to lists for JSON serialization
                    for attr_key in attrs_summary:
                        attrs_summary[attr_key]["values"] = list(attrs_summary[attr_key]["values"])
                        attrs_summary[attr_key]["unique_values_count"] = len(attrs_summary[attr_key]["values"])
                    
                    browser_report["attributes_summary"] = attrs_summary
                
                report_data["browser_results"][browser_type] = browser_report
            
            # Add unclassified transactions if any
            if unclassified_transactions:
                report_data["unclassified_transactions"] = {
                    "count": len(unclassified_transactions),
                    "transactions": [
                        {
                            "transaction_id": trans.get('transID', f'unclassified_{idx}'),
                            "timestamp": trans.get('timestamp', ''),
                            "user_agent": trans.get('userAgent', ''),
                            "attributes": trans.get('attributes', {})
                        }
                        for idx, trans in enumerate(unclassified_transactions, 1)
                    ]
                }
            
            # Save report to file
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False, default=str)
            
            # Print summary
            print(f"\n{'='*80}")
            print(f"COMPREHENSIVE BROWSER TEST REPORT GENERATED")
            print(f"{'='*80}")
            print(f"Report saved to: {report_path}")
            print(f"Total Transactions: {report_data['summary']['total_transactions']}")
            print(f"Browsers Tested: {report_data['summary']['total_browsers_tested']}")
            print(f"Driver Optimization: ENABLED (Reuse + Dynamic Updates)")
            
            for browser_type, browser_data in report_data["browser_results"].items():
                print(f"  - {browser_data['browser_name']}: {browser_data['transaction_count']} transactions")
            
            if unclassified_transactions:
                print(f"  - Unclassified: {len(unclassified_transactions)} transactions")
            
            print(f"{'='*80}")
            
            return report_path
            
        except Exception as e:
            print(f"Error generating comprehensive test report: {e}")
            return None
    
    def run_optimized_cross_browser_test_with_report(self, headless=True, output_dir="reports"):
        """Run optimized cross-browser test and generate comprehensive report"""
        print(f"\n{'='*80}")
        print("STARTING OPTIMIZED CROSS-BROWSER FINGERPRINT TEST")
        print("Driver Reuse Optimization: ENABLED")
        print("Dynamic Attribute Updates: ENABLED")
        print(f"{'='*80}")
        
        try:
            # Run cross-browser test with optimization
            self.run_cross_browser_test(headless)
            
            # Generate comprehensive report
            report_path = self.generate_comprehensive_test_report(output_dir)
            
            return report_path
            
        except Exception as e:
            print(f"Error in optimized cross-browser test: {e}")
            return None



