# 🧪 Scripts de Prueba - API de Tiempos Fuera

## Pruebas con el Orchestrator

### 1. Obtener todas las pausas

```bash
curl http://localhost:3000/api/orchestrator?resource=pausas
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [...],
  "source": "API Real (Puerto 5004)" // o "Mock Data"
}
```

### 2. Buscar pausas por fecha

```bash
curl "http://localhost:3000/api/orchestrator?resource=pausas&query=2024-05-20"
```

### 3. Crear una pausa

```bash
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "pausas",
    "data": {
      "estado": "Almuerzo",
      "subEstado": "Comedor",
      "observacion": "Pausa de almuerzo grupal",
      "empleadosIds": ["1720123456", "1720987654"],
      "fechaPausa": "2024-05-20",
      "horaInicio": "12:30",
      "horaFin": "13:30"
    }
  }'
```

### 4. Actualizar una pausa

```bash
curl -X PUT http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "pausas",
    "id": 15,
    "data": {
      "observacion": "Corrección: Salida autorizada",
      "horaFin": "13:45"
    }
  }'
```

### 5. Eliminar una pausa

```bash
curl -X DELETE "http://localhost:3000/api/orchestrator?resource=pausas&id=15"
```

---

## Pruebas Directas a la API (Puerto 5004)

Estas pruebas requieren que el contenedor Docker esté corriendo.

### 1. Listar empleados

```bash
curl http://localhost:5004/api/empleados
```

### 2. Listar pausas

```bash
curl http://localhost:5004/api/pausas
```

### 3. Pausas con filtros

```bash
curl "http://localhost:5004/api/pausas?ci=1720123456&fecha_inicio=2024-05-01&fecha_fin=2024-05-31"
```

### 4. Pausas por fecha específica

```bash
curl http://localhost:5004/api/pausas/fecha/2024-05-20
```

### 5. Crear pausas

```bash
curl -X POST http://localhost:5004/api/pausas \
  -H "Content-Type: application/json" \
  -d '{
    "empleados": ["1720123456", "1720987654"],
    "estado": "ALMUERZO",
    "subestado": "CANTEEN",
    "observacion": "Salida grupal",
    "fecha": "2024-05-20",
    "horaInicio": "12:30",
    "horaFin": "13:30",
    "usuario": "ADMIN_SISTEMA"
  }'
```

### 6. Actualizar pausa

```bash
curl -X PUT http://localhost:5004/api/pausas/15 \
  -H "Content-Type: application/json" \
  -d '{
    "observacion": "Corrección de hora",
    "horaFin": "13:45",
    "usuario": "SUPERVISOR"
  }'
```

### 7. Eliminar pausa

```bash
curl -X DELETE http://localhost:5004/api/pausas/15
```

---

## PowerShell (Windows)

### Obtener pausas
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/orchestrator?resource=pausas" -Method Get
```

### Crear pausa
```powershell
$body = @{
    resource = "pausas"
    data = @{
        estado = "Almuerzo"
        subEstado = "Comedor"
        observacion = "Pausa de almuerzo"
        empleadosIds = @("1720123456", "1720987654")
        fechaPausa = "2024-05-20"
        horaInicio = "12:30"
        horaFin = "13:30"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/orchestrator" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Eliminar pausa
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/orchestrator?resource=pausas&id=15" -Method Delete
```

---

## Verificar el contenedor Docker

### Ver contenedores corriendo
```bash
docker ps
```

### Logs del contenedor de tiempos-fuera
```bash
docker logs <container_id>
```

### Verificar que la API responde
```bash
curl http://localhost:5004/apidocs/
```

---

## Estados de Configuración

### Modo Mock (desarrollo sin Docker)
```env
USE_REAL_API_PAUSAS=false
```

**Ventajas:**
- No requiere Docker
- Datos predecibles
- Desarrollo rápido

### Modo API Real (integración)
```env
USE_REAL_API_PAUSAS=true
```

**Requisitos:**
- Contenedor Docker corriendo en puerto 5004
- Red accesible
- API disponible

**Verificar conexión:**
```bash
curl http://localhost:5004/api/empleados
```

Si retorna JSON con empleados, la API está lista.
