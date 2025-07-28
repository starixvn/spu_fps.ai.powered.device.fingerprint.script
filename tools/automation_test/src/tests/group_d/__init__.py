# Group D test cases for User Agent testing
from .user_agent import ChangeUASameOSDiffBrowserTest, DualTransUATest
from .os_name import ChangeOSSameDeviceDiffBrowserTest
from .plugins import ChangePluginsSameDeviceDiffBrowserTest
from .pdf_viewer_enabled import ChangePDFViewerEnabledSameDeviceDiffBrowserTest
__all__ = [
    'ChangeUASameOSDiffBrowserTest',
    'DualTransUATest',
    'ChangeOSSameDeviceDiffBrowserTest',
    'ChangePluginsSameDeviceDiffBrowserTest',
    'ChangePDFViewerEnabledSameDeviceDiffBrowserTest'
]
