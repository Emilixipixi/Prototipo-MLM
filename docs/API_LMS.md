# API del conector Campus ERICK (LMS) - referencia para producción

En el prototipo, el conector es `src/servicios/conectorLms.ts` y funciona en memoria (simulado). Este documento describe los endpoints REST equivalentes que tendría el sistema real entre MLM 2027 y Campus ERICK. Todos los ejemplos usan datos de DEMOSTRACIÓN.

Convenciones: JSON en UTF-8, fechas ISO 8601, autenticación por token de servicio (`Authorization: Bearer <token>`), idempotencia con el encabezado `Idempotency-Key` en todas las escrituras. Errores con `{ "error": { "codigo": "...", "mensaje": "..." } }`.

## 1. MLM 2027 hacia Campus ERICK

### 1.1 Pedido confirmado (equivale a `alConfirmarPedido`)

`POST /api/lms/v1/pedidos/confirmados`

```json
{
  "pedidoId": "DEMO-P206",
  "compradorId": "DEMO-L01",
  "fechaConfirmacion": "2026-11-14T10:20:00Z",
  "items": [{ "productoId": "DEMO-PRD-21", "cantidad": 1 }]
}
```

Respuesta `200`:

```json
{ "matriculas": [], "membresias": ["DEMO-MEM-02"], "errores": [] }
```

Reglas: solo pedidos en estado `confirmada`. Un producto de curso o diplomado crea o renueva una matrícula; un plan de membresía crea o extiende la membresía desde su vencimiento vigente. Reintentar con la misma `Idempotency-Key` devuelve la misma respuesta sin duplicar.

### 1.2 Pedido devuelto (equivale a `alDevolverPedido`)

`POST /api/lms/v1/pedidos/devueltos`

```json
{ "pedidoId": "DEMO-P206", "motivo": "Devolución solicitada por el cliente", "actorId": "DEMO-U01" }
```

Respuesta `200`: `{ "matriculas": ["DEMO-MAT-25"], "membresias": [], "errores": [] }`. Suspende el acceso; las notas y los certificados se conservan.

### 1.3 Matrícula manual (equivale a `matricularManual`)

`POST /api/lms/v1/matriculas`

```json
{ "personaId": "DEMO-C01", "programaId": "DEMO-CUR-01", "origen": "manual", "motivo": "Beca por convenio", "actorId": "DEMO-U02" }
```

Respuesta `201`: la matrícula creada (`id`, `inicio`, `vencimiento`, `estado`).

### 1.4 Consultar estado académico de una persona

`GET /api/lms/v1/personas/{personaId}/academico`

```json
{
  "personaId": "DEMO-A01",
  "programas": [{ "programaId": "DEMO-CUR-01", "estado": "aprobado", "nota": 17.98, "avance": 100, "vencimiento": "2027-04-25" }],
  "documentos": [{ "codigo": "ERK-CER-2026-00012", "tipo": "certificado", "estado": "emitido" }]
}
```

## 2. Campus ERICK hacia MLM 2027 (webhooks)

`POST /api/mlm/v1/eventos-lms`. Cada evento corresponde a un `EventoIntegracion` del prototipo. MLM responde `202` y procesa en cola con reintentos; un evento repetido (mismo `id`) no se procesa dos veces.

```json
{
  "id": "DEMO-EVL-120",
  "tipo": "curso_aprobado",
  "personaId": "DEMO-A01",
  "programaId": "DEMO-CUR-01",
  "fecha": "2026-11-14T15:42:00Z",
  "carga": { "documento": "ERK-CER-2026-00012", "nota": 17.98, "horas": 60 }
}
```

| Tipo | Cuándo | Efecto en MLM 2027 |
|---|---|---|
| `matricula_creada` | Matrícula nueva o renovada | Estado formativo `matriculado` |
| `membresia_activada` | Membresía nueva o renovada | Ninguno (informativo) |
| `avance_actualizado` | Primer componente completado o evaluación aprobada | Estado formativo `cursando` |
| `curso_aprobado` | Certificado emitido | Estado formativo `aprobado`; cumple `formacion_aprobada` |
| `diploma_emitido` | Diploma emitido | Estado formativo `aprobado` del diplomado |
| `certificado_anulado` | Anulación o reemisión | Auditoría |
| `acceso_suspendido` | Devolución o suspensión | Auditoría |
| `acceso_vencido` | Vencimiento | Aviso al estudiante |
| `mid_aprobado` | Constancia MID emitida | Informativo; no altera el diploma |

## 3. Verificación pública de documentos

`GET /api/lms/v1/verificaciones/{codigo}` (sin autenticación). `codigo` puede ser `ERK-CER-AAAA-NNNNN`, `ERK-DIP-AAAA-NNNNN`, `ERK-MID-AAAA-NNNNN` o el código corto de 8 caracteres.

```json
{ "estado": "valido", "tipo": "diploma", "estudiante": "Diego Arana Becerra", "documentoIdentidad": "*********-063", "programa": "Diplomado en Liderazgo y Gestión Comercial", "horas": 120, "nota": 17.78, "fechaEmision": "2026-10-25" }
```

`estado`: `valido`, `anulado` (incluye `motivo` y `reemplazadoPor`) o `inexistente` (`404`). Nunca expone correo, teléfono ni el documento completo.

## 4. Pasarela de pago local

En producción, el checkout llama al adaptador de pagos (`POST /api/pagos/v1/cobros`) y la pasarela notifica por webhook `aprobado`, `rechazado` o `pendiente`. Solo `aprobado` confirma el pedido; MLM confirma el pedido y llama a `1.1`.

## 5. Consideraciones de producción

- Base de datos transaccional para matrículas, intentos y documentos; los documentos y notas nunca se borran.
- Generación de PDF en servidor y almacenamiento en un bucket con URL firmada.
- Cola de eventos con reintentos exponenciales y registro de errores (el prototipo muestra un evento en `error` para DEMO-A18).
- Videos alojados en un servicio de streaming (campo `urlVideo`).
