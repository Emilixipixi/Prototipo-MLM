import { useMemo } from 'react';
import {
  ArrowRight, Award, CircleAlert, Clock, Gift, Network, TrendingUp, UserCheck, Users, Wallet,
} from 'lucide-react';
import { EnlacePatrocinio } from '../../componentes/demo/EnlacePatrocinio';
import { LeyendaDemostracion } from '../../componentes/demo/LeyendaDemostracion';
import { coloresBrazos } from '../../componentes/graficos/coloresBrazos';
import { Sparkline } from '../../componentes/graficos/Sparkline';
import { BarraProgreso } from '../../componentes/rangos/BarraProgreso';
import { ChecklistRequisitos } from '../../componentes/rangos/ChecklistRequisitos';
import { ChipBrazo } from '../../componentes/ui/ChipBrazo';
import { EnlaceBoton } from '../../componentes/ui/EnlaceBoton';
import { Insignia } from '../../componentes/ui/Insignia';
import { Tarjeta } from '../../componentes/ui/Tarjeta';
import { TarjetaKpi } from '../../componentes/ui/TarjetaKpi';
import { TerminoInfo } from '../../componentes/ui/TerminoInfo';
import { presentacionMotores } from '../../datos/presentacionMotores';
import { useDatosAfiliado } from '../../hooks/useDatosAfiliado';
import { hijosUnilevel } from '../../motores/utilidadesMotor';
import { organizacionTrinaria, volumenAcumuladoDiario } from '../../servicios/organizacion';
import { unirClases } from '../../utilidades/clases';
import { avanceCiclo } from '../../utilidades/ciclo';
import { formatearFecha } from '../../utilidades/fechas';
import { formatearMonto, formatearNumero, redondear } from '../../utilidades/formatos';

export default function InicioAfiliado() {
  const { fuente, persona, periodoActual, periodoCerrado, calificaciones, saldos, bonos } = useDatosAfiliado();
  const personaId = persona?.id ?? '';
  const actual = periodoActual ? calificaciones[periodoActual.id]?.find((item) => item.personaId === personaId) : undefined;
  const cerrada = periodoCerrado ? calificaciones[periodoCerrado.id]?.find((item) => item.personaId === personaId) : undefined;
  const brazos = periodoActual ? (saldos[periodoActual.id] ?? []).filter((saldo) => saldo.personaId === personaId) : [];
  const bonosActuales = periodoActual ? bonos[periodoActual.id] : undefined;
  const misBonos = (bonosActuales?.bonos ?? []).filter((bono) => bono.personaId === personaId);
  const totalBonos = redondear(misBonos.reduce((suma, bono) => suma + bono.monto, 0));
  const posicion = fuente.posiciones.find((item) => item.personaId === personaId && item.estado === 'activa');
  const directos = (hijosUnilevel(fuente.patrocinios).get(personaId) ?? []).map((id) => fuente.personas.find((item) => item.id === id)).filter(Boolean);
  const directosActivos = directos.filter((item) => item?.estado === 'activo').length;
  const reversiones = fuente.movimientos.filter((movimiento) => movimiento.personaId === personaId && movimiento.periodoId === periodoActual?.id && movimiento.tipo === 'reversion');
  const vpReversiones = reversiones.reduce((suma, movimiento) => suma + movimiento.vp, 0);

  const serieGrupal = useMemo(() => {
    if (!periodoActual) return [];
    return volumenAcumuladoDiario(periodoActual, fuente.movimientos, [personaId, ...organizacionTrinaria(personaId, fuente.posiciones)]);
  }, [periodoActual, fuente.movimientos, fuente.posiciones, personaId]);
  const serieGrupalVc = useMemo(() => {
    if (!periodoActual) return [];
    return volumenAcumuladoDiario(periodoActual, fuente.movimientos, [personaId, ...organizacionTrinaria(personaId, fuente.posiciones)], 'vc');
  }, [periodoActual, fuente.movimientos, fuente.posiciones, personaId]);
  const seriePersonal = useMemo(() => (periodoActual ? volumenAcumuladoDiario(periodoActual, fuente.movimientos, [personaId]) : []), [periodoActual, fuente.movimientos, personaId]);

  if (!persona || !periodoActual) return null;
  const avance = avanceCiclo(periodoActual);
  const maximoBrazo = Math.max(1, ...brazos.map((saldo) => saldo.generadoVp));
  const pendientes = actual?.desgloseSiguiente.filter((requisito) => !requisito.cumple) ?? [];
  const cumplidos = (actual?.desgloseSiguiente.length ?? 0) - pendientes.length;
  const totalRequisitos = actual?.desgloseSiguiente.length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {(persona.estado !== 'activo' || !posicion) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13.5px] text-advertencia">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-bold">Cuenta {persona.estado}{!posicion ? ' y sin posición Trinaria' : ''}</p>
            <p className="text-texto-2">{!posicion ? 'Corporativo asignará tu posición en la red Trinaria. Tu patrocinio ya está registrado.' : 'Tus comisiones pueden quedar retenidas mientras la cuenta no esté activa.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
        <Tarjeta variante="oscura" className="lg:col-span-5" titulo="Calificación" subtitulo="El RUN de Cobro es el que se usa para liquidar" icono={Award}>
          <span className="absolute -bottom-16 -right-16 size-56 rounded-full border-[38px] border-acento-brillo/10" aria-hidden />
          <div className="relative grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3">
            <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#9FDFF0]"><Wallet className="size-3.5" aria-hidden />RUN de Cobro</p>
              <p className="mt-1 text-[21px] font-extrabold tracking-tight min-[400px]:text-[24px] sm:text-[30px]">{cerrada?.runCobro ?? 'Sin rango'}</p>
              <p className="text-[11.5px] text-[#A9BCD9]">Último cierre {periodoCerrado?.id.replace('DEMO-', '')}</p>
            </div>
            <div className="min-w-0 rounded-2xl border border-[#E8B15A]/45 bg-oro/15 p-3 sm:p-4">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#F2C46D]"><Award className="size-3.5" aria-hidden />RUN Histórico</p>
              <p className="mt-1 text-[21px] font-extrabold tracking-tight min-[400px]:text-[24px] sm:text-[30px]">{actual?.runHistorico ?? cerrada?.runHistorico ?? 'Sin rango'}</p>
              <p className="text-[11.5px] text-[#A9BCD9]">Máximo de trayectoria</p>
            </div>
          </div>
          <div className="relative mt-4 flex min-w-0 items-center gap-2 text-[12px] text-[#C7D3E6] sm:gap-3 sm:text-[12.5px]">
            <Clock className="size-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{avance.estado === 'en_curso' ? `Día ${avance.dia} de ${avance.total}` : avance.estado === 'antes' ? 'Por iniciar' : 'Ciclo finalizado'}</span>
            <BarraProgreso valor={avance.dia} maximo={avance.total} etiqueta="Avance del ciclo" oscura />
            <span className="whitespace-nowrap">{avance.restantes} días</span>
          </div>
          <p className="relative mt-2 text-[11.5px] text-[#A9BCD9]">Ciclo <span className="cifra">{periodoActual.id}</span> · {formatearFecha(periodoActual.fechaInicio)} - {formatearFecha(periodoActual.fechaFin)}</p>
        </Tarjeta>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
          <TarjetaKpi etiqueta="VP grupal del ciclo" valor={formatearNumero(actual?.vpGrupal ?? 0)} icono={TrendingUp} tono="primario" ayuda={<TerminoInfo termino="vp" />} tendencia="neutra" textoTendencia="Personal + tres brazos" grafico={<Sparkline valores={serieGrupal} />} />
          <TarjetaKpi etiqueta="VC grupal del ciclo" valor={formatearNumero(actual?.vcGrupal ?? 0)} icono={Wallet} tono="acento" ayuda={<TerminoInfo termino="vc" />} tendencia="neutra" textoTendencia="Volumen comisionable" grafico={<Sparkline valores={serieGrupalVc} color="#14305A" relleno={false} />} />
          <TarjetaKpi
            etiqueta="VP personal"
            valor={formatearNumero(actual?.vpPersonal ?? 0)}
            icono={UserCheck}
            tono={vpReversiones < 0 ? 'error' : 'exito'}
            tendencia={vpReversiones < 0 ? 'baja' : 'neutra'}
            textoTendencia={vpReversiones < 0 ? `${formatearNumero(vpReversiones)} por devolución ${reversiones.map((item) => item.pedidoId).join(', ')}` : 'Sin reversiones en el ciclo'}
            grafico={<Sparkline valores={seriePersonal} color={vpReversiones < 0 ? '#B91C1C' : '#15803D'} />}
          />
        </div>

        <Tarjeta className="lg:col-span-7" titulo="Producción por brazo · Trinaria" subtitulo="VP y VC generados en el ciclo vigente" icono={Network} acciones={<EnlaceBoton to="/afiliado/volumen" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Mi volumen</EnlaceBoton>}>
          {brazos.length === 0 ? (
            <p className="text-[13px] text-texto-2">Aún no tienes posición Trinaria: la producción por brazo aparecerá cuando corporativo te asigne una.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-borde">
              {brazos.map((saldo) => (
                <li key={saldo.brazo} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[28px_minmax(0,1fr)_88px_88px]">
                  <ChipBrazo brazo={saldo.brazo} />
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${(saldo.generadoVp / maximoBrazo) * 100}%`, background: coloresBrazos[saldo.brazo] }} /></div>
                  <p className="cifra text-right text-[13px] font-semibold">{formatearNumero(saldo.generadoVp)}<span className="block font-sans text-[10.5px] font-medium uppercase tracking-[0.08em] text-texto-3">VP</span></p>
                  <p className="cifra hidden text-right text-[13px] font-semibold sm:block">{formatearNumero(saldo.generadoVc)}<span className="block font-sans text-[10.5px] font-medium uppercase tracking-[0.08em] text-texto-3">VC</span></p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="lg:col-span-5" titulo={`Próximo RUN: ${actual?.siguienteRun ?? '-'}`} subtitulo="Requisitos con valores ficticios editables" icono={Award} acciones={<EnlaceBoton to="/afiliado/run" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Mi RUN</EnlaceBoton>}>
          <div className="mb-4 flex items-center gap-4">
            <p className="cifra text-[28px] font-semibold text-texto">{cumplidos}/{totalRequisitos}</p>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-texto">requisitos cumplidos</p>
              <BarraProgreso valor={cumplidos} maximo={totalRequisitos} etiqueta="Requisitos cumplidos" />
            </div>
          </div>
          <ChecklistRequisitos requisitos={pendientes.slice(0, 3)} mostrarFuente={false} />
          {pendientes.length > 3 && <p className="mt-2 text-xs text-texto-2">y {pendientes.length - 3} requisitos más en Mi RUN.</p>}
        </Tarjeta>

        <Tarjeta className={unirClases('lg:col-span-7', bonosActuales?.origen === 'estimacion' && 'fondo-simulacion')} variante={bonosActuales?.origen === 'corrida_aprobada' ? 'normal' : 'simulacion'} titulo="Bonos del ciclo" subtitulo={bonosActuales?.origen === 'estimacion' ? `Estimación en vivo con reglas ${bonosActuales.versionReglasId}` : `Corrida ${bonosActuales?.corrida?.id ?? ''}`} icono={Gift} acciones={<Insignia tono="info">{bonosActuales?.origen === 'corrida_aprobada' ? 'APROBADA' : 'SIMULACIÓN'}</Insignia>}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Total ilustrativo</p>
              <p className="cifra text-[26px] font-semibold text-texto">{formatearMonto(totalBonos)}</p>
            </div>
            <EnlaceBoton to="/afiliado/bonos" tamano="sm" variante="secundario" iconoDerecha={ArrowRight}>Ver desglose</EnlaceBoton>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {misBonos.filter((bono) => bono.monto > 0).map((bono) => {
              const Icono = presentacionMotores[bono.motor].icono;
              return (
                <li key={bono.id} className="flex items-center gap-2 rounded-xl bg-superficie/80 px-3 py-2 text-[13px]">
                  <Icono className="size-4 shrink-0 text-acento" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{presentacionMotores[bono.motor].nombre}</span>
                  <span className="cifra font-semibold">{formatearMonto(bono.monto)}</span>
                </li>
              );
            })}
          </ul>
          <LeyendaDemostracion variante="bloque" className="mt-4" />
        </Tarjeta>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <EnlacePatrocinio codigo={persona.codigo} />
          <Tarjeta titulo="Mi organización" icono={Users} acciones={<EnlaceBoton to="/afiliado/equipo" tamano="sm" variante="fantasma" iconoDerecha={ArrowRight}>Mi equipo</EnlaceBoton>}>
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Directos activos</dt><dd className="cifra mt-1 text-xl font-semibold">{directosActivos}/{directos.length}</dd></div>
              <div className="rounded-xl bg-fondo p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-texto-3">Estado de cuenta</dt><dd className="mt-1"><Insignia tono={persona.estado === 'activo' ? 'exito' : 'advertencia'} className="capitalize">{persona.estado}</Insignia></dd></div>
            </dl>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
