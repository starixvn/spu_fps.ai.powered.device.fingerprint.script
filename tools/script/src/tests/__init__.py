from .group_d import ChangeUASameOSDiffBrowserTest, DualTransUATest
from .group_d import ChangePluginsSameDeviceDiffBrowserTest
from .group_d import ChangePDFViewerEnabledSameDeviceDiffBrowserTest
from .group_e import ChangeLanguageMultiOSTest
from .group_e import ChangeTimezoneMultiOSTest
from .group_b import ScreenFrameFingerprintMultiOSTest
from .login import LoginConsistencyMultiBrowserTest

__all__ = [
    "ChangeUASameOSDiffBrowserTest",
    "DualTransUATest",
    "ChangePluginsSameDeviceDiffBrowserTest",
    "ChangePDFViewerEnabledSameDeviceDiffBrowserTest",
    "ChangeLanguageMultiOSTest",
    "ChangeTimezoneMultiOSTest",
    "ScreenFrameFingerprintMultiOSTest",
    "LoginConsistencyMultiBrowserTest"
]