# China Auto Atlas

China Auto Atlas is an evidence-led automotive knowledge platform focused on China's automotive industry.

## Local development

Requirements:

- Node.js 24.x
- pnpm 11.5.2+
- Python 3.10+
- PyYAML from `requirements-dev.txt`

Install dependencies and validate the data:

```bash
pnpm install
python3 -m pip install -r requirements-dev.txt
pnpm data:validate
pnpm data:build
```

Start the application:

```bash
pnpm dev
```

Available checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

The application reads generated indexes from `build/`. YAML and Markdown under `data/` and `content/` remain the source
files and must not be imported directly by pages or components.

See `AGENTS.md` and `mvp-execution-plan.md` for contribution rules and the P0 execution sequence.
