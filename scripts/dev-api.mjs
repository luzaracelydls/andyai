// Arranca la API de FastAPI con el Python del entorno virtual (api/.venv),
// para que `npm run dev` funcione sin tener que activarlo antes.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'api');
const isWindows = process.platform === 'win32';
const python = path.join(apiDir, '.venv', isWindows ? 'Scripts/python.exe' : 'bin/python');
const port = process.env.API_PORT ?? '8000';

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

const child = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', port], {
  cwd: apiDir,
  stdio: 'inherit',
});
child.on('exit', code => process.exit(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
