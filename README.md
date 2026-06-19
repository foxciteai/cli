# Foxcite CLI

[![npm version](https://badge.fury.io/js/@foxcite%2Fcli.svg)](https://badge.fury.io/js/@foxcite%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official Command Line Interface for [Foxcite](https://foxcite.com). Manage your workspaces, trigger manual AEO audits, and measure your [ai search visibility](https://foxcite.com) and LLM citation gaps directly from your terminal.

## Installation

Install the CLI globally using npm:

```bash
npm install -g @foxcite/cli
```

## Authentication

Before using the CLI, you need to link it to your Foxcite account using an API Key generated from your [Dashboard](https://foxcite.com).

```bash
foxcite login
```
*You will be prompted to paste your API Key.*

## Common Commands

### Manage Brands
List all the brands currently tracked in your workspace:
```bash
foxcite brands list
```

### Run Audits
Trigger a quick AI visibility audit across ChatGPT, Claude, Gemini, Grok, and Perplexity:
```bash
foxcite audits run --domain "example.com" --query "best analytics tools"
```

### Tracked Queries
View the historical AI visibility performance for a specific brand:
```bash
foxcite queries view <brand-id>
```

## Advanced Usage & Dev Notes
The CLI is built using Commander.js and leverages the `@foxcite/sdk` under the hood. All API interactions are strictly typed. 

If you are running the CLI in a CI/CD environment (like GitHub Actions), you can bypass the `foxcite login` prompt by setting the environment variable directly:
```bash
export FOXCITE_API_KEY="seomd_live_..."
foxcite audits run --domain "example.com" --query "best tools"
```

## Contributing
1. Clone the repository: [https://github.com/foxciteai/cli](https://github.com/foxciteai/cli)
2. Install dependencies: `npm install`
3. Run the development build: `npm run dev -- <command>`

## Resources
- [Homepage](https://foxcite.com)
- [GitHub Repository](https://github.com/foxciteai/cli)
