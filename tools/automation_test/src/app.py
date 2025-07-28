from tests import (ChangeUASameOSDiffBrowserTest, 
                      DualTransUATest, 
                      ChangeOSSameDeviceDiffBrowserTest, 
                      ChangePluginsSameDeviceDiffBrowserTest,
                      ChangePDFViewerEnabledSameDeviceDiffBrowserTest,
                      ChangeLanguageMultiOSTest)

class TestRunner:
    def __init__(self):
        self.change_ua_test = ChangeUASameOSDiffBrowserTest()
        self.dual_session_test = DualTransUATest()
        self.change_os_test = ChangeOSSameDeviceDiffBrowserTest()
        self.change_plugins_test = ChangePluginsSameDeviceDiffBrowserTest()
        self.change_pdf_viewer_test = ChangePDFViewerEnabledSameDeviceDiffBrowserTest()
        self.change_language_test = ChangeLanguageMultiOSTest()
    
    def run_all_tests(self):
        # self.change_ua_test.run_cross_browser_test()
        self.dual_session_test.run_dual_session_test_with_verification()
        # self.change_os_test.run_cross_browser_test(headless=False)
        # self.change_plugins_test.run_cross_browser_test(headless=False)
        # self.change_pdf_viewer_test.run_cross_browser_test(headless=False)

def main():
    runner = TestRunner()
    runner.run_all_tests()

if __name__ == "__main__":
    main()
