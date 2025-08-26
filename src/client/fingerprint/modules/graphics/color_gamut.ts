import type { ColorGamutInfo } from "../../types";

export async function collectColorGamut(): Promise<ColorGamutInfo> {
  try {
    return await getColorGamut();
  } catch {
    return {
      colorGamut: "srgb",
      supportedColorSpaces: ["srgb"],
      p3Support: false,
      rec2020Support: false,
      srgbSupport: true,
      displayP3Support: false,
    };
  }
}

async function getColorGamut(): Promise<ColorGamutInfo> {
  const testSpaces = ["srgb", "p3", "rec2020", "display-p3", "adobe-rgb"];
  const supportedColorSpaces = testSpaces.filter((s) =>
    checkColorSpaceSupport(s)
  );

  const priority = ["rec2020", "p3", "display-p3", "adobe-rgb", "srgb"];
  const colorGamut =
    priority.find((p) => supportedColorSpaces.includes(p)) || "srgb";

  return {
    colorGamut,
    supportedColorSpaces: supportedColorSpaces.sort(),
    p3Support: supportedColorSpaces.includes("p3"),
    rec2020Support: supportedColorSpaces.includes("rec2020"),
    srgbSupport: supportedColorSpaces.includes("srgb"),
    displayP3Support: supportedColorSpaces.includes("display-p3"),
  };
}

function checkColorSpaceSupport(space: string): boolean {
  try {
    if (window.matchMedia && ["p3", "rec2020", "srgb"].includes(space)) {
      if (window.matchMedia(`(color-gamut: ${space})`).matches) return true;
    }

    const el = document.createElement("div");
    el.style.color = `color(${space} 1 0 0)`;
    const computed = getComputedStyle(el).color;
    const normalized = computed.replace(/\s+/g, "").toLowerCase();

    return !["rgb(255,0,0)", "rgba(255,0,0,1)", "red"].includes(normalized);
  } catch {
    return false;
  }
}
