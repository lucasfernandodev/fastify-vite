const { existsSync, lstatSync } = require('node:fs')
const { writeFile, readFile } = require('node:fs/promises')
const {
  isAbsolute,
  join,
  resolve,
  parse,
  dirname,
  basename,
  sep,
} = require('node:path')
const { ensureDir, remove } = require('fs-extra')
const klaw = require('klaw')

function getCurrentExecutionFileDirectory() {
  const entryFile = (require.main && require.main.filename) || process.argv[1]
  return resolve(dirname(resolve(entryFile)))
}

async function resolveIfRelative(p, root) {
  if (isAbsolute(p)) {
    return p
  }

  if (isAbsolute(root)) {
    return resolve(root, p)
  }

  const { packageDirectory } = await import('package-directory')
  const outDirRoot = await packageDirectory({
    cwd: getCurrentExecutionFileDirectory()
  })

  const target = resolve(outDirRoot, root, p)
  return target
}

async function* walk(dir, ignorePatterns = []) {
  const sliceAt = dir.length + (dir.endsWith('/') ? 0 : 1)
  for await (const match of klaw(dir)) {
    const pathEntry = match.path.slice(sliceAt)
    if (
      ignorePatterns.some((ignorePattern) => ignorePattern.test(match.path))
    ) {
      continue
    }
    if (pathEntry === '') {
      continue
    }
    yield { stats: match.stats, path: pathEntry }
  }
}

module.exports = {
  parse,
  join,
  resolve,
  resolveIfRelative,
  walk,
  dirname,
  basename,
  remove,
  isAbsolute,
  sep,
  getCurrentExecutionFileDirectory,
  write: writeFile,
  read: readFile,
  exists: existsSync,
  stat: lstatSync,
  ensure: ensureDir,
}
