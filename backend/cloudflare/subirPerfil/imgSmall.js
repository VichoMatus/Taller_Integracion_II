// Función para convertir cualquier imagen a webp (sin importar tamaño)
function toWebp(file, quality, maxWidth, maintainRatio) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = function() {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                const aspect = width / height;
                width = maxWidth;
                if (maintainRatio) height = Math.floor(width / aspect);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('No se pudo convertir la imagen.'));
                    return;
                }
                const url = URL.createObjectURL(blob);
                resolve({blob, url});
            }, 'image/webp', quality);
        };
        img.onerror = function() { reject(new Error('Error al cargar la imagen')); };
        img.src = URL.createObjectURL(file);
    });
}

// Función de compresión de imágenes
function compressImage(file, quality, maxWidth, maintainRatio) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = function() {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                const aspect = width / height;
                width = maxWidth;
                if (maintainRatio) height = Math.floor(width / aspect);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('No se pudo comprimir la imagen.'));
                    return;
                }
                const url = URL.createObjectURL(blob);
                resolve({blob, url});
            }, 'image/webp', quality);
        };
        img.onerror = function() { reject(new Error('Error al cargar la imagen')); };
        img.src = URL.createObjectURL(file);
    });
}

// Exponer funciones globalmente y notificar que están disponibles
window.toWebp = toWebp;
window.compressImage = compressImage;

// Indicar que el script se ha cargado correctamente
console.log("imgSmall.js cargado correctamente - funciones disponibles: toWebp, compressImage");

// Disparar un evento personalizado que indique que las funciones están listas
document.dispatchEvent(new CustomEvent('imgProcessingReady'));