import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.whattocook.app",
  appName: "WhatToCook",
  webDir: "out",
  android: {
    backgroundColor: "#f4efe6",
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#f4efe6",
      style: "LIGHT",
    },
  },
};

export default config;
