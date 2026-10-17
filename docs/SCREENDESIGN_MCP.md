# ScreensDesign MCP (design research)

LocalReady does not ship UI mockups in git. For competitor flows and real app screens, use [ScreensDesign](https://screensdesign.com/) via MCP (Pro subscription).

## Connect in Cursor (you must sign in)

1. This repo includes `.cursor/mcp.json` with the hosted server URL.
2. In Cursor: **Settings → MCP** (or **Customize → MCP**). Ensure **screensdesign** appears; if it shows **Needs authentication**, click **Connect** and complete browser OAuth with your ScreensDesign Pro account.
3. Start a **new** chat (or refresh MCP) so tools load.
4. Optional companion skill (research prompts / citations):

   ```bash
   npx skills@latest add screensdesign-com/screensdesign-agent-skill --skill screensdesign-data -a cursor -y
   ```

Server URL (Streamable HTTP):

```text
https://api.screensdesign.com/v1/mcp
```

## Cloud Agents

This agent **cannot** complete OAuth for you. Add the same MCP server in your [Cloud Agent environment](https://cursor.com/dashboard/cloud-agents) MCP settings (if available), authenticate in the browser when prompted, then re-run the agent.

## Example prompts (after connect)

- Pull Duolingo’s streak / lesson flow screens in order.
- Compare paywalls in three language-learning apps with revenue context.
- Find trip / destination onboarding patterns (e.g. Wanderlog-style home).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| HTTP 401 | Finish OAuth in Cursor MCP panel |
| Tools missing | New chat or MCP restart |
| 429 | Rate limit; wait and retry |

See [ScreensDesign connection docs](https://github.com/screensdesign-com/screensdesign-agent-skill/blob/main/screensdesign-data/references/connection.md).
