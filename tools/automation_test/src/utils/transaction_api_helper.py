"""
API Helper for Transaction Verification
"""

import requests
import json
from datetime import datetime, timezone, timedelta


class TransactionAPIHelper:
    
    def __init__(self, base_url="http://localhost:5001"):
        self.base_url = base_url
        self.api_endpoint = f"{base_url}/api/GetTransactionByLoginName"
    
    def get_transactions_by_login(self, subscriber_id, login_name, batch_size=10, 
                                from_date=None, to_date=None):

        gmt_minus_4 = timezone(timedelta(hours=-4))
        
        if not from_date:
            from_date = datetime.now(gmt_minus_4).strftime("%Y-%m-%d")
        if not to_date:
            to_date = datetime.now(gmt_minus_4).strftime("%Y-%m-%d")
        
        payload = {
            "subscriberID": subscriber_id,
            "loginName": login_name,
            "batchSize": batch_size,
            "fromDate": from_date,
            "toDate": to_date
        }
        
        try:
            response = requests.post(
                self.api_endpoint,
                headers={
                    'accept': 'text/plain',
                    'Content-Type': 'application/json'
                },
                data=json.dumps(payload),
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"API Request Error: {str(e)}")
            return None