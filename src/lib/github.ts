import { openSource, person } from '../data/site';

export type PinnedRepo = {
	name: string;
	description: string;
	href: string;
	stars: number;
	forks: number;
	language?: { name: string; color: string };
	topics: string[];
	homepage?: string;
};

const login = person.links.github.split('/').pop() as string;

const query = `
query($login: String!) {
	user(login: $login) {
		pinnedItems(first: 6, types: REPOSITORY) {
			nodes {
				... on Repository {
					name
					description
					url
					stargazerCount
					forkCount
					homepageUrl
					primaryLanguage { name color }
					repositoryTopics(first: 4) { nodes { topic { name } } }
				}
			}
		}
	}
}`;

// Static fallback so the build never fails when the API or token is unavailable.
const fallback: PinnedRepo[] = openSource.map((repo) => ({
	name: repo.name,
	description: repo.description,
	href: repo.href,
	stars: 0,
	forks: 0,
	topics: [],
}));

export async function getPinnedRepos(): Promise<PinnedRepo[]> {
	const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
	if (!token) {
		console.warn('[github] GITHUB_TOKEN not set, using fallback pinned repositories.');
		return fallback;
	}

	try {
		const res = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				'User-Agent': 'portfolio-build',
			},
			body: JSON.stringify({ query, variables: { login } }),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		const nodes = json?.data?.user?.pinnedItems?.nodes;
		if (!Array.isArray(nodes) || nodes.length === 0) throw new Error(json?.errors?.[0]?.message ?? 'no pinned items');

		return nodes.map((n: any): PinnedRepo => ({
			name: n.name,
			description: n.description ?? '',
			href: n.url,
			stars: n.stargazerCount,
			forks: n.forkCount,
			language: n.primaryLanguage ?? undefined,
			topics: n.repositoryTopics.nodes.map((t: any) => t.topic.name),
			homepage: n.homepageUrl || undefined,
		}));
	} catch (err) {
		console.warn(`[github] Failed to fetch pinned repositories (${(err as Error).message}), using fallback.`);
		return fallback;
	}
}
