from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass, field


@dataclass
class TransactionAttributes:
    applePay: Optional[str] = None
    architecture: Optional[str] = None
    audio: Optional[str] = None
    audioBaseLatency: Optional[str] = None
    canvas: Optional[str] = None
    colorDepth: Optional[str] = None
    colorGamut: Optional[str] = None
    contrast: Optional[str] = None
    cookiesEnabled: Optional[str] = None
    cpuClass: Optional[str] = None
    deviceMemory: Optional[str] = None
    domBlockers: Optional[str] = None
    doNotTrack: Optional[str] = None
    fontPreferences: Optional[str] = None
    fonts: Optional[str] = None
    forcedColors: Optional[str] = None
    hardwareConcurrency: Optional[str] = None
    hdr: Optional[str] = None
    indexedDB: Optional[str] = None
    invertedColors: Optional[str] = None
    languages: Optional[str] = None
    localStorage: Optional[str] = None
    math: Optional[str] = None
    monochrome: Optional[str] = None
    openDatabase: Optional[str] = None
    osCpu: Optional[str] = None
    pdfViewerEnabled: Optional[str] = None
    platform: Optional[str] = None
    plugins: Optional[str] = None
    privateClickMeasurement: Optional[str] = None
    reducedMotion: Optional[str] = None
    reducedTransparency: Optional[str] = None
    screenFrame: Optional[str] = None
    screenResolution: Optional[str] = None
    sessionStorage: Optional[str] = None
    timezone: Optional[str] = None
    touchSupport: Optional[str] = None
    vendor: Optional[str] = None
    vendorFlavors: Optional[str] = None
    webGlBasics: Optional[str] = None
    webGlExtensions: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TransactionAttributes':
        if not data:
            return cls()
        
        kwargs = {}
        for field_name in cls.__dataclass_fields__.keys():
            if field_name in data:
                kwargs[field_name] = data[field_name]
        
        return cls(**kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in self.__dict__.items() if v is not None}


@dataclass
class Transaction:
    transID: Optional[int] = None
    transTime: Optional[str] = None
    accountID: Optional[int] = None
    loginName: Optional[str] = None
    subscriberID: Optional[int] = None
    subscriberName: Optional[str] = None
    createdDate: Optional[str] = None
    flagged: Optional[int] = None
    robotTracking: Optional[str] = None
    userAgentKey: Optional[str] = None
    userAgent: Optional[str] = None
    osName: Optional[str] = None
    osVersion: Optional[str] = None
    browserName: Optional[str] = None
    browserVersion: Optional[str] = None
    deviceType: Optional[str] = None
    ip: Optional[str] = None
    ipid: Optional[str] = None
    urlid: Optional[int] = None
    urlDetails: Optional[str] = None
    actionResultID: Optional[int] = None
    action: Optional[str] = None
    actionResult: Optional[str] = None
    transStatus: Optional[str] = None
    insertTime: Optional[str] = None
    botDetectionValue: Optional[int] = None
    botComponentID: Optional[int] = None
    fakeIP: Optional[str] = None
    deviceID: Optional[int] = None
    deviceCode: Optional[str] = None
    firstDeviceCode: Optional[str] = None
    deviceStatus: Optional[int] = None
    deviceFingerprintID: Optional[int] = None
    fingerprintCode: Optional[str] = None
    fP_DeviceMappingID: Optional[int] = None
    attributes: Optional[TransactionAttributes] = field(default_factory=TransactionAttributes)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Transaction':
        if not data:
            return cls()
        
        attributes_data = data.get('attributes', {})
        attributes = TransactionAttributes.from_dict(attributes_data) if attributes_data else TransactionAttributes()
        
        kwargs = {}
        for field_name in cls.__dataclass_fields__.keys():
            if field_name == 'attributes':
                kwargs[field_name] = attributes
            elif field_name in data:
                kwargs[field_name] = data[field_name]
        
        return cls(**kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        result = {}
        for key, value in self.__dict__.items():
            if key == 'attributes' and isinstance(value, TransactionAttributes):
                result[key] = value.to_dict()
            elif value is not None:
                result[key] = value
        return result
    
    @property
    def trans_time_datetime(self) -> Optional[datetime]:
        if not self.transTime:
            return None
        try:
            return datetime.fromisoformat(self.transTime.replace('Z', '+00:00'))
        except ValueError:
            return None
    
    @property
    def insert_time_datetime(self) -> Optional[datetime]:
        if not self.insertTime:
            return None
        try:
            return datetime.fromisoformat(self.insertTime.replace('Z', '+00:00'))
        except ValueError:
            return None
    
    def is_successful_login(self) -> bool:
        return (
            self.action == "login" and 
            self.actionResult == "successfull"  # Note: API uses "successfull" (double 'l')
        )
    
    def is_bot_detected(self) -> bool:
        return self.robotTracking == "Bot" if self.robotTracking else False
    
    def get_device_info(self) -> Dict[str, Any]:
        return {
            "deviceID": self.deviceID,
            "deviceCode": self.deviceCode,
            "firstDeviceCode": self.firstDeviceCode,
            "deviceStatus": self.deviceStatus,
            "deviceFingerprintID": self.deviceFingerprintID,
            "fingerprintCode": self.fingerprintCode
        }
    
    def get_browser_info(self) -> Dict[str, Any]:
        return {
            "userAgent": self.userAgent,
            "userAgentKey": self.userAgentKey,
            "browserName": self.browserName,
            "browserVersion": self.browserVersion,
            "osName": self.osName,
            "osVersion": self.osVersion
        }


@dataclass
class TransactionSearchRequest:
    subscriberID: int
    loginName: str
    batchSize: int = 10
    fromDate: Optional[str] = None
    toDate: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = {
            "subscriberID": self.subscriberID,
            "loginName": self.loginName,
            "batchSize": self.batchSize
        }
        
        if self.fromDate:
            result["fromDate"] = self.fromDate
        if self.toDate:
            result["toDate"] = self.toDate
            
        return result


@dataclass
class TransactionVerificationResult:
    success: bool
    message: str
    login_name: str
    subscriber_id: int
    transaction_count: int
    latest_transaction: Optional[Transaction] = None
    attributes_verification: Optional[Dict[str, Any]] = None
    all_transactions: List[Transaction] = field(default_factory=list)
    
    @classmethod
    def from_api_response(cls, response_data: List[Dict[str, Any]], 
                         login_name: str, subscriber_id: int) -> 'TransactionVerificationResult':
        if not response_data:
            return cls(
                success=False,
                message="No transactions found",
                login_name=login_name,
                subscriber_id=subscriber_id,
                transaction_count=0
            )
        
        transactions = [Transaction.from_dict(t) for t in response_data]
        transaction_count = len(transactions)
        latest_transaction = transactions[0] if transactions else None
        
        return cls(
            success=True,
            message=f"Found {transaction_count} transaction(s)",
            login_name=login_name,
            subscriber_id=subscriber_id,
            transaction_count=transaction_count,
            latest_transaction=latest_transaction,
            all_transactions=transactions
        )
    
    def to_dict(self) -> Dict[str, Any]:
        result = {
            "success": self.success,
            "message": self.message,
            "login_name": self.login_name,
            "subscriber_id": self.subscriber_id,
            "transaction_count": self.transaction_count
        }
        
        if self.latest_transaction:
            result["latest_transaction"] = self.latest_transaction.to_dict()
        
        if self.attributes_verification:
            result["attributes_verification"] = self.attributes_verification
            
        if self.all_transactions:
            result["all_transactions"] = [t.to_dict() for t in self.all_transactions]
        
        return result
    
    def get_successful_logins(self) -> List[Transaction]:
        return [t for t in self.all_transactions if t.is_successful_login()]
    
    def get_bot_transactions(self) -> List[Transaction]:
        return [t for t in self.all_transactions if t.is_bot_detected()]
    
    def get_unique_devices(self) -> List[str]:
        return list(set(t.deviceCode for t in self.all_transactions if t.deviceCode))
