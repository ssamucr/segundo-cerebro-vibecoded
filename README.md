# Segundo Cerebro

Sistema personal de productividad para gestionar objetivos, proyectos, tareas y notas. Construido en **un día** mediante **vibecoding** — código generado 100% con IA (GitHub Copilot) sin escribir una sola línea a mano.

## ¿Qué es vibecoding?

Vibecoding es una práctica donde el desarrollador describe lo que quiere en lenguaje natural y la IA genera el código. El humano dirige, la IA construye. Este proyecto es una demostración de hasta dónde se puede llegar en un día con esa metodología.

## Stack

**Backend**
- Python 3.8 + FastAPI + Uvicorn
- Turso (SQLite distribuido en la nube vía libsql)
- Clerk (autenticación JWT)
- Pydantic v2

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Clerk (autenticación)

## Funcionalidades

- **Objetivos** — define metas con deadline, estado y criterios de aceptación
- **Criterios de aceptación** — condiciones verificables por objetivo
- **Proyectos** — agrupa trabajo bajo un objetivo; máquina de estados (`backlog → in_progress → stopped/completed`)
- **Tareas** — unidades de trabajo dentro de un proyecto, con dificultad y duración estimada
- **Notas** — espacio libre de conocimiento personal
- **Progress** — cálculo ponderado de avance por objetivo (40% criterios + 60% proyectos)

## Estructura

```
segundo-cerebro/
├── backend/
│   ├── app/
│   │   ├── auth/        # Validación JWT con Clerk
│   │   ├── db/          # Conexión Turso + migraciones
│   │   ├── models/      # Schemas Pydantic
│   │   └── routers/     # Endpoints REST
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/    # Clientes HTTP por entidad
│   │   ├── hooks/       # React hooks de datos
│   │   └── types/
│   └── .env.example
└── SETUP.md             # Instrucciones de instalación
```

## Instalación rápida

Ver [SETUP.md](./SETUP.md) para instrucciones completas.

```bash
# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
# Copiar .env.example → .env y rellenar credenciales
$env:PYTHONPATH = "$PWD"; python -m uvicorn app.main:app --port 8000

# Frontend
cd frontend
npm install
# Copiar .env.example → .env y rellenar credenciales
npm run dev
```

## Variables de entorno

**`backend/.env`**
```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8000
```

---

*Construido en 1 día · Vibecoding con GitHub Copilot*
