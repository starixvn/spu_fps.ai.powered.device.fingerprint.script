import { ScriptBundle } from './scriptBundle';
import { ScoringScriptService } from '../services/scoringScriptService';

export class ScoringBundle extends ScriptBundle<ScoringScriptService> {
  constructor(outputDir?: string) {
    super(new ScoringScriptService(), {
      outputDir,
      fileName: 'scoring.min.js',
    });
  }
}

