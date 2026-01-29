# ✅ Orquestación de APIs - Implementación Completada

## 🎯 Resumen de Implementación

Se ha implementado exitosamente la orquestación de la API de **Tiempos Fuera (Pausas)** siguiendo la arquitectura limpia del proyecto.

## 📦 Archivos Creados

### Configuración
- ✅ `src/infrastructure/config/api.config.ts` - Configuración centralizada de URLs de APIs

### Clientes HTTP
- ✅ `src/infrastructure/api-clients/base/BaseApiClient.ts` - Cliente HTTP reutilizable
- ✅ `src/infrastructure/api-clients/TiemposFueraApiClient.ts` - Cliente específico para API de pausas

### Repositorios
- ✅ `src/infrastructure/repositories/ApiPausaRepository.ts` - Repositorio real que consume la API

### Orquestador
- ✅ `src/app/api/orchestrator/route.ts` - Actualizado con soporte para pausas (GET, POST, PUT, DELETE)

### Documentación
- ✅ `docs/ORCHESTRATION.md` - Documentación completa de la arquitectura
- ✅ `docs/API_TESTING.md` - Scripts de prueba y ejemplos
- ✅ `.env.local.example` - Plantilla de variables de entorno

## 🚀 Cómo Usar

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copiar el ejemplo
cp .env.local.example .env.local
```

Edita `.env.local`:
```env
# Para usar datos Mock (sin Docker)
USE_REAL_API_PAUSAS=false

# Para usar API real (requiere Docker en puerto 5004)
# USE_REAL_API_PAUSAS=true
# NEXT_PUBLIC_API_TIEMPOS_FUERA_URL=http://localhost:5004/api
```

### 2. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 3. Probar el Orchestrator

#### Desde el navegador:
```
http://localhost:3000/api/orchestrator?resource=pausas
```

#### Desde PowerShell:
```powershell
# Ver todas las pausas
Invoke-RestMethod -Uri "http://localhost:3000/api/orchestrator?resource=pausas"

# Buscar pausas por fecha
Invoke-RestMethod -Uri "http://localhost:3000/api/orchestrator?resource=pausas&query=2026-01-18"
```

## 🔄 Flujo de Datos

```
Frontend → Orchestrator → Use Case → Repository → API Client → API Externa (Puerto 5004)
                                    ↓
                                Mock Repository (si USE_REAL_API_PAUSAS=false)
```

## 📊 Endpoints Disponibles

### GET - Obtener pausas
```
GET /api/orchestrator?resource=pausas
GET /api/orchestrator?resource=pausas&query=2024-05-20
```

### POST - Crear pausa
```json
POST /api/orchestrator
{
  "resource": "pausas",
  "data": {
    "estado": "Almuerzo",
    "subEstado": "Comedor",
    "observacion": "Pausa grupal",
    "empleadosIds": ["1720123456"],
    "fechaPausa": "2024-05-20",
    "horaInicio": "12:30",
    "horaFin": "13:30"
  }
}
```

### PUT - Actualizar pausa
```json
PUT /api/orchestrator
{
  "resource": "pausas",
  "id": 15,
  "data": {
    "observacion": "Actualizado",
    "horaFin": "13:45"
  }
}
```

### DELETE - Eliminar pausa
```
DELETE /api/orchestrator?resource=pausas&id=15
```

## 🔮 Próximos Pasos

### Para integrar las otras 4 APIs:

1. **Personal (Puerto 5001)**
   - Crear `PersonalApiClient.ts`
   - Crear `ApiPersonalRepository.ts`
   - Agregar casos al orchestrator

2. **Turnos (Puerto 5002)**
   - Crear `TurnosApiClient.ts`
   - Crear `ApiTurnoRepository.ts`
   - Agregar casos al orchestrator

3. **Recesos (Puerto 5003)**
   - Crear `RecesosApiClient.ts`
   - Crear `ApiRecesoRepository.ts`
   - Agregar casos al orchestrator

4. **Firmas (Puerto 5005)**
   - Crear `FirmasApiClient.ts`
   - Crear `ApiFirmaRepository.ts`
   - Agregar casos al orchestrator

### Patrón a seguir:

```typescript
// 1. Crear cliente API
export class NombreApiClient extends BaseApiClient {
  constructor() {
    super(API_CONFIG.NOMBRE.BASE_URL);
  }
  // ... métodos
}

// 2. Crear repositorio
export class ApiNombreRepository implements INombreRepository {
  private apiClient: NombreApiClient;
  // ... implementación
}

// 3. Actualizar orchestrator
const USE_REAL_API_NOMBRE = process.env.USE_REAL_API_NOMBRE === 'true';
const nombreRepository = USE_REAL_API_NOMBRE 
  ? new ApiNombreRepository() 
  : new MockNombreRepository();
```

## 🧪 Testing

### Modo Mock (Desarrollo)
```env
USE_REAL_API_PAUSAS=false
```
- ✅ No requiere Docker
- ✅ Datos predecibles
- ✅ Desarrollo rápido

### Modo API Real (Integración)
```env
USE_REAL_API_PAUSAS=true
```
- ⚠️ Requiere Docker corriendo
- ⚠️ Verificar puerto 5004 disponible
- ✅ Datos reales de la base de datos

**Verificar Docker:**
```bash
curl http://localhost:5004/api/empleados
```

## 📝 Notas Importantes

1. **El orchestrator se ejecuta en el servidor** (Next.js API Routes), no en el cliente
2. **Los errores de red se capturan** y se retornan como JSON con `success: false`
3. **La respuesta incluye `source`** para indicar si viene de Mock o API Real
4. **El mapeo de datos** se hace automáticamente en `ApiPausaRepository`
5. **La autenticación de usuario** está pendiente (TODO en el código)

## 🐛 Troubleshooting

### Error: "Cannot connect to API"
- Verificar que Docker esté corriendo
- Verificar puerto 5004 disponible
- Cambiar a `USE_REAL_API_PAUSAS=false` para desarrollo

### Error: "Module not found"
- Ejecutar `npm install`
- Reiniciar el servidor de desarrollo

### Error en TypeScript
- Verificar que no haya errores de compilación
- Ejecutar `npm run build` para verificar

## 📚 Recursos

- [Documentación Completa](./docs/ORCHESTRATION.md)
- [Scripts de Prueba](./docs/API_TESTING.md)
- Documentación API: `http://localhost:5004/apidocs/`

---

**Estado:** ✅ Implementación completa y funcional
**Arquitectura:** Arquitectura limpia respetada
**Testing:** Scripts de prueba incluidos
**Documentación:** Completa y detallada
