import { replaceNaN, toFloat, round } from '../../utils/data';
import { exitFullscreen, getFullscreenElement, isSafariWebKit, isWebKit, isWebKit616OrNewer } from '../../utils/browser';
import type { Bit } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';

export type FrameSizeValue = number | FingerprintSpecialValue;
export type FrameSize = [FrameSizeValue, FrameSizeValue, FrameSizeValue, FrameSizeValue];
export const screenFrameCheckInterval = 2500;

const roundingPrecision = 10;
let screenFrameBackup: Readonly<FrameSize> | undefined;
let screenFrameSizeTimeoutId: number | undefined;

export async function collectScreenFrame(): Promise<FrameSize> {
  const getFrameAsync = getScreenFrame();
  const frameSize = await getFrameAsync();

  if (!frameSize) {
    return [
      FingerprintSpecialValue.UNDEFINED,
      FingerprintSpecialValue.UNDEFINED,
      FingerprintSpecialValue.UNDEFINED,
      FingerprintSpecialValue.UNDEFINED,
    ];
  }

  return [
    frameSize[0] === null ? FingerprintSpecialValue.UNDEFINED : frameSize[0],
    frameSize[1] === null ? FingerprintSpecialValue.UNDEFINED : frameSize[1],
    frameSize[2] === null ? FingerprintSpecialValue.UNDEFINED : frameSize[2],
    frameSize[3] === null ? FingerprintSpecialValue.UNDEFINED : frameSize[3],
  ];
}

export function resetScreenFrameWatch(): void {
  if (screenFrameSizeTimeoutId !== undefined) {
    clearTimeout(screenFrameSizeTimeoutId);
    screenFrameSizeTimeoutId = undefined;
  }
  screenFrameBackup = undefined;
}

function watchScreenFrame() {
  if (screenFrameSizeTimeoutId !== undefined) {
    return;
  }

  const checkScreenFrame = () => {
    const frameSize = getCurrentScreenFrame();
    if (isFrameSizeNull(frameSize)) {
      screenFrameSizeTimeoutId = (setTimeout as typeof window.setTimeout)(
        checkScreenFrame,
        screenFrameCheckInterval,
      );
    } else {
      screenFrameBackup = frameSize;
      screenFrameSizeTimeoutId = undefined;
    }
  };

  checkScreenFrame();
}

export function getUnstableScreenFrame(): () => Promise<FrameSize> {
  watchScreenFrame();

  return async () => {
    let frameSize = getCurrentScreenFrame();

    if (isFrameSizeNull(frameSize)) {
      if (screenFrameBackup) {
        return [...screenFrameBackup];
      }

      if (getFullscreenElement()) {
        await exitFullscreen();
        frameSize = getCurrentScreenFrame();
      }
    }

    if (!isFrameSizeNull(frameSize)) {
      screenFrameBackup = frameSize;
    }

    return frameSize;
  };
}

function getScreenFrame(): () => Promise<FrameSize | undefined> {
  if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
    return () => Promise.resolve(undefined);
  }

  const screenFrameGetter = getUnstableScreenFrame();

  return async () => {
    const frameSize = await screenFrameGetter();
    const processSize = (sideSize: FrameSize[number]) =>
      sideSize === null
        ? FingerprintSpecialValue.UNDEFINED
        : round(sideSize as number, roundingPrecision);

    return [
      processSize(frameSize[0]),
      processSize(frameSize[1]),
      processSize(frameSize[2]),
      processSize(frameSize[3]),
    ];
  };
}

function getCurrentScreenFrame(): FrameSize {
  const s = screen as any;

  // Handle undefined availTop and availLeft - major issue on many browsers
  const availTop = s.availTop !== undefined ? toFloat(s.availTop) : FingerprintSpecialValue.UNDEFINED;
  const availLeft = s.availLeft !== undefined ? toFloat(s.availLeft) : FingerprintSpecialValue.UNDEFINED;
  const width = toFloat(s.width) ?? FingerprintSpecialValue.UNDEFINED;
  const height = toFloat(s.height) ?? FingerprintSpecialValue.UNDEFINED;
  const availWidth = toFloat(s.availWidth) ?? FingerprintSpecialValue.UNDEFINED;
  const availHeight = toFloat(s.availHeight) ?? FingerprintSpecialValue.UNDEFINED;

  return [
    replaceNaN(availTop, FingerprintSpecialValue.UNDEFINED),
    replaceNaN(width - availWidth - replaceNaN(availLeft, FingerprintSpecialValue.UNDEFINED), FingerprintSpecialValue.UNDEFINED),
    replaceNaN(height - availHeight - replaceNaN(availTop, FingerprintSpecialValue.UNDEFINED), FingerprintSpecialValue.UNDEFINED),
    replaceNaN(availLeft, FingerprintSpecialValue.UNDEFINED),
  ];
}

function isFrameSizeNull(frameSize: FrameSize): Bit {
  for (let i = 0; i < 4; ++i) {
    if (
      typeof frameSize[i] === 'number' &&
      frameSize[i] !== FingerprintSpecialValue.UNDEFINED
    ) {
      return 0;
    }
  }
  return 1;
}
