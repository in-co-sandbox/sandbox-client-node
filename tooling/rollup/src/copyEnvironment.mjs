#!/usr/bin/env node
import { cpSync } from 'node:fs';

cpSync('environment', 'dist/environment', { recursive: true });
