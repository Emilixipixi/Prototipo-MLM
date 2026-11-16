# Cambios - Alumno de demostración con datos completos (15/11/2026)

Pedido: que el panel del alumno muestre notas, historial, certificados y Mi MID con datos de ejemplo.

## Archivo nuevo

- `src/componentes/campus/DetalleMid.tsx` (rúbrica con barras, cronología y datos de la constancia)

## Archivos modificados (líneas con + son nuevas; con - las líneas cambiadas)

### `src/componentes/demo/sesionesDemo.ts`

```diff
@@ -1,4 +1,4 @@
-import { Briefcase, ClipboardPen, GraduationCap, School, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';
+import { BookOpen, Briefcase, ClipboardPen, GraduationCap, School, ShieldCheck, ShoppingBag, UserCog, type LucideIcon } from 'lucide-react';
 
 export interface SesionDemo { personaId: string; etiqueta: string; detalle: string; icono: LucideIcon; }
 
@@ -7,7 +7,9 @@
   { personaId: 'DEMO-U02', etiqueta: 'Operador', detalle: 'Operador Demo', icono: UserCog },
   { personaId: 'DEMO-A01', etiqueta: 'Afiliado', detalle: 'Mariana Vega - DEMO-A01', icono: Briefcase },
   { personaId: 'DEMO-C01', etiqueta: 'Cliente', detalle: 'Rosa Delgado - DEMO-C01', icono: ShoppingBag },
-  { personaId: 'DEMO-L01', etiqueta: 'Alumno', detalle: 'Gabriela Ponce - DEMO-L01', icono: GraduationCap },
+  { personaId: 'DEMO-L08', etiqueta: 'Alumno', detalle: 'Valeria Cárdenas - DEMO-L08', icono: GraduationCap },
   { personaId: 'DEMO-U04', etiqueta: 'Administrador educativo', detalle: 'ERICK S.A.C. - DEMO-U04', icono: School },
   { personaId: 'DEMO-U03', etiqueta: 'Docente', detalle: 'Docente Evaluador - DEMO-U03', icono: ClipboardPen },
 ];
+
+sesionesDemo.push({ personaId: 'DEMO-L01', etiqueta: 'Alumna nueva', detalle: 'Gabriela Ponce - DEMO-L01', icono: BookOpen });
```

### `src/datos/academico/matriculasIniciales.ts`

```diff
@@ -52,6 +52,7 @@
 ];
 semillas.push(...semillasAlumnosCampus);
 semillas.push(...semillasAlumnosAmpliados);
+semillas.push({ personaId: 'DEMO-L08', programaId: 'DEMO-CUR-03', origen: 'manual', inicio: '2026-09-28', aprobados: 14, fin: '2026-11-13', enCurso: { video: true, lectura: true }, fallidos: 2 });
 
 const motivosOrigen: Record<OrigenMatricula, string> = {
   compra: 'Matrícula automática por pago confirmado',
```

### `src/paginas/campus/MiMid.tsx`

```diff
@@ -1,6 +1,7 @@
 import { useState } from 'react';
 import { FileUp, Info, Microscope, Send } from 'lucide-react';
 import { LineaMid } from '../../componentes/campus/LineaMid';
+import { DetalleMid } from '../../componentes/campus/DetalleMid';
 import { Boton } from '../../componentes/ui/Boton';
 import { Campo } from '../../componentes/ui/Campo';
 import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
@@ -60,11 +61,12 @@
             {item.notaFinal !== null && (
               <div className="mt-3 rounded-xl bg-fondo p-3 text-[13px]">
                 <p className="font-semibold">Nota final: <span className="cifra">{formatearNumero(item.notaFinal, 2)}</span></p>
-                <ul className="mt-1 grid gap-1 sm:grid-cols-2">{item.rubrica.map((criterio) => <li key={criterio.criterio} className="flex justify-between gap-2"><span>{criterio.criterio} ({criterio.peso}%)</span><span className="cifra">{criterio.nota ?? '-'}</span></li>)}</ul>
+                <ul className="mt-1 grid gap-x-8 gap-y-1 sm:grid-cols-2">{item.rubrica.map((criterio) => <li key={criterio.criterio} className="flex justify-between gap-2"><span>{criterio.criterio} ({criterio.peso}%)</span><span className="cifra">{criterio.nota ?? '-'}</span></li>)}</ul>
                 <p className="mt-2 text-texto-2">{item.observaciones}</p>
                 {item.estado === 'aprobado' && <EnlaceBoton to="/campus/certificados" tamano="sm" className="mt-2">Ver mi constancia</EnlaceBoton>}
               </div>
             )}
+            <DetalleMid sustentacion={item} evaluador={evaluador ? `${evaluador.nombres} ${evaluador.apellidos}` : null} />
           </Tarjeta>
         );
       })}
```

### `src/datos/academico/notificacionesErick.ts` (línea 19)

```diff
-const destacados = ['DEMO-L01', 'DEMO-L02', 'DEMO-L03', 'DEMO-L12', 'DEMO-L17', 'DEMO-L20', 'DEMO-A01'];
+const destacados = ['DEMO-L01', 'DEMO-L02', 'DEMO-L03', 'DEMO-L12', 'DEMO-L17', 'DEMO-L20', 'DEMO-A01', 'DEMO-L08'];
```

También se actualizaron `CLAUDE.md` (línea nueva después de E4) y `docs/GUION_DEMOSTRACION.md` (sección 8, recorrido por roles).
