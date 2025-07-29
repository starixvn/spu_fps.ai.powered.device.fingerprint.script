import time
import json
from typing import Dict, List, Any, Optional, Union
from utils.transaction_api_helper import TransactionAPIHelper
from utils.test_utils import TestResultPrinter


class AttributeComparator:
    
    @staticmethod
    def compare_boolean_attribute(expected: Any, actual: Any) -> bool:
        if isinstance(expected, str):
            expected_bool = expected.lower() == "true"
        else:
            expected_bool = bool(expected)
            
        if isinstance(actual, str):
            actual_bool = actual.lower() == "true"
        else:
            actual_bool = bool(actual)
            
        return expected_bool == actual_bool
    
    @staticmethod
    def compare_json_attribute(expected: Any, actual: Any) -> bool:
        try:
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
    
    @staticmethod
    def compare_screen_frame(expected: Any, actual: Any) -> bool:
        try:
            expected_parsed = AttributeComparator._parse_array_format(expected, [0, 0, 0, 0])
            actual_parsed = AttributeComparator._parse_array_format(actual, [0, 0, 0, 0])
            return expected_parsed == actual_parsed
        except Exception:
            return str(expected) == str(actual)
    
    @staticmethod
    def compare_screen_resolution(expected: Any, actual: Any) -> bool:
        try:
            expected_parsed = AttributeComparator._parse_resolution_format(expected, [1920, 1080])
            actual_parsed = AttributeComparator._parse_resolution_format(actual, [1920, 1080])
            return expected_parsed == actual_parsed
        except Exception:
            return str(expected) == str(actual)
    
    @staticmethod
    def _parse_array_format(value: Any, default: List[int]) -> List[int]:
        if isinstance(value, str):
            if value.startswith('[') and value.endswith(']'):
                return json.loads(value)
            else:
                return json.loads(f'[{value}]') if ',' in value else [int(value)]
        elif isinstance(value, (list, tuple)):
            return list(value)
        else:
            return default
    
    @staticmethod
    def _parse_resolution_format(value: Any, default: List[int]) -> List[int]:
        if isinstance(value, str):
            if value.startswith('[') and value.endswith(']'):
                return json.loads(value)
            elif 'x' in value.lower():
                parts = value.lower().split('x')
                return [int(parts[0].strip()), int(parts[1].strip())]
            elif ',' in value:
                return json.loads(f'[{value}]')
            else:
                return [int(value), int(value)]  # Square
        elif isinstance(value, (list, tuple)):
            return list(value)
        elif isinstance(value, dict) and 'width' in value and 'height' in value:
            return [value['width'], value['height']]
        else:
            return default


class TransactionFieldVerifier:
    
    @staticmethod
    def verify_field(transaction: Dict, field_name: str, expected_value: Any) -> Dict[str, Any]:
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
    
    @staticmethod
    def verify_browser_name(transaction: Dict, expected_browser: str) -> Dict[str, Any]:
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
    
    @staticmethod
    def verify_attributes(transaction: Dict, expected_attributes: Dict[str, Any]) -> Dict[str, Any]:
        if not expected_attributes:
            return {"match": True, "message": "No attributes specified for verification"}
        
        transaction_attributes = transaction.get("attributes", {})
        attribute_results = {}
        
        ATTRIBUTE_HANDLERS = {
            "pdfViewerEnabled": AttributeComparator.compare_boolean_attribute,
            "languages": AttributeComparator.compare_json_attribute,
            "fonts": AttributeComparator.compare_json_attribute,
            "plugins": AttributeComparator.compare_json_attribute,
            "fontPreferences": AttributeComparator.compare_json_attribute,
            "math": AttributeComparator.compare_json_attribute,
            "touchSupport": AttributeComparator.compare_json_attribute,
            "webGlBasics": AttributeComparator.compare_json_attribute,
            "screenFrame": AttributeComparator.compare_screen_frame,
            "screenResolution": AttributeComparator.compare_screen_resolution,
        }
        
        for attr_name, expected_value in expected_attributes.items():
            actual_value = transaction_attributes.get(attr_name)
            
            handler = ATTRIBUTE_HANDLERS.get(attr_name)
            if handler:
                match = handler(expected_value, actual_value)
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


class TransactionComparator:
    
    @staticmethod
    def compare_transactions(trans1: Dict, trans2: Dict, ignore_fields: Optional[List[str]] = None, 
                           comparison_name: str = "Transaction Comparison") -> Dict[str, Any]:
        if ignore_fields is None:
            ignore_fields = ['transID', 'timestamp', 'createdAt', 'updatedAt', 'loginTime']
        
        differences = []
        all_fields = set(trans1.keys()) | set(trans2.keys())
        
        for field in all_fields:
            if field in ignore_fields:
                continue
                
            val1 = trans1.get(field)
            val2 = trans2.get(field)
            
            if field == "attributes" and isinstance(val1, dict) and isinstance(val2, dict):
                attr_diff = TransactionComparator._compare_attributes_deep(val1, val2)
                if attr_diff:
                    differences.append({
                        "field": field,
                        "transaction1_value": val1,
                        "transaction2_value": val2,
                        "attribute_differences": attr_diff
                    })
            elif TransactionComparator._values_different(val1, val2):
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
    
    @staticmethod
    def _compare_attributes_deep(attr1: Dict, attr2: Dict) -> List[Dict[str, Any]]:
        differences = []
        all_attr_keys = set(attr1.keys()) | set(attr2.keys())
        
        for attr_key in all_attr_keys:
            val1 = attr1.get(attr_key)
            val2 = attr2.get(attr_key)
            
            if TransactionComparator._values_different(val1, val2):
                differences.append({
                    "attribute": attr_key,
                    "value1": val1,
                    "value2": val2
                })
        
        return differences
    
    @staticmethod
    def _values_different(val1: Any, val2: Any) -> bool:
        if val1 is None and val2 is None:
            return False
        if val1 is None or val2 is None:
            return True
            
        if isinstance(val1, str) and isinstance(val2, str):
            try:
                try:
                    parsed1 = json.loads(val1)
                    parsed2 = json.loads(val2)
                    return parsed1 != parsed2
                except json.JSONDecodeError:
                    return val1 != val2
            except Exception:
                return val1 != val2
        
        return val1 != val2


class TransactionVerifier:
    
    def __init__(self, api_base_url: str = "http://localhost:5001"):
        self.api_helper = TransactionAPIHelper(api_base_url)
        self.field_verifier = TransactionFieldVerifier()
        self.comparator = TransactionComparator()

    def get_transactions(self, subscriber_id: str, login_name: str, 
                        max_retries: int = 3, retry_delay: int = 5, 
                        batch_size: int = 10) -> List[Dict[str, Any]]:
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
    
    def verify_complete_transaction(self, test_name: str, expected_data: Dict[str, Any], 
                                  max_retries: int = 3, retry_delay: int = 5, 
                                  batch_size: int = 1) -> Optional[Dict[str, Any]]:
        subscriber_id = expected_data.get("subscriberID")
        login_name = expected_data.get("loginName")
        
        if not subscriber_id or not login_name:
            self._print_error_result(test_name, "subscriberID and loginName are required")
            return None

        transactions = self.get_transactions(
            subscriber_id, login_name, max_retries=max_retries, 
            retry_delay=retry_delay, batch_size=batch_size
        )

        if not transactions:
            self._print_error_result(test_name, f"No transactions found for {login_name}")
            return None

        latest_transaction = transactions[0]
        verification_results = self._build_verification_results(latest_transaction, expected_data)

        overall_result = {
            "transID": latest_transaction.get("transID"),
            "verification_results": verification_results,
            "overall_success": all(
                result.get("match", False) 
                for result in verification_results.values() 
                if isinstance(result, dict)
            )
        }

        TestResultPrinter.print_test_result(f"{test_name}-COMPLETE_VERIFY", overall_result)
        return overall_result
    
    def verify_transaction_attribute(self, test_name: str, subscriber_id: str, login_name: str, 
                                   attribute_name: str, expected_value: Any, 
                                   max_retries: int = 3, retry_delay: int = 5, 
                                   batch_size: int = 1) -> None:
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
        
        verification_result = self._verify_single_attribute(
            latest_transactions, attribute_name, expected_value, login_name
        )
        
        TestResultPrinter.print_test_result(
            f"{test_name}-{attribute_name.upper()}_VERIFY", 
            verification_result
        )
    
    def compare_transactions(self, trans1: Dict, trans2: Dict, 
                           ignore_fields: Optional[List[str]] = None, 
                           comparison_name: str = "Transaction Comparison") -> Dict[str, Any]:
        return self.comparator.compare_transactions(trans1, trans2, ignore_fields, comparison_name)
    
    def _build_verification_results(self, transaction: Dict[str, Any], 
                                  expected_data: Dict[str, Any]) -> Dict[str, Any]:
        verification_results = {}
        
        BASIC_FIELDS = ["subscriberID", "loginName", "browserName"]
        
        for field in BASIC_FIELDS:
            if field in expected_data:
                if field == "browserName":
                    verification_results[field] = self.field_verifier.verify_browser_name(
                        transaction, expected_data.get(field)
                    )
                else:
                    verification_results[field] = self.field_verifier.verify_field(
                        transaction, field, expected_data.get(field)
                    )
        
        if "url" in expected_data:
            verification_results["url"] = self.field_verifier.verify_field(
                transaction, "urlDetails", expected_data.get("url")
            )
        
        if "attributes" in expected_data:
            verification_results["attributes"] = self.field_verifier.verify_attributes(
                transaction, expected_data.get("attributes")
            )
        
        return verification_results
    
    def _verify_single_attribute(self, transactions: List[Dict], attribute_name: str, 
                                expected_value: Any, login_name: str) -> Dict[str, Any]:
        if not transactions:
            return {
                "has_transactions": False,
                "attribute_match": False,
                "attribute_name": attribute_name,
                "message": f"No transactions found for {login_name}"
            }
        
        latest_transaction = transactions[0]
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
    
    def _print_error_result(self, test_name: str, error_message: str) -> None:
        TestResultPrinter.print_test_result(
            f"{test_name}-COMPLETE_VERIFY", 
            {"error": error_message}
        )
