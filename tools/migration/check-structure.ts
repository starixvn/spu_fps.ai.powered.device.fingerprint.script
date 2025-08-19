#!/usr/bin/env node

/**
 * FPS Project Structure Checker
 * Validates project structure and identifies issues
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

interface StructureItem {
  path: string;
  type: 'file' | 'directory';
  required: boolean;
  description?: string;
}

interface CheckResult {
  path: string;
  exists: boolean;
  type?: 'file' | 'directory';
  issue?: string;
}

class StructureChecker {
  private rootDir: string;
  
  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  private expectedStructure: StructureItem[] = [
    // Root files
    { path: 'package.json', type: 'file', required: true, description: 'Project configuration' },
    { path: 'tsconfig.json', type: 'file', required: true, description: 'Base TypeScript config' },
    { path: 'tsconfig.client.json', type: 'file', required: true, description: 'Client TypeScript config' },
    { path: 'tsconfig.server.json', type: 'file', required: true, description: 'Server TypeScript config' },
    { path: 'README.md', type: 'file', required: true, description: 'Project documentation' },
    { path: '.gitignore', type: 'file', required: true, description: 'Git ignore rules' },

    // Source directories
    { path: 'src', type: 'directory', required: true, description: 'Source code' },
    { path: 'src/client', type: 'directory', required: true, description: 'Client-side code' },
    { path: 'src/client/fingerprint', type: 'directory', required: true, description: 'Fingerprinting modules' },
    { path: 'src/client/fingerprint/index.ts', type: 'file', required: true, description: 'Main fingerprint coordinator' },
    { path: 'src/client/fingerprint/types.ts', type: 'file', required: true, description: 'Type definitions' },
    { path: 'src/client/fingerprint/modules', type: 'directory', required: true, description: 'Fingerprint modules' },
    { path: 'src/client/fingerprint/utils', type: 'directory', required: false, description: 'Utility functions' },
    
    { path: 'src/server', type: 'directory', required: true, description: 'Server-side code' },
    { path: 'src/server/index.ts', type: 'file', required: true, description: 'Express server' },
    { path: 'src/server/services', type: 'directory', required: true, description: 'Business logic services' },
    
    { path: 'src/shared', type: 'directory', required: false, description: 'Shared utilities' },

    // Documentation
    { path: 'docs', type: 'directory', required: true, description: 'Documentation' },

    // Tests
    { path: 'tests', type: 'directory', required: true, description: 'Test files' },
    { path: 'tests/unit', type: 'directory', required: false, description: 'Unit tests' },
    { path: 'tests/integration', type: 'directory', required: false, description: 'Integration tests' },
    { path: 'tests/e2e', type: 'directory', required: false, description: 'End-to-end tests' },

    // Tools and examples
    { path: 'tools', type: 'directory', required: false, description: 'Development tools' },
    { path: 'examples', type: 'directory', required: false, description: 'Usage examples' },

    // Build output
    { path: 'dist', type: 'directory', required: false, description: 'Compiled output' },
  ];

  private obsoleteItems: string[] = [
    'README_NEW.md',
    'report.md',
    'test_results_report_README_report.md',
    '.vs'
  ];

  async checkStructure(): Promise<void> {
    console.log('🔍 Checking FPS Project Structure...\n');

    const results: CheckResult[] = [];

    // Check expected structure
    for (const item of this.expectedStructure) {
      const result = await this.checkItem(item);
      results.push(result);
    }

    // Check for obsolete items
    const obsoleteResults = await this.checkObsoleteItems();

    // Generate report
    this.generateReport(results, obsoleteResults);
  }

  private async checkItem(item: StructureItem): Promise<CheckResult> {
    const fullPath = path.join(this.rootDir, item.path);
    
    try {
      const stats = await stat(fullPath);
      const actualType = stats.isDirectory() ? 'directory' : 'file';
      
      if (actualType !== item.type) {
        return {
          path: item.path,
          exists: true,
          type: actualType,
          issue: `Expected ${item.type}, found ${actualType}`
        };
      }

      return {
        path: item.path,
        exists: true,
        type: actualType
      };
    } catch {
      return {
        path: item.path,
        exists: false,
        issue: item.required ? 'Required item missing' : 'Optional item missing'
      };
    }
  }

  private async checkObsoleteItems(): Promise<CheckResult[]> {
    const results: CheckResult[] = [];

    for (const obsoletePath of this.obsoleteItems) {
      const fullPath = path.join(this.rootDir, obsoletePath);
      
      try {
        const stats = await stat(fullPath);
        results.push({
          path: obsoletePath,
          exists: true,
          type: stats.isDirectory() ? 'directory' : 'file',
          issue: 'Obsolete item should be removed'
        });
      } catch {
        // Good - obsolete item doesn't exist
      }
    }

    return results;
  }

  private generateReport(results: CheckResult[], obsoleteResults: CheckResult[]): void {
    console.log('📊 Structure Check Report\n');

    // Required items
    const missingRequired = results.filter(r => 
      !r.exists && this.expectedStructure.find(s => s.path === r.path)?.required
    );

    if (missingRequired.length > 0) {
      console.log('❌ Missing Required Items:');
      missingRequired.forEach(item => {
        const expectedItem = this.expectedStructure.find(s => s.path === item.path);
        console.log(`   - ${item.path} (${expectedItem?.description || 'Required file/directory'})`);
      });
      console.log();
    }

    // Type mismatches
    const typeMismatches = results.filter(r => r.exists && r.issue?.includes('Expected'));
    if (typeMismatches.length > 0) {
      console.log('⚠️  Type Mismatches:');
      typeMismatches.forEach(item => {
        console.log(`   - ${item.path}: ${item.issue}`);
      });
      console.log();
    }

    // Obsolete items
    if (obsoleteResults.length > 0) {
      console.log('🗑️  Obsolete Items (should be removed):');
      obsoleteResults.forEach(item => {
        console.log(`   - ${item.path} (${item.type})`);
      });
      console.log();
    }

    // Optional missing items
    const missingOptional = results.filter(r => 
      !r.exists && !this.expectedStructure.find(s => s.path === r.path)?.required
    );

    if (missingOptional.length > 0) {
      console.log('ℹ️  Missing Optional Items:');
      missingOptional.forEach(item => {
        const expectedItem = this.expectedStructure.find(s => s.path === item.path);
        console.log(`   - ${item.path} (${expectedItem?.description || 'Optional item'})`);
      });
      console.log();
    }

    // Success items
    const successfulItems = results.filter(r => r.exists && !r.issue);
    console.log(`✅ Valid Items: ${successfulItems.length}/${results.length}`);

    // Generate package.json suggestions
    this.checkPackageJsonScripts();

    // Overall status
    const hasErrors = missingRequired.length > 0 || typeMismatches.length > 0;
    const hasWarnings = obsoleteResults.length > 0;

    console.log('\n📋 Summary:');
    if (hasErrors) {
      console.log('❌ Structure has errors that need to be fixed');
      console.log('   Run: npm run migrate');
    } else if (hasWarnings) {
      console.log('⚠️  Structure is mostly correct but has some cleanup needed');
      console.log('   Run: npm run migrate');
    } else {
      console.log('✅ Project structure is properly organized!');
    }

    console.log('\n🔧 Available commands:');
    console.log('   npm run migrate           # Fix structure issues');
    console.log('   npm run migrate:dry-run   # Preview changes');
    console.log('   npm run build             # Build project');
    console.log('   npm run dev               # Start development');
  }

  private async checkPackageJsonScripts(): Promise<void> {
    try {
      const packagePath = path.join(this.rootDir, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const recommendedScripts = {
        'migrate': 'Migration script',
        'migrate:dry-run': 'Preview migration',
        'build': 'Build project',
        'build:client': 'Build client',
        'build:server': 'Build server',
        'dev': 'Development mode',
        'test': 'Run tests',
        'lint': 'Code linting',
        'clean': 'Clean build output'
      };

      const missingScripts = Object.keys(recommendedScripts).filter(
        script => !packageContent.scripts?.[script]
      );

      if (missingScripts.length > 0) {
        console.log('\n💡 Recommended package.json scripts to add:');
        missingScripts.forEach(script => {
          console.log(`   "${script}": "${recommendedScripts[script as keyof typeof recommendedScripts]}"`);
        });
      }
    } catch (error) {
      console.log('⚠️  Could not read package.json');
    }
  }
}

// CLI Interface
async function main() {
  const rootDir = process.cwd();
  console.log(`📁 Checking project at: ${rootDir}\n`);

  const checker = new StructureChecker(rootDir);
  await checker.checkStructure();
}

if (require.main === module) {
  main().catch(console.error);
}

export { StructureChecker };
