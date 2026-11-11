import { BrowserRouter } from 'react-router-dom';
import { GuiaFlujos } from './componentes/demo/GuiaFlujos';
import { Toaster } from './componentes/ui/Toaster';
import { Rutas } from './rutas/Rutas';

export default function App() {
  return (
    <BrowserRouter>
      <Rutas />
      <GuiaFlujos />
      <Toaster />
    </BrowserRouter>
  );
}
