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
        self.change_ua_test = ChangeUASameOSDiffBrowserTest()
        self.dual_session_test = DualTransUATest()
        self.change_plugins_test = ChangePluginsSameDeviceDiffBrowserTest()
        self.change_pdf_viewer_test = ChangePDFViewerEnabledSameDeviceDiffBrowserTest()
        self.change_language_test = ChangeLanguageMultiOSTest()
        self.change_timezone_test = ChangeTimezoneMultiOSTest()
        self.screen_frame_test = ScreenFrameFingerprintMultiOSTest()
        self.consistency_test = LoginConsistencyMultiBrowserTest()
    
    def run_all_tests(self):
        self.consistency_test.run_all_browsers_consistency_test(headless=False)
        # self.change_ua_test.run_cross_browser_test()
        # self.dual_session_test.run_dual_session_test_with_verification()
        # self.change_plugins_test.run_cross_browser_test(headless=False)
        # self.change_pdf_viewer_test.run_cross_browser_test(headless=False)
        # self.change_language_test.run_language_test_for_os(headless=False)
        # self.change_timezone_test.run_timezone_change_test()
        # self.screen_frame_test.run_all_os_screen_frame_tests()

def main():
    runner = TestRunner()
    runner.run_all_tests()

if __name__ == "__main__":
    main()
