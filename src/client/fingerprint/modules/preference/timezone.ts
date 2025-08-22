interface TimezoneResult {
  timezone: string;
}

export function collectTimezone(): TimezoneResult {
  try {
    const timezone = getTimezone();
    console.log("Timezone fingerprint collected:", { timezone });

    return { timezone };
  } catch (error) {
    console.error("Error collecting timezone:", error);
    return { timezone: "unknown" };
  }
}

function getTimezone(): string {
  try {
    if (Intl && Intl.DateTimeFormat) {
      const formatter = new Intl.DateTimeFormat();
      const options = formatter.resolvedOptions();

      if (options.timeZone) {
        return options.timeZone;
      }
    }

    const date = new Date();
    const offset = date.getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";

    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } catch {
    return "unknown";
  }
}
