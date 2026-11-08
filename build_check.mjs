import { spawn } from 'child_process';

const child = spawn('npx', ['vite', 'build'], {
  cwd: 'E:\\ruan',
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  console.log('Exit code:', code);
  process.exit(code);
});