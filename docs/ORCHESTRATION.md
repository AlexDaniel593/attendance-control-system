# 🔄 Orquestación de APIs

## Descripción General

Este sistema implementa una arquitectura de orquestación que permite consumir múltiples APIs externas de forma centralizada, manteniendo la arquitectura limpia y facilitando el cambio entre implementaciones Mock y APIs reales.

## 📐 Arquitectura

```
┌─────────────┐
│  Frontend   │
│ (Next.js)   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│   Orchestrator   │ ◄── /api/orchestrator/route.ts
│  (Next.js API)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Use Cases      │ ◄── Application Layer
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Repositories    │ ◄── Infrastructure Layer
│  (Mock o API)    │
└──────┬───────────┘
       │
       ▼ (si USE_REAL_API=true)
┌──────────────────┐
│  API Clients     │ ◄── HTTP Clients
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  APIs Externas   │ ◄── Docker Containers
│  (Flask/Python)  │
└──────────────────┘
```

## 🗂️ Estructura de Archivos

```
src/
├── app/api/orchestrator/
│   └── route.ts                     # Endpoint de orquestación
├── application/use-cases/
│   ├── GetAllPausasUseCase.ts
│   ├── CreatePausaUseCase.ts
│   └── ...
├── domain/
│   ├── entities/
│   │   └── Pausa.ts                 # Modelo de dominio
│   └── interfaces/
│       └── IPausaRepository.ts      # Contrato del repositorio
└── infrastructure/
    ├── config/
    │   └── api.config.ts            # URLs de las APIs
    ├── api-clients/
    │   ├── base/
    │   │   └── BaseApiClient.ts     # Cliente HTTP base
    │   └── TiemposFueraApiClient.ts # Cliente de API pausas
    └── repositories/
        ├── MockPausaRepository.ts   # Implementación Mock
        └── ApiPausaRepository.ts    # Implementación API Real
```

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` basado en `.env.local.example`:

### 2. Cambiar entre Mock y API Real

Para usar datos **Mock** (desarrollo sin dependencias):
```env
USE_REAL_API_PAUSAS=false
```

Para usar la **API real** (requiere contenedor Docker corriendo):
```env
USE_REAL_API_PAUSAS=true
```

# API TIEMPOS FUERA

## 🔄 Mapeo de Datos

### Modelo de Dominio → API Externa

| Domain (Pausa)     | API (pausas)     |
|--------------------|------------------|
| `id`               | `id`             |
| `estado`           | `tipo`           |
| `subEstado`        | `sub_tipo`       |
| `observacion`      | `observacion`    |
| `empleadosIds[]`   | `empleado_id`    |
| `fechaPausa`       | `fecha`          |
| `horaInicio`       | `hora_inicio`    |
| `horaFin`          | `hora_fin`       |

**Nota:** La API retorna un empleado por pausa. Al crear, se pueden enviar múltiples empleados y la API crea múltiples registros.

## 🧩 Componentes Principales

### 1. BaseApiClient
Cliente HTTP reutilizable con métodos `get()`, `post()`, `put()`, `delete()`.

### 2. TiemposFueraApiClient
Cliente específico que consume los endpoints de la API de pausas.

```typescript
const client = new TiemposFueraApiClient();
const pausas = await client.getPausas({ fecha_inicio: '2024-05-01' });
```

### 3. ApiPausaRepository
Implementa `IPausaRepository` consumiendo la API real.

```typescript
const repo = new ApiPausaRepository();
const pausas = await repo.getAll();
```

### 4. Orchestrator
Endpoint Next.js que orquesta las llamadas usando los casos de uso.

## 🔮 Futuras APIs

El sistema está preparado para integrar 4 APIs adicionales:

1. **Personal** - Puerto 5001 (pendiente)
2. **Turnos** - Puerto 5002 (pendiente)
3. **Recesos** - Puerto 5003 (pendiente)
4. **Firmas** - Puerto 5005 (pendiente)

Para agregar una nueva API:

1. Crear cliente en `api-clients/NombreApiClient.ts`
2. Crear repositorio en `repositories/ApiNombreRepository.ts`
3. Agregar endpoints en `api.config.ts`
4. Actualizar orchestrator en `route.ts`
5. Agregar variable `USE_REAL_API_NOMBRE` en `.env.local`

## ✅ Ventajas de esta Arquitectura

- ✨ **Desarrollo sin dependencias**: Usa Mock data cuando las APIs no están disponibles
- 🔄 **Fácil cambio**: Alterna entre Mock y API real con una variable de entorno
- 🎯 **Arquitectura limpia**: Separa dominio, aplicación e infraestructura
- 🧪 **Testeable**: Los repositorios son fáciles de mockear en tests
- 📦 **Escalable**: Agregar nuevas APIs sigue el mismo patrón
- 🔌 **Desacoplado**: El frontend no conoce los detalles de las APIs externas

## 🐛 Debugging

Para ver qué fuente de datos está usando:

```typescript
const response = await fetch('/api/orchestrator?resource=pausas');
const data = await response.json();
console.log(data.source); // "API Real (Puerto 5004)" o "Mock Data"
```

## 📝 Notas Técnicas

- El orchestrator se ejecuta en el **servidor** (Next.js API Routes)
- Los API Clients hacen llamadas HTTP desde el servidor a las APIs externas
- La autenticación de usuario (TODO) debe pasar el contexto al repositorio
- Los errores de red se capturan y se retornan como respuestas JSON
