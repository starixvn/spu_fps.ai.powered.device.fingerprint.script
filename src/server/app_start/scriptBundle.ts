import * as fs from 'fs';
import * as path from 'path';
import { ScriptService } from '../services/scriptService';
import { Logger } from '../components/sentry';

export class ScriptBundle<T extends ScriptService> {
  protected scriptService: T;
  protected outputDir: string;
  protected fileName: string;

  constructor(
    scriptService: T,
    options?: {
      outputDir?: string;
      fileName?: string;
    }
  ) {
    this.scriptService = scriptService;
    
    this.outputDir = options?.outputDir || this.resolveOutputDirectory();
    
    this.fileName = options?.fileName || 'script.min.js';
  }

  protected resolveOutputDirectory(): string {
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'public', 'scripts'),
      path.join(__dirname, '..', 'public', 'scripts'),
      path.join(process.cwd(), 'public', 'scripts'),
      path.join(process.cwd(), 'dist', 'public', 'scripts'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }

    const defaultPath = path.join(process.cwd(), 'public', 'scripts');
    this.ensureDirectoryExists(defaultPath);
    return defaultPath;
  }

  protected ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async bundle(): Promise<string | null> {
    try {
      const minifiedScript = await this.scriptService.getMinifiedScript();
      const outputPath = path.join(this.outputDir, this.fileName);
      
      this.ensureDirectoryExists(this.outputDir);
      fs.writeFileSync(outputPath, minifiedScript, 'utf8');
      
      return outputPath;
    } catch (error) {
      Logger.captureException(error as Error);
      return null;
    }
  }
}

