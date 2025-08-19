#!/usr/bin/env node

/**
 * FPS Project Migration Script
 * Cleans up unused files and reorganizes project structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);

interface MigrationConfig {
  rootDir: string;
  dryRun: boolean;
  verbose: boolean;
}

class ProjectMigrator {
  private config: MigrationConfig;
  private removedFiles: string[] = [];
  private movedFiles: Array<{from: string, to: string}> = [];
  
  constructor(config: MigrationConfig) {
    this.config = config;
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting FPS Project Migration...\n');
    
    try {
      // Phase 1: Remove unused files
      await this.removeUnusedFiles();
      
      // Phase 2: Reorganize remaining files
      await this.reorganizeFiles();
      
      // Phase 3: Update package.json
      await this.updatePackageJson();
      
      // Phase 4: Generate summary
      await this.generateMigrationReport();
      
      console.log('✅ Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async removeUnusedFiles(): Promise<void> {
    console.log('📂 Phase 1: Removing unused files...\n');

    const filesToRemove = [
      // Duplicate documentation
      'README_NEW.md',
      'report.md', 
      'test_results_report_README_report.md',
      
      // VS Code artifacts (should be in .gitignore)
      '.vs',
      
      // Legacy documentation files
      '.vs',
      'test_results_report_README_report.md',
      'report.md',
      'README_NEW.md'
    ];

    for (const fileToRemove of filesToRemove) {
      await this.safeRemove(fileToRemove);
    }

    console.log('✅ Phase 1 completed\n');
  }

  private async reorganizeFiles(): Promise<void> {
    console.log('📁 Phase 2: Reorganizing project structure...\n');

    // Ensure proper examples structure
    await this.ensureExamplesStructure();

    // Reorganize tools directory
    await this.reorganizeToolsDirectory();

    console.log('✅ Phase 2 completed\n');
  }

  private async ensureExamplesStructure(): Promise<void> {
    const examplesDir = path.join(this.config.rootDir, 'examples');
    
    // Create examples subdirectories if they don't exist
    const exampleDirs = ['basic', 'advanced', 'integrations'];
    
    for (const dir of exampleDirs) {
      const dirPath = path.join(examplesDir, dir);
      if (!await this.exists(dirPath)) {
        await this.safeCreateDir(dirPath);
      }
    }

    // Move demo.html to examples/basic/ if it exists in root examples
    const demoPath = path.join(examplesDir, 'demo.html');
    if (await this.exists(demoPath)) {
      const newDemoPath = path.join(examplesDir, 'basic', 'demo.html');
      await this.safeMove(demoPath, newDemoPath);
    }
  }

  private async reorganizeToolsDirectory(): Promise<void> {
    const toolsDir = path.join(this.config.rootDir, 'tools');
    
    // Rename automation_test to automation for consistency
    const oldAutomationPath = path.join(toolsDir, 'automation_test');
    const newAutomationPath = path.join(toolsDir, 'automation');
    
    if (await this.exists(oldAutomationPath) && !await this.exists(newAutomationPath)) {
      await this.safeMove(oldAutomationPath, newAutomationPath);
    }

    // Create build tools directory
    const buildDir = path.join(toolsDir, 'build');
    if (!await this.exists(buildDir)) {
      await this.safeCreateDir(buildDir);
    }
  }

  private async updatePackageJson(): Promise<void> {
    console.log('📦 Phase 3: Updating package.json...\n');

    const packagePath = path.join(this.config.rootDir, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add migration script
    packageContent.scripts = {
      ...packageContent.scripts,
      "migrate": "ts-node tools/migration/migrate.ts",
      "migrate:dry-run": "ts-node tools/migration/migrate.ts --dry-run",
      "docs:serve": "http-server docs/",
      "structure:check": "ts-node tools/migration/check-structure.ts"
    };

    // Add development dependencies if missing
    const newDevDeps = {
      "http-server": "^14.1.1",
      "glob": "^10.3.0",
      "chalk": "^4.1.2"
    };

    packageContent.devDependencies = {
      ...packageContent.devDependencies,
      ...newDevDeps
    };

    if (!this.config.dryRun) {
      await writeFile(packagePath, JSON.stringify(packageContent, null, 2));
    }

    console.log('✅ Phase 3 completed\n');
  }

  private async generateMigrationReport(): Promise<void> {
    console.log('📊 Phase 4: Generating migration report...\n');

    const reportPath = path.join(this.config.rootDir, 'MIGRATION_REPORT.md');
    
    const report = `# FPS Project Migration Report

Generated: ${new Date().toISOString()}

## Files Removed (${this.removedFiles.length})

${this.removedFiles.map(file => `- ✅ ${file}`).join('\n')}

## Files Moved (${this.movedFiles.length})

${this.movedFiles.map(move => `- 📁 ${move.from} → ${move.to}`).join('\n')}

## Current Project Structure

\`\`\`
fps.ai.powered.device.fingerprint.script/
├── 📁 src/                          # Source code
│   ├── 📁 client/                   # Client-side fingerprinting
│   │   └── 📁 fingerprint/          # Fingerprint collection modules
│   ├── 📁 server/                   # Server-side API
│   └── 📁 shared/                   # Shared utilities & types
├── 📁 docs/                         # Documentation
├── 📁 tests/                        # Test files
│   ├── 📁 unit/                     # Unit tests
│   ├── 📁 integration/              # Integration tests
│   └── 📁 e2e/                      # End-to-end tests
├── 📁 examples/                     # Example implementations
│   ├── 📁 basic/                    # Basic examples
│   ├── 📁 advanced/                 # Advanced examples
│   └── 📁 integrations/             # Integration examples
├── 📁 tools/                        # Development tools
│   ├── 📁 automation/               # Test automation
│   ├── 📁 build/                    # Build scripts
│   └── 📁 migration/                # Migration scripts
└── 📁 dist/                         # Compiled output
\`\`\`

## Next Steps

1. Review the migrated structure
2. Update any remaining import paths
3. Test the build process: \`npm run build\`
4. Run tests: \`npm test\`
5. Start development: \`npm run dev\`

## Migration Commands Added

- \`npm run migrate\` - Run migration script
- \`npm run migrate:dry-run\` - Preview migration without changes
- \`npm run docs:serve\` - Serve documentation locally
- \`npm run structure:check\` - Verify project structure

## Cleanup Summary

- Removed ${this.removedFiles.length} unused files
- Moved ${this.movedFiles.length} files to better locations
- Updated package.json with new scripts
- Organized examples and tools directories
`;

    if (!this.config.dryRun) {
      await writeFile(reportPath, report);
    }

    console.log(report);
    console.log('✅ Phase 4 completed\n');
  }

  // Utility methods
  private async safeRemove(filePath: string): Promise<void> {
    const fullPath = path.join(this.config.rootDir, filePath);
    
    if (!await this.exists(fullPath)) {
      if (this.config.verbose) {
        console.log(`⚠️  File not found: ${filePath}`);
      }
      return;
    }

    if (this.config.dryRun) {
      console.log(`🗑️  Would remove: ${filePath}`);
      this.removedFiles.push(filePath);
      return;
    }

    try {
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        await this.removeDirectory(fullPath);
      } else {
        await unlink(fullPath);
      }
      
      this.removedFiles.push(filePath);
      console.log(`🗑️  Removed: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${filePath}:`, error);
    }
  }

  private async removeDirectory(dirPath: string): Promise<void> {
    const files = await readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await this.removeDirectory(filePath);
      } else {
        await unlink(filePath);
      }
    }
    
    await rmdir(dirPath);
  }

  private async safeMove(fromPath: string, toPath: string): Promise<void> {
    const fullFromPath = path.resolve(this.config.rootDir, fromPath);
    const fullToPath = path.resolve(this.config.rootDir, toPath);

    if (!await this.exists(fullFromPath)) {
      if (this.config.verbose) {
        console.log(`⚠️  Source not found: ${fromPath}`);
      }
      return;
    }

    if (this.config.dryRun) {
      console.log(`📁 Would move: ${fromPath} → ${toPath}`);
      this.movedFiles.push({from: fromPath, to: toPath});
      return;
    }

    try {
      // Ensure target directory exists
      const targetDir = path.dirname(fullToPath);
      await this.safeCreateDir(targetDir);

      // Move the file/directory
      await copyFile(fullFromPath, fullToPath);
      await unlink(fullFromPath);
      
      this.movedFiles.push({from: fromPath, to: toPath});
      console.log(`📁 Moved: ${fromPath} → ${toPath}`);
    } catch (error) {
      console.error(`❌ Failed to move ${fromPath}:`, error);
    }
  }

  private async safeCreateDir(dirPath: string): Promise<void> {
    if (!await this.exists(dirPath)) {
      if (!this.config.dryRun) {
        await mkdir(dirPath, { recursive: true });
      }
      if (this.config.verbose) {
        console.log(`📁 Created directory: ${path.relative(this.config.rootDir, dirPath)}`);
      }
    }
  }

  private async exists(filePath: string): Promise<boolean> {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  const rootDir = process.cwd();
  
  console.log(`📁 Project Root: ${rootDir}`);
  console.log(`🔍 Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`📝 Verbose: ${verbose ? 'Yes' : 'No'}\n`);

  const migrator = new ProjectMigrator({
    rootDir,
    dryRun,
    verbose
  });

  await migrator.migrate();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ProjectMigrator };
