export const person = {
	name: 'Luca Argentieri',
	role: 'Senior Frontend Developer',
	avatar: '/avatar.jpg',
	bio: [
		'I develop web interfaces for diverse clients, with a strong focus on performance and accessibility.',
		"I have solid experience with modern libraries, frameworks, and CMS platforms, including e-commerce solutions built with Shopify. I specialize in creative coding and high-quality user experiences, and I actively contribute to open-source projects while staying up to date with emerging technologies and industry trends.",
	],
	links: {
		email: 'lucaargentieri98@gmail.com',
		github: 'https://github.com/LucaArgentieri',
		linkedin: 'https://www.linkedin.com/in/luca-argentieri/',
	},
};

export type Experience = {
	role: string;
	company: string;
	start: string;
	end: string;
};

// Placeholder — replace with your real work history.
export const experience: Experience[] = [
	{ role: 'Frontend Developer', company: 'Display Design Studio', start: '2021', end: 'Present' },
];

export type Project = {
	title: string;
	subtitle: string;
	meta: string;
	technologies: string;
	href: string;
	description?: string;
};

export const projects: Project[] = [
	{
		title: 'Gimatic',
		subtitle: 'B2B Website',
		meta: 'Display Studio · 2025',
		technologies: 'Nuxt, Sanity CMS, Supabase',
		href: '#',
	},
	{
		title: 'Universal Music Italia: Shop Online',
		subtitle: 'E-commerce Development',
		meta: 'Display Studio · 2025',
		technologies: 'Shopify',
		href: '#',
	},
	{
		title: 'Alessi',
		subtitle: 'E-commerce Development',
		meta: 'Display Studio · 2025',
		technologies: 'Shopify',
		href: '#',
	},
	{
		title: 'Politecnico di Milano (7 Departments)',
		subtitle: 'UI Components Library, Website, Reserved area',
		meta: 'Display Studio · 2025',
		technologies: 'Nuxt, Sanity CMS',
		href: '#',
		description:
			'Developed departments: DDD, FISI, DASTU, DABC, DMECC, DAER, DIG. The project consists of three layers: UI, backend, and frontend. The UI is divided into the website UI and the private area UI, both shared by all departments. The backend is built with Sanity CMS. The frontend connects everything together.',
	},
	{
		title: 'Acqua Fiuggi',
		subtitle: 'Frontend & CMS',
		meta: 'Display Studio · 2025',
		technologies: 'Nuxt, Sanity CMS',
		href: '#',
	},
];

export type OpenSourceProject = {
	name: string;
	description: string;
	href: string;
	stat?: string;
};

export const openSource: OpenSourceProject[] = [
	{
		name: 'gsap-nuxt-module',
		description: 'GSAP module for Nuxt.',
		href: 'https://github.com/LucaArgentieri/gsap-nuxt-module',
		stat: '37 stars',
	},
	{
		name: 'firmereferendum-bot',
		description:
			'Telegram bot that sends updates on new, changed, or removed referendum and popular initiatives from the public feed.',
		href: 'https://github.com/LucaArgentieri/firmereferendum-bot',
	},
	{
		name: 'sanity-starter',
		description: 'Starter template for building sites with Sanity CMS.',
		href: 'https://github.com/LucaArgentieri/sanity-starter',
	},
];

export type WritingPost = {
	title: string;
	tag: string;
	href: string;
};

// Placeholder — add your posts here, or remove the section from index.astro.
export const writing: WritingPost[] = [];
