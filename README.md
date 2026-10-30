# Luca Argentieri — Portfolio

Personal site of Luca Argentieri, Senior Frontend Developer.
Live at **https://lucaargentieri.github.io**

Built with [Astro](https://astro.build), Tailwind CSS 4 and Geist fonts, deployed to GitHub Pages.

## Preview

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ╭─────╮                                              ( ☀ )  │
│   │ :-) │                                                    │
│   ╰─────╯                                                    │
│                                                              │
│   Luca Argentieri                                            │
│   Senior Frontend Developer                                  │
│                                                              │
│   I develop web interfaces for diverse clients, with a       │
│   strong focus on performance and accessibility.             │
│   Solid experience with modern libraries, frameworks and     │
│   CMS platforms, including Shopify e-commerce.               │
│                                                              │
│   EXPERIENCE                                                 │
│   ────────────────────────────────────────────────────────   │
│   Display Design Studio                         2021 — Present│
│   Frontend Developer                                         │
│                                                              │
│   PROJECTS                                                   │
│   ────────────────────────────────────────────────────────   │
│   Gimatic  B2B Website                                       │
│   Universal Music Italia: Shop Online                        │
│   Alessi  E-commerce Development                             │
│   Politecnico di Milano (7 Departments)                      │
│   Acqua Fiuggi  Frontend & CMS                               │
│                                                              │
│   OPEN SOURCE · PINNED ON GITHUB                             │
│   ┌───────────────────────────┐ ┌───────────────────────────┐│
│   │ gsap-nuxt-module          │ │ nuxt-starter              ││
│   │ GSAP module for Nuxt.     │ │ Nuxt 4 full-stack starter ││
│   │ [gsap] [nuxt] [nuxt3]     │ │ [nuxt] [sanity]           ││
│   │ ● Vue            ★ 37     │ │ ● TypeScript              ││
│   └───────────────────────────┘ └───────────────────────────┘│
│   ┌───────────────────────────┐ ┌───────────────────────────┐│
│   │ firmereferendum-bot       │ │ vite-plugin-shopify-theme ││
│   │ Telegram referendum bot   │ │ Vite plugin for Shopify   ││
│   │ [telegram] [italia]       │ │ [hmr] [liquid] [shopify]  ││
│   │ ● TypeScript              │ │ ● TypeScript              ││
│   └───────────────────────────┘ └───────────────────────────┘│
│                                                              │
│   ──────────────────────────────────────────────────────     │
│                  email   github   linkedin                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Pinned repositories

The *Open source* section shows the repositories pinned on the GitHub profile.
They are fetched at build time from the GitHub GraphQL API (`src/lib/github.ts`) using `GITHUB_TOKEN`.
If the token or the API is unavailable, the build falls back to the static list in `src/data/site.ts`.
A scheduled workflow rebuilds the site daily so pins stay in sync.

## Project structure

```text
/
├── public/               favicons, og-image, robots.txt, manifest
├── src/
│   ├── components/       Header, Experience, Projects, OpenSource, Writing, Footer, ThemeToggle
│   ├── data/site.ts      profile, experience, projects, fallback repos
│   ├── layouts/          Layout.astro (SEO meta, theme, skip link)
│   ├── lib/github.ts     pinned repos fetch
│   ├── pages/index.astro
│   └── styles/global.css design tokens, light/dark themes
└── .github/workflows/    GitHub Pages deploy
```

## Commands

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `bun install`   | Install dependencies                        |
| `bun dev`       | Start the dev server at `localhost:4321`    |
| `bun build`     | Build the production site to `./dist/`      |
| `bun preview`   | Preview the build locally                   |

Set `GITHUB_TOKEN` in your environment to fetch the real pinned repositories locally.
