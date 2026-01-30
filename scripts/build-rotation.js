/**
 * Generalized build script for Sylvanas rotations
 *
 * Usage:
 *   node scripts/build-rotation.js [options] [rotation-name]
 *
 * Options:
 *   --debug    Skip bundling, copy Lua files as-is (for debugging)
 *
 * Examples:
 *   node scripts/build-rotation.js                         # Build all rotations
 *   node scripts/build-rotation.js ext_rotation_template   # Build specific rotation
 *   node scripts/build-rotation.js --debug                 # Debug build all
 *   node scripts/build-rotation.js --debug ext_rotation_template  # Debug build one
 */

const { bundle } = require('luabundle');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const localConfigPath = path.join(__dirname, 'config.local.js');
const defaultConfigPath = path.join(__dirname, 'config.js');

let config;
if (fs.existsSync(localConfigPath)) {
  config = require(localConfigPath);
} else if (fs.existsSync(defaultConfigPath)) {
  config = require(defaultConfigPath);
} else {
  console.error('ERROR: No config file found. Create scripts/config.local.js with your paths.');
  process.exit(1);
}

const { PROJECT_DIR, SYLVANAS_SCRIPTS_DIR } = config;

if (!PROJECT_DIR || !SYLVANAS_SCRIPTS_DIR) {
  console.error('ERROR: PROJECT_DIR and SYLVANAS_SCRIPTS_DIR must be set in config file.');
  process.exit(1);
}

// Derived paths
const SRC_DIR = path.join(PROJECT_DIR, 'src');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');

// External modules that should NOT be bundled (loaded at runtime by Sylvanas)
const EXTERNAL_MODULES = [
  // Geometry
  'common/geometry/vector_2',
  'common/geometry/vector_3',
  'common/geometry/geometry',
  'common/geometry/circle',
  'common/geometry/rectangle',
  'common/geometry/cone',

  // Common base
  'common/color',
  'common/enums',
  'common/buff_db',
  'common/unit_manager',
  'common/spell_attributes',
  'common/talents_id',
  'common/wow_api_clone',
  'common/ow_menu_api',
  'common/izi_sdk',

  // Modules
  'common/modules/settings_manager',
  'common/modules/combat_forecast',
  'common/modules/spell_queue',
  'common/modules/spell_prediction',
  'common/modules/profiler',
  'common/modules/buff_manager',
  'common/modules/health_prediction',
  'common/modules/target_selector',

  // Utilities
  'common/utility/control_panel_helper',
  'common/utility/plugin_helper',
  'common/utility/unit_helper',
  'common/utility/auto_attack_helper',
  'common/utility/key_helper',
  'common/utility/spell_helper',
  'common/utility/spell_sequence_helper',
  'common/utility/graphics_helper',
  'common/utility/movement_handler',
  'common/utility/simple_movement',
  'common/utility/coords_helper',
  'common/utility/cooldown_tracker',
  'common/utility/dungeons_helper',
  'common/utility/evade_helper',
  'common/utility/fish_helper',
  'common/utility/inventory_helper',
  'common/utility/pet_handler',
  'common/utility/pvp_helper',
  'common/utility/wigs_tracker',
  'common/utility/ui_buttons_info',
  'common/utility/assets_helper',
  'common/utility/icons_helper',
  'common/utility/dispel_external_filters_helper',
  'common/utility/kick_external_filters_helper',
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Copy directory recursively (only .lua files)
 */
function copyLuaFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyLuaFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.lua')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Fix header.lua export for Sylvanas loader
 */
function fixHeaderExport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('   WARNING: header.lua not found at', filePath);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  content = content.replace(
    /____exports\.default = plugin\r?\nreturn ____exports\s*$/m,
    `____exports.default = plugin
-- Sylvanas compatibility: return plugin directly
return setmetatable(plugin, { __index = ____exports })`
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('   Fixed header.lua export');
  } else {
    console.log('   header.lua already in correct format');
  }
}

/**
 * Discover all rotation folders in src/
 */
function discoverRotations() {
  const entries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
  const rotations = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('ext_rotation_')) {
      const tsconfigPath = path.join(SRC_DIR, entry.name, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        rotations.push(entry.name);
      }
    }
  }

  return rotations;
}

/**
 * Build a single rotation
 * @param {string} rotationName - Name of the rotation folder
 * @param {boolean} debugMode - If true, skip bundling and copy Lua files as-is
 */
function buildRotation(rotationName, debugMode = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Building: ${rotationName}${debugMode ? ' (DEBUG)' : ''}`);
  console.log('='.repeat(60));

  const rotationSrc = path.join(SRC_DIR, rotationName);
  const rotationDist = path.join(DIST_DIR, rotationName);
  const outputDir = path.join(SYLVANAS_SCRIPTS_DIR, rotationName);

  const tsconfigPath = path.join(rotationSrc, 'tsconfig.json');
  const tsconfigHeaderPath = path.join(rotationSrc, 'tsconfig.header.json');

  // Verify rotation exists
  if (!fs.existsSync(tsconfigPath)) {
    console.error(`ERROR: tsconfig.json not found for ${rotationName}`);
    return false;
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 1: Transpile header (if exists)
  if (fs.existsSync(tsconfigHeaderPath)) {
    console.log('\n1. Transpiling header...');
    try {
      execSync(`npx tstl -p "${tsconfigHeaderPath}"`, {
        cwd: PROJECT_DIR,
        stdio: 'inherit'
      });
    } catch (error) {
      console.error('   Header transpilation failed:', error.message);
      return false;
    }
  } else {
    console.log('\n1. No tsconfig.header.json found, skipping header...');
  }

  // Step 2: Transpile main
  console.log('\n2. Transpiling main...');
  try {
    execSync(`npx tstl -p "${tsconfigPath}"`, {
      cwd: PROJECT_DIR,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('   Main transpilation failed:', error.message);
    return false;
  }

  // Step 3: Copy and fix header.lua
  console.log('\n3. Copying and fixing header.lua...');
  const headerSrc = path.join(rotationDist, 'header.lua');
  const headerDest = path.join(outputDir, 'header.lua');

  if (fs.existsSync(headerSrc)) {
    fs.copyFileSync(headerSrc, headerDest);
    console.log('   Copied header.lua to', headerDest);
    fixHeaderExport(headerDest);
  } else {
    console.log('   No header.lua found, skipping...');
  }

  // Step 4: Bundle or copy (debug mode)
  if (debugMode) {
    console.log('\n4. Debug mode: Copying Lua files as-is...');

    // Copy rotation Lua files
    copyLuaFiles(rotationDist, outputDir);
    console.log('   Copied rotation Lua files to', outputDir);
  } else {
    console.log('\n4. Bundling with luabundle...');
    const entryPoint = path.join(rotationDist, 'main.lua');
    const outputBundle = path.join(outputDir, 'main.lua');

    if (!fs.existsSync(entryPoint)) {
      console.error('   ERROR: main.lua not found at', entryPoint);
      return false;
    }

    try {
      const bundledCode = bundle(entryPoint, {
        paths: [
          `${rotationDist}/?.lua`,
          `${rotationDist}/?/init.lua`,
          `${DIST_DIR}/?.lua`,
          `${DIST_DIR}/?/init.lua`,
        ],
        ignoredModuleNames: EXTERNAL_MODULES,
        isolate: false,
      });

      fs.writeFileSync(outputBundle, bundledCode);
      console.log('   Bundle created:', outputBundle);
    } catch (error) {
      console.error('   Bundle failed:', error.message);
      return false;
    }
  }

  console.log(`\n✓ ${rotationName} built successfully!`);
  return true;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  // Parse flags
  const debugMode = args.includes('--debug');
  const targetRotation = args.find(arg => !arg.startsWith('--'));

  console.log('Sylvanas Rotation Builder');
  console.log('========================\n');
  console.log('Project:', PROJECT_DIR);
  console.log('Output:', SYLVANAS_SCRIPTS_DIR);
  if (debugMode) {
    console.log('Mode: DEBUG (no bundling)');
  }

  // Discover available rotations
  const availableRotations = discoverRotations();
  console.log('\nAvailable rotations:', availableRotations.join(', ') || '(none)');

  // Determine which rotations to build
  let rotationsToBuild;
  if (targetRotation) {
    if (!availableRotations.includes(targetRotation)) {
      console.error(`\nERROR: Rotation "${targetRotation}" not found.`);
      console.log('Available rotations:', availableRotations.join(', '));
      process.exit(1);
    }
    rotationsToBuild = [targetRotation];
  } else {
    rotationsToBuild = availableRotations;
  }

  if (rotationsToBuild.length === 0) {
    console.log('\nNo rotations to build.');
    process.exit(0);
  }

  console.log('\nBuilding:', rotationsToBuild.join(', '));

  // Build each rotation
  let successCount = 0;
  let failCount = 0;

  for (const rotation of rotationsToBuild) {
    if (buildRotation(rotation, debugMode)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Build Summary');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
