from utils.test_utils import TestResultPrinter
from tests import (ChangeUASameOSDiffBrowserTest, 
                      DualTransUATest, 
                      ChangePluginsSameDeviceDiffBrowserTest,
                      ChangePDFViewerEnabledSameDeviceDiffBrowserTest,
                      ChangeLanguageMultiOSTest,
                      ChangeTimezoneMultiOSTest,
                      ScreenFrameFingerprintMultiOSTest,
                      LoginConsistencyMultiBrowserTest)

class TestRunner:
    def __init__(self):
        self.test_ua = ChangeUASameOSDiffBrowserTest()
        self.test_ua_dual_trans = DualTransUATest()
        self.test_plugins = ChangePluginsSameDeviceDiffBrowserTest()
        self.test_pdf_viewer = ChangePDFViewerEnabledSameDeviceDiffBrowserTest()
        self.test_language = ChangeLanguageMultiOSTest()
        self.test_timezone = ChangeTimezoneMultiOSTest()
        self.test_screen_frame = ScreenFrameFingerprintMultiOSTest()
        self.test_login = LoginConsistencyMultiBrowserTest()

    def run_all_tests(self):
        # self.test_login.run_login_transaction_test()
        self.test_login.run_dual_trans_login_test()
        self.test_ua.run_cross_browser_test()
        # self.test_ua_dual_trans.run_dual_session_test_with_verification()
        self.test_plugins.run_cross_browser_test()
        self.test_pdf_viewer.run_cross_browser_test()
        self.test_language.run_language_test_for_os()
        self.test_timezone.run_timezone_test()
        # self.test_screen_frame.run_screen_frame_test_for_os()

def main():
    runner = TestRunner()
    runner.run_all_tests()

    TestResultPrinter.save_test_results_report("test_results_report.csv")

if __name__ == "__main__":
    main()
