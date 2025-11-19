/**
 * Script para verificar la configuración PWA
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración PWA...\n');

const publicDir = path.join(__dirname, '..', 'public');
const errors = [];
const warnings = [];
const success = [];

// Verificar manifests
const manifests = [
  'manifest-admin.json',
  'manifest-inspector.json'
];

manifests.forEach(manifest => {
  const manifestPath = path.join(publicDir, manifest);
  if (fs.existsSync(manifestPath)) {
    try {
      const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Verificar campos requeridos
      const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
      const missing = required.filter(field => !content[field]);
      
      if (missing.length === 0) {
        success.push(`✅ ${manifest} - Válido`);
      } else {
        errors.push(`❌ ${manifest} - Faltan campos: ${missing.join(', ')}`);
      }
      
      // Verificar iconos
      if (content.icons && content.icons.length > 0) {
        content.icons.forEach(icon => {
          const iconPath = path.join(publicDir, icon.src);
          if (!fs.existsSync(iconPath)) {
            warnings.push(`⚠️  ${manifest} - Icono no encontrado: ${icon.src}`);
          }
        });
      }
    } catch (error) {
      errors.push(`❌ ${manifest} - JSON inválido: ${error.message}`);
    }
  } else {
    errors.push(`❌ ${manifest} - Archivo no encontrado`);
  }
});

// Verificar service workers
const serviceWorkers = [
  'sw-admin.js',
  'sw-inspector.js'
];

serviceWorkers.forEach(sw => {
  const swPath = path.join(publicDir, sw);
  if (fs.existsSync(swPath)) {
    const content = fs.readFileSync(swPath, 'utf8');
    
    // Verificar eventos básicos
    const events = ['install', 'activate', 'fetch'];
    const missingEvents = events.filter(event => !content.includes(`addEventListener('${event}'`));
    
    if (missingEvents.length === 0) {
      success.push(`✅ ${sw} - Eventos completos`);
    } else {
      warnings.push(`⚠️  ${sw} - Faltan eventos: ${missingEvents.join(', ')}`);
    }
  } else {
    errors.push(`❌ ${sw} - Archivo no encontrado`);
  }
});

// Verificar iconos
const icons = [
  'icon-admin-192.svg',
  'icon-admin-512.svg',
  'icon-inspector-192.svg',
  'icon-inspector-512.svg'
];

icons.forEach(icon => {
  const iconPath = path.join(publicDir, icon);
  if (fs.existsSync(iconPath)) {
    success.push(`✅ ${icon} - Existe`);
  } else {
    warnings.push(`⚠️  ${icon} - No encontrado`);
  }
});

// Verificar componentes
const componentsDir = path.join(__dirname, '..', 'components', 'pwa');
const components = [
  'InstallPWA.tsx',
  'PWARegistration.tsx'
];

components.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  if (fs.existsSync(componentPath)) {
    success.push(`✅ ${component} - Existe`);
  } else {
    errors.push(`❌ ${component} - No encontrado`);
  }
});

// Verificar offline.html
const offlinePath = path.join(publicDir, 'offline.html');
if (fs.existsSync(offlinePath)) {
  success.push(`✅ offline.html - Existe`);
} else {
  warnings.push(`⚠️  offline.html - No encontrado`);
}

// Mostrar resultados
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (success.length > 0) {
  console.log('✨ ÉXITOS:\n');
  success.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:\n');
  warnings.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORES:\n');
  errors.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Resumen
const total = success.length + warnings.length + errors.length;
console.log(`📊 RESUMEN:`);
console.log(`   Total verificaciones: ${total}`);
console.log(`   ✅ Éxitos: ${success.length}`);
console.log(`   ⚠️  Advertencias: ${warnings.length}`);
console.log(`   ❌ Errores: ${errors.length}\n`);

if (errors.length === 0) {
  console.log('🎉 ¡Configuración PWA lista!\n');
  console.log('📱 Próximos pasos:');
  console.log('   1. npm run dev');
  console.log('   2. Visita http://localhost:3000/panel');
  console.log('   3. Espera el prompt de instalación');
  console.log('   4. ¡Instala tu PWA!\n');
  process.exit(0);
} else {
  console.log('⚠️  Hay errores que corregir antes de continuar.\n');
  process.exit(1);
}
