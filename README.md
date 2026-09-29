# Andy AI — tu mentora de pintura con IA

Andy AI ayuda a personas que aprenden a dibujar y pintar:

1. Detecta tu nivel (lo eliges o subes una obra para que la IA lo estime).
2. Genera un reto según tu nivel, técnica (acuarela, óleo, pasteles…) y tema, con búsquedas de YouTube para aprender.
3. Evalúa la foto de tu obra en proporciones, composición, color, volumen y luz, con una calificación de 0 a 5 y un puntaje por criterio.
4. Guarda tu historial en **Mi progreso**: galería de obras, racha de días y evolución de tus calificaciones (solo en tu navegador).

## Arquitectura

```
React + Vite + Tailwind v4 + shadcn/ui (frontend/)  ──fetch──▶  FastAPI (api/)  ──▶  Gemini en Vertex AI
                    :5173                                          :8000
```

Las credenciales de Google Cloud viven solo en la API; el navegador nunca habla directo con Gemini.

Los componentes de interfaz están en `frontend/components/ui/` (shadcn/ui, sobre Radix) y los colores y tipografías en los tokens de `frontend/styles.css`. Para agregar otro componente: `npx shadcn@latest add <nombre>` desde `frontend/`.

## Requisitos

- **Node.js 20+** y npm
- **Python 3.11+**
- **[Google Cloud CLI](https://cloud.google.com/sdk/docs/install)** con un proyecto que tenga habilitada la API de Vertex AI

## Cómo correr la aplicación

### 1. Credenciales de Google Cloud (una sola vez)

```bash
gcloud auth application-default login
```

### 2. API (Python)

```bash
cd api
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env               # Windows: copy .env.example .env
```

Edita `api/.env` y pon el ID de tu proyecto en `GOOGLE_CLOUD_PROJECT`.

### 3. Frontend (Node)

Desde la raíz del repositorio:

```bash
npm install
```

Opcional: si la API no corre en `http://localhost:8000`, copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL`.

### 4. Arrancar todo

Desde la raíz (no hace falta activar el entorno virtual: el script usa `api/.venv` directamente):

```bash
npm run dev
```

Esto levanta la API en http://localhost:8000 y el frontend en http://localhost:5173.
También puedes arrancarlos por separado con `npm run dev-api` y `npm run dev-frontend`.

Para comprobar que la API responde: http://localhost:8000/health debe devolver `{"status":"ok"}`.

## Pruebas y verificación

```bash
cd api && pytest                      # tests de la API
npm run typecheck --prefix frontend   # tipos de TypeScript
npm run build --prefix frontend       # build de producción
```

## Variables de entorno

| Archivo | Variable | Descripción |
|---|---|---|
| `api/.env` | `GOOGLE_CLOUD_PROJECT` | ID de tu proyecto de Google Cloud (obligatoria) |
| `api/.env` | `GOOGLE_CLOUD_LOCATION` | Región de Vertex AI (por defecto `us-central1`) |
| `api/.env` | `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma (por defecto `http://localhost:5173`; cada `localhost` también permite `127.0.0.1`) |
| `frontend/.env` | `VITE_API_URL` | URL de la API (por defecto `http://localhost:8000`) |

## Problemas comunes

Primero abre http://localhost:8000/health: si responde `{"status":"ok"}`, la API está corriendo.

- **"No se pudo conectar con la API"**: la API no está corriendo o el navegador la bloqueó.
  - Revisa las líneas `[api]` de la terminal de `npm run dev`.
  - `Address already in use`: otro proceso usa el puerto 8000. En macOS/Linux: `lsof -i :8000` y `kill <PID>`.
  - `No se encontró el entorno virtual`: crea `api/.venv` como en el paso 2.
  - `incompatible architecture (have 'arm64', need 'x86_64')` (Mac con Apple Silicon): tu Node es la versión para Intel y corre bajo Rosetta. `npm run dev-api` ya lo detecta y arranca la API como arm64; la solución de fondo es instalar Node para Apple Silicon (`node -p process.arch` debe decir `arm64`). Mientras tanto también puedes correr la API aparte: `cd api && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000`.
  - Si /health responde pero la app no, abre la consola del navegador (F12). Un error de CORS significa que la página está en un origen no permitido: ábrela en http://localhost:5173 o agrega su URL a `ALLOWED_ORIGINS`.
- **"Tu proyecto de Google Cloud no tiene la facturación activada"**: Vertex AI exige billing. Actívalo en https://console.cloud.google.com/billing y espera unos minutos.
- **"Faltan credenciales de Google Cloud"**: corre `gcloud auth application-default login`.
- **"Habilita Vertex AI en tu proyecto"**: `gcloud services enable aiplatform.googleapis.com --project <tu-proyecto>`.
- **"Falta GOOGLE_CLOUD_PROJECT"**: crea `api/.env` a partir de `api/.env.example` y llena el ID del proyecto.
- **"No se pudo generar el reto" / 502**: error inesperado de Gemini; el detalle aparece en la terminal, en las líneas `[api]` después de `Falló /challenge`.
