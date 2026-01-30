/**
 * Generate TypeScript declarations from Sylvanas API annotation files
 *
 * Usage: node scripts/generate-api-types.js [module-path]
 *
 * Examples:
 *   node scripts/generate-api-types.js                              # Generate all
 *   node scripts/generate-api-types.js common/modules/buff_manager  # Generate one
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

// Load config from config.local.js (gitignored) or fall back to config.js
let config;
const localConfigPath = path.join(__dirname, 'config.local.js');
const defaultConfigPath = path.join(__dirname, 'config.js');

if (fs.existsSync(localConfigPath)) {
  config = require(localConfigPath);
} else if (fs.existsSync(defaultConfigPath)) {
  config = require(defaultConfigPath);
} else {
  console.error('ERROR: No config file found. Create scripts/config.local.js with API_DIR and OUTPUT_DIR.');
  process.exit(1);
}

const { API_DIR, TYPES_OUTPUT_DIR } = config;
const OUTPUT_DIR = TYPES_OUTPUT_DIR; // Alias for backwards compatibility

if (!API_DIR || !TYPES_OUTPUT_DIR) {
  console.error('ERROR: API_DIR and TYPES_OUTPUT_DIR must be set in config file.');
  console.error('Edit scripts/config.local.js with your paths.');
  process.exit(1);
}



/**
 * Module configuration schema:
 *
 * @typedef {Object} ModuleConfig
 * @property {string} file - Source .lua/.api file path relative to API_DIR
 * @property {string} [mainExport] - Interface name for default export. If omitted, no module declaration is generated.
 * @property {string[]} [filterClasses] - Only include classes matching these patterns (supports trailing * wildcard)
 * @property {boolean} [declareGlobalVar] - If true, emits `declare const X: X;` for the main export
 */

/** @type {Record<string, ModuleConfig>} */
const MODULES = {
  // =========================================================================
  // Geometry
  // =========================================================================
  'common/geometry/vector_2': {
    file: 'common/geometry/vec2.lua',
    mainExport: 'vec2',
  },
  'common/geometry/vector_3': {
    file: 'common/geometry/vec3.lua',
    mainExport: 'vec3',
  },
  'common/geometry/circle': {
    file: 'common/geometry/geometry.lua',
    mainExport: 'circle',
    filterClasses: ['circle', 'circle_*'],
  },
  'common/geometry/rectangle': {
    file: 'common/geometry/geometry.lua',
    mainExport: 'rectangle',
    filterClasses: ['rectangle', 'rectangle_*'],
  },
  'common/geometry/cone': {
    file: 'common/geometry/geometry.lua',
    mainExport: 'cone',
    filterClasses: ['cone', 'cone_*'],
  },

  // =========================================================================
  // Common Base
  // =========================================================================
  'common/color': {
    file: 'common/color.lua',
    mainExport: 'color',
  },
  'common/enums': {
    file: 'common/enums.lua',
    // No mainExport - pure global type definitions
  },
  'common/unit_manager': {
    file: 'common/unit_manager.lua',
    mainExport: 'unit_manager',
  },
  'common/buff_db': {
    file: 'common/buff_db.lua',
    mainExport: 'buff_db',
  },
  'common/spell_attributes': {
    file: 'common/spell_attributes.lua',
    mainExport: 'spell_attributes',
  },
  'common/talents_id': {
    file: 'common/talents_id.lua',
    mainExport: 'talents_id',
  },
  'common/wow_api_clone': {
    file: 'common/wow_api_clone.lua',
    mainExport: 'wow_api_clone',
  },
  'common/ow_menu_api': {
    file: 'common/ow_menu_api.lua',
    mainExport: 'ow_menu_api',
  },
  'common/izi_sdk': {
    file: 'common/izi_sdk.lua',
    mainExport: 'izi_api',
  },

  // =========================================================================
  // Modules
  // =========================================================================
  'common/modules/buff_manager': {
    file: 'common/modules/buff_manager.lua',
    mainExport: 'buff_manager',
  },
  'common/modules/settings_manager': {
    file: 'common/modules/settings_manager.lua',
    mainExport: 'settings_manager',
  },
  'common/modules/spell_queue': {
    file: 'common/modules/spell_queue.lua',
    mainExport: 'spell_queue',
  },
  'common/modules/spell_prediction': {
    file: 'common/modules/spell_prediction.lua',
    mainExport: 'spell_prediction',
  },
  'common/modules/combat_forecast': {
    file: 'common/modules/combat_forecast.lua',
    mainExport: 'combat_forecast',
  },
  'common/modules/profiler': {
    file: 'common/modules/profiler.lua',
    mainExport: 'profiler',
  },
  'common/modules/health_prediction': {
    file: 'common/modules/health_prediction.lua',
    mainExport: 'health_prediction',
  },
  'common/modules/target_selector': {
    file: 'common/modules/target_selector.lua',
    mainExport: 'target_selector',
  },

  // =========================================================================
  // Utility Helpers
  // =========================================================================
  'common/utility/plugin_helper': {
    file: 'common/utility/plugin_helper.lua',
    mainExport: 'plugin_helper',
  },
  'common/utility/control_panel_helper': {
    file: 'common/utility/control_panel_helper.lua',
    mainExport: 'control_panel_helper',
  },
  'common/utility/unit_helper': {
    file: 'common/utility/unit_helper.lua',
    mainExport: 'unit_helper',
  },
  'common/utility/spell_helper': {
    file: 'common/utility/spell_helper.lua',
    mainExport: 'spell_helper',
  },
  'common/utility/key_helper': {
    file: 'common/utility/key_helper.lua',
    mainExport: 'key_helper',
  },
  'common/utility/auto_attack_helper': {
    file: 'common/utility/auto_attack_helper.lua',
    mainExport: 'auto_attack_helper',
  },
  'common/utility/cooldown_tracker': {
    file: 'common/utility/cooldown_tracker.lua',
    mainExport: 'cooldown_tracker',
  },
  'common/utility/dungeons_helper': {
    file: 'common/utility/dungeons_helper.lua',
    mainExport: 'dungeons_helper',
  },
  'common/utility/evade_helper': {
    file: 'common/utility/evade_helper.lua',
    mainExport: 'evade_helper',
  },
  'common/utility/fish_helper': {
    file: 'common/utility/fish_helper.lua',
    mainExport: 'fish_helper',
  },
  'common/utility/graphics_helper': {
    file: 'common/utility/graphics_helper.lua',
    mainExport: 'graphics_helper',
  },
  'common/utility/inventory_helper': {
    file: 'common/utility/inventory_helper.lua',
    mainExport: 'inventory_helper',
  },
  'common/utility/kick_external_filters_helper': {
    file: 'common/utility/kick_external_filters_helper.lua',
    mainExport: 'kick_external_filters_helper',
  },
  'common/utility/dispel_external_filters_helper': {
    file: 'common/utility/dispel_external_filters_helper.lua',
    mainExport: 'dispel_external_filters_helper',
  },
  'common/utility/movement_handler': {
    file: 'common/utility/movement_handler.lua',
    mainExport: 'movement_handler',
  },
  'common/utility/pet_handler': {
    file: 'common/utility/pet_handler.lua',
    mainExport: 'pet_handler',
  },
  'common/utility/pvp_helper': {
    file: 'common/utility/pvp_helper.lua',
    mainExport: 'pvp_helper',
  },
  'common/utility/simple_movement': {
    file: 'common/utility/simple_movement.lua',
    mainExport: 'simple_movement',
  },
  'common/utility/ui_buttons_info': {
    file: 'common/utility/ui_buttons_info.lua',
    mainExport: 'ui_buttons_info',
  },
  'common/utility/wigs_tracker': {
    file: 'common/utility/wigs_tracker.lua',
    mainExport: 'wigs_tracker',
  },
  'common/utility/assets_helper': {
    file: 'common/utility/assets_helper.lua',
    mainExport: 'assets_helper',
  },
  'common/utility/icons_helper': {
    file: 'common/utility/icons_helper.lua',
    mainExport: 'icons_helper',
  },
  'common/utility/spell_sequence_helper': {
    file: 'common/utility/spell_sequence_helper.lua',
    mainExport: 'spell_sequence_helper',
  },
  'common/utility/coords_helper': {
    file: 'common/utility/coords_helper.lua',
    mainExport: 'coords_helper',
  },

  // =========================================================================
  // Core globals - available everywhere + importable
  // =========================================================================
  'menu': {
    file: 'menu.lua',
    mainExport: 'menu',
    declareGlobalVar: true,
  },
  'core': {
    file: 'core.lua',
    mainExport: 'core',
    declareGlobalVar: true,
  },
  'game_object': {
    file: 'game_object.lua',
    mainExport: 'game_object',
    declareGlobalVar: false, // game_object is a type, not a runtime global
  },
};

// ============================================================================
// Type Conversion
// ============================================================================

function convertLuaTypeToTS(luaType) {
  luaType = luaType.trim();

  // Strip inline Lua comments
  const commentIdx = luaType.indexOf(' --');
  if (commentIdx !== -1) {
    luaType = luaType.slice(0, commentIdx).trim();
  }
  const hashIdx = luaType.indexOf('  #');
  if (hashIdx !== -1) {
    luaType = luaType.slice(0, hashIdx).trim();
  }

  if (!luaType) return 'void';
  if (luaType === 'nil') return 'void';

  // Handle trailing "| nil"
  if (luaType.endsWith('| nil') || luaType.endsWith('|nil')) {
    const base = luaType.replace(/\|\s*nil$/, '').trim();
    return `${convertLuaTypeToTS(base)} | null`;
  }

  // Primitives
  if (luaType === 'number' || luaType === 'integer') return 'number';
  if (luaType === 'string') return 'string';
  if (luaType === 'boolean') return 'boolean';
  if (luaType === 'any') return 'any';
  if (luaType === 'userdata') return 'unknown';
  if (luaType === 'table') return 'object';
  if (luaType === 'function') return '(...args: any[]) => any';

  // Optional: type?
  if (luaType.endsWith('?') && !luaType.includes('|')) {
    return `${convertLuaTypeToTS(luaType.slice(0, -1))} | undefined`;
  }

  // Unions
  if (luaType.includes('|')) {
    const parts = splitUnion(luaType);
    if (parts.length > 1) {
      const converted = parts.map(p => convertLuaTypeToTS(p.trim()));
      return [...new Set(converted)].join(' | ');
    }
  }

  // Tuple: (type1, type2)
  if (luaType.startsWith('(') && luaType.endsWith(')')) {
    const inner = luaType.slice(1, -1);
    const parts = splitByComma(inner);
    if (parts.length > 1) {
      const innerTypes = parts.map(t => convertLuaTypeToTS(t.trim()));
      return `LuaMultiReturn<[${innerTypes.join(', ')}]>`;
    }
    return convertLuaTypeToTS(inner);
  }

  // Arrays: type[]
  const arrayMatch = luaType.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    return `${convertLuaTypeToTS(arrayMatch[1])}[]`;
  }

  // table<K, V>
  if (luaType.startsWith('table<') && luaType.endsWith('>')) {
    const inner = luaType.slice(6, -1);
    const parts = splitByComma(inner);
    if (parts.length === 2) {
      return `Record<${convertLuaTypeToTS(parts[0].trim())}, ${convertLuaTypeToTS(parts[1].trim())}>`;
    }
  }

  // Function: fun(params): return
  if (luaType.startsWith('fun(') || luaType.startsWith('fun ')) {
    return parseFunType(luaType);
  }

  return luaType;
}

function convertLuaAliasToTS(luaType) {
  luaType = luaType.trim();

  // Handle object-like aliases: { field: type, field2: type }
  if (luaType.startsWith('{') && luaType.endsWith('}')) {
    const inner = luaType.slice(1, -1).trim();
    if (!inner) return '{}';

    const fields = [];
    const parts = splitByComma(inner);
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx !== -1) {
        const fieldName = part.slice(0, colonIdx).trim();
        const fieldType = part.slice(colonIdx + 1).trim();
        fields.push(`${fieldName}: ${convertLuaTypeToTS(fieldType)}`);
      }
    }
    return `{ ${fields.join('; ')} }`;
  }

  // Handle unions containing function types
  if (luaType.includes('|') && luaType.includes('fun(')) {
    const parts = splitUnion(luaType);
    const converted = parts.map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('fun(') || trimmed.startsWith('fun ')) {
        return `(${parseFunType(trimmed)})`;
      }
      return convertLuaTypeToTS(trimmed);
    });
    return [...new Set(converted)].join(' | ');
  }

  return convertLuaTypeToTS(luaType);
}

function splitUnion(type) {
  const parts = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < type.length; i++) {
    const char = type[i];
    if ('([{<'.includes(char)) { depth++; current += char; }
    else if (')]}>'.includes(char)) { depth--; current += char; }
    else if (char === '|' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += char; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function splitByComma(str) {
  const parts = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if ('([{<'.includes(char)) { depth++; current += char; }
    else if (')]}>'.includes(char)) { depth--; current += char; }
    else if (char === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
    else { current += char; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function findMatchingParen(str, start) {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '(') depth++;
    if (str[i] === ')') depth--;
    if (depth === 0) return i;
  }
  return -1;
}

// Context for the current class being parsed
let currentClassName = null;

function parseFunType(luaType) {
  const startParen = luaType.indexOf('(');
  if (startParen === -1) return '(...args: any[]) => any';

  const endParen = findMatchingParen(luaType, startParen);
  if (endParen === -1) return '(...args: any[]) => any';

  const paramsStr = luaType.slice(startParen + 1, endParen);
  const rest = luaType.slice(endParen + 1).trim();

  let returnType = 'void';
  if (rest.startsWith(':')) {
    let returnStr = rest.slice(1).trim();

    // Strip Lua comments
    const luaCommentIdx = returnStr.indexOf(' --');
    if (luaCommentIdx !== -1) {
      returnStr = returnStr.slice(0, luaCommentIdx).trim();
    }

    // Strip inline descriptions
    const descMatch = returnStr.match(/ [A-Z][a-z]/);
    if (descMatch && descMatch.index !== undefined) {
      returnStr = returnStr.slice(0, descMatch.index).trim();
    }

    // Handle Lua multi-return
    const returnParts = splitByComma(returnStr);
    if (returnParts.length > 1) {
      const innerTypes = returnParts.map(t => convertLuaTypeToTS(t.trim()));
      returnType = `LuaMultiReturn<[${innerTypes.join(', ')}]>`;
    } else {
      returnType = convertLuaTypeToTS(returnStr);
    }
  }

  const params = parseParams(paramsStr);

  const tsParams = params.map((p) => {
    if (p.name === 'self') {
      return `this: ${p.type}`;
    }
    const tsType = convertLuaTypeToTS(p.type);
    const opt = p.optional ? '?' : '';
    return `${sanitizeParamName(p.name)}${opt}: ${tsType}`;
  });

  // If no self param, it's a static function
  if (params.length === 0 || params[0].name !== 'self') {
    tsParams.unshift(`this: void`);
  }

  return `(${tsParams.join(', ')}) => ${returnType}`;
}

function parseParams(paramsStr) {
  if (!paramsStr.trim()) return [];

  const params = [];
  const parts = splitByComma(paramsStr);

  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;

    // Handle varargs
    if (trimmed.startsWith('...')) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const type = trimmed.slice(colonIdx + 1).trim();
        params.push({ name: '...args', type: type + '[]', optional: false, isVararg: true });
      } else {
        params.push({ name: '...args', type: 'any[]', optional: false, isVararg: true });
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      let name = trimmed.slice(0, colonIdx).trim();
      let type = trimmed.slice(colonIdx + 1).trim();
      const optional = name.endsWith('?') || type.endsWith('?');
      if (name.endsWith('?')) name = name.slice(0, -1);
      if (type.endsWith('?')) type = type.slice(0, -1);
      params.push({ name, type, optional });
    } else {
      params.push({ name: trimmed, type: 'any', optional: false });
    }
  }

  return params;
}

function sanitizeParamName(name) {
  const reserved = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
    'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
    'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
    'typeof', 'var', 'void', 'while', 'with', 'yield'];
  return reserved.includes(name) ? `_${name}` : name;
}

// ============================================================================
// Parsing API Files
// ============================================================================

/**
 * @typedef {Object} ParsedClass
 * @property {string} name
 * @property {Array<{name: string, type: string, description?: string, isMethod: boolean}>} fields - Methods
 * @property {Array<{name: string, type: string, description?: string, optional: boolean}>} dataFields - Data properties
 * @property {Array<{keyType: string, valueType: string}>} indexSignatures
 */

/**
 * @typedef {Object} ParseResult
 * @property {Map<string, ParsedClass>} classes
 * @property {Map<string, {name: string, type: string}>} aliases
 * @property {string|null} detectedMainExport - From @type annotation
 */

/**
 * Parse a LuaCATS API file and extract type information
 * @param {string} content
 * @returns {ParseResult}
 */
function parseApiFile(content) {
  const classes = new Map();
  const aliases = new Map();
  const lines = content.split('\n');

  let currentClass = null;
  let currentDescription = [];
  let detectedMainExport = null;
  let pendingParams = [];
  let pendingReturn = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle function Class.method(params) pattern
    const funcDeclMatch = trimmed.match(/^function\s+([\w.]+)\.(\w+)\s*\(([^)]*)\)/);
    if (funcDeclMatch) {
      const classPath = funcDeclMatch[1];
      const methodName = funcDeclMatch[2];
      const paramsStr = funcDeclMatch[3];

      const classNameParts = classPath.split('.');
      const className = classNameParts[classNameParts.length - 1];

      if (!classes.has(className)) {
        classes.set(className, { name: className, fields: [], dataFields: [], indexSignatures: [] });
      }
      const cls = classes.get(className);

      const paramTypes = [];
      const paramNames = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      for (const paramName of paramNames) {
        const paramInfo = pendingParams.find(p => p.name === paramName);
        if (paramInfo) {
          const opt = paramInfo.optional ? '?' : '';
          paramTypes.push(`${paramName}${opt}: ${paramInfo.type}`);
        } else {
          paramTypes.push(`${paramName}: any`);
        }
      }

      const returnType = pendingReturn || 'void';
      // Dot-notation functions (function Class.method) have NO implicit self
      // Only colon-notation (function Class:method) has implicit self
      const funType = `fun(${paramTypes.join(', ')}): ${returnType}`;

      cls.fields.push({
        name: methodName,
        type: funType,
        description: currentDescription.join(' ') || undefined,
        isMethod: true,
      });

      pendingParams = [];
      pendingReturn = null;
      currentDescription = [];
      continue;
    }

    // Handle function Class:method(params) pattern (colon notation = implicit self)
    const funcColonMatch = trimmed.match(/^function\s+(\w+):(\w+)\s*\(([^)]*)\)/);
    if (funcColonMatch) {
      const className = funcColonMatch[1];
      const methodName = funcColonMatch[2];
      const paramsStr = funcColonMatch[3];

      if (!classes.has(className)) {
        classes.set(className, { name: className, fields: [], dataFields: [], indexSignatures: [] });
      }
      const cls = classes.get(className);

      const paramTypes = [];
      const paramNames = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      for (const paramName of paramNames) {
        const paramInfo = pendingParams.find(p => p.name === paramName);
        if (paramInfo) {
          const opt = paramInfo.optional ? '?' : '';
          paramTypes.push(`${paramName}${opt}: ${paramInfo.type}`);
        } else {
          paramTypes.push(`${paramName}: any`);
        }
      }

      const returnType = pendingReturn || 'void';
      // Colon-notation has implicit self
      const funType = `fun(self: ${className}${paramTypes.length > 0 ? ', ' + paramTypes.join(', ') : ''}): ${returnType}`;

      cls.fields.push({
        name: methodName,
        type: funType,
        description: currentDescription.join(' ') || undefined,
        isMethod: true,
      });

      pendingParams = [];
      pendingReturn = null;
      currentDescription = [];
      continue;
    }

    // Handle Class.subclass = {} pattern
    const subclassAssignMatch = trimmed.match(/^(\w+)\.(\w+)\s*=\s*\{\s*\}$/);
    if (subclassAssignMatch && currentClass) {
      const parentClassName = subclassAssignMatch[1];
      const fieldName = subclassAssignMatch[2];

      if (!classes.has(parentClassName)) {
        classes.set(parentClassName, { name: parentClassName, fields: [], dataFields: [], indexSignatures: [] });
      }
      const parentCls = classes.get(parentClassName);

      parentCls.dataFields.push({
        name: fieldName,
        type: currentClass,
        description: undefined,
        optional: false,
      });
      continue;
    }

    if (!trimmed.startsWith('---')) {
      if (trimmed === '' || trimmed.startsWith('--') || trimmed.startsWith('_G.')) {
        continue;
      }
      currentDescription = [];
      pendingParams = [];
      pendingReturn = null;
      continue;
    }

    const lineContent = trimmed.replace(/^---\s*/, '');

    // @type ClassName - main export hint
    const typeMatch = lineContent.match(/^@type\s+(\w+)/);
    if (typeMatch) {
      detectedMainExport = typeMatch[1];
      continue;
    }

    // @alias
    const aliasMatch = lineContent.match(/^@alias\s+(\w+)\s+(.+)$/);
    if (aliasMatch) {
      aliases.set(aliasMatch[1], { name: aliasMatch[1], type: aliasMatch[2].trim() });
      continue;
    }

    // @class
    const classMatch = lineContent.match(/^@class\s+(\w+)/);
    if (classMatch) {
      currentClass = classMatch[1];
      if (!classes.has(currentClass)) {
        classes.set(currentClass, { name: currentClass, fields: [], dataFields: [], indexSignatures: [] });
      }
      continue;
    }

    // @param
    const paramMatch = lineContent.match(/^@param\s+(\w+\??)\s+(\S+)(?:\s+(.*))?$/);
    if (paramMatch) {
      let paramName = paramMatch[1];
      const paramType = paramMatch[2];
      const isOptional = paramName.endsWith('?');
      if (isOptional) paramName = paramName.slice(0, -1);
      pendingParams.push({ name: paramName, type: paramType, optional: isOptional });
      continue;
    }

    // @return
    const returnMatch = lineContent.match(/^@return\s+(.+)$/);
    if (returnMatch) {
      let returnTypeStr = returnMatch[1].trim();
      const descMatch = returnTypeStr.match(/ [A-Z][a-z]| --/);
      if (descMatch && descMatch.index !== undefined) {
        returnTypeStr = returnTypeStr.slice(0, descMatch.index).trim();
      }
      const typeKeywords = ['nil', 'string', 'number', 'boolean', 'integer', 'any', 'void', 'table', 'function'];
      const trailingWordMatch = returnTypeStr.match(/ ([a-z_]\w*)$/);
      if (trailingWordMatch && !typeKeywords.includes(trailingWordMatch[1])) {
        returnTypeStr = returnTypeStr.slice(0, trailingWordMatch.index).trim();
      }
      if (returnTypeStr.match(/[>\]\w]\s+\w/)) {
        returnTypeStr = 'any';
      }
      pendingReturn = returnTypeStr;
      continue;
    }

    // @field [keyType] valueType - index signature
    const indexSigMatch = lineContent.match(/^@field\s+(?:public\s+)?\[(\w+)\]\s+(.+)$/);
    if (indexSigMatch && currentClass) {
      const cls = classes.get(currentClass);
      cls.indexSignatures.push({
        keyType: indexSigMatch[1],
        valueType: indexSigMatch[2].trim(),
      });
      continue;
    }

    // @field name type
    const fieldMatch = lineContent.match(/^@field\s+(?:public\s+)?(\w+\??)\s+(.+)$/);
    if (fieldMatch && currentClass) {
      const cls = classes.get(currentClass);
      let fieldName = fieldMatch[1];
      let fieldType = fieldMatch[2].trim();

      const isOptional = fieldName.endsWith('?');
      if (isOptional) fieldName = fieldName.slice(0, -1);

      let description = currentDescription.join(' ') || undefined;

      if (fieldType.startsWith('fun(') || fieldType.startsWith('fun ')) {
        const existingIdx = cls.fields.findIndex(f => f.name === fieldName);
        const hasSelf = fieldType.includes('self:') || fieldType.includes('self :');

        if (existingIdx !== -1) {
          const existingHasSelf = cls.fields[existingIdx].type.includes('self:') ||
                                   cls.fields[existingIdx].type.includes('self :');
          if (hasSelf && !existingHasSelf) {
            cls.fields[existingIdx] = { name: fieldName, type: fieldType, description, isMethod: true };
          }
        } else {
          cls.fields.push({ name: fieldName, type: fieldType, description, isMethod: true });
        }
      } else {
        const descMatch = fieldType.match(/ [A-Z][a-z]/);
        let cleanType = fieldType;
        let inlineDesc = null;
        if (descMatch && descMatch.index !== undefined) {
          cleanType = fieldType.slice(0, descMatch.index).trim();
          inlineDesc = fieldType.slice(descMatch.index).trim();
        }
        cls.dataFields.push({
          name: fieldName,
          type: cleanType,
          description: description || inlineDesc,
          optional: isOptional,
        });
      }
      currentDescription = [];
      continue;
    }

    // Description line
    if (!lineContent.startsWith('@') && lineContent.trim()) {
      currentDescription.push(lineContent.trim());
    }
  }

  return { classes, aliases, detectedMainExport };
}

// ============================================================================
// Class Filtering
// ============================================================================

/**
 * Check if a class name matches any of the filter patterns
 * @param {string} className
 * @param {string[]} patterns - Patterns like ['circle', 'circle_*']
 */
function matchesFilter(className, patterns) {
  for (const pattern of patterns) {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (className.startsWith(prefix)) return true;
    } else {
      if (className === pattern) return true;
    }
  }
  return false;
}

/**
 * Filter classes based on config patterns
 * @param {Map<string, ParsedClass>} classes
 * @param {string[]} [filterPatterns]
 * @returns {Map<string, ParsedClass>}
 */
function filterClasses(classes, filterPatterns) {
  if (!filterPatterns || filterPatterns.length === 0) {
    return classes;
  }

  const filtered = new Map();
  for (const [name, cls] of classes) {
    if (matchesFilter(name, filterPatterns)) {
      filtered.set(name, cls);
    }
  }
  return filtered;
}

// ============================================================================
// Enum Detection
// ============================================================================

function isEnumLikeClass(cls) {
  const hasDataFields = cls.dataFields && cls.dataFields.length > 0;
  const hasMethods = cls.fields && cls.fields.length > 0;
  const hasIndexSigs = cls.indexSignatures && cls.indexSignatures.length > 0;

  if (!hasDataFields || hasMethods || hasIndexSigs) return false;

  for (const field of cls.dataFields) {
    const fieldType = field.type.toLowerCase().trim();
    if (fieldType !== 'number' && fieldType !== 'integer') return false;
  }

  return true;
}

/**
 * Generate a TypeScript enum from a parsed class
 * @param {string} className
 * @param {ParsedClass} cls
 * @returns {string[]}
 */
function generateEnum(className, cls) {
  const lines = [];

  lines.push(`declare enum ${className} {`);

  for (const field of cls.dataFields) {
    if (field.description) {
      lines.push(`  /** ${field.description} */`);
    }
    // Emit enum member without explicit value (TypeScript will auto-number)
    lines.push(`  ${field.name},`);
  }

  lines.push(`}`);
  return lines;
}

// ============================================================================
// Declaration Generation
// ============================================================================

const RESERVED_METHOD_NAMES = ['new', 'delete', 'default', 'class', 'function', 'return', 'typeof', 'import', 'export'];

/**
 * Generate a TypeScript interface from a parsed class
 * @param {string} className
 * @param {ParsedClass} cls
 * @param {Set<string>} enumClasses - Set of class names that are enums
 * @returns {string[]}
 */
function generateInterface(className, cls, enumClasses) {
  const lines = [];
  currentClassName = className;

  lines.push(`interface ${className} {`);

  // Index signatures
  for (const sig of cls.indexSignatures || []) {
    lines.push(`  [key: ${convertLuaTypeToTS(sig.keyType)}]: ${convertLuaTypeToTS(sig.valueType)};`);
  }

  // Data fields
  for (const field of cls.dataFields || []) {
    if (field.description) {
      lines.push(`  /** ${field.description} */`);
    }
    let tsType = convertLuaTypeToTS(field.type);
    if (enumClasses.has(tsType)) {
      tsType = `typeof ${tsType}`;
    }
    const optMark = field.optional ? '?' : '';
    lines.push(`  ${field.name}${optMark}: ${tsType};`);
  }

  // Methods
  for (const field of cls.fields || []) {
    if (field.description) {
      lines.push(`  /** ${field.description} */`);
    }

    const funType = parseFunType(field.type);
    let methodSig = funType.replace(/^\(/, '');
    const lastArrowIdx = methodSig.lastIndexOf(') => ');
    if (lastArrowIdx !== -1) {
      methodSig = methodSig.slice(0, lastArrowIdx) + '): ' + methodSig.slice(lastArrowIdx + 5);
    }

    const methodName = RESERVED_METHOD_NAMES.includes(field.name) ? `"${field.name}"` : field.name;
    lines.push(`  ${methodName}(${methodSig};`);
  }

  lines.push(`}`);
  return lines;
}

/**
 * Generate complete TypeScript declaration file
 *
 * @param {string} modulePath - Import path like 'common/modules/buff_manager'
 * @param {ModuleConfig} config
 * @param {ParseResult} parseResult
 * @returns {string}
 */
function generateDeclaration(modulePath, config, parseResult) {
  const { classes, aliases, detectedMainExport } = parseResult;
  const lines = [];

  // Header
  lines.push(`// Auto-generated from Sylvanas API`);
  lines.push(`// Source: ${config.file}`);
  lines.push(`// Do not edit manually`);
  lines.push(``);

  // Filter classes if specified
  const filteredClasses = filterClasses(classes, config.filterClasses);

  // Generate type aliases (global scope)
  if (aliases.size > 0) {
    for (const [aliasName, alias] of aliases) {
      const tsType = convertLuaAliasToTS(alias.type);
      lines.push(`type ${aliasName} = ${tsType};`);
    }
    lines.push(``);
  }

  // First pass: identify enums
  const enumClasses = new Set();
  for (const [className, cls] of filteredClasses) {
    if (isEnumLikeClass(cls)) {
      enumClasses.add(className);
    }
  }

  // Generate enums
  for (const [className, cls] of filteredClasses) {
    if (enumClasses.has(className)) {
      lines.push(...generateEnum(className, cls));
      lines.push(``);
    }
  }

  // Generate interfaces
  for (const [className, cls] of filteredClasses) {
    if (!enumClasses.has(className)) {
      lines.push(...generateInterface(className, cls, enumClasses));
      lines.push(``);
    }
  }

  // Determine main export: config > detected > first interface with methods
  let mainExport = config.mainExport;
  if (!mainExport && detectedMainExport && filteredClasses.has(detectedMainExport)) {
    mainExport = detectedMainExport;
  }

  // Global variable declaration (for core, menu, etc.)
  if (config.declareGlobalVar && mainExport) {
    lines.push(`// Global variable declaration`);
    lines.push(`declare const ${mainExport}: ${mainExport};`);
    lines.push(``);
  }

  // Module declaration (only if mainExport is specified)
  if (mainExport) {
    lines.push(`// Module declaration for imports`);
    lines.push(`declare module "${modulePath}" {`);
    lines.push(`  const _default: ${mainExport};`);
    lines.push(`  export = _default;`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join('\n');
}

// ============================================================================
// Post-processing
// ============================================================================

function postProcessOwMenuApi(content) {
  content = content.replace(/opts\?: \{\):/g, 'opts?: object):');
  content = content.replace(/opts\?: \{, /g, 'opts?: object, ');
  return content;
}

function postProcessKickExternalFiltersHelper(content) {
  content = content.replace(/, string\|nil: any,/g, ',');
  return content;
}

function postProcessSpellSequenceHelper(content) {
  content = content.replace(/game_object \| \(this: void\) => game_object/g,
    'game_object | ((this: void) => game_object)');
  content = content.replace(/: string "([^"]+)";/g, ': "$1";');
  return content;
}

function postProcessIziSdk(content, outputDir) {
  // Fix adv_condition alias
  content = content.replace(
    /type adv_condition = boolean \| \(this: void, u: game_object\) => boolean;/,
    'type adv_condition = boolean | ((this: void, u: game_object) => boolean);'
  );

  // Fix cast_opts
  content = content.replace(
    /skip_back\?: boolean validated in is_castable_to_unit;/,
    'skip_back?: boolean;'
  );

  // Fix is_spell_in_range
  content = content.replace(
    /is_spell_in_range\(this: game_object, spell: number \| izi_spell \| \{id:fun\(self\):integer\}\): boolean;/,
    'is_spell_in_range(this: game_object, spell: number | izi_spell | { id: (this: any) => number }): boolean;'
  );

  // Fix constructor/factory fields - function in union needs parentheses
  content = content.replace(
    /vec2: vec2 \| \(this: void, x: number, y: number\) => vec2;/,
    'vec2: vec2 | ((this: void, x: number, y: number) => vec2);'
  );
  content = content.replace(
    /vec3: vec3 \| \(this: void, x: number, y: number, z: number\) => vec3;/,
    'vec3: vec3 | ((this: void, x: number, y: number, z: number) => vec3);'
  );
  content = content.replace(
    /circle: circle \| \(this: void, center: vec3, radius: number\) => circle;/,
    'circle: circle | ((this: void, center: vec3, radius: number) => circle);'
  );
  content = content.replace(
    /rectangle: rectangle \| \(this: void, min: vec3, max: vec3\) => rectangle;/,
    'rectangle: rectangle | ((this: void, min: vec3, max: vec3) => rectangle);'
  );
  content = content.replace(
    /cone: cone \| \(this: void, origin: vec3, direction: vec3, angle: number, range: number\) => cone;/,
    'cone: cone | ((this: void, origin: vec3, direction: number, range: number) => cone);'
  );

  // Fix event handler double-arrow syntax
  const eventHandlers = [
    'on_buff_gain', 'on_buff_lose', 'on_debuff_gain', 'on_debuff_lose',
    'on_combat_start', 'on_combat_finish', 'on_spell_begin', 'on_spell_success', 'on_spell_cancel'
  ];
  for (const handler of eventHandlers) {
    const pattern = new RegExp(`${handler}\\(this: void, cb: .*?\\) => \\(this: void\\): void;`, 'g');
    content = content.replace(pattern, `${handler}(this: void, cb: (this: void, ev: any) => void): () => void;`);
  }

  content = content.replace(
    /on_key_release\(this: void, key: .*?\) => \(this: void\): void;/,
    'on_key_release(this: void, key: number | string, cb: (this: void, key: number | string) => void): () => void;'
  );

  content = content.replace(
    /after\(this: void, seconds: number, fn: \(this: void\) => void\) => \(this: void\): void;/,
    'after(this: void, seconds: number, fn: (this: void) => void): () => void;'
  );

  // =========================================================================
  // Fix truncated tuple return types - use flexible patterns
  // These match any parameters since type aliases vary (Milliseconds, CCFlagMask, etc.)
  // =========================================================================

  // Pattern: methodName(this: game_object, ...anything...): (type, type,;
  // The truncation happens when description stripping cuts off the tuple

  // CC methods returning 5-element tuples: [boolean, CCFlagMask, Milliseconds, boolean, boolean]
  const cc5Methods = [
    'is_cc', 'isCC', 'crowd_controlled', 'isCrowdControlled',
    'is_cc_weak', 'isWeakCC', 'weak_cc',
    'is_rooted', 'rooted', 'isRooted',
    'is_stunned', 'stunned', 'isStunned',
    'is_feared', 'feared', 'isFeared',
    'is_sapped', 'sapped', 'isSapped',
    'is_silenced', 'silenced', 'isSilenced',
    'is_cycloned', 'cycloned', 'isCycloned',
    'is_disarmed', 'disarmed', 'isDisarmed',
    'is_disoriented', 'isDisorient', 'isDisoriented',
    'is_incap', 'is_incapacitated', 'isIncapacitated',
    'immune_cc', 'isCCImmune'
  ];
  for (const method of cc5Methods) {
    // Match the truncated return type pattern
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[boolean, number, number, boolean, boolean]>;');
  }

  // CC reduction methods returning 3-element tuples: [number, CCFlagMask, Milliseconds]
  const ccReductionMethods = ['get_cc_reduction', 'cc_reduction', 'getCCReduce', 'getCCReduction'];
  for (const method of ccReductionMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[number, number, number]>;');
  }

  // Slow methods returning 3-element tuples: [boolean, number, Milliseconds]
  const slowBoolMethods = ['is_slowed', 'isSlowed', 'slowed'];
  for (const method of slowBoolMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[boolean, number, number]>;');
  }

  // Slow mult methods returning 2-element tuples: [number, Milliseconds]
  const slowNumMethods = ['get_slow', 'slow_mult', 'getSlow'];
  for (const method of slowNumMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[number, number]>;');
  }

  // Slow immune methods returning 2-element tuples: [boolean, Milliseconds]
  const slowImmuneMethods = ['is_slow_immune', 'slow_immune', 'isSlowImmune'];
  for (const method of slowImmuneMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[boolean, number]>;');
  }

  // Damage reduction methods returning 3-element tuples: [number, DMGTypeMask, Milliseconds]
  const dmgReductionMethods = ['get_damage_reduction', 'getDRPct', 'dmg_reduction', 'dmgRed', 'getDamageReduction'];
  for (const method of dmgReductionMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[number, number, number]>;');
  }

  // Damage immune methods returning 3-element tuples: [boolean, DMGTypeMask, Milliseconds]
  const dmgImmuneMethods = ['isImmune', 'isDamageImmune', 'immune_dmg'];
  for (const method of dmgImmuneMethods) {
    const pattern = new RegExp(`(${method}\\([^)]*\\)):\\s*\\([^;]*,;`, 'g');
    content = content.replace(pattern, '$1: LuaMultiReturn<[boolean, number, number]>;');
  }

  return content;
}

/**
 * Apply module-specific post-processing
 * @param {string} modulePath
 * @param {string} content
 * @returns {string}
 */
function applyPostProcessing(modulePath, content) {
  switch (modulePath) {
    case 'common/izi_sdk':
      return postProcessIziSdk(content, OUTPUT_DIR);
    case 'common/ow_menu_api':
      return postProcessOwMenuApi(content);
    case 'common/utility/kick_external_filters_helper':
      return postProcessKickExternalFiltersHelper(content);
    case 'common/utility/spell_sequence_helper':
      return postProcessSpellSequenceHelper(content);
    default:
      return content;
  }
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const targetModule = args[0];

  console.log('Generating TypeScript declarations from Sylvanas API...\n');

  const modulesToProcess = targetModule
    ? { [targetModule]: MODULES[targetModule] }
    : MODULES;

  if (targetModule && !MODULES[targetModule]) {
    console.error(`Unknown module: ${targetModule}`);
    console.log('Available modules:', Object.keys(MODULES).join(', '));
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const [modulePath, config] of Object.entries(modulesToProcess)) {
    if (!config) continue;

    const inputPath = path.join(API_DIR, config.file);
    const outputPath = path.join(OUTPUT_DIR, modulePath + '.d.ts');

    const flags = [
      config.mainExport ? `export: ${config.mainExport}` : 'no export',
      config.filterClasses ? `filter: [${config.filterClasses.join(', ')}]` : null,
      config.declareGlobalVar ? 'global var' : null,
    ].filter(Boolean).join(', ');

    console.log(`Processing: ${modulePath} (${flags})`);

    if (!fs.existsSync(inputPath)) {
      console.log(`  WARNING: API file not found: ${inputPath}`);
      errorCount++;
      continue;
    }

    try {
      const content = fs.readFileSync(inputPath, 'utf-8');
      const parseResult = parseApiFile(content);

      if (parseResult.classes.size === 0) {
        console.log(`  WARNING: No classes found in ${config.file}`);
        skipCount++;
        continue;
      }

      let declaration = generateDeclaration(modulePath, config, parseResult);
      declaration = applyPostProcessing(modulePath, declaration);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, declaration);
      console.log(`  Generated: ${outputPath}`);
      successCount++;
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\nDone! ${successCount} generated, ${skipCount} skipped, ${errorCount} errors`);
}

main();