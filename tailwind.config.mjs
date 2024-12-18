/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			white: '#ffffff',
			black: '#000000',
			accent: '#E53D00',
			lightgray: '#E4E4E4',
			darkgray: '#CCCCCC',
		},
		spacing: {
			5: '5px',
			10: '10px',
			20: '20px',
			40: '40px',
		},
		borderRadius: {
			32: '32px',
		},
		flex: {
			'col-1': '0 0 8.333333%',
			'col-2': '0 0 16.666667%',
			'col-3': '0 0 25%',
			'col-4': '0 0 33.333333%',
			'col-5': '0 0 41.666667%',
			'col-6': '0 0 50%',
			'col-7': '0 0 58.333333%',
			'col-8': '0 0 66.666667%',
			'col-9': '0 0 75%',
			'col-10': '0 0 83.333333%',
			'col-11': '0 0 91.666667%',
			'col-12': '0 0 100%',
		},
		extend: {
			width: {
				'col-1': '0 0 8.333333%',
				'col-2': '0 0 16.666667%',
				'col-3': '0 0 25%',
				'col-4': '0 0 33.333333%',
				'col-5': '0 0 41.666667%',
				'col-6': '0 0 50%',
				'col-7': '0 0 58.333333%',
				'col-8': '0 0 66.666667%',
				'col-9': '0 0 75%',
				'col-10': '0 0 83.333333%',
				'col-11': '0 0 91.666667%',
				'col-12': '0 0 100%',
			},
		}
	},
	plugins: [],
}
