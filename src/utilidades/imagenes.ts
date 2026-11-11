const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp'];
const PESO_MAXIMO = 5 * 1024 * 1024;

export function validarImagen(archivo: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) return 'Formato no admitido. Usa PNG, JPG o WEBP.';
  if (archivo.size > PESO_MAXIMO) return 'La imagen supera los 5 MB.';
  return null;
}

export function leerImagenReducida(archivo: File, ladoMaximo = 900): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error('No se pudo leer la imagen.'));
    lector.onload = () => {
      const imagen = new Image();
      imagen.onerror = () => rechazar(new Error('El archivo no es una imagen válida.'));
      imagen.onload = () => {
        const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(imagen.width * escala);
        lienzo.height = Math.round(imagen.height * escala);
        const contexto = lienzo.getContext('2d');
        if (!contexto) {
          rechazar(new Error('No se pudo procesar la imagen.'));
          return;
        }
        contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
        resolver(lienzo.toDataURL(archivo.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85));
      };
      imagen.src = String(lector.result);
    };
    lector.readAsDataURL(archivo);
  });
}
