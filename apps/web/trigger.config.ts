import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "",
  maxDuration: 2400,
  build: {
    external: ["pg"],
  },
});
