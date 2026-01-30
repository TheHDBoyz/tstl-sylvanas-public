# TSTL-Sylvanas Setup Guide

A TypeScript-to-Lua build system for Sylvanas rotation scripts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tstl-sylvanas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local configuration:
   ```bash
   cp scripts/config.js scripts/config.local.js
   ```

4. Edit `scripts/config.local.js` with your paths:
   ```javascript
   module.exports = {
     // Root directory of this project
     PROJECT_DIR: 'C:/Path/To/tstl-sylvanas',

     // Location of Sylvanas .api directory (for type generation)
     API_DIR: 'C:/Path/To/Sylvanas/scripts/.api',

     // Where to output generated TypeScript types
     TYPES_OUTPUT_DIR: 'C:/Path/To/tstl-sylvanas/src/types',

     // Sylvanas scripts directory (where rotations are deployed)
     SYLVANAS_SCRIPTS_DIR: 'C:/Path/To/Sylvanas/scripts',
   };
   ```

## Project Structure

```
tstl-sylvanas/
├── src/
│   ├── types/                      # Generated TypeScript types from Sylvanas API
│   ├── ext_rotation_template/      # Minimal template rotation (start here!)
│   │   ├── header.ts               # Plugin metadata
│   │   ├── main.ts                 # Main entry point
│   │   ├── tsconfig.json           # TypeScript config for main
│   │   └── tsconfig.header.json    # TypeScript config for header
│   └── ext_rotation_*/             # Your rotation folders
├── dist/                           # Transpiled Lua output (generated)
├── scripts/
│   ├── config.js                   # Default configuration template
│   ├── config.local.js             # Your local configuration (gitignored)
│   ├── build-rotation.js           # Main rotation build script
│   ├── build-bb-core.js            # Shared library build script
│   └── generate-api-types.js       # Type generator from Sylvanas API
└── package.json
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all rotations (bundled, production) |
| `npm run build:debug` | Build all rotations (unbundled, for debugging) |
| `npm run build:rotation <name>` | Build a specific rotation |
| `npm run build:bb-core` | Build only the shared bb_core library |
| `npm run generate-types` | Generate TypeScript types from Sylvanas API |
| `npm run clean` | Remove dist/ folder |
| `npm run lint` | Run ESLint on source files |
| `npm run typecheck` | Run TypeScript type checking |

### Build Examples

```bash
# Build all rotations
npm run build

# Build only the template rotation
npm run build:rotation ext_rotation_template

# Debug build (Lua files not bundled, easier to debug)
npm run build:debug

# Debug build for specific rotation
node scripts/build-rotation.js --debug ext_rotation_template
```

## Creating a New Rotation

1. Copy the template folder:
   ```bash
   cp -r src/ext_rotation_template src/ext_rotation_my_spec
   ```

2. Update `header.ts` with your rotation's metadata:
   ```typescript
   plugin.name = "My Rotation";
   plugin.author = "Your Name";
   plugin.version = "1.0.0";
   ```

3. Update `tsconfig.json` and `tsconfig.header.json`:
   - Change `outDir` paths to match your new folder name

4. Write your rotation logic in `main.ts`

5. Build and test:
   ```bash
   npm run build:rotation ext_rotation_my_spec
   ```

## Rotation Naming Convention

Rotation folders must follow this pattern to be auto-discovered:
```
ext_rotation_<name>/
```

Examples:
- `ext_rotation_hunter_bm`
- `ext_rotation_warrior_fury`
- `ext_rotation_template`

## Generating API Types

If you have access to the Sylvanas `.api` folder, you can generate TypeScript types:

```bash
npm run generate-types
```

This reads Lua files from `API_DIR` and generates TypeScript declarations in `TYPES_OUTPUT_DIR`.

## Troubleshooting

### Build fails with "config file not found"
Create `scripts/config.local.js` with your local paths. See Installation step 3-4.

### Rotation not showing in Sylvanas
- Check that your rotation folder starts with `ext_rotation_`
- Verify the header.lua was generated and has `plugin.load = true`
- Check Sylvanas logs for errors

### TypeScript errors during build
Run `npm run typecheck` to see detailed type errors.

### Bundling fails
- Ensure all imports use the correct module paths
- External Sylvanas modules (in `common/`) are not bundled - they're loaded at runtime

## Debug vs Production Builds

**Production (`npm run build`):**
- All local modules are bundled into a single `main.lua`
- Smaller file count, easier to distribute
- Harder to debug (minified paths)

**Debug (`npm run build:debug`):**
- Lua files are copied as-is, not bundled
- Each module is a separate file
- Easier to debug with Sylvanas error messages
- Requires bb_core to be deployed separately

## License

MIT
