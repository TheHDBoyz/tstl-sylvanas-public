/**
 * Build script for bb_core shared library
 *
 * Copies Lua source files and transpiles TypeScript on top.
 * Run this before building rotations that depend on bb_core.
 *
 * Usage:
 *   node scripts/build-bb-core.js [options]
 *
 * Options:
 *   --deploy    Also copy bb_core to SYLVANAS_SCRIPTS_DIR (for debug builds)
 */

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

if (!PROJECT_DIR) {
  console.error('ERROR: PROJECT_DIR must be set in config file.');
  process.exit(1);
}

// Derived paths
const SRC_DIR = path.join(PROJECT_DIR, 'src');
const DIST_DIR = path.join(PROJECT_DIR, 'dist');
const BB_CORE_LUA_SRC = path.join(SRC_DIR, 'ext_plugin_bb_core_lua');
const BB_CORE_TS_SRC = path.join(SRC_DIR, 'ext_plugin_bb_core');
const BB_CORE_TS_CONFIG = path.join(BB_CORE_TS_SRC, 'tsconfig.json');
const BB_CORE_DIST = path.join(DIST_DIR, 'ext_plugin_bb_core');

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

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const deployMode = args.includes('--deploy');

  console.log('BB Core Builder');
  console.log('===============\n');

  // Check if bb_core exists
  if (!fs.existsSync(BB_CORE_LUA_SRC) && !fs.existsSync(BB_CORE_TS_SRC)) {
    console.log('bb_core not found, skipping...');
    console.log('  (This is normal if you do not have bb_core installed)');
    process.exit(0);
  }

  // Step 1: Copy bb_core Lua to dist (base layer)
  if (fs.existsSync(BB_CORE_LUA_SRC)) {
    console.log('1. Copying bb_core Lua to dist...');
    if (fs.existsSync(BB_CORE_DIST)) {
      fs.rmSync(BB_CORE_DIST, { recursive: true });
    }
    copyLuaFiles(BB_CORE_LUA_SRC, BB_CORE_DIST);
    console.log('   Copied to', BB_CORE_DIST);
  } else {
    console.log('1. No bb_core Lua source found, skipping...');
  }

  // Step 2: Transpile bb_core TypeScript on top (overwrites converted files)
  if (fs.existsSync(BB_CORE_TS_CONFIG)) {
    console.log('\n2. Transpiling bb_core TypeScript...');
    try {
      execSync(`npx tstl -p "${BB_CORE_TS_CONFIG}"`, {
        cwd: PROJECT_DIR,
        stdio: 'inherit'
      });
      console.log('   Transpiled TypeScript to', BB_CORE_DIST);
    } catch (error) {
      console.error('   Transpilation failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('\n2. No bb_core TypeScript config found, skipping...');
  }

  // Step 3: Deploy to Sylvanas (optional, for debug builds)
  if (deployMode) {
    if (!SYLVANAS_SCRIPTS_DIR) {
      console.error('\nERROR: --deploy requires SYLVANAS_SCRIPTS_DIR in config.');
      process.exit(1);
    }

    console.log('\n3. Deploying bb_core to Sylvanas...');
    const bbCoreOutputDir = path.join(SYLVANAS_SCRIPTS_DIR, 'ext_plugin_bb_core');

    if (fs.existsSync(bbCoreOutputDir)) {
      fs.rmSync(bbCoreOutputDir, { recursive: true });
    }
    copyLuaFiles(BB_CORE_DIST, bbCoreOutputDir);
    console.log('   Deployed to', bbCoreOutputDir);
  }

  console.log('\n✓ bb_core built successfully!');
}

main();
