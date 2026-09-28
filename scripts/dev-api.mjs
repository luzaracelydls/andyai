// Arranca la API de FastAPI con el Python del entorno virtual (api/.venv),
// para que `npm run dev` funcione sin tener que activarlo antes.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'api');
const isWindows = process.platform === 'win32';
const python = path.join(apiDir, '.venv', isWindows ? 'Scripts/python.exe' : 'bin/python');
const port = process.env.API_PORT ?? '8000';

// En una Mac con Apple Silicon, un Node de Intel corre bajo Rosetta (x86_64) y el Python
// que lance hereda esa arquitectura, pero el venv se instaló como arm64:
// "incompatible architecture (have 'arm64', need 'x86_64')".
// ANDY_FORCE_ROSETTA=1 simula este caso para probarlo en otras máquinas.
function runningUnderRosetta() {
  if (process.env.ANDY_FORCE_ROSETTA === '1') return true;
  if (process.platform !== 'darwin') return false;
  try {
    return execFileSync('/usr/sbin/sysctl', ['-n', 'sysctl.proc_translated'], { encoding: 'utf8' }).trim() === '1';
  } catch {
    return false; // Mac Intel: la variable no existe
  }
}

if (!existsSync(python)) {
  const activate = isWindows ? '.venv\\Scripts\\activate' : 'source .venv/bin/activate';
  console.error(`No se encontró el entorno virtual de la API (${python}).
Créalo una sola vez con:

  cd api
  python3 -m venv .venv
  ${activate}
  pip install -r requirements-dev.txt
`);
  process.exit(1);
}

let command = python;
let args = ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', port];
if (runningUnderRosetta()) {
  console.log('Node corre bajo Rosetta (x86_64); iniciando la API como arm64. ' +
    'Recomendado: instalar Node para Apple Silicon (nodejs.org, "macOS Installer (ARM64)").');
  args = ['-arm64', command, ...args];
  command = '/usr/bin/arch';
}

// ANDY_DEV_API_DRY_RUN=1 solo muestra el comando, sin ejecutarlo (para pruebas)
if (process.env.ANDY_DEV_API_DRY_RUN === '1') {
  console.log([command, ...args].join(' '));
  process.exit(0);
}

const child = spawn(command, args, { cwd: apiDir, stdio: 'inherit' });
child.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
