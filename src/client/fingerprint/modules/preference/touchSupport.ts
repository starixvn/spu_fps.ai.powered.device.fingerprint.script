import type { TouchSupportInfo } from "../../types";
import { toInt } from "../../utils/data";

export function collectTouchSupport(): TouchSupportInfo {
  try {
    return getTouchSupport();
  } catch (error) {
    return {
      maxTouchPoints: 0,
      touchEvent: false,
      touchStart: false,
    };
  }
}

function getTouchSupport(): TouchSupportInfo {
  try {
    const n = navigator;

    let maxTouchPoints = 0;
    let touchEvent: boolean;

    if (n.maxTouchPoints !== undefined) {
      maxTouchPoints = toInt(n.maxTouchPoints);
    } else if ((n as any).msMaxTouchPoints !== undefined) {
      maxTouchPoints = (n as any).msMaxTouchPoints;
    }

    try {
      document.createEvent('TouchEvent');
      touchEvent = true;
    } catch {
      touchEvent = false;
    }

    const touchStart = 'ontouchstart' in window;

    return {
      maxTouchPoints,
      touchEvent,
      touchStart,
    };
  } catch {
    return {
      maxTouchPoints: 0,
      touchEvent: false,
      touchStart: false,
    };
  }
}
