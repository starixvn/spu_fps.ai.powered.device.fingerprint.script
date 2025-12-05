import { collectViewport } from './viewport';
import { collectScreen } from './screen';
import { collectDevicePixelRatio } from './devicePixelRatio';
import { collectRender} from './render';

import type {
  ViewportInfo,
  ScreenInfo,
  DevicePixelRatioInfo,
  RenderInfo,
} from '../../types';

export interface GraphicsGroupInfo {
  viewport: ViewportInfo;
  screen: ScreenInfo;
  devicePixelRatio: DevicePixelRatioInfo;
  render: RenderInfo;
}

export class GraphicsScoring {
  public static collect(): GraphicsGroupInfo {
    const viewportResult = collectViewport();
    const screenResult = collectScreen();
    const devicePixelRatioResult = collectDevicePixelRatio();
    const renderResult = collectRender();

    const graphicsGroup: GraphicsGroupInfo = {
      viewport: viewportResult,
      screen: screenResult,
      devicePixelRatio: devicePixelRatioResult,
      render: renderResult,
    };

    return graphicsGroup;
  }
}

