# Andy AI — tu mentora de pintura con IA

Andy AI ayuda a personas que aprenden a dibujar y pintar:

1. Detecta tu nivel (lo eliges o subes una obra para que la IA lo estime).
2. Genera un reto según tu nivel, técnica (acuarela, óleo, pasteles…) y tema, con búsquedas de YouTube para aprender.
3. Evalúa la foto de tu obra en proporciones, composición, color, volumen y luz, con una calificación de 0 a 5.

## Arquitectura

```
React + Vite (frontend/)  ──fetch──▶  FastAPI (api/)  ──▶  Gemini en Vertex AI
       :5173                              :8000
```

Las credenciales de Google Cloud viven solo en la API; el navegador nunca habla directo con Gemini.

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

Con el entorno virtual de Python **activado**, desde la raíz:

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
| `api/.env` | `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma (por defecto `http://localhost:5173`) |
| `frontend/.env` | `VITE_API_URL` | URL de la API (por defecto `http://localhost:8000`) |

## Problemas comunes

- **"No se pudo conectar con la API"**: la API no está corriendo. Revisa la terminal de `npm run dev` y que el entorno virtual esté activado.
- **"No se pudo generar el reto" / 502**: revisa los logs de la API. Suele ser que falta `GOOGLE_CLOUD_PROJECT` en `api/.env` o que no corriste `gcloud auth application-default login`.
- **Error de CORS en el navegador**: agrega la URL del frontend a `ALLOWED_ORIGINS`.
