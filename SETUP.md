# Segundo Cerebro — Instrucciones de arranque

## Requisitos previos

- Python 3.8 (con el `.venv` ya creado en `backend/`)
- Node.js 22+
- Variables de entorno configuradas (ver secciones abajo)

---

## Variables de entorno

### Backend — `backend/.env`

```env
TURSO_DATABASE_URL=libsql://<tu-db>.turso.io
TURSO_AUTH_TOKEN=<tu-token>
CLERK_JWKS_URL=https://<tu-dominio>.clerk.accounts.dev/.well-known/jwks.json
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env.local`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

## Arrancar el backend

```powershell
# Desde la raíz del proyecto
$env:PYTHONPATH = "$PWD\backend"
backend\.venv\Scripts\python.exe -m uvicorn app.main:app `
  --reload `
  --port 8000 `
  --reload-dir backend
```

El servidor quedará disponible en **http://localhost:8000**.  
Documentación interactiva: **http://localhost:8000/docs**

---

## Arrancar el frontend

```powershell
# Desde la raíz del proyecto
npm run dev --prefix frontend
```

La app quedará disponible en **http://localhost:5173**.

---

## Arrancar ambos a la vez (dos terminales)

**Terminal 1 — Backend:**
```powershell
$env:PYTHONPATH = "$PWD\backend"
backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --reload-dir backend
```

**Terminal 2 — Frontend:**
```powershell
npm run dev --prefix frontend
```

---

## Instalar dependencias (primera vez)

### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cd ..
```

### Frontend
```powershell
cd frontend
npm install
cd ..
```
