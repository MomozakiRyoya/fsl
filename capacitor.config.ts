import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fukuokasuperleague.app",
  appName: "Fukuoka Super League",
  webDir: "out",
  server: {
    url: "https://www.fukuokasuperleague.com",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
