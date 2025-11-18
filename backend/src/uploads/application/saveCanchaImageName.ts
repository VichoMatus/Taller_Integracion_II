import fs from 'fs';
import path from 'path';

// Ruta del archivo donde se guardarán los IDs y nombres de archivo
const MAP_FILE = path.join(__dirname, 'cancha_img_map.json');

export function saveCanchaImageName(id: string, filename: string) {
  let map: Record<string, string> = {};
  if (fs.existsSync(MAP_FILE)) {
    map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  }
  map[id] = filename;
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}

export function getCanchaImageName(id: string): string | null {
  if (!fs.existsSync(MAP_FILE)) return null;
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  return map[id] || null;
}
