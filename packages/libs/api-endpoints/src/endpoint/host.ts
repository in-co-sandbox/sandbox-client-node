/**
 * The API host this build is pinned to.
 *
 * Empty in the npm build, where the API key picks the host. `scripts/publish-internal.mjs` sets it for the
 * internal dev and uat builds.
 */
export const HOST: string = '';
