import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

function inside(base, target) {
  const path = relative(base, target);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

// Existing links are rejected rather than followed, including Windows junctions.
// These checks protect maintenance commands from pre-existing escaping paths;
// they do not promise atomic protection against a hostile concurrent local process.
export function createConfinedFontFiles(projectRoot) {
  const base = resolve(projectRoot);
  const canonicalBase = realpath(base);

  async function checkedPath(path) {
    const target = resolve(base, path);
    if (target === base || !inside(base, target)) throw new Error(`Font path is outside the project root: ${path}`);
    const root = await canonicalBase;
    const segments = relative(base, target).split(sep);
    let current = base;
    for (let index = 0; index < segments.length; index++) {
      current = resolve(current, segments[index]);
      let status;
      try { status = await lstat(current); }
      catch (error) { if (error.code === 'ENOENT') break; throw error; }
      if (status.isSymbolicLink()) throw new Error(`Symbolic links or junctions are not allowed in pinned font paths: ${current}`);
      if (!inside(root, await realpath(current))) throw new Error(`Font path resolves outside the project root: ${current}`);
      if (index < segments.length - 1 && !status.isDirectory()) throw new Error(`Font path parent is not a directory: ${current}`);
    }
    return target;
  }

  async function readMaybe(path) {
    const target = await checkedPath(path);
    try { return await readFile(target); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }

  async function writeLocked(path, data) {
    const target = await checkedPath(path);
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const existing = await readMaybe(target);
    if (existing) {
      if (!existing.equals(bytes)) throw new Error(`Refusing to overwrite a pinned file: ${target}`);
      return;
    }
    await mkdir(dirname(target), { recursive: true });
    await checkedPath(target);
    await writeFile(target, bytes, { flag: 'wx' });
  }

  return { readMaybe, writeLocked };
}
