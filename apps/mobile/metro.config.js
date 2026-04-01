/**
 * Metro config for pnpm monorepo + NativeWind v4
 * Must point Metro at the workspace root so it can resolve
 * shared packages like @focusflow/ui, @focusflow/types, etc.
 */
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// ── pnpm monorepo: watch workspace root & resolve from both locations ──────────
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// ── NativeWind v4 ──────────────────────────────────────────────────────────────
module.exports = withNativeWind(config, { input: './global.css' })
