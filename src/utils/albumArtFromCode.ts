/**
 * Simple string hash (djb2) - produces a deterministic number from a string.
 */
function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

/** Derive a value 0..max from hash, using step to get different streams */
function pick(h: number, step: number, max: number): number {
  return ((h * step) >>> 0) % max;
}

/**
 * Generate a deterministic pattern album art from track code.
 * Returns an SVG data URI with layered stripes, shapes, and overlays.
 */
export function generateAlbumArtFromCode(code: string): string {
  const h = hashString(code);
  const size = 200;
  const cx = size / 2;

  // Base colors from hash
  const hue1 = pick(h, 1, 360);
  const hue2 = (hue1 + pick(h, 7, 120)) % 360;
  const hue3 = (hue2 + pick(h, 13, 80)) % 360;

  const colors = [
    `hsl(${hue1}, 45%, 22%)`,
    `hsl(${hue1}, 50%, 16%)`,
    `hsl(${hue2}, 40%, 20%)`,
    `hsl(${hue2}, 35%, 26%)`,
    `hsl(${hue3}, 42%, 18%)`,
    `hsl(${hue3}, 38%, 24%)`,
  ];

  // Layer 1: Base fill
  const baseColor = colors[0];

  // Layer 2: Primary diagonal stripes
  const stripes1 = pick(h, 2, 5) + 5;
  const angle1 = (pick(h, 3, 180) - 90);
  const stripeWidth1 = size / stripes1;

  const stripeRects1 = Array.from({ length: stripes1 }, (_, i) => {
    const color = colors[i % colors.length];
    const y = i * stripeWidth1 - size;
    return `<rect x="-${size}" y="${y}" width="${size * 3}" height="${stripeWidth1 + 2}" fill="${color}"/>`;
  }).join('');

  // Layer 3: Secondary diagonal stripes (different angle)
  const stripes2 = pick(h, 5, 4) + 4;
  const angle2 = angle1 + 60 + pick(h, 11, 40);
  const stripeWidth2 = size / stripes2;

  const stripeRects2 = Array.from({ length: stripes2 }, (_, i) => {
    const color = colors[(i + 2) % colors.length];
    const y = i * stripeWidth2 - size;
    return `<rect x="-${size}" y="${y}" width="${size * 3}" height="${stripeWidth2 + 2}" fill="${color}" opacity="0.6"/>`;
  }).join('');

  // Layer 4: Grid of circles or rotated squares (varies by hash)
  const gridSize = pick(h, 17, 2) + 3; // 3-4
  const cellSize = size / gridSize;
  const shapeType = pick(h, 19, 3); // 0=circles, 1=squares, 2=smaller circles

  const shapes: string[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const idx = row * gridSize + col;
      const color = colors[(idx + pick(h, 23, 3)) % colors.length];
      const x = col * cellSize + cellSize / 2;
      const y = row * cellSize + cellSize / 2;
      const scale = shapeType === 2 ? 0.2 : 0.35;
      const r = cellSize * (scale + (pick(h, 29 + idx, 15) / 100));

      if (shapeType === 0 || shapeType === 2) {
        shapes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.5"/>`);
      } else {
        const s = r * 1.4;
        shapes.push(`<rect x="${x - s/2}" y="${y - s/2}" width="${s}" height="${s}" fill="${color}" opacity="0.4" transform="rotate(${pick(h, 31 + idx, 360)} ${x} ${y})"/>`);
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${baseColor}"/>
  <g transform="rotate(${angle1} ${cx} ${cx})">${stripeRects1}</g>
  <g transform="rotate(${angle2} ${cx} ${cx})">${stripeRects2}</g>
  ${shapes.join('')}
</svg>`;

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
