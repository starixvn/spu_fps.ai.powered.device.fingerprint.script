import requests
import json
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from models.transaction import (
    Transaction,
    TransactionSearchRequest,
    TransactionVerificationResult
)

logging.basicConfig(level=logging.INFO)


class TransactionAPIHelper:
    
    def __init__(self, base_url="http://localhost:5001"):
        self.base_url = base_url
        self.api_endpoint = f"{base_url}/api/GetTransactionByLoginName"
    
    def get_transactions_by_login(self, subscriber_id: int, login_name: str, batch_size: int = 10, 
                                from_date: Optional[str] = None, to_date: Optional[str] = None) -> Optional[List[Transaction]]:
        gmt_minus_4 = timezone(timedelta(hours=-4))
        
        if not from_date:
            from_date = datetime.now(gmt_minus_4).strftime("%Y-%m-%d")

        if not to_date:
            to_date = datetime.now(gmt_minus_4).strftime("%Y-%m-%d")
        
        search_request = TransactionSearchRequest(
            subscriberID=subscriber_id,
            loginName=login_name,
            batchSize=batch_size,
            fromDate=from_date,
            toDate=to_date
        )
        
        try:
            response = requests.post(
                self.api_endpoint,
                headers={
                    'accept': 'text/plain',
                    'Content-Type': 'application/json'
                },
                data=json.dumps(search_request.to_dict()),
                timeout=60
            )
            
            if response.status_code == 200:
                response_data = response.json()
                return [Transaction.from_dict(t) for t in response_data] if response_data else []
            else:
                logging.error(f"API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logging.error(f"API Request Error: {str(e)}")
            return None
    

    
class TransactionVerifier:

    IGNORE_FIELDS = ['transID', 'accountID', 'loginName', 'deviceCode', 'deviceStatus', 'fP_DeviceMappingID', 'insertTime', 'transTime']

    def __init__(self, api_helper: TransactionAPIHelper):
        self.api_helper = api_helper

    def _get_transaction_with_retry(self, subscriber_id: int, login_name: str, batch_size: int = 5, 
                                    max_retries: int = 3, retry_delay: int = 30) -> Optional[List[Transaction]]:
        transactions = None
        for attempt in range(max_retries):
            transactions = self.api_helper.get_transactions_by_login(subscriber_id, login_name, batch_size)
            
            if transactions and len(transactions) > 0:
                return transactions
            
            if attempt < max_retries - 1:  
                time.sleep(retry_delay)
    
    def verify_transaction_exists(self, subscriber_id: int, login_name: str) -> TransactionVerificationResult:
        transactions = self._get_transaction_with_retry(subscriber_id, login_name)

        if not transactions or len(transactions) == 0:
            return TransactionVerificationResult(
                success=False,
                message="No transactions found or API error",
                login_name=login_name,
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        latest_transaction = transactions[0] if transactions else None
        
        result = TransactionVerificationResult(
            success=True,
            message=f"Found {len(transactions)} transaction(s)",
            login_name=login_name,
            subscriber_id=subscriber_id,
            transaction_count=len(transactions),
            latest_transaction=latest_transaction,
            all_transactions=transactions
        )
        
        return result
    
    def verify_dual_transaction(self, subscriber_id, login_name1, login_name2) -> TransactionVerificationResult:

        trans1 = self._get_transaction_with_retry(subscriber_id, login_name1, batch_size=1)
        trans2 = self._get_transaction_with_retry(subscriber_id, login_name2, batch_size=1)

        if not trans1 or not trans2:
            return TransactionVerificationResult(
                success=False,
                message=f"Failed to retrieve transactions - Login1: {'Found' if trans1 else 'Not found'}, Login2: {'Found' if trans2 else 'Not found'}",
                login_name=f"{login_name1} , {login_name2}",
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        # Extract first transaction from lists since _get_transaction_with_retry returns lists
        transaction1 = trans1[0] if trans1 and len(trans1) > 0 else None
        transaction2 = trans2[0] if trans2 and len(trans2) > 0 else None
        
        if not transaction1 or not transaction2:
            return TransactionVerificationResult(
                success=False,
                message="One or both transactions are empty after extraction",
                login_name=f"{login_name1} vs {login_name2}",
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        comparison_result = self._compare_transactions(transaction1, transaction2)
        
        return TransactionVerificationResult(
            success=comparison_result["success"],
            message=comparison_result["message"],
            login_name=f"{login_name1} vs {login_name2}",
            subscriber_id=subscriber_id,
            transaction_count=2,
            latest_transaction=transaction1,
            all_transactions=[transaction1, transaction2],
            attributes_verification=comparison_result.get("details")
        )
    
    def _compare_transactions(self, trans1: Transaction, trans2: Transaction) -> Dict[str, Any]:
        differences = {}
        all_match = True
        
        dict1 = trans1.to_dict()
        dict2 = trans2.to_dict()
        
        for key in dict1.keys():
            if key not in self.IGNORE_FIELDS and key != 'attributes':
                value1 = dict1.get(key)
                value2 = dict2.get(key)
                
                if value1 != value2:
                    differences[key] = {
                        "transaction1": value1,
                        "transaction2": value2,
                        "matches": False
                    }
                    all_match = False
                else:
                    differences[key] = {
                        "transaction1": value1,
                        "transaction2": value2,
                        "matches": True
                    }
        
        if hasattr(trans1, 'attributes') and hasattr(trans2, 'attributes'):
            if trans1.attributes and trans2.attributes:
                attr_dict1 = trans1.attributes.to_dict() if hasattr(trans1.attributes, 'to_dict') else trans1.attributes
                attr_dict2 = trans2.attributes.to_dict() if hasattr(trans2.attributes, 'to_dict') else trans2.attributes
                
                all_attr_keys = set(attr_dict1.keys()).union(set(attr_dict2.keys()))
                
                for attr_key in all_attr_keys:
                    if attr_key not in self.IGNORE_FIELDS:
                        attr_value1 = attr_dict1.get(attr_key)
                        attr_value2 = attr_dict2.get(attr_key)
                        
                        if attr_value1 != attr_value2:
                            differences[f"attributes.{attr_key}"] = {
                                "transaction1": attr_value1,
                                "transaction2": attr_value2,
                                "matches": False
                            }
                            all_match = False
                        else:
                            differences[f"attributes.{attr_key}"] = {
                                "transaction1": attr_value1,
                                "transaction2": attr_value2,
                                "matches": True
                            }
        
        message = "Transactions match (ignoring specified fields)" if all_match else f"Transactions differ in {len([k for k, v in differences.items() if not v['matches']])} field(s)"
        
        return {
            "success": all_match,
            "message": message,
            "details": {
                "comparison_summary": differences,
                "ignored_fields": self.IGNORE_FIELDS,
                "total_differences": len([k for k, v in differences.items() if not v['matches']])
            }
        }





        
