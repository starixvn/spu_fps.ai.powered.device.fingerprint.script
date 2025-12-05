import { collectPlatform } from './platform';
import type {
  PlatformInfo,
} from '../../types';

export interface HardwareGroupInfo {
  platform: PlatformInfo;
}

export class HardwareScoring {
  public static collect(): HardwareGroupInfo {
    const platformResult = collectPlatform();

    const hardwareGroup: HardwareGroupInfo = {
      platform: platformResult,
    };

    return hardwareGroup;
  }
}