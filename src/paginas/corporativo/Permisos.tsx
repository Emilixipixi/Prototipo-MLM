import { useState } from 'react';
import { Check, Info, KeyRound, Lock } from 'lucide-react';
import { Insignia } from '../../componentes/ui/Insignia';
import { Pestanas } from '../../componentes/ui/Pestanas';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { useToast } from '../../componentes/ui/useToast';
import { acciones, modulos, nombresAcciones, nombresModulos } from '../../datos/permisosIniciales';
import { nombresPerfiles } from '../../datos/perfiles';
import { alternarPermiso } from '../../servicios/permisos';
import { usePermisosStore } from '../../store/usePermisosStore';
import { usePersonaSesion } from '../../store/useSesionStore';
import type { PerfilAcceso } from '../../tipos/persona';
import { unirClases } from '../../utilidades/clases';

const perfiles: PerfilAcceso[] = ['operador', 'superadministrador', 'afiliado', 'cliente_alumno'];

export default function Permisos() {
  const tabla = usePermisosStore((estado) => estado.tabla);
  const actor = usePersonaSesion();
  const toast = useToast();
  const [perfil, setPerfil] = useState<PerfilAcceso>('operador');
  const bloqueado = perfil === 'superadministrador';
  const sinArea = perfil === 'afiliado' || perfil === 'cliente_alumno';

  const alternar = (modulo: (typeof modulos)[number], accion: (typeof acciones)[number]) => {
    const resultado = alternarPermiso(perfil, modulo, accion, actor?.id ?? 'DEMO-U01');
    if (resultado.ok) toast.info(resultado.valor ? 'Permiso otorgado' : 'Permiso retirado', `${nombresPerfiles[perfil]}: ${accion} en ${nombresModulos[modulo]}. Se aplica de inmediato.`);
    else toast.error('No se pudo cambiar', resultado.error);
  };

  return (
    <div className="flex flex-col gap-5">
      <Pestanas etiqueta="Perfil" activa={perfil} alCambiar={(valor) => setPerfil(valor as PerfilAcceso)} pestanas={perfiles.map((item) => ({ id: item, texto: nombresPerfiles[item], icono: item === 'superadministrador' ? Lock : KeyRound }))} />
      <div className="flex items-start gap-2 rounded-xl bg-acento-suave px-3 py-2.5 text-[12.5px] text-[#155E75]">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {bloqueado ? 'El superadministrador conserva todos los permisos; la matriz se muestra solo como referencia.'
          : sinArea ? 'Este perfil no accede al área corporativa: solo ve su propia información. Los permisos aquí no le abren módulos corporativos.'
            : 'Los cambios se aplican de inmediato a las sesiones con este perfil y quedan registrados en la bitácora. Los módulos sin "consultar" aparecen con candado en el menú.'}
      </div>
      <Tarjeta titulo={`Matriz de permisos · ${nombresPerfiles[perfil]}`} subtitulo="Acciones por módulo" icono={KeyRound} sinRelleno>
        <div className="overflow-x-auto px-4 pb-4 pt-3 sm:px-5">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-borde text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-texto-3">
                <th className="py-2 pr-3">Módulo</th>
                {acciones.map((accion) => <th key={accion} className="px-1 py-2 text-center">{nombresAcciones[accion]}</th>)}
              </tr>
            </thead>
            <tbody>
              {modulos.map((modulo) => (
                <tr key={modulo} className="border-b border-borde last:border-0">
                  <td className="py-1.5 pr-3 font-semibold">{nombresModulos[modulo]}</td>
                  {acciones.map((accion) => {
                    const activo = tabla[perfil][modulo].includes(accion);
                    return (
                      <td key={accion} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={activo}
                          aria-label={`${accion} en ${nombresModulos[modulo]}`}
                          disabled={bloqueado}
                          onClick={() => alternar(modulo, accion)}
                          className={unirClases('mx-auto grid size-11 place-items-center rounded-lg border transition-colors md:size-9', activo ? 'border-acento bg-acento text-white' : 'border-borde bg-superficie text-transparent hover:border-texto-3', bloqueado && 'opacity-70')}
                        >
                          <Check className="size-4" aria-hidden />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
      <p className="flex flex-wrap items-center gap-2 text-xs text-texto-2"><Insignia tono="primaria">MLM-005</Insignia>Un operador no recibe automáticamente permisos de superadministrador.</p>
    </div>
  );
}
