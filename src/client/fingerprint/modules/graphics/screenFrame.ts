import { replaceNaN, toFloat, round } from '../../utils/data';
import { exitFullscreen, getFullscreenElement, isSafariWebKit, isWebKit, isWebKit616OrNewer } from '../../utils/browser';
import type { Bit } from '../../types';

export type FrameSize = [number | null, number | null, number | null, number | null];
export const screenFrameCheckInterval = 2500;

const roundingPrecision = 10;
let screenFrameBackup: Readonly<FrameSize> | undefined;
let screenFrameSizeTimeoutId: number | undefined;

export async function collectScreenFrame(): Promise<[number, number, number, number]> {
  try {
    const getFrameAsync = getScreenFrame();
    const frameSize = await getFrameAsync();

    if (!frameSize) {
      return [0, 0, 0, 0];
    }

    return [
      frameSize[0] === null ? 0 : frameSize[0],
      frameSize[1] === null ? 0 : frameSize[1],
      frameSize[2] === null ? 0 : frameSize[2],
      frameSize[3] === null ? 0 : frameSize[3],
    ];
  } catch {
    return [0, 0, 0, 0];
  }
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
      sideSize === null ? null : round(sideSize, roundingPrecision);

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
  const availTop = s.availTop !== undefined ? toFloat(s.availTop) : 0;
  const availLeft = s.availLeft !== undefined ? toFloat(s.availLeft) : 0;
  const width = toFloat(s.width) || 0;
  const height = toFloat(s.height) || 0;
  const availWidth = toFloat(s.availWidth) || 0;
  const availHeight = toFloat(s.availHeight) || 0;

  return [
    replaceNaN(availTop, null),
    replaceNaN(width - availWidth - replaceNaN(availLeft, 0), null),
    replaceNaN(height - availHeight - replaceNaN(availTop, 0), null),
    replaceNaN(availLeft, null),
  ];
}

function isFrameSizeNull(frameSize: FrameSize): Bit {
  for (let i = 0; i < 4; ++i) {
    if (frameSize[i]) {
      return 0;
    }
  }
  return 1;
}
