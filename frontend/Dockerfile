# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/main.py .

# Copy built frontend to a directory the backend can serve or proxy
COPY --from=frontend-build /app/dist /app/static

# Expose port 8080
EXPOSE 8080

# Run the FastAPI app
CMD ["python", "main.py"]
