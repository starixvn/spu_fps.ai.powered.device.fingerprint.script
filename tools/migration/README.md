# FPS Project Migration Tools

This directory contains tools to help clean up and organize your FPS Device Fingerprinting project.

## 🛠 Available Tools

### 1. **Migration Script** (`migrate.ts`)
Automatically cleans up unused files and reorganizes project structure.

```bash
# Preview changes without making them
npm run migrate:dry-run

# Run full migration
npm run migrate

# Windows users can also use:
tools/migration/migrate.bat
```

### 2. **Structure Checker** (`check-structure.ts`)
Validates project structure and identifies issues.

```bash
# Check current project structure
npm run migrate:check

# Or use the alias
npm run structure:check
```

### 3. **Interactive Migration** (`migrate.bat`)
Windows batch script with interactive menu.

```cmd
# Run interactive migration tool
tools\migration\migrate.bat
```

## 📋 What Gets Cleaned Up

### Files Removed
- `README_NEW.md` - Duplicate documentation
- `report.md` - Old report file
- `test_results_report_README_report.md` - Outdated test results
- `.vs/` - Visual Studio artifacts (should be in .gitignore)
- Legacy `api/di/` structure files after migration

### Files Reorganized
- Examples moved to proper subdirectories
- `automation_test/` renamed to `automation/`
- Documentation consolidated in `docs/`

### Directories Created
- `examples/basic/` - Basic usage examples
- `examples/advanced/` - Advanced examples
- `examples/integrations/` - Integration examples
- `tools/build/` - Build scripts
- `tools/automation/` - Test automation (renamed)

## 🚀 Usage Examples

### Quick Structure Check
```bash
npm run migrate:check
```

### Preview Migration
```bash
npm run migrate:dry-run
```
This shows what would be changed without making any actual changes.

### Run Full Migration
```bash
npm run migrate
```
This applies all changes and generates a `MIGRATION_REPORT.md`.

### Interactive Mode (Windows)
```cmd
tools\migration\migrate.bat
```
Provides a menu-driven interface for different migration options.

## 📊 Migration Report

After running the migration, a `MIGRATION_REPORT.md` file is generated with:

- List of removed files
- List of moved files
- Current project structure
- Next steps and recommendations
- New npm scripts added

## 🎯 Expected Final Structure

```
fps.ai.powered.device.fingerprint.script/
├── 📁 src/
│   ├── 📁 client/fingerprint/
│   ├── 📁 server/
│   └── 📁 shared/
├── 📁 docs/
├── 📁 tests/
│   ├── 📁 unit/
│   ├── 📁 integration/
│   └── 📁 e2e/
├── 📁 examples/
│   ├── 📁 basic/
│   ├── 📁 advanced/
│   └── 📁 integrations/
├── 📁 tools/
│   ├── 📁 automation/
│   ├── 📁 build/
│   └── 📁 migration/
└── 📁 dist/
```

## 🔧 New NPM Scripts Added

After migration, these scripts are added to `package.json`:

```json
{
  "scripts": {
    "migrate": "Run migration script",
    "migrate:dry-run": "Preview migration changes",
    "migrate:check": "Check project structure",
    "docs:serve": "Serve documentation locally",
    "structure:check": "Alias for migrate:check"
  }
}
```

## ⚠️ Important Notes

1. **Backup First**: Always commit your changes to git before running migration
2. **Review Changes**: Use `--dry-run` first to see what will change
3. **Test After**: Run `npm run build` and `npm test` after migration
4. **Import Paths**: You may need to update some import paths manually

## 🐛 Troubleshooting

### "Cannot find module" errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript is available: `npx tsc --version`

### Structure check fails
- Ensure you're running from the project root directory
- Check that `package.json` exists in current directory

### Migration script errors
- Verify file permissions (especially on Windows)
- Run with `--verbose` flag for detailed output
- Check `MIGRATION_REPORT.md` for details

## 📞 Support

If you encounter issues:

1. Check the generated `MIGRATION_REPORT.md`
2. Run with `--verbose` flag for detailed output
3. Review the project structure with `npm run migrate:check`
4. Ensure all dependencies are installed with `npm install`

## 🔄 Rolling Back

If you need to undo migration changes:

1. Use git to revert: `git checkout -- .`
2. Or restore from backup
3. The migration script doesn't modify core source files, only reorganizes structure
