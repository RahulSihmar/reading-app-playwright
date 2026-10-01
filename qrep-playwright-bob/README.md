# Still / Becoming — reflective reading app

A responsive React reading experience with ten original short essays about attention, perspective, everyday life, and stillness. The writing is original and is not attributed to Osho; it does not reproduce or imitate his writing.

## Start locally

From this directory:

```sh
pnpm install
pnpm run dev
```

Open **http://127.0.0.1:4173**. If the port is already occupied, stop the older app process with `Ctrl+C` in its terminal, then retry.

## Browse the ten pages

- Use the **Go to page** dropdown in the header.
- Use **Choose a reflection** or **Next reflection** below each article.
- On small screens, tap **Explore** to open the responsive navigation.
- Tap **Summon a ghost** for a brief CSS-only playful effect.

## Test and build

```sh
pnpm test
pnpm run test:headed
pnpm run build
pnpm exec playwright show-report
```

Playwright verifies article navigation, all ten routes, the click effect, and a narrow mobile viewport. Keep the Vite development server running in one terminal before starting the browser tests in a second terminal.

## IBM Bob / Playwright MCP

The `.bob/mcp_servers.json` example remains available for connecting IBM Bob to Playwright MCP. Bob can navigate the local app to inspect its accessibility tree and exercise the reading controls.

The earlier Q Replication test-case catalog remains in [docs/test-cases.md](./docs/test-cases.md) as a separate planning reference. This reading app does not connect to Db2 or test Q Replication.
