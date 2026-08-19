/**
 * Utility to compress base64 images / files using HTML5 Canvas to prevent localStorage quota exhaustion.
 * Reduces raw 3MB-10MB camera snapshots to ~20KB-40KB JPEG thumbnails.
 */
export async function compressImage(
  dataUrlOrFile: string | File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve) => {
    let source = '';

    const processDataUrl = (src: string) => {
      // If it's already an external HTTP URL or small, return as is
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return resolve(src);
      }
      if (src.length < 50000) {
        return resolve(src);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(src);
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(src);
        }
      };

      img.onerror = () => resolve(src);
      img.src = src;
    };

    if (typeof dataUrlOrFile === 'string') {
      processDataUrl(dataUrlOrFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        if (res) {
          processDataUrl(res);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
}
