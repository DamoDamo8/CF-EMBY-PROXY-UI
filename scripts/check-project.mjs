import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const frontendDirectory = path.join(repositoryRoot, 'frontend');
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const requiredChecks = [
  {
    name: 'Worker syntax',
    command: process.execPath,
    args: ['--check', 'worker.js'],
    cwd: repositoryRoot
  },
  {
    name: 'Worker defensive boundaries',
    command: process.execPath,
    args: ['--test', 'tests/worker-defensive-boundaries.test.mjs'],
    cwd: repositoryRoot
  },
  {
    name: 'Admin runtime composition',
    command: npmExecutable,
    args: ['run', 'check:admin-runtime'],
    cwd: frontendDirectory
  },
  {
    name: 'Release CDN paths',
    command: npmExecutable,
    args: ['run', 'check:cdn'],
    cwd: frontendDirectory
  },
  {
    name: 'Git diff whitespace',
    command: 'git',
    args: ['diff', '--check'],
    cwd: repositoryRoot
  }
];

for (const check of requiredChecks) {
  console.log(`\n[check-project] ${check.name}`);
  const completed = spawnSync(check.command, check.args, {
    cwd: check.cwd,
    stdio: 'inherit',
    shell: false
  });
  if (completed.error) throw completed.error;
  if (completed.status !== 0) {
    process.exit(completed.status || 1);
  }
}

console.log('\n[check-project] all checks passed');
