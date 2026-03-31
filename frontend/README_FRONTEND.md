# Frontend - Oficina Virtual Dashboard

## 📋 Descripción

Interfaz Next.js moderna para la Oficina Virtual con 3 áreas principales:
1. **Input**: Formulario para enviar tareas
2. **Live Feed**: Chat en tiempo real de eventos WebSocket
3. **Output**: Panel con resultado final

## 🏗️ Estructura del Proyecto

```
frontend/
├── app/                      # App Router (Next.js 14)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página raíz
│   ├── globals.css          # Estilos globales
│   └── favicon.ico
├── components/              # Componentes React
│   ├── Dashboard.tsx        # Componente principal
│   ├── TaskInput.tsx        # Formulario de entrada
│   ├── LiveFeed.tsx         # Chat en tiempo real
│   └── Output.tsx           # Panel de resultado
├── hooks/                   # Custom hooks
│   └── useWebSocket.ts      # Hook para WebSocket con reconexión
├── store/                   # Zustand stores
│   └── taskStore.ts         # State management
├── lib/                     # Utilidades
│   ├── constants.ts         # Configuración de agentes, URLs
│   └── api.ts               # Funciones de API
├── types/                   # TypeScript types
│   └── index.ts             # Interfaces y tipos
├── package.json             # Dependencias
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── next.config.js           # Next.js config
└── .env.example             # Ejemplo de variables de entorno
```

## 📦 Dependencias Principales

- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Zustand** - State management ligero
- **WebSocket API** - Comunicación en tiempo real

## 🎨 Características

### Dashboard
- Layout responsive (móvil, tablet, desktop)
- Tema oscuro profesional
- Indicador de estado de conexión WebSocket
- Gestión de errores

### TaskInput
- Formulario con validación
- Campos: título, descripción, prioridad
- Feedback visual de carga
- Mensajes de error claros

### LiveFeed
- Chat en tiempo real de eventos
- Colores y avatares únicos por agente:
  - 👨‍💼 Manager (Verde)
  - 👨‍💻 Especialista (Azul)
  - ✅ QA (Ámbar)
  - 🌐 Gateway (Púrpura)
- Auto-scroll al último evento
- Timestamps localizados
- Indicador de conexión

### Output
- Muestra información de la tarea
- Estados: Pendiente, Procesando, Completada, Error
- Renderización de resultados
- Estadísticas de eventos

## 🔌 WebSocket Integration

### useWebSocket Hook
```typescript
const { status, isConnected, send, disconnect } = useWebSocket({
  url: "ws://localhost:8000/ws",
  onMessage: (event) => { /* handle event */ },
  onConnect: () => { /* handle connection */ },
  onDisconnect: () => { /* handle disconnection */ },
  onError: (error) => { /* handle error */ },
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
});
```

### Características
- Reconexión automática
- Manejo de errores robusto
- Keep-alive
- Sincronización de estado

## 📊 State Management (Zustand)

### useTaskStore
```typescript
const {
  currentTask,
  tasks,
  events,
  isLoading,
  error,
  createTask,
  addEvent,
  setCurrentTask,
  // ... más acciones
} = useTaskStore();
```

## 🎯 API Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | `/api/task` | Crear tarea |
| GET | `/api/task/:id` | Obtener estado |
| GET | `/api/tasks` | Listar tareas |
| GET | `/ws` | WebSocket stream |

## 🚀 Desarrollo Local

### Instalación
```bash
cd frontend
npm install
```

### Variables de Entorno
```bash
cp .env.example .env.local
# Editar .env.local con valores correctos
```

### Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

## 🎨 Tema y Estilos

### Paleta de Colores
- **Fondo**: `#0f172a` (Slate-900)
- **Cards**: `#1e293b` (Slate-800)
- **Borders**: `#334155` (Slate-700)
- **Text**: `#e2e8f0` (Slate-200)

### Agentes
- **Manager**: `#10b981` (Emerald)
- **Especialista**: `#3b82f6` (Blue)
- **QA**: `#f59e0b` (Amber)
- **Gateway**: `#8b5cf6` (Purple)

### Tailwind CSS
Custom utilities:
- `.glass-effect` - Efecto glass-morphism
- `.text-gradient` - Texto con gradiente
- `.animate-slide-in` - Animación de entrada

## 📱 Responsive Design

- **Mobile First**: Optimizado para móviles
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- **Grid Layout**: Adaptativo con CSS Grid

## 🔐 Security

- Content Security Policy headers
- CORS habilitado desde Gateway
- Validación de inputs
- Error handling seguro
- No almacenamiento de credenciales

## 🧪 Testing

Estructura lista para:
- Unit tests con Jest
- E2E tests con Cypress/Playwright
- Visual tests

## 📚 Documentación

- Types: `types/index.ts`
- Constants: `lib/constants.ts`
- API: `lib/api.ts`
- Hooks: `hooks/useWebSocket.ts`

## 🐳 Docker

```dockerfile
FROM node:20-alpine AS builder
# ... (multi-stage build en Dockerfile)
```

## 🚀 Deployment

Optimizado para:
- Vercel (recomendado para Next.js)
- Docker
- Self-hosted

---

**Stack**: Next.js 14 • React 18 • TypeScript • Tailwind CSS • Zustand • WebSocket
