export const person = {
	name: 'Luca Argentieri',
	role: 'Product Engineer',
	avatar: '/avatar.jpg',
	bio: [
		'I build web products, developer tools and AI-powered workflows, with a background in frontend engineering and a focus on performance, accessibility and developer experience.',
		'My work spans frontend architecture, e-commerce platforms and AI-driven applications. I enjoy exploring how emerging technologies can improve the way we design, build and interact with software.',
		"I'm particularly interested in creative development, open-source software and the evolution of software engineering through AI.",
	],
	links: {
		email: 'lucaargentieri98@gmail.com',
		github: 'https://github.com/LucaArgentieri',
		linkedin: 'https://www.linkedin.com/in/luca-argentieri/',
		x: 'https://x.com/luca_argentieri',
	},
};

export type Experience = {
	role: string;
	company: string;
	start: string;
	end: string;
	description?: string[];
	technologies?: string;
};

// Placeholder — replace with your real work history.
export const experience: Experience[] = [
	{
		role: 'Frontend Developer',
		company: 'Display Design Studio',
		start: '2021',
		end: 'Present',
		description: [
			'Developing digital products, e-commerce platforms and custom web applications.',
			'Working across frontend architecture, Shopify development, CMS integrations, developer tooling and AI-powered workflows.',
			'Building internal tools to improve team workflows, defining AI skills and processes, and generating UI with Figma.',
		],
		technologies: 'Vue, Nuxt, TypeScript, Shopify, Sanity, AI/LLM integrations',
	},
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
		href: 'https://gimatic.com',
	},
	{
		title: 'Universal Music Italia: Shop Online',
		subtitle: 'E-commerce Development',
		meta: 'Display Studio · 2025',
		technologies: 'Shopify',
		href: 'https://shop.universalmusic.it/',
	},
	{
		title: 'Alessi',
		subtitle: 'E-commerce Development',
		meta: 'Display Studio · 2025',
		technologies: 'Shopify',
		href: 'https://alessi.com/',
	},
	{
		title: 'Politecnico di Milano (7 Departments)',
		subtitle: 'UI Components Library, Website, Reserved area',
		meta: 'Display Studio · 2025',
		technologies: 'Nuxt, Sanity CMS',
		href: 'https://www.dipartimentodesign.polimi.it/',
		description:
			'Developed departments: DDD, FISI, DASTU, DABC, DMECC, DAER, DIG. The project consists of three layers: UI, backend, and frontend. The UI is divided into the website UI and the private area UI, both shared by all departments. The backend is built with Sanity CMS. The frontend connects everything together.',
	},
	{
		title: 'Acqua Fiuggi',
		subtitle: 'Frontend & CMS',
		meta: 'Display Studio · 2025',
		technologies: 'Nuxt, Sanity CMS',
		href: 'https://acquafiuggi.com/',
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
