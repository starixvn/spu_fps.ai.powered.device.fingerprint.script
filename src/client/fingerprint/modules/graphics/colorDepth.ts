export function collectColorDepth(): number | "" {
  return getColorDepth();
}

function getColorDepth(): number | "" {
  try {
    return window?.screen?.colorDepth ?? "";
  } catch {
    return "";
  }
}