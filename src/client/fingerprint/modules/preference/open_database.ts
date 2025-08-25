interface OpenDatabaseResult {
  openDatabase: boolean;
}

export function collectOpenDatabase(): OpenDatabaseResult {
  try {
    const openDatabase = getOpenDatabase();
    return { openDatabase };
  } catch (error) {
    console.error("Error collecting openDatabase status:", error);
    return { openDatabase: false };
  }
}

function getOpenDatabase(): boolean {
  try {
    if (typeof window !== "undefined" && (window as any).openDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).webkitOpenDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).mozOpenDatabase) {
      return true;
    }

    if (typeof window !== "undefined" && (window as any).msOpenDatabase) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
