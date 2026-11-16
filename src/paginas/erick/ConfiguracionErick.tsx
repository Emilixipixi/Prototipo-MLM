import { useState } from 'react';
import { Building2, FileSignature, Save, Settings2 } from 'lucide-react';
import { Boton } from '../../componentes/ui/Boton';
import { Campo } from '../../componentes/ui/Campo';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { firmasInstitucionales, leyendaDocumentos } from '../../datos/academico/firmas';
import { guardarConfiguracion } from '../../servicios/configuracionErick';
import { useErickStore } from '../../store/useErickStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { ConfiguracionErick as Configuracion } from '../../tipos/academico';

export default function ConfiguracionErick() {
  const actual = useErickStore((estado) => estado.configuracion);
  const actor = usePersonaSesion()?.id ?? 'DEMO-U04';
  const toast = useToast();
  const [datos, setDatos] = useState<Configuracion>(actual);
  const [error, setError] = useState<string | null>(null);
  const cambiar = <K extends keyof Configuracion>(clave: K, valor: Configuracion[K]) => setDatos({ ...datos, [clave]: valor });
  const guardar = () => {
    const resultado = guardarConfiguracion(datos, actor);
    if (!resultado.ok) { setError(resultado.error); return; }
    setError(null);
    toast.exito('Configuración guardada', 'Los cambios quedaron registrados en la bitácora académica.');
  };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-5">
        <Tarjeta titulo="Datos institucionales" subtitulo="Datos de contacto de la institución para documentos y comunicaciones" icono={Building2}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo className="sm:col-span-2" etiqueta="Razón social" value={datos.razonSocial} onChange={(evento) => cambiar('razonSocial', evento.target.value)} />
            <Campo etiqueta="RUC" inputMode="numeric" value={datos.ruc} onChange={(evento) => cambiar('ruc', evento.target.value)} />
            <Campo etiqueta="Teléfono" value={datos.telefono} onChange={(evento) => cambiar('telefono', evento.target.value)} />
            <Campo className="sm:col-span-2" etiqueta="Dirección" value={datos.direccion} onChange={(evento) => cambiar('direccion', evento.target.value)} />
            <Campo className="sm:col-span-2" etiqueta="Correo de contacto académico" type="email" value={datos.correoContacto} onChange={(evento) => cambiar('correoContacto', evento.target.value)} />
          </div>
        </Tarjeta>
        <Tarjeta titulo="Valores por defecto de nuevos programas" icono={Settings2}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Meses de acceso" type="number" min={1} max={24} value={datos.mesesAccesoPorDefecto} onChange={(evento) => cambiar('mesesAccesoPorDefecto', Number(evento.target.value))} ayuda="Duración del acceso al matricularse." />
            <Campo etiqueta="Intentos por evaluación" type="number" min={1} max={10} value={datos.intentosPorDefecto} onChange={(evento) => cambiar('intentosPorDefecto', Number(evento.target.value))} ayuda="Antes de requerir un intento extra." />
          </div>
        </Tarjeta>
        <Tarjeta titulo="Texto del certificado" icono={FileSignature}>
          <label htmlFor="texto-certificado" className="sr-only">Texto del certificado</label>
          <textarea id="texto-certificado" rows={4} value={datos.textoCertificado} onChange={(evento) => cambiar('textoCertificado', evento.target.value)} className="w-full rounded-xl border border-borde bg-superficie p-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-suave" />
          {error && <p role="alert" className="mt-2 text-[13px] font-medium text-error">{error}</p>}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Boton variante="secundario" onClick={() => { setDatos(actual); setError(null); }}>Descartar cambios</Boton>
            <Boton icono={Save} onClick={guardar}>Guardar configuración</Boton>
          </div>
        </Tarjeta>
      </div>
      <div className="flex flex-col gap-5">
        <Tarjeta titulo="Vista previa del texto" icono={FileSignature}>
          <div className="rounded-xl border-[5px] border-[#2E6B4F] bg-white p-5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-oro">Certificado</p>
            <p className="mt-1 text-[16px] font-extrabold text-primario-profundo">{datos.razonSocial}</p>
            <p className="mt-3 text-[12px] text-texto-2">Otorga el presente a</p>
            <p className="text-[15px] font-bold text-texto">Nombre del estudiante</p>
            <p className="mx-auto mt-2 max-w-sm text-[12.5px] text-texto-2">{datos.textoCertificado}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-texto-2">
              {firmasInstitucionales.map((firma) => <div key={firma.nombre} className="border-t border-borde pt-1.5"><p className="font-semibold text-texto">{firma.nombre}</p><p>{firma.cargo}</p></div>)}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-texto-2">{leyendaDocumentos}</p>
        </Tarjeta>
      </div>
    </div>
  );
}
