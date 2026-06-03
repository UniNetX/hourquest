export const SHUTDOWN_PATH = "/shutdown";

/** Set SITE_SHUTDOWN=false in env to reopen the site without redeploying. */
export function isSiteShutdown(): boolean {
  return process.env.SITE_SHUTDOWN !== "false";
}
