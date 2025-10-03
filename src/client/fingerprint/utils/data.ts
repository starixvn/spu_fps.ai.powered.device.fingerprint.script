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

export function boolToBit(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

export function parseSimpleCssSelector(selector: string): [string | undefined, Record<string, string[]>] {
  const match = /^([a-zA-Z][a-zA-Z0-9]*)?(?:#([a-zA-Z][a-zA-Z0-9-]*))?(?:\\.([a-zA-Z][a-zA-Z0-9-]*))?(?:\\[(.+?)\\])?$/.exec(selector)
  if (!match) {
    throw new Error(`Invalid CSS selector: ${selector}`)
  }

  const [, tag, id, className, attributesString] = match
  const attributes: Record<string, string[]> = {}

  if (id) {
    attributes.id = [id]
  }
  if (className) {
    attributes.class = [className]
  }
  if (attributesString) {
    const attributePairs = attributesString.split(',').map(pair => pair.trim())
    for (const pair of attributePairs) {
      const [name, value] = pair.split('=').map(s => s.trim())
      if (name && value) {
        attributes[name] = [value.replace(/^["']|["']$/g, '')]
      }
    }
  }

  return [tag, attributes]
}