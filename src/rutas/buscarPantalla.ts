import { matchPath } from 'react-router-dom';
import { pantallas, type InfoPantalla } from './pantallas';

export function buscarPantalla(ruta: string): InfoPantalla | undefined {
  return pantallas.find((pantalla) => matchPath({ path: pantalla.patron, end: true }, ruta));
}
