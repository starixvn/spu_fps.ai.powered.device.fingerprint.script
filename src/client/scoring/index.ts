import { BrowserScoring } from './modules/browser';
import { HardwareScoring } from './modules/hardware';
import { GraphicsScoring } from './modules/graphics';
import { PreferenceScoring } from './modules/preference';

import {
  mapBrowserGroupToShortCodes,
  mapHardwareGroupToShortCodes,
  mapGraphicsGroupToShortCodes,
  mapPreferenceGroupToShortCodes,
  GROUP_FIELD_MAPPING,
} from './fieldMapping';

import type { ScoringGroupInfo } from './types';

export class ScoringCollector {
  public start(): ScoringGroupInfo {
    
    const browserGroup = BrowserScoring.collect();
    const hardwareGroup = HardwareScoring.collect();
    const graphicsGroup = GraphicsScoring.collect();
    const preferenceGroup = PreferenceScoring.collect();

    const browserData = mapBrowserGroupToShortCodes(browserGroup);
    const hardwareData = mapHardwareGroupToShortCodes(hardwareGroup);
    const graphicsData = mapGraphicsGroupToShortCodes(graphicsGroup);
    const preferenceData = mapPreferenceGroupToShortCodes(preferenceGroup);

    const scoringGroup: ScoringGroupInfo = {
      [GROUP_FIELD_MAPPING.browser]: browserData as any,
      [GROUP_FIELD_MAPPING.hardware]: hardwareData as any,
      [GROUP_FIELD_MAPPING.graphics]: graphicsData as any,
      [GROUP_FIELD_MAPPING.preference]: preferenceData as any,
    };

    if (typeof window !== 'undefined') {
      (window as any).__sgx = scoringGroup;
    }

    return scoringGroup;
  }
}