import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const MODEL_NESTED_DIRS = [
  'AuthModels',
  'BlogModels',
  'CommentsModels',
  'CommentLikeStatusModels',
  'PostModels',
  'UserModels',
  'VideoModels',
  'SecurityDeviceModels',
];

const VALIDATION_NESTED_DIRS = [
  'auth',
  'blog',
  'comment',
  'post',
  'user',
  'video',
];

const IMPORT_PATH_REPLACEMENTS = [
  ...MODEL_NESTED_DIRS.map((dir) => [
    new RegExp(`/models/${dir}/`, 'g'),
    '/models/',
  ]),
  ...VALIDATION_NESTED_DIRS.map((dir) => [
    new RegExp(`/validations/${dir}/`, 'g'),
    '/validations/',
  ]),
  ...VALIDATION_NESTED_DIRS.map((dir) => [
    new RegExp(`/validations/${dir}(['"])`, 'g'),
    '/validations/index$1',
  ]),
];

const MODULES = [
  'auth',
  'blogs',
  'comments',
  'posts',
  'security-devices',
  'testing',
  'users',
  'videos',
];

function walkDir(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile()) {
      callback(fullPath);
    }
  }
}

function flattenNestedDirs(parentDir, nestedDirNames) {
  for (const nestedName of nestedDirNames) {
    const nestedPath = path.join(parentDir, nestedName);
    if (!fs.existsSync(nestedPath) || !fs.statSync(nestedPath).isDirectory()) {
      continue;
    }

    for (const file of fs.readdirSync(nestedPath)) {
      const from = path.join(nestedPath, file);
      const to = path.join(parentDir, file);
      if (fs.existsSync(to)) {
        throw new Error(`Target already exists: ${to}`);
      }
      fs.renameSync(from, to);
    }

    fs.rmdirSync(nestedPath);
  }
}

function flattenStructure() {
  walkDir(path.join(SRC, 'modules'), (filePath) => {
    // noop — used only to traverse tree
  });

  const moduleDirs = fs
    .readdirSync(path.join(SRC, 'modules'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SRC, 'modules', entry.name));

  for (const moduleDir of moduleDirs) {
    const modelsDir = path.join(moduleDir, 'models');
    if (fs.existsSync(modelsDir)) {
      flattenNestedDirs(modelsDir, MODEL_NESTED_DIRS);
    }

    const validationsDir = path.join(moduleDir, 'validations');
    if (fs.existsSync(validationsDir)) {
      flattenNestedDirs(validationsDir, VALIDATION_NESTED_DIRS);
    }
  }
}

function getSourceLayer(filePath) {
  const rel = path.relative(SRC, filePath).replace(/\\/g, '/');

  if (rel.startsWith('core/')) {
    return { type: 'core' };
  }

  if (rel.startsWith('app/')) {
    return { type: 'app' };
  }

  const moduleMatch = rel.match(/^modules\/([^/]+)\//);
  if (moduleMatch) {
    return { type: 'module', name: moduleMatch[1] };
  }

  return null;
}

function resolveImport(fromFile, importPath) {
  if (importPath.startsWith('@/')) {
    return path.join(SRC, importPath.slice(2));
  }

  if (importPath.startsWith('.')) {
    return path.resolve(path.dirname(fromFile), importPath);
  }

  return null;
}

function getTargetLayer(resolvedPath) {
  if (!resolvedPath.startsWith(SRC)) {
    return null;
  }

  const rel = path.relative(SRC, resolvedPath).replace(/\\/g, '/');
  const withoutExt = rel.replace(/\.(ts|tsx|js|jsx)$/, '');

  if (withoutExt.startsWith('core/') || withoutExt === 'core') {
    return { type: 'core' };
  }

  if (withoutExt.startsWith('app/') || withoutExt === 'app') {
    return { type: 'app' };
  }

  const moduleMatch = withoutExt.match(/^modules\/([^/]+)/);
  if (moduleMatch) {
    return { type: 'module', name: moduleMatch[1] };
  }

  return null;
}

function toAliasImport(resolvedPath) {
  const rel = path.relative(SRC, resolvedPath).replace(/\\/g, '/');
  const withoutExt = rel.replace(/\.(ts|tsx|js|jsx)$/, '');
  return `@/${withoutExt}`;
}

function toRelativeImport(fromFile, resolvedPath) {
  let rel = path
    .relative(path.dirname(fromFile), resolvedPath)
    .replace(/\\/g, '/')
    .replace(/\.(ts|tsx|js|jsx)$/, '');

  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }

  return rel;
}

function isSameLayer(sourceLayer, targetLayer) {
  if (!sourceLayer || !targetLayer) {
    return false;
  }

  if (sourceLayer.type !== targetLayer.type) {
    return false;
  }

  if (sourceLayer.type === 'module') {
    return sourceLayer.name === targetLayer.name;
  }

  return true;
}

function fixRepositoryImportPaths(content, filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (!/\/repositories\/(CUD|Queries)\//.test(normalizedPath)) {
    return content;
  }

  return content.replace(
    /from ['"]\.\.\/(models|services)\//g,
    "from '../../$1/",
  );
}

function normalizeImportPaths(content, filePath) {
  let result = content;

  for (const [pattern, replacement] of IMPORT_PATH_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  for (const moduleName of MODULES) {
    result = result.replace(
      new RegExp(
        `((?:from|export[^'"]*from)\\s+['"](?:\\.\\.\\/)+)${moduleName}/`,
        'g',
      ),
      '$1',
    );
  }

  result = fixRepositoryImportPaths(result, filePath);

  return result;
}

function fixImportConventions(content, filePath) {
  const sourceLayer = getSourceLayer(filePath);
  const importRegex =
    /(?:import\s+(?:type\s+)?(?:[\w*{}\s,\n\r]+)\s+from\s+|export\s+\*\s+from\s+|export\s+\{[^}]+\}\s+from\s+)['"]([^'"]+)['"]/g;

  return content.replace(importRegex, (fullMatch, importPath) => {
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      return fullMatch;
    }

    const resolved = resolveImport(filePath, importPath);
    if (!resolved) {
      return fullMatch;
    }

    const targetLayer = getTargetLayer(resolved);
    const sameLayer = isSameLayer(sourceLayer, targetLayer);

    if (sameLayer && importPath.startsWith('@/')) {
      const relative = toRelativeImport(filePath, resolved);
      return fullMatch.replace(importPath, relative);
    }

    if (!sameLayer && importPath.startsWith('.')) {
      const alias = toAliasImport(resolved);
      return fullMatch.replace(importPath, alias);
    }

    return fullMatch;
  });
}

function processTextFiles(callback) {
  const roots = [SRC, path.join(ROOT, '__tests__')];

  for (const root of roots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    walkDir(root, (filePath) => {
      if (!/\.(ts|tsx|yml|yaml)$/.test(filePath)) {
        return;
      }

      const original = fs.readFileSync(filePath, 'utf8');
      const updated = callback(original, filePath);

      if (updated !== original) {
        fs.writeFileSync(filePath, updated, 'utf8');
      }
    });
  }
}

function main() {
  console.log('Flattening nested model/validation directories...');
  flattenStructure();

  console.log('Updating import paths...');
  processTextFiles((content, filePath) => {
    let updated = normalizeImportPaths(content, filePath);

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      updated = fixImportConventions(updated, filePath);
    }

    return updated;
  });

  console.log('Done.');
}

main();
