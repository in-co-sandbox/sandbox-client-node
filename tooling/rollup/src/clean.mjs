#!/usr/bin/env node
import { rmSync } from 'node:fs';

// Run from the owning package. Generation owns its separate generated/ directory.
for (const directory of ['.build', 'dist']) {
    rmSync(directory, { recursive: true, force: true });
}
