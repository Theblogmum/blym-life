import { Capacitor } from "@capacitor/core";

export const isNativeIOS = (): boolean => {
  try {
    return Capacitor.getPlatform() === "ios" && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const isNativeApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};