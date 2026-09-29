import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  // Un build de producción que apunte a localhost se vería bien al desplegar pero no funcionaría:
  // mejor fallar aquí con instrucciones
  if (command === 'build' && mode === 'production') {
    const apiUrl = loadEnv(mode, __dirname, 'VITE_').VITE_API_URL;
    if (!apiUrl || /localhost|127\.0\.0\.1/.test(apiUrl)) {
      throw new Error(
        'Falta VITE_API_URL para el build de producción (o apunta a localhost).\n' +
        'Copia frontend/.env.production.example a frontend/.env.production y pon la URL de tu API en Cloud Run,\n' +
        'o corre: VITE_API_URL=https://<tu-servicio>.run.app npm run build',
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
