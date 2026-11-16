import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CargandoPantalla } from '../componentes/ui/CargandoPantalla';
import type { ModuloPermiso } from '../tipos/permisos';
import { RutaPorPerfil, RutaPorPermiso } from './Guardas';

const LayoutPublico = lazy(() => import('../layouts/LayoutPublico'));
const LayoutAfiliado = lazy(() => import('../layouts/LayoutAfiliado'));
const LayoutCorporativo = lazy(() => import('../layouts/LayoutCorporativo'));
const PantallaProvisional = lazy(() => import('../paginas/PantallaProvisional'));
const PanelCorporativo = lazy(() => import('../paginas/corporativo/PanelCorporativo'));
const Usuarios = lazy(() => import('../paginas/corporativo/Usuarios'));
const FichaPersona = lazy(() => import('../paginas/corporativo/FichaPersona'));
const Permisos = lazy(() => import('../paginas/corporativo/Permisos'));
const Productos = lazy(() => import('../paginas/corporativo/Productos'));
const Arboles = lazy(() => import('../paginas/corporativo/Arboles'));
const Periodos = lazy(() => import('../paginas/corporativo/Periodos'));
const Rangos = lazy(() => import('../paginas/corporativo/Rangos'));
const ConfiguracionBonos = lazy(() => import('../paginas/corporativo/ConfiguracionBonos'));
const Simulador = lazy(() => import('../paginas/corporativo/Simulador'));
const Liquidaciones = lazy(() => import('../paginas/corporativo/Liquidaciones'));
const Compliance = lazy(() => import('../paginas/corporativo/Compliance'));
const Auditoria = lazy(() => import('../paginas/corporativo/Auditoria'));
const Reportes = lazy(() => import('../paginas/corporativo/Reportes'));
const Integraciones = lazy(() => import('../paginas/corporativo/Integraciones'));
const BalanceFinanciero = lazy(() => import('../paginas/corporativo/BalanceFinanciero'));
const MiBalance = lazy(() => import('../paginas/afiliado/MiBalance'));
const MisCobros = lazy(() => import('../paginas/afiliado/MisCobros'));
const Retiros = lazy(() => import('../paginas/corporativo/Retiros'));
const Ingreso = lazy(() => import('../paginas/sesion/Ingreso'));
const RecuperarAcceso = lazy(() => import('../paginas/sesion/RecuperarAcceso'));
const AccesoRestringido = lazy(() => import('../paginas/sesion/AccesoRestringido'));
const NoEncontrada = lazy(() => import('../paginas/sesion/NoEncontrada'));
const CambioRol = lazy(() => import('../paginas/sesion/CambioRol'));
const DatosDemo = lazy(() => import('../paginas/demo/DatosDemo'));
const Inicio = lazy(() => import('../paginas/publico/Inicio'));
const Catalogo = lazy(() => import('../paginas/publico/Catalogo'));
const FichaProducto = lazy(() => import('../paginas/publico/FichaProducto'));
const Registro = lazy(() => import('../paginas/publico/Registro'));
const Carrito = lazy(() => import('../paginas/publico/Carrito'));
const Checkout = lazy(() => import('../paginas/publico/Checkout'));
const DetallePedido = lazy(() => import('../paginas/publico/DetallePedido'));
const MiCuenta = lazy(() => import('../paginas/publico/MiCuenta'));
const InicioAfiliado = lazy(() => import('../paginas/afiliado/InicioAfiliado'));
const RedUnilevel = lazy(() => import('../paginas/afiliado/RedUnilevel'));
const RedTrinaria = lazy(() => import('../paginas/afiliado/RedTrinaria'));
const MiEquipo = lazy(() => import('../paginas/afiliado/MiEquipo'));
const MiVolumen = lazy(() => import('../paginas/afiliado/MiVolumen'));
const MiRun = lazy(() => import('../paginas/afiliado/MiRun'));
const MisBonos = lazy(() => import('../paginas/afiliado/MisBonos'));
const MisCompras = lazy(() => import('../paginas/afiliado/MisCompras'));
const MisLiquidaciones = lazy(() => import('../paginas/afiliado/MisLiquidaciones'));
const MiFormacion = lazy(() => import('../paginas/afiliado/MiFormacion'));
const LayoutCampus = lazy(() => import('../layouts/LayoutCampus'));
const LayoutEvaluador = lazy(() => import('../layouts/LayoutEvaluador'));
const LayoutErick = lazy(() => import('../layouts/LayoutErick'));
const IntegracionErick = lazy(() => import('../paginas/corporativo/IntegracionErick'));
const IntegracionMlm = lazy(() => import('../paginas/erick/IntegracionMlm'));
const ResumenErick = lazy(() => import('../paginas/erick/ResumenErick'));
const Estudiantes = lazy(() => import('../paginas/erick/Estudiantes'));
const Docentes = lazy(() => import('../paginas/erick/Docentes'));
const CalendarioErick = lazy(() => import('../paginas/erick/CalendarioErick'));
const ConfiguracionErick = lazy(() => import('../paginas/erick/ConfiguracionErick'));
const BitacoraAcademica = lazy(() => import('../paginas/erick/BitacoraAcademica'));
const PantallaProvisionalLms = lazy(() => import('../paginas/campus/PantallaProvisionalLms'));
const MisProgramas = lazy(() => import('../paginas/campus/MisProgramas'));
const MiMembresia = lazy(() => import('../paginas/campus/MiMembresia'));

const RutaPrograma = lazy(() => import('../paginas/campus/RutaPrograma'));
const TemaCampus = lazy(() => import('../paginas/campus/TemaCampus'));
const EvaluacionCampus = lazy(() => import('../paginas/campus/EvaluacionCampus'));
const TimCampus = lazy(() => import('../paginas/campus/TimCampus'));
const MisNotas = lazy(() => import('../paginas/campus/MisNotas'));
const HistorialAcademico = lazy(() => import('../paginas/campus/HistorialAcademico'));
const MisCertificados = lazy(() => import('../paginas/campus/MisCertificados'));
const MiMid = lazy(() => import('../paginas/campus/MiMid'));
const BandejaMid = lazy(() => import('../paginas/evaluador/BandejaMid'));
const LayoutDocente = lazy(() => import('../layouts/LayoutDocente'));
const MisCursosDocente = lazy(() => import('../paginas/docente/MisCursos'));
const ClasesVideoDocente = lazy(() => import('../paginas/docente/ClasesVideo'));
const LibretaNotasDocente = lazy(() => import('../paginas/docente/LibretaNotas'));
const CalendarioDocente = lazy(() => import('../paginas/docente/CalendarioDocente'));
const VerificarDocumento = lazy(() => import('../paginas/publico/VerificarDocumento'));

const pantallasCampus: Record<string, ComponentType> = {
  programas: MisProgramas, membresia: MiMembresia, 'programas/:id': RutaPrograma, 'temas/:id': TemaCampus,
  'evaluaciones/:ambito/:id': EvaluacionCampus, 'tim/:id': TimCampus, notas: MisNotas, historial: HistorialAcademico,
  certificados: MisCertificados, mid: MiMid,
};

const rutasCampus = ['programas', 'programas/:id', 'temas/:id', 'evaluaciones/:ambito/:id', 'tim/:id', 'notas', 'historial', 'certificados', 'membresia', 'mid'];
pantallasCampus.calendario = lazy(() => import('../paginas/campus/MiCalendario'));
rutasCampus.push('calendario');

const pantallasAcademicas: Record<string, ComponentType> = {
  'academico/resumen': lazy(() => import('../paginas/corporativo/academico/ResumenAcademico')),
  'academico/programas': lazy(() => import('../paginas/corporativo/academico/ProgramasAcademicos')),
  'academico/programas/:id': lazy(() => import('../paginas/corporativo/academico/EditorPrograma')),
  'academico/preguntas': lazy(() => import('../paginas/corporativo/academico/BancoPreguntas')),
  'academico/matriculas': lazy(() => import('../paginas/corporativo/academico/MatriculasAcademicas')),
  'academico/membresias': lazy(() => import('../paginas/corporativo/academico/MembresiasAcademicas')),
  'academico/certificados': lazy(() => import('../paginas/corporativo/academico/CertificadosRegistro')),
  'academico/mid': lazy(() => import('../paginas/corporativo/academico/SustentacionesMid')),
  'academico/reportes': lazy(() => import('../paginas/corporativo/academico/ReportesAcademicos')),
};

const rutasAcademicas: Array<{ ruta: string; modulo: ModuloPermiso }> = [
  { ruta: 'academico/resumen', modulo: 'academico' },
  { ruta: 'academico/programas', modulo: 'academico' },
  { ruta: 'academico/programas/:id', modulo: 'academico' },
  { ruta: 'academico/preguntas', modulo: 'academico' },
  { ruta: 'academico/matriculas', modulo: 'matriculas' },
  { ruta: 'academico/membresias', modulo: 'matriculas' },
  { ruta: 'academico/certificados', modulo: 'certificados' },
  { ruta: 'academico/mid', modulo: 'academico' },
  { ruta: 'academico/reportes', modulo: 'academico' },
];

const pantallasCorporativo: Record<string, ComponentType> = {
  resumen: PanelCorporativo, usuarios: Usuarios, 'usuarios/:id': FichaPersona, permisos: Permisos,
  productos: Productos, arboles: Arboles, periodos: Periodos, rangos: Rangos,
  bonos: ConfiguracionBonos, simulador: Simulador, liquidaciones: Liquidaciones, compliance: Compliance,
  auditoria: Auditoria, reportes: Reportes, integraciones: Integraciones, balance: BalanceFinanciero, retiros: Retiros,
  'integracion-erick': IntegracionErick,
};

const rutasCorporativo: Array<{ ruta: string; modulo?: ModuloPermiso }> = [
  { ruta: 'resumen' },
  { ruta: 'usuarios', modulo: 'usuarios' },
  { ruta: 'usuarios/:id', modulo: 'usuarios' },
  { ruta: 'permisos', modulo: 'permisos' },
  { ruta: 'productos', modulo: 'catalogo' },
  { ruta: 'arboles', modulo: 'redes' },
  { ruta: 'periodos', modulo: 'periodos' },
  { ruta: 'rangos', modulo: 'rangos' },
  { ruta: 'bonos', modulo: 'bonos' },
  { ruta: 'simulador', modulo: 'simulador' },
  { ruta: 'liquidaciones', modulo: 'liquidaciones' },
  { ruta: 'compliance', modulo: 'compliance' },
  { ruta: 'auditoria', modulo: 'auditoria' },
  { ruta: 'reportes', modulo: 'reportes' },
  { ruta: 'balance', modulo: 'reportes' },
  { ruta: 'retiros', modulo: 'liquidaciones' },
  { ruta: 'integraciones', modulo: 'integraciones' },
  { ruta: 'integracion-erick', modulo: 'academico' },
];

const rutasErick: Array<{ ruta: string; modulo: ModuloPermiso; Pantalla: ComponentType }> = [
  ...rutasAcademicas.filter(({ ruta }) => ruta !== 'academico/resumen').map(({ ruta, modulo }) => ({ ruta: ruta.replace('academico/', ''), modulo, Pantalla: pantallasAcademicas[ruta] ?? PantallaProvisionalLms })),
  { ruta: 'integracion', modulo: 'academico', Pantalla: IntegracionMlm },
  { ruta: 'resumen', modulo: 'academico', Pantalla: ResumenErick },
  { ruta: 'estudiantes', modulo: 'academico', Pantalla: Estudiantes },
  { ruta: 'docentes', modulo: 'docentes', Pantalla: Docentes },
  { ruta: 'calendario', modulo: 'calendario', Pantalla: CalendarioErick },
  { ruta: 'configuracion', modulo: 'configuracion_erick', Pantalla: ConfiguracionErick },
  { ruta: 'bitacora', modulo: 'academico', Pantalla: BitacoraAcademica },
];

export function Rutas() {
  return (
    <Suspense fallback={<CargandoPantalla texto="Cargando MLM 2027" />}>
      <Routes>
        <Route path="/ingresar" element={<Ingreso />} />
        <Route path="/recuperar-acceso" element={<RecuperarAcceso />} />
        <Route path="/acceso-restringido" element={<AccesoRestringido />} />
        <Route path="/cambiar-rol/:personaId" element={<CambioRol />} />

        <Route element={<LayoutPublico />}>
          <Route index element={<Inicio />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="catalogo/:id" element={<FichaProducto />} />
          <Route path="registro" element={<Registro />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="pedido/:id" element={<DetallePedido />} />
          <Route path="cuenta" element={<RutaPorPerfil perfiles={['cliente_alumno']}><MiCuenta /></RutaPorPerfil>} />
          <Route path="verificar" element={<VerificarDocumento />} />
          <Route path="verificar/:codigo" element={<VerificarDocumento />} />
        </Route>

        <Route path="/afiliado" element={<RutaPorPerfil perfiles={['afiliado']}><LayoutAfiliado /></RutaPorPerfil>}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="redes" element={<Navigate to="unilevel" replace />} />
          <Route path="inicio" element={<InicioAfiliado />} />
          <Route path="redes/unilevel" element={<RedUnilevel />} />
          <Route path="redes/trinaria" element={<RedTrinaria />} />
          <Route path="equipo" element={<MiEquipo />} />
          <Route path="volumen" element={<MiVolumen />} />
          <Route path="run" element={<MiRun />} />
          <Route path="bonos" element={<MisBonos />} />
          <Route path="compras" element={<MisCompras />} />
          <Route path="liquidaciones" element={<MisLiquidaciones />} />
          <Route path="balance" element={<MiBalance />} />
          <Route path="cobros" element={<MisCobros />} />
          <Route path="formacion" element={<MiFormacion />} />
        </Route>

        <Route path="/corporativo" element={<RutaPorPerfil perfiles={['superadministrador', 'operador']}><LayoutCorporativo /></RutaPorPerfil>}>
          <Route index element={<Navigate to="resumen" replace />} />
          {rutasCorporativo.map(({ ruta, modulo }) => {
            const Pantalla = pantallasCorporativo[ruta] ?? PantallaProvisional;
            return (
              <Route
                key={ruta}
                path={ruta}
                element={modulo ? <RutaPorPermiso modulo={modulo}><Pantalla /></RutaPorPermiso> : <Pantalla />}
              />
            );
          })}
          <Route path="academico/*" element={<Navigate to="/corporativo/integracion-erick" replace />} />
        </Route>

        <Route path="/erick" element={<RutaPorPerfil perfiles={['admin_educativo']}><LayoutErick /></RutaPorPerfil>}>
          <Route index element={<Navigate to="resumen" replace />} />
          {rutasErick.map(({ ruta, modulo, Pantalla }) => (
            <Route key={ruta} path={ruta} element={<RutaPorPermiso modulo={modulo}><Pantalla /></RutaPorPermiso>} />
          ))}
        </Route>

        <Route path="/campus" element={<RutaPorPerfil perfiles={['cliente_alumno', 'afiliado']}><LayoutCampus /></RutaPorPerfil>}>
          <Route index element={<Navigate to="programas" replace />} />
          {rutasCampus.map((ruta) => {
            const Pantalla = pantallasCampus[ruta] ?? PantallaProvisionalLms;
            return <Route key={ruta} path={ruta} element={<Pantalla key={ruta} />} />;
          })}
        </Route>

        <Route path="/evaluador" element={<RutaPorPerfil perfiles={['evaluador']}><LayoutEvaluador /></RutaPorPerfil>}>
          <Route index element={<Navigate to="/docente/sustentaciones" replace />} />
        </Route>

        <Route path="/docente" element={<RutaPorPerfil perfiles={['evaluador']}><LayoutDocente /></RutaPorPerfil>}>
          <Route index element={<Navigate to="cursos" replace />} />
          <Route path="cursos" element={<MisCursosDocente />} />
          <Route path="cursos/:programaId/clases" element={<ClasesVideoDocente />} />
          <Route path="cursos/:programaId/notas" element={<LibretaNotasDocente />} />
          <Route path="calendario" element={<CalendarioDocente />} />
          <Route path="sustentaciones" element={<BandejaMid />} />
        </Route>

        <Route path="/demo" element={<RutaPorPerfil perfiles={['superadministrador']}><LayoutCorporativo /></RutaPorPerfil>}>
          <Route path="datos" element={<DatosDemo />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Suspense>
  );
}
