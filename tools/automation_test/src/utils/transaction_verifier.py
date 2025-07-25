import time
from utils.transaction_api_helper import TransactionAPIHelper
from utils.test_utils import TestResultPrinter


class TransactionVerifier:
    
    def __init__(self, api_base_url="http://localhost:5001"):
        self.api_helper = TransactionAPIHelper(api_base_url)
    
    def verify_transaction_attribute(self, test_name, subscriber_id, login_name, 
                                   attribute_name, expected_value, 
                                   max_retries=3, retry_delay=5, batch_size=1):
        
        for attempt in range(max_retries):
            transactions = self.api_helper.get_transactions_by_login(
                subscriber_id, 
                login_name,
                batch_size=batch_size
            )
            
            verification_result = self._verify_attribute_match(
                transactions, attribute_name, expected_value, login_name, subscriber_id
            )
            
            if verification_result.get("has_transactions", False):
                break
                
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        
        TestResultPrinter.print_test_result(
            f"{test_name}-{attribute_name.upper()}_VERIFY", 
            verification_result
        )
        
        return verification_result
    
    def _verify_attribute_match(self, transactions, attribute_name, expected_value, 
                               login_name):
       
        if not transactions:
            return {
                "has_transactions": False,
                "attribute_match": False,
                "attribute_name": attribute_name,
                "message": f"No transactions found for {login_name}"
            }
        
        latest_transaction = transactions[0]
        
        actual_value = self._get_nested_attribute(latest_transaction, attribute_name)
        
        attribute_match = self._compare_attribute_values(
            attribute_name, expected_value, actual_value
        )
        
        return {
            "has_transactions": True,
            "attribute_match": attribute_match,
            "attribute_name": attribute_name,
            "expected_value": expected_value,
            "actual_value": actual_value,
            "trans_id": latest_transaction.get("transID"),
            "trans_time": latest_transaction.get("transTime"),
            "login_name": latest_transaction.get("loginName"),
            "subscriber_id": latest_transaction.get("subscriberID"),
            "message": f"{attribute_name} match" if attribute_match else f"{attribute_name} mismatch"
        }
    
    def _get_nested_attribute(self, transaction, attribute_name):

        if '.' in attribute_name:
            parts = attribute_name.split('.')
            value = transaction
            for part in parts:
                if isinstance(value, dict) and part in value:
                    value = value[part]
                else:
                    return None
            return value
        else:
            return transaction.get(attribute_name)
    
    def _compare_attribute_values(self, attribute_name, expected, actual):

        if actual is None:
            return expected is None
        
        if isinstance(expected, str) and isinstance(actual, str):
            return expected == actual
        
        if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
            return expected == actual
        
        if attribute_name.lower() in ['subscriberid', 'subscriber_id']:
            return int(expected) == int(actual)
        
        return expected == actual

    def verify_multiple_attributes(self, test_name, subscriber_id, login_name, 
                                 attribute_mappings, max_retries=3, retry_delay=5):
        
        results = {}
        
        for attribute_name, expected_value in attribute_mappings.items():
            result = self.verify_transaction_attribute(
                test_name, subscriber_id, login_name,
                attribute_name, expected_value,
                max_retries, retry_delay
            )
            results[attribute_name] = result
        
        return results
