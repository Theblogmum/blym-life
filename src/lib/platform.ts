import { Capacitor } from "@capacitor/core";

export const isNativeIOS = (): boolean => {
  try {
    const hasNativeMarker =
      typeof navigator !== "undefined" &&
      navigator.userAgent.includes("BlymNativeIOS");

    return (
      (Capacitor.getPlatform() === "ios" && Capacitor.isNativePlatform()) ||
      hasNativeMarker
    );
  } catch {
    return false;
  }
};

export const isNativeApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform() || isNativeIOS();
  } catch {
    return false;
  }
};