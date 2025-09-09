export function replaceNaN<T>(value: number, fallback: T): number | T {
  return isNaN(value) ? fallback : value;
}

export function toInt(value: unknown): number {
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? NaN : parsed;
  }
  
  return NaN;
}

export function toFloat(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? NaN : parsed;
  }
  
  return NaN;
}

export function round(value: number, base = 1): number {
  if (Math.abs(base) >= 1) {
    return Math.round(value / base) * base;
  } else {
    const counterBase = 1 / base;
    return Math.round(value * counterBase) / counterBase;
  }
}
