export function collectColorDepth(): number | "" {
  try {
    return getColorDepth();
  } catch {
    return "";
  }
}

function getColorDepth(): number | "" {
  return window?.screen?.colorDepth ?? "";
}