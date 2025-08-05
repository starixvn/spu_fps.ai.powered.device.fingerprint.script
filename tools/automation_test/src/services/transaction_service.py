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
    
    def __init__(self, api_helper: TransactionAPIHelper):
        self.api_helper = api_helper
    
    def verify_transaction_exists(self, subscriber_id: int, login_name: str, 
                                expected_attributes: Optional[Dict[str, Any]] = None,
                                processing_delay: int = 30) -> TransactionVerificationResult:
        transactions = None
        for attempt in range(3):
            
            transactions = self.api_helper.get_transactions_by_login(subscriber_id, login_name, batch_size=5)
            
            if transactions and len(transactions) > 0:
                logging.info(f"Found {len(transactions)} transactions on attempt {attempt + 1}")
                break
            
            if attempt < 2:  
                time.sleep(processing_delay)

        if not transactions:
            return TransactionVerificationResult(
                success=False,
                message="No transactions found or API error",
                login_name=login_name,
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        transaction_count = len(transactions)
        if transaction_count == 0:
            return TransactionVerificationResult(
                success=False,
                message="No transactions found for this login name",
                login_name=login_name,
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        latest_transaction = transactions[0] if transactions else None
        
        logging.info(f"Found {transaction_count} transactions for {login_name}")
        if latest_transaction and latest_transaction.attributes:
            logging.info(f"Latest transaction has attributes: {latest_transaction.attributes.to_dict()}")
        else:
            logging.warning(f"Latest transaction has no attributes or is None")
        
        result = TransactionVerificationResult(
            success=True,
            message=f"Found {transaction_count} transaction(s)",
            login_name=login_name,
            subscriber_id=subscriber_id,
            transaction_count=transaction_count,
            latest_transaction=latest_transaction,
            all_transactions=transactions
        )
        
        if expected_attributes and latest_transaction and latest_transaction.attributes:
            logging.info(f"Verifying attributes: {expected_attributes}")
            attributes_match = True
            attribute_details = {}
            
            if latest_transaction.attributes:
                trans_attributes = latest_transaction.attributes.to_dict()
                logging.info(f"Transaction attributes: {trans_attributes}")
                
                for key, expected_value in expected_attributes.items():
                    actual_value = trans_attributes.get(key)
                    matches = str(actual_value) == str(expected_value)
                    
                    logging.info(f"Checking attribute '{key}': expected='{expected_value}', actual='{actual_value}', matches={matches}")
                    
                    attribute_details[key] = {
                        "expected": expected_value,
                        "actual": actual_value,
                        "matches": matches
                    }
                    
                    if not matches:
                        attributes_match = False
            else:
                logging.error("No attributes found in transaction")
                attributes_match = False
                attribute_details = {"error": "No attributes found in transaction"}
            
            result.attributes_verification = {
                "success": attributes_match,
                "details": attribute_details
            }
        
        return result
    
    def verify_login_transaction(self, subscriber_id: int, login_name: str, 
                               time_retry: int = 30, max_retries: int = 3) -> bool:
           
        for attempt in range(max_retries):
            
            result = self.verify_transaction_exists(subscriber_id, login_name)
            
            if result.success and result.transaction_count > 0:
                return True
            
            if attempt < max_retries - 1:
                time.sleep(time_retry)
        
        return False
    
