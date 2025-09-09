import { replaceNaN, toInt } from '../../utils/data';

type ScreenResolution = [number | null, number | null];

export function collectScreenResolution(): [number, number] {
  try {
    return getScreenResolution();
  } catch (error) {
    return [0, 0];
  }
}

function getScreenResolution(): [number, number] {
  return formatScreenResolution(getUnstableScreenResolution());
}

export function getUnstableScreenResolution(): ScreenResolution {
  const s = screen;
  const parseDimension = (value: unknown) => replaceNaN(toInt(value), null);
  const width = parseDimension(s.width);
  const height = parseDimension(s.height);
  
  return [width, height] as ScreenResolution;
}

function formatScreenResolution(dimensions: ScreenResolution): [number, number] {
  const width = dimensions[0] ?? 0;
  const height = dimensions[1] ?? 0;
  
  return [width, height];
}
