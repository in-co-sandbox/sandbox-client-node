#!/usr/bin/env node
// Publishes api-endpoints and api-client-core pinned to one API host, for Sandbox's own dev and uat services.
// These builds go to the internal registry only; npm gets the unpinned build from the publish workflow.
//
//   node scripts/publish-internal.mjs <version> <host> <registry>
//   node scripts/publish-internal.mjs 2.0.0-dev https://<dev api host> https://<internal registry>/
//
// The version's prerelease id (dev, uat) is the dist-tag. Sign in to the registry in ~/.npmrc first.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [version, host, registry] = process.argv.slice(2);
if (!version?.includes('-') || !host || !registry) {
    process.stderr.write('Usage: node scripts/publish-internal.mjs <version>-<env> <host> <registry>\n');
    process.exit(1);
}

const hostFile = 'packages/libs/api-endpoints/src/endpoint/host.ts';
const manifests = ['packages/libs/api-endpoints/package.json', 'packages/libs/api-client-core/package.json'];
const filters = ['--filter', '@in-co-sandbox/api-endpoints', '--filter', '@in-co-sandbox/api-client-core'];
const originals = new Map([hostFile, ...manifests].map((file) => [file, readFileSync(file, 'utf8')]));
const run = (args) => execFileSync('pnpm', args, { stdio: 'inherit', shell: process.platform === 'win32' });

try {
    writeFileSync(hostFile, `export const HOST: string = '${host}';\n`);
    for (const file of manifests) {
        const manifest = JSON.parse(originals.get(file));
        manifest.version = version;
        writeFileSync(file, `${JSON.stringify(manifest, null, 4)}\n`);
    }
    run(['-r', ...filters, 'run', 'build']);
    // workspace:* publishes core with an exact api-endpoints version, so core@<version> always gets this host.
    run(['-r', ...filters, 'publish', '--registry', registry, '--tag', version.split('-')[1], '--no-git-checks']);
} finally {
    for (const [file, contents] of originals) writeFileSync(file, contents);
}
