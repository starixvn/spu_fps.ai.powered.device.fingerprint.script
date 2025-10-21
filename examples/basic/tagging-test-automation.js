/**
 * Tagging Test Automation Script
 * 
 * This script automates the testing of the tagging module
 * to ensure it works correctly in various scenarios.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class TaggingTestAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {},
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                successRate: 0
            }
        };
    }

    async initialize() {
        console.log('🚀 Initializing Tagging Test Automation...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set viewport
        await this.page.setViewport({ width: 1280, height: 720 });
        
        // Enable console logging
        this.page.on('console', msg => {
            console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
        });

        // Handle page errors
        this.page.on('pageerror', error => {
            console.error('Page Error:', error.message);
        });

        console.log('✅ Browser initialized successfully');
    }

    async navigateToTestPage() {
        console.log('🌐 Navigating to test page...');
        
        const testPagePath = path.join(__dirname, 'demo.html');
        const fileUrl = `file://${testPagePath}`;
        
        await this.page.goto(fileUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('✅ Test page loaded successfully');
    }

    async runBasicFunctionalityTest() {
        console.log('🧪 Running Basic Functionality Test...');
        
        try {
            // Enable tagging
            await this.page.evaluate(() => {
                window.enabledTag = true;
            });
            
            // Wait for initialization
            await this.page.waitForTimeout(2000);
            
            // Run basic test
            await this.page.click('button[onclick="testTaggingBasic()"]');
            
            // Wait for test completion
            await this.page.waitForTimeout(3000);
            
            // Get results
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-basic-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            const passed = result.includes('✅');
            this.results.tests.basicFunctionality = {
                passed,
                result,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? '✅ Basic Functionality Test PASSED' : '❌ Basic Functionality Test FAILED');
            return passed;
            
        } catch (error) {
            console.error('❌ Basic Functionality Test ERROR:', error.message);
            this.results.tests.basicFunctionality = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runStorageMethodsTest() {
        console.log('💾 Running Storage Methods Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingStorage()"]');
            await this.page.waitForTimeout(3000);
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-storage-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            const passed = result.includes('✅') && !result.includes('❌');
            this.results.tests.storageMethods = {
                passed,
                result,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? '✅ Storage Methods Test PASSED' : '❌ Storage Methods Test FAILED');
            return passed;
            
        } catch (error) {
            console.error('❌ Storage Methods Test ERROR:', error.message);
            this.results.tests.storageMethods = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runErrorHandlingTest() {
        console.log('⚠️ Running Error Handling Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingErrorHandling()"]');
            await this.page.waitForTimeout(3000);
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-error-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            const passed = result.includes('✅');
            this.results.tests.errorHandling = {
                passed,
                result,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? '✅ Error Handling Test PASSED' : '❌ Error Handling Test FAILED');
            return passed;
            
        } catch (error) {
            console.error('❌ Error Handling Test ERROR:', error.message);
            this.results.tests.errorHandling = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runPerformanceTest() {
        console.log('⚡ Running Performance Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingPerformance()"]');
            await this.page.waitForTimeout(5000);
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-performance-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            // Extract performance metrics
            const avgMatch = result.match(/Average: ([\d.]+)ms/);
            const avgTime = avgMatch ? parseFloat(avgMatch[1]) : 0;
            
            const passed = avgTime > 0 && avgTime < 2000; // Pass if < 2 seconds
            this.results.tests.performance = {
                passed,
                result,
                averageTime: avgTime,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? `✅ Performance Test PASSED (${avgTime}ms)` : `❌ Performance Test FAILED (${avgTime}ms)`);
            return passed;
            
        } catch (error) {
            console.error('❌ Performance Test ERROR:', error.message);
            this.results.tests.performance = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runBrowserCompatibilityTest() {
        console.log('🌐 Running Browser Compatibility Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingCompatibility()"]');
            await this.page.waitForTimeout(3000);
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-compatibility-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            const passed = result.includes('✅') && result.split('✅').length > result.split('❌').length;
            this.results.tests.browserCompatibility = {
                passed,
                result,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? '✅ Browser Compatibility Test PASSED' : '❌ Browser Compatibility Test FAILED');
            return passed;
            
        } catch (error) {
            console.error('❌ Browser Compatibility Test ERROR:', error.message);
            this.results.tests.browserCompatibility = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runNetworkFailureTest() {
        console.log('🌍 Running Network Failure Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingNetworkFailure()"]');
            await this.page.waitForTimeout(3000);
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-network-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            const passed = result.includes('✅');
            this.results.tests.networkFailure = {
                passed,
                result,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? '✅ Network Failure Test PASSED' : '❌ Network Failure Test FAILED');
            return passed;
            
        } catch (error) {
            console.error('❌ Network Failure Test ERROR:', error.message);
            this.results.tests.networkFailure = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runStressTest() {
        console.log('🔥 Running Stress Test...');
        
        try {
            await this.page.click('button[onclick="testTaggingStress()"]');
            await this.page.waitForTimeout(10000); // Stress test takes longer
            
            const result = await this.page.evaluate(() => {
                const element = document.getElementById('tagging-stress-result');
                return element ? element.innerHTML : 'No result found';
            });
            
            // Extract success rate
            const successRateMatch = result.match(/Success Rate: ([\d.]+)%/);
            const successRate = successRateMatch ? parseFloat(successRateMatch[1]) : 0;
            
            const passed = successRate >= 80; // Pass if >= 80% success rate
            this.results.tests.stressTest = {
                passed,
                result,
                successRate,
                timestamp: new Date().toISOString()
            };
            
            console.log(passed ? `✅ Stress Test PASSED (${successRate}%)` : `❌ Stress Test FAILED (${successRate}%)`);
            return passed;
            
        } catch (error) {
            console.error('❌ Stress Test ERROR:', error.message);
            this.results.tests.stressTest = {
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting All Tagging Tests...');
        
        const tests = [
            { name: 'Basic Functionality', fn: () => this.runBasicFunctionalityTest() },
            { name: 'Storage Methods', fn: () => this.runStorageMethodsTest() },
            { name: 'Error Handling', fn: () => this.runErrorHandlingTest() },
            { name: 'Performance', fn: () => this.runPerformanceTest() },
            { name: 'Browser Compatibility', fn: () => this.runBrowserCompatibilityTest() },
            { name: 'Network Failure', fn: () => this.runNetworkFailureTest() },
            { name: 'Stress Test', fn: () => this.runStressTest() }
        ];
        
        let passedCount = 0;
        
        for (const test of tests) {
            console.log(`\n📋 Running ${test.name}...`);
            try {
                const passed = await test.fn();
                if (passed) passedCount++;
                
                this.results.summary.total++;
                if (passed) {
                    this.results.summary.passed++;
                } else {
                    this.results.summary.failed++;
                }
                
            } catch (error) {
                console.error(`❌ ${test.name} failed with error:`, error.message);
                this.results.summary.total++;
                this.results.summary.failed++;
            }
            
            // Wait between tests
            await this.page.waitForTimeout(1000);
        }
        
        this.results.summary.successRate = (this.results.summary.passed / this.results.summary.total) * 100;
        
        console.log(`\n📊 Test Summary:`);
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed}`);
        console.log(`Failed: ${this.results.summary.failed}`);
        console.log(`Success Rate: ${this.results.summary.successRate.toFixed(1)}%`);
        
        return this.results.summary.successRate >= 80; // Pass if >= 80% success rate
    }

    async exportResults() {
        console.log('📄 Exporting test results...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tagging-test-results-${timestamp}.json`;
        const filepath = path.join(__dirname, filename);
        
        try {
            fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
            console.log(`✅ Results exported to: ${filename}`);
            return filepath;
        } catch (error) {
            console.error('❌ Failed to export results:', error.message);
            return null;
        }
    }

    async cleanup() {
        console.log('🧹 Cleaning up...');
        
        if (this.browser) {
            await this.browser.close();
        }
        
        console.log('✅ Cleanup completed');
    }

    async run() {
        try {
            await this.initialize();
            await this.navigateToTestPage();
            
            const success = await this.runAllTests();
            await this.exportResults();
            
            if (success) {
                console.log('\n🎉 All tests completed successfully!');
                process.exit(0);
            } else {
                console.log('\n❌ Some tests failed. Check results for details.');
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ Test automation failed:', error.message);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }
}

// Run automation if called directly
if (require.main === module) {
    const automation = new TaggingTestAutomation();
    automation.run().catch(console.error);
}

module.exports = TaggingTestAutomation;
