import time
from utils.transaction_api_helper import TransactionAPIHelper
from utils.test_utils import TestResultPrinter


class TransactionVerifier:
    
    def __init__(self, api_base_url="http://localhost:5001"):
        self.api_helper = TransactionAPIHelper(api_base_url)

    def get_transactions(self, subscriber_id, login_name, max_retries=3, retry_delay=5, batch_size=10):
        transactions = []
        
        for attempt in range(max_retries):
            current_transactions = self.api_helper.get_transactions_by_login(
                subscriber_id, login_name, batch_size=batch_size
            )
            
            if current_transactions:
                transactions = current_transactions
            
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        return transactions
    
    def verify_complete_transaction(self, test_name, expected_data, 
                                  max_retries=3, retry_delay=5, batch_size=1):
        subscriber_id = expected_data.get("subscriberID")
        login_name = expected_data.get("loginName")
        
        if not subscriber_id or not login_name:
            TestResultPrinter.print_test_result(
                f"{test_name}-COMPLETE_VERIFY", 
                {"error": "subscriberID and loginName are required"}
            )
            return

        transactions = self.get_transactions(
            subscriber_id, login_name, max_retries=max_retries, 
            retry_delay=retry_delay, batch_size=batch_size
        )

        if not transactions:
            TestResultPrinter.print_test_result(
                f"{test_name}-COMPLETE_VERIFY", 
                {"error": f"No transactions found for {login_name}"}
            )
            return

        latest_transaction = transactions[-1]
        verification_results = {}

        verification_results["subscriberID"] = self._verify_field(
            latest_transaction, "subscriberID", expected_data.get("subscriberID")
        )
        verification_results["loginName"] = self._verify_field(
            latest_transaction, "loginName", expected_data.get("loginName")
        )

        if "url" in expected_data:
            verification_results["url"] = self._verify_field(
                latest_transaction, "urlDetails", expected_data.get("url")
            )

        if "browserName" in expected_data:
            verification_results["browserName"] = self._verify_browser_name(
                latest_transaction, expected_data.get("browserName")
            )

        if "userAgent" in expected_data:
            verification_results["userAgent"] = self._verify_field(
                latest_transaction, "userAgent", expected_data.get("userAgent")
            )
        if "osName" in expected_data:
            verification_results["osName"] = self._verify_field(
                latest_transaction, "osName", expected_data.get("osName")
            )

        if "attributes" in expected_data:
            verification_results["attributes"] = self._verify_attributes(
                latest_transaction, expected_data.get("attributes")
            )

        overall_result = {
            "transID": latest_transaction.get("transID"),
            "verification_results": verification_results,
            "overall_success": all(result.get("match", False) for result in verification_results.values() if isinstance(result, dict))
        }

        TestResultPrinter.print_test_result(f"{test_name}-COMPLETE_VERIFY", overall_result)
        return overall_result
    
    def verify_transaction_attribute(self, test_name, subscriber_id, login_name, 
                                   attribute_name, expected_value, 
                                   max_retries=3, retry_delay=5, batch_size=1):
        
        latest_transactions = []
        
        for attempt in range(max_retries):
            print(f"Attempt {attempt + 1}/{max_retries}: Getting transactions for attribute '{attribute_name}'")
            current_transactions = self.api_helper.get_transactions_by_login(
                subscriber_id, login_name, batch_size=batch_size
            )
            
            if current_transactions:
                latest_transactions = current_transactions
                print(f"Found {len(current_transactions)} transactions on attempt {attempt + 1}")
            
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        
        verification_result = self._verify_attribute(
            latest_transactions, attribute_name, expected_value, login_name
        )
        
        TestResultPrinter.print_test_result(
            f"{test_name}-{attribute_name.upper()}_VERIFY", 
            verification_result
        )
    
    def _verify_attribute(self, transactions, attribute_name, expected_value, login_name):
       
        if not transactions:
            return {
                "has_transactions": False,
                "attribute_match": False,
                "attribute_name": attribute_name,
                "message": f"No transactions found for {login_name}"
            }
        
        latest_transaction = transactions[-1]
        actual_value = latest_transaction.get(attribute_name)
        
        if attribute_name == "userAgent":
            attribute_match = expected_value == actual_value
        elif attribute_name == "browserName":
            expected_browser = expected_value.lower()
            actual_browser = (actual_value or "").lower()
            attribute_match = expected_browser == actual_browser
        else:
            attribute_match = expected_value == actual_value
        
        return {
            "has_transactions": True,
            "attribute_match": attribute_match,
            "attribute_name": attribute_name,
            "expected_value": expected_value,
            "actual_value": actual_value,
            "trans_id": latest_transaction.get("transID"),
            "login_name": latest_transaction.get("loginName"),
            "message": f"{attribute_name} match" if attribute_match else f"{attribute_name} mismatch"
        }
    
    def _verify_field(self, transaction, field_name, expected_value):
        if expected_value is None:
            return {"match": True, "message": f"{field_name} not specified for verification"}
        
        actual_value = transaction.get(field_name)
        match = expected_value == actual_value
        
        return {
            "match": match,
            "field_name": field_name,
            "expected": expected_value,
            "actual": actual_value,
            "message": f"{field_name} {'match' if match else 'mismatch'}"
        }
    
    def _verify_browser_name(self, transaction, expected_browser):
        if expected_browser is None:
            return {"match": True, "message": "browserName not specified for verification"}
        
        actual_browser = transaction.get("browserName")
        expected_browser_lower = expected_browser.lower() if expected_browser else ""
        actual_browser_lower = (actual_browser or "").lower()
        
        match = expected_browser_lower == actual_browser_lower
        
        return {
            "match": match,
            "field_name": "browserName",
            "expected": expected_browser,
            "actual": actual_browser,
            "message": f"browserName {'match' if match else 'mismatch'}"
        }
    
    def _verify_attributes(self, transaction, expected_attributes):
        if not expected_attributes:
            return {"match": True, "message": "No attributes specified for verification"}
        
        transaction_attributes = transaction.get("attributes", {})
        attribute_results = {}
        
        for attr_name, expected_value in expected_attributes.items():
            actual_value = transaction_attributes.get(attr_name)
            
            if attr_name == "pdfViewerEnabled":
                if isinstance(expected_value, str):
                    expected_bool = expected_value.lower() == "true"
                else:
                    expected_bool = bool(expected_value)
                    
                if isinstance(actual_value, str):
                    actual_bool = actual_value.lower() == "true"
                else:
                    actual_bool = bool(actual_value)
                    
                match = expected_bool == actual_bool
            elif attr_name in ["languages", "fonts", "plugins"]:
                match = self._compare_json_values(expected_value, actual_value)
            elif attr_name in ["fontPreferences", "math", "touchSupport", "webGlBasics"]:
                match = self._compare_json_values(expected_value, actual_value)
            else:
                match = str(expected_value) == str(actual_value)
            
            attribute_results[attr_name] = {
                "match": match,
                "expected": expected_value,
                "actual": actual_value
            }
        
        overall_match = all(result["match"] for result in attribute_results.values())
        
        return {
            "match": overall_match,
            "attribute_results": attribute_results,
            "message": f"Attributes {'all match' if overall_match else 'have mismatches'}"
        }
    
    def _compare_json_values(self, expected, actual):
        try:
            import json
            if isinstance(expected, str) and isinstance(actual, str):
                try:
                    expected_parsed = json.loads(expected)
                    actual_parsed = json.loads(actual)
                    return expected_parsed == actual_parsed
                except json.JSONDecodeError:
                    return expected == actual
            return expected == actual
        except Exception:
            return str(expected) == str(actual)
    
    def compare_transactions(self, trans1, trans2, ignore_fields=None, comparison_name="Transaction Comparison"):
        if ignore_fields is None:
            ignore_fields = ['transID', 'timestamp', 'createdAt', 'updatedAt', 'loginTime']
        print(trans1, trans2)
        differences = []
        all_fields = set(trans1.keys()) | set(trans2.keys())
        
        for field in all_fields:
            if field in ignore_fields:
                continue
                
            val1 = trans1.get(field)
            val2 = trans2.get(field)
            
            if field == "attributes" and isinstance(val1, dict) and isinstance(val2, dict):
                attr_diff = self._compare_attributes_deep(val1, val2)
                if attr_diff:
                    differences.append({
                        "field": field,
                        "transaction1_value": val1,
                        "transaction2_value": val2,
                        "attribute_differences": attr_diff
                    })
            elif self._values_different(val1, val2):
                differences.append({
                    "field": field,
                    "transaction1_value": val1,
                    "transaction2_value": val2
                })
        
        is_identical = len(differences) == 0
        
        return {
            "comparison_name": comparison_name,
            "transactions_identical": is_identical,
            "trans1_id": trans1.get("transID"),
            "trans2_id": trans2.get("transID"),
            "total_fields_compared": len(all_fields) - len(ignore_fields),
            "ignored_fields": ignore_fields,
            "differences_count": len(differences),
            "differences": differences,
            "message": f"{comparison_name}: Transactions are {'identical' if is_identical else 'different'} (ignoring {len(ignore_fields)} fields)"
        }
    
    def _compare_attributes_deep(self, attr1, attr2):
        differences = []
        all_attr_keys = set(attr1.keys()) | set(attr2.keys())
        
        for attr_key in all_attr_keys:
            val1 = attr1.get(attr_key)
            val2 = attr2.get(attr_key)
            
            if self._values_different(val1, val2):
                differences.append({
                    "attribute": attr_key,
                    "value1": val1,
                    "value2": val2
                })
        
        return differences
    
    def _values_different(self, val1, val2):
        if val1 is None and val2 is None:
            return False
        if val1 is None or val2 is None:
            return True
            
        if isinstance(val1, str) and isinstance(val2, str):
            try:
                import json
                try:
                    parsed1 = json.loads(val1)
                    parsed2 = json.loads(val2)
                    return parsed1 != parsed2
                except json.JSONDecodeError:
                    return val1 != val2
            except Exception:
                return val1 != val2
        
        return val1 != val2
