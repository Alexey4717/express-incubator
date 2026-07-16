import fs from 'fs';
import path from 'path';

const SRC = path.resolve(import.meta.dirname, '..', 'src');

function getSourceLayer(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized.includes('/__tests__/')) {
    return { type: 'test' };
  }

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

function getModuleFacadeViolation(importPath, sourceLayer) {
  const match = importPath.match(/^@\/modules\/([^/]+)(?:\/(.+))?$/);
  if (!match) {
    return false;
  }

  const [, moduleName, subPath] = match;
  if (!subPath || subPath === 'index') {
    return false;
  }

  if (sourceLayer?.type === 'module' && sourceLayer.name === moduleName) {
    return false;
  }

  return true;
}

function importExists(resolvedPath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];

  if (fs.existsSync(resolvedPath)) {
    return true;
  }

  return extensions.some((ext) => fs.existsSync(`${resolvedPath}${ext}`));
}

function isLintableFile(filename) {
  const normalized = filename.replace(/\\/g, '/');
  return normalized.includes('/src/') || normalized.includes('/__tests__/');
}

export const importConventions = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce relative imports within the same layer/module, @/ alias across layers/modules, and module facade imports',
    },
    schema: [],
    messages: {
      useRelative:
        'Use relative imports for code within the same layer/module. Expected a path starting with "./" or "../".',
      useAlias:
        'Use @/ alias imports for code from other layers/modules. Expected a path starting with "@/".',
      noDeepModuleImport:
        'Import from the module public API only: use "@/modules/<name>" instead of "@/modules/<name>/<internal-path>".',
    },
  },
  create(context) {
    const filename = context.filename;

    if (!isLintableFile(filename)) {
      return {};
    }

    const sourceLayer = getSourceLayer(filename);

    function checkImport(node) {
      const importPath = node.source?.value;
      if (typeof importPath !== 'string') {
        return;
      }

      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        return;
      }

      if (
        importPath.startsWith('@/modules/') &&
        getModuleFacadeViolation(importPath, sourceLayer)
      ) {
        context.report({ node: node.source, messageId: 'noDeepModuleImport' });
        return;
      }

      const resolved = resolveImport(filename, importPath);
      if (!resolved || !importExists(resolved)) {
        return;
      }

      const targetLayer = getTargetLayer(resolved);
      const sameLayer = isSameLayer(sourceLayer, targetLayer);

      if (sameLayer && importPath.startsWith('@/')) {
        context.report({ node: node.source, messageId: 'useRelative' });
        return;
      }

      if (!sameLayer && importPath.startsWith('.')) {
        const isCrossModuleRelative =
          sourceLayer?.type === 'module' &&
          targetLayer?.type === 'module' &&
          sourceLayer.name !== targetLayer.name;

        if (!isCrossModuleRelative) {
          context.report({ node: node.source, messageId: 'useAlias' });
        }
        return;
      }
    }

    return {
      ImportDeclaration: checkImport,
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImport(node);
        }
      },
      ExportAllDeclaration: checkImport,
    };
  },
};

export default {
  rules: {
    'import-conventions': importConventions,
  },
};
