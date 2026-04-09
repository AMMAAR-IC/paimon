#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const exe = path.join(__dirname, 'paimon.exe');
const result = spawnSync(exe, process.argv.slice(2), { stdio: 'inherit' });
process.exit(result.status);