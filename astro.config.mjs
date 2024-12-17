import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  site: "https://lucaargentieri.github.io/",
  integrations: [tailwind(), vue()],
});
