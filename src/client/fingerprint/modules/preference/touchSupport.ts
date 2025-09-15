import type { TouchSupportInfo, Bit } from "../../types";
import { toInt, boolToBit } from "../../utils/data";

export function collectTouchSupport(): TouchSupportInfo {
  try {
    const result = getTouchSupport();
    return [result.maxTouchPoints, result.touchEvent, result.touchStart];
  } catch (error) {
    return [0, 0, 0];
  }
}

function getTouchSupport(): { maxTouchPoints: number; touchEvent: Bit; touchStart: Bit } {
  try {
    const n = navigator;

    let maxTouchPoints = 0;
    let touchEvent: Bit;

    if (n.maxTouchPoints !== undefined) {
      maxTouchPoints = toInt(n.maxTouchPoints);
    } else if ((n as any).msMaxTouchPoints !== undefined) {
      maxTouchPoints = (n as any).msMaxTouchPoints;
    }

    try {
      document.createEvent('TouchEvent');
      touchEvent = 1;
    } catch {
      touchEvent = 0;
    }

    const touchStart = boolToBit('ontouchstart' in window);

    return {
      maxTouchPoints,
      touchEvent,
      touchStart,
    };
  } catch {
    return {
      maxTouchPoints: 0,
      touchEvent: 0,
      touchStart: 0,
    };
  }
}
