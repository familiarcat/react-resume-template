#!/usr/bin/env node

const { spawn } = require('child_process');

// Get the command to run
const args = process.argv.slice(2);
const command = args.join(' ');

if (!command) {
  console.error('No command specified');
  process.exit(1);
}

// Create the clean environment command
const cleanCommand = `bash scripts/clean-aws-env.sh ${command}`;

// Run the command
console.log(`Running with clean environment: ${command}`);

const child = spawn('bash', ['scripts/clean-aws-env.sh'].concat(args), {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
