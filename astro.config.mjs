// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://lucaargentieri.github.io',
	integrations: [sitemap()],
	vite: {
		plugins: [tailwindcss(), wgslVitePlugin()],
	},
});
