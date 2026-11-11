# MLM 2027 - Prototipo navegable

Prototipo visual de una plataforma comercial multinivel con genealogía Unilevel y red Trinaria (brazos A, B y C). Todos los datos son ficticios y rotulados como DEMOSTRACIÓN.

## Requisitos
- Node.js 20.19 o superior (recomendado 22 LTS)

## Ejecutar (PowerShell)
```powershell
cd D:\Prototipo\Prototipo-MLM
npm install
npm run dev
```
Abrir la dirección que muestra la terminal (normalmente http://localhost:5173).

## Otros comandos
```powershell
npm run build
npm run lint
npm run preview
```

## Usuarios de demostración
En la pantalla de ingreso use los botones de acceso rápido o el correo correspondiente con cualquier clave:
- admin@correo.demo (superadministrador)
- operador@correo.demo (operador)
- mariana.vega@correo.demo (afiliado DEMO-A01)
- rosa.delgado@correo.demo (cliente DEMO-C01)
- gabriela.ponce@correo.demo (alumno DEMO-L01)

## Demostración guiada
- El botón "Guía de flujos" (abajo a la izquierda) recorre los flujos F01 a F08: cada paso abre su pantalla y cambia de rol si hace falta.
- Guion para presentar: `docs\GUION_DEMOSTRACION.md`.
- Checklist de requerimientos MLM-001 a MLM-070: `docs\CHECKLIST_REQUERIMIENTOS.md`.
- Los datos viven en memoria: recargar el navegador o pulsar "Reiniciar demostración" vuelve al estado inicial.
