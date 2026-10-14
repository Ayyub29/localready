/** True when corridor packs / situations must be loaded from bundled JSON (Cloudflare Workers). */
let cachedUseBundled: boolean | null = null;

export async function isBundledContentMode(): Promise<boolean> {
  if (process.env.LOCALREADY_BUNDLED_CONTENT === "1") return true;
  if (process.env.LOCALREADY_BUNDLED_CONTENT === "0") return false;
  if (cachedUseBundled !== null) return cachedUseBundled;
  try {
    const { stat } = await import("node:fs/promises");
    await stat(process.cwd());
    cachedUseBundled = false;
  } catch {
    cachedUseBundled = true;
  }
  return cachedUseBundled;
}
