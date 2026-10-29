# Foxcite CLI

[![npm version](https://badge.fury.io/js/@foxcite%2Fcli.svg)](https://badge.fury.io/js/@foxcite%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official command-line interface for [Foxcite](https://foxcite.com). Run AI search visibility scans, see which brands and pages AI engines cite, and pull fix-it playbooks into your project, from your terminal, CI or AI agent.

## Installation

```bash
npm install -g @foxcite/cli
```

## Authentication

Create an API key in the [Foxcite dashboard](https://app.foxcite.com/api-keys) and set it as `FOXCITE_API_KEY`, either in your shell or in your project's `.env` file:

```bash
export FOXCITE_API_KEY=fc_live_your_actual_key_here
```

Keep the key out of git. The CLI reads `.env` from the folder you run it in.

## Quick start

Run these in your project folder:

```bash
foxcite init      # creates foxcite.json (and .env if missing)
foxcite status    # checks the connection and lists your brands
foxcite link      # ties this project to one of your brands
foxcite audit --query "best project management software"
foxcite pull      # saves playbooks to .foxcite/playbooks/
```

Edit `foxcite.json` after `init` to set your brand's `name`, `domain` and `niche`.

## Commands

| Command | What it does |
| --- | --- |
| `foxcite init` | Creates `foxcite.json` with placeholder brand details, and adds `FOXCITE_API_KEY` to `.env`. |
| `foxcite status` | Checks your API key and lists the brands in your account. |
| `foxcite link` | Links the project to a brand and saves its ID in `foxcite.json`. Prompts you to pick one, or pass `--brand-id <uuid> --domain <domain>`. |
| `foxcite audit` | Starts a scan for one query: `--query "<question>"`, or `default_query` from `foxcite.json`. Results appear in the dashboard. |
| `foxcite pull` | Downloads the linked brand's playbooks as Markdown into `.foxcite/playbooks/`. |
| `foxcite keywords` | Lists the linked brand's tracked queries and their intent. |
| `foxcite export` | Exports tracked queries and metrics to CSV: `--output <file>` (default `keywords_export.csv`). |

### Global options

- `--json`: prints raw JSON instead of formatted output, for agents and CI. In this mode `link` needs `--brand-id` and `--domain`, since it can't prompt.
- `--version`, `--help`

## Credits

Scans draw on your Foxcite credit balance, per engine: 2 credits each for ChatGPT, Claude and Gemini, 4 for Perplexity and Google AI Overviews, and 6 for Grok. Check your balance and buy more in the [dashboard](https://app.foxcite.com/billing).

## CI and agents

Set `FOXCITE_API_KEY` as a secret and use `--json`:

```bash
foxcite --json status
foxcite --json audit --query "best project management software"
```

## Self-hosted Foxcite

The CLI talks to `https://api.foxcite.com` by default. To use your own deployment, set `FOXCITE_API_URL`:

```bash
export FOXCITE_API_URL=https://foxcite-api.example.com
```

## Contributing

1. Clone the repository: [github.com/foxciteai/cli](https://github.com/foxciteai/cli)
2. Install dependencies: `npm install`
3. Run the development build: `npm run dev -- <command>`

## Resources

- [Homepage](https://foxcite.com)
- [Dashboard](https://app.foxcite.com)
- [GitHub repository](https://github.com/foxciteai/cli)
