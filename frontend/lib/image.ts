// Reduce y comprime imágenes en el navegador antes de mandarlas a la API
// (la API acepta ~4 MB) y genera miniaturas para el historial.

export interface PreparedImage {
  base64: string;
  mimeType: 'image/jpeg';
  dataUrl: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    img.src = src;
  });
}

function drawScaled(img: HTMLImageElement, maxSide: number, quality: number): string {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite procesar imágenes');
  ctx.fillStyle = '#ffffff'; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export async function prepareImage(file: File, maxSide = 1600, quality = 0.85): Promise<PreparedImage> {
  const url = URL.createObjectURL(file);
  try {
    const dataUrl = drawScaled(await loadImage(url), maxSide, quality);
    return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg', dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function makeThumbnail(dataUrl: string, maxSide = 240): Promise<string> {
  return drawScaled(await loadImage(dataUrl), maxSide, 0.7);
}
