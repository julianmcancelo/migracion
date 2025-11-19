/**
 * Script para generar iconos PWA
 * Crea iconos SVG simples que luego se pueden convertir a PNG
 */

const fs = require('fs');
const path = require('path');

// Icono Admin (Escudo con engranaje)
const adminIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0093D2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#007AB8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#adminGrad)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <path d="M ${size * 0.3} ${size * 0.05} L ${size * 0.5} ${size * 0.15} L ${size * 0.3} ${size * 0.25} L ${size * 0.3} ${size * 0.55} C ${size * 0.3} ${size * 0.6} ${size * 0.35} ${size * 0.6} ${size * 0.4} ${size * 0.6} L ${size * 0.6} ${size * 0.6} C ${size * 0.65} ${size * 0.6} ${size * 0.7} ${size * 0.6} ${size * 0.7} ${size * 0.55} L ${size * 0.7} ${size * 0.25} L ${size * 0.5} ${size * 0.15} L ${size * 0.7} ${size * 0.05} Z" 
          fill="white" opacity="0.95"/>
    <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.08}" fill="#0093D2"/>
    <path d="M ${size * 0.5} ${size * 0.32} L ${size * 0.52} ${size * 0.28} L ${size * 0.56} ${size * 0.3} L ${size * 0.54} ${size * 0.34} L ${size * 0.58} ${size * 0.36} L ${size * 0.56} ${size * 0.4} L ${size * 0.58} ${size * 0.44} L ${size * 0.54} ${size * 0.46} L ${size * 0.56} ${size * 0.5} L ${size * 0.52} ${size * 0.52} L ${size * 0.5} ${size * 0.48} L ${size * 0.48} ${size * 0.52} L ${size * 0.44} ${size * 0.5} L ${size * 0.46} ${size * 0.46} L ${size * 0.42} ${size * 0.44} L ${size * 0.44} ${size * 0.4} L ${size * 0.42} ${size * 0.36} L ${size * 0.46} ${size * 0.34} L ${size * 0.44} ${size * 0.3} L ${size * 0.48} ${size * 0.28} Z" 
          fill="#0093D2" opacity="0.8"/>
  </g>
</svg>
`;

// Icono Inspector (Lupa con checklist)
const inspectorIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="inspectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#inspectorGrad)"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.15}" fill="none" stroke="white" stroke-width="${size * 0.03}"/>
    <line x1="${size * 0.45}" y1="${size * 0.45}" x2="${size * 0.6}" y2="${size * 0.6}" stroke="white" stroke-width="${size * 0.04}" stroke-linecap="round"/>
    <path d="M ${size * 0.25} ${size * 0.35} L ${size * 0.32} ${size * 0.42} L ${size * 0.45} ${size * 0.28}" 
          fill="none" stroke="white" stroke-width="${size * 0.025}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

// Crear directorio public si no existe
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generar iconos Admin
fs.writeFileSync(
  path.join(publicDir, 'icon-admin-192.svg'),
  adminIconSVG(192)
);
fs.writeFileSync(
  path.join(publicDir, 'icon-admin-512.svg'),
  adminIconSVG(512)
);

// Generar iconos Inspector
fs.writeFileSync(
  path.join(publicDir, 'icon-inspector-192.svg'),
  inspectorIconSVG(192)
);
fs.writeFileSync(
  path.join(publicDir, 'icon-inspector-512.svg'),
  inspectorIconSVG(512)
);

console.log('✅ Iconos SVG generados exitosamente');
console.log('📁 Ubicación: public/');
console.log('');
console.log('Iconos creados:');
console.log('  - icon-admin-192.svg');
console.log('  - icon-admin-512.svg');
console.log('  - icon-inspector-192.svg');
console.log('  - icon-inspector-512.svg');
console.log('');
console.log('💡 Para convertir a PNG, puedes usar:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - O cualquier herramienta de conversión SVG a PNG');
