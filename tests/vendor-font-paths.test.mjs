import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { createConfinedFontFiles } from '../scripts/lib/confined-font-files.mjs';

async function fixture(t) {
  const temporaryRoot = await realpath(tmpdir());
  const directory = await mkdtemp(join(temporaryRoot, 'shan-font-paths-'));
  const canonicalDirectory = await realpath(directory);
  t.after(async () => {
    // Only this explicitly created temporary fixture may be recursively removed.
    assert.equal(dirname(canonicalDirectory), temporaryRoot);
    assert.ok(basename(canonicalDirectory).startsWith('shan-font-paths-'));
    assert.equal(await realpath(directory), canonicalDirectory);
    await rm(directory, { recursive: true, force: true });
  });
  const project = join(directory, 'project');
  const outside = join(directory, 'outside-project');
  await mkdir(project);
  await mkdir(outside);
  return { project, outside, files: createConfinedFontFiles(project) };
}

test('font file access creates missing in-project parents and refuses changed pinned bytes', async (t) => {
  const { project, files } = await fixture(t);
  const target = join(project, 'public/fonts/google/licenses/test-OFL.txt');
  assert.equal(await files.readMaybe(target), null);
  await files.writeLocked(target, 'pinned license');
  assert.equal((await files.readMaybe(target)).toString(), 'pinned license');
  await files.writeLocked(target, 'pinned license');
  await assert.rejects(files.writeLocked(target, 'changed license'), /Refusing to overwrite/);
  assert.equal((await readFile(target)).toString(), 'pinned license');
});

test('font file access rejects parent traversal before reading or creating a file', async (t) => {
  const { project, outside, files } = await fixture(t);
  const outsideFile = join(outside, 'private.txt');
  await writeFile(outsideFile, 'outside bytes');
  await assert.rejects(files.readMaybe('../outside-project/private.txt'), /outside the project root/);
  await assert.rejects(files.writeLocked(join(project, '../outside-project/new.txt'), 'bad'), /outside the project root/);
  assert.deepEqual(await readdir(outside), ['private.txt']);
  assert.equal((await readFile(outsideFile)).toString(), 'outside bytes');
});

for (const relativeDirectory of ['public/fonts/google/licenses', 'src/data']) {
  test(`font file access rejects an escaping ${relativeDirectory} directory junction before I/O`, async (t) => {
    const { project, outside, files } = await fixture(t);
    const link = join(project, relativeDirectory);
    await mkdir(dirname(link), { recursive: true });
    await symlink(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
    await writeFile(join(outside, 'existing.txt'), 'outside bytes');
    await assert.rejects(files.readMaybe(join(link, 'existing.txt')), /Symbolic links or junctions/);
    await assert.rejects(files.writeLocked(join(link, 'new.txt'), 'bad'), /Symbolic links or junctions/);
    assert.deepEqual(await readdir(outside), ['existing.txt']);
    assert.equal((await readFile(join(outside, 'existing.txt'))).toString(), 'outside bytes');
  });
}

test('font file access rejects an escaping file symlink before reading or writing it', async (t) => {
  const { project, outside, files } = await fixture(t);
  const target = join(outside, 'existing.txt');
  const link = join(project, 'font.woff2');
  await writeFile(target, 'outside bytes');
  try { await symlink(target, link, 'file'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip(`This platform does not permit an unprivileged file symlink (${error.code})`);
      return;
    }
    throw error;
  }
  await assert.rejects(files.readMaybe(resolve(link)), /Symbolic links or junctions/);
  await assert.rejects(files.writeLocked(link, 'bad'), /Symbolic links or junctions/);
  assert.equal((await readFile(target)).toString(), 'outside bytes');
});
