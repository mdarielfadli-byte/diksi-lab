/**
 * Database access is intentionally unconfigured in the Vercel deployment.
 * Add a Vercel-compatible adapter and environment variables here when durable
 * application data is introduced.
 */
export function getDb(): never {
  throw new Error("Database access has not been configured for this deployment.");
}
