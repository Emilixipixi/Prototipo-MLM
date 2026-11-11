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

const pantallasCorporativo: Record<string, ComponentType> = {
  resumen: PanelCorporativo, usuarios: Usuarios, 'usuarios/:id': FichaPersona, permisos: Permisos,
  productos: Productos, arboles: Arboles, periodos: Periodos, rangos: Rangos,
  bonos: ConfiguracionBonos, simulador: Simulador, liquidaciones: Liquidaciones, compliance: Compliance,
  auditoria: Auditoria, reportes: Reportes, integraciones: Integraciones, balance: BalanceFinanciero,
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
  { ruta: 'integraciones', modulo: 'integraciones' },
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
        </Route>

        <Route path="/demo" element={<RutaPorPerfil perfiles={['superadministrador']}><LayoutCorporativo /></RutaPorPerfil>}>
          <Route path="datos" element={<DatosDemo />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Suspense>
  );
}
