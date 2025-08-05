"""
Standardized exception models for FPS testing framework
"""

class BaseTestException(Exception):
    """Base exception class for all test-related exceptions"""
    
    def __init__(self, message: str, test_name: str = None, details: dict = None):
        self.message = message
        self.test_name = test_name
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self):
        """Convert exception to dictionary format"""
        return {
            "exception_type": self.__class__.__name__,
            "message": self.message,
            "test_name": self.test_name,
            "details": self.details
        }
    
    def __str__(self):
        base_msg = self.message
        if self.test_name:
            base_msg = f"[{self.test_name}] {base_msg}"
        if self.details:
            details_str = ", ".join([f"{k}: {v}" for k, v in self.details.items()])
            base_msg = f"{base_msg} | Details: {details_str}"
        return base_msg


class LoginTestException(BaseTestException):
    """Exception raised during login test operations"""
    
    def __init__(self, message: str, test_name: str = None, username: str = None, 
                 login_result: str = None, final_url: str = None):
        details = {}
        if username:
            details["username"] = username
        if login_result:
            details["login_result"] = login_result
        if final_url:
            details["final_url"] = final_url
            
        super().__init__(message, test_name, details)


class BrowserException(BaseTestException):
    """Exception raised during browser operations"""
    
    def __init__(self, message: str, test_name: str = None, browser_type: str = None, 
                 browser_config: dict = None, url: str = None):
        details = {}
        if browser_type:
            details["browser_type"] = browser_type
        if browser_config:
            details["browser_config"] = browser_config
        if url:
            details["url"] = url
            
        super().__init__(message, test_name, details)


class CredentialsException(BaseTestException):
    """Exception raised for credential-related issues"""
    
    def __init__(self, message: str, test_name: str = None, credentials_key: str = None):
        details = {}
        if credentials_key:
            details["credentials_key"] = credentials_key
            
        super().__init__(message, test_name, details)


class TestConfigurationException(BaseTestException):
    """Exception raised for test configuration issues"""
    
    def __init__(self, message: str, test_name: str = None, config_type: str = None, 
                 environment: str = None):
        details = {}
        if config_type:
            details["config_type"] = config_type
        if environment:
            details["environment"] = environment
            
        super().__init__(message, test_name, details)
