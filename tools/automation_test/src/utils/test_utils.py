from .browser_factory import BrowserDriverFactory

class TestValidator:
    
    @staticmethod
    def check_webdriver_availability(browser_type):
        try:
            driver = BrowserDriverFactory.create_driver(browser_type, headless=True)
            driver.quit()

            return True, None
        
        except Exception as e:
            return False, str(e)

class TestResultPrinter:
    
    @staticmethod
    def print_test_result(test_name, result_dict, exception_error=None):
        if exception_error:
            print(f"❌ FAIL: {test_name} - Exception: {exception_error}")
            return
        
        is_pass = TestResultPrinter._determine_test_success(result_dict)
        status = "✅ PASS" if is_pass else "❌ FAIL"
        
        message, details = TestResultPrinter._extract_message_and_details(result_dict)
        
        print(f"{status}: {test_name} - {message}")
        
        if not is_pass and details:
            for detail in details[:3]:  # Limit to 3 most important details
                print(f"   🔍 {detail}")
    
    @staticmethod
    def _determine_test_success(result_dict):
        
        if result_dict.get('login_result') == 'SUCCESS':
            return True
        if result_dict.get('result') == 'SUCCESS':
            return True
        if result_dict.get('overall_success') is True:
            return True
        
        if "verification_results" in result_dict:
            return result_dict.get('overall_success', False)
        
        if "transactions_identical" in result_dict:
            identical = result_dict.get('transactions_identical', False)
            if result_dict.get('test_type') == 'dual_tabs':
                return result_dict.get('dual_tabs_success', False)
            return identical
        
        if "dual_tabs_success" in result_dict:
            return result_dict.get('dual_tabs_success', False)
        
        if result_dict.get('login_result') in ['FAILED', 'ERROR']:
            return False
        if result_dict.get('result') in ['FAILED', 'ERROR']:
            return False
        if "error" in result_dict and result_dict.get('error'):
            return False
        
        return not bool(result_dict.get('error'))
    
    @staticmethod
    def _extract_message_and_details(result_dict):
        
        if "verification_results" in result_dict:
            trans_id = result_dict.get('transID', 'N/A')
            overall_success = result_dict.get('overall_success', False)
            
            if overall_success:
                return f"All verifications successful (TransID: {trans_id})", []
            else:
                details = []
                verification_results = result_dict.get('verification_results', {})
                for field, result in verification_results.items():
                    if isinstance(result, dict) and not result.get('match', False):
                        expected = str(result.get('expected', 'N/A'))[:50]
                        actual = str(result.get('actual', 'N/A'))[:50]
                        details.append(f"{field}: Expected '{expected}', Got '{actual}'")
                        
                return f"Verification failed (TransID: {trans_id})", details
        
        if "transactions_identical" in result_dict:
            comparison_name = result_dict.get('comparison_name', 'Transaction comparison')
            differences_count = result_dict.get('differences_count', 0)
            
            if result_dict.get('test_type') == 'dual_tabs':
                dual_success = result_dict.get('dual_tabs_success', False)
                ua_different = result_dict.get('userAgent_different', False)
                
                if dual_success:
                    return f"Dual tabs test successful - User Agents are different", []
                else:
                    details = []
                    if not ua_different:
                        details.append("User Agents should be different but are identical")

                    if not result_dict.get('ua1_matches_expected', True):
                        details.append("Tab 1 User Agent doesn't match expected")

                    if not result_dict.get('ua2_matches_expected', True):
                        details.append("Tab 2 User Agent doesn't match expected")

                    return f"Dual tabs test failed", details
            else:
                identical = result_dict.get('transactions_identical', False)
                if identical:
                    return f"{comparison_name} - Transactions are identical", []
                else:
                    details = []
                    differences = result_dict.get('differences', [])
                    for diff in differences[:3]:
                        field = diff.get('field', 'unknown')
                        details.append(f"Field '{field}' differs between transactions")
                    return f"{comparison_name} - Found {differences_count} differences", details
        
        login_result = result_dict.get('login_result')
        if login_result == 'SUCCESS':
            return "Login successful", []
        
        elif login_result == 'FAILED':
            error_msg = result_dict.get('error', 'Unknown login error')
            return f"Login failed: {error_msg}", []
        
        elif login_result == 'ERROR':
            error_msg = result_dict.get('error', 'Unknown test error')
            return f"Test error: {error_msg}", []
        
        if result_dict.get('result') == 'SUCCESS':
            return "Test successful", []
        elif result_dict.get('result') in ['FAILED', 'ERROR']:
            error_msg = result_dict.get('error', 'Unknown error')
            return f"Test failed: {error_msg}", []
        
        if "error" in result_dict and result_dict.get('error'):
            error_msg = result_dict.get('error', 'Unknown error')
            return f"Error: {error_msg}", []
        
        if "message" in result_dict:
            message = result_dict.get('message', 'Unknown result')
            return message, []
        
        return "Test completed", []
    
    @staticmethod
    def print_browser_test_result(browser_name, result_dict):

        test_name = f"{browser_name} Login Test"
        
        if result_dict.get('result') == 'SUCCESS':
            print(f"✅ PASS: {test_name} - Login successful")
        elif result_dict.get('result') == 'FAILED':
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"❌ FAIL: {test_name} - Login failed: {error_msg}")
        else:
            error_msg = result_dict.get('error', 'Unknown error')
            print(f"⚠️ ERROR: {test_name} - Test error: {error_msg}")
