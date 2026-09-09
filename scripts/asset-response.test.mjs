import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../app/api/assets/[id]/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ status = 'approved', session = null, cacheHit, cachePut = async () => {}, cacheMatch } = {}) {
  const background = [];
  let reads = 0;
  let writes = 0;
  const modules = {
    'cloudflare:workers': { waitUntil: promise => background.push(promise) },
    '../../../../lib/server-auth': { apiSession: async () => session },
    '../../../../db': {
      getD1: () => ({ prepare: () => ({ bind: () => ({ first: async () => ({ object_key: 'preview.webp', status, user_id: 'owner' }) }) }) }),
      getFilesBucket: () => ({ get: async () => {
        reads++;
        return { body: 'image', size: 5, httpEtag: '"test"', writeHttpMetadata() {} };
      } }),
    },
  };
  const context = { exports: {}, require: name => modules[name], Request, Response, Headers,
    console: { error() {} },
    caches: { default: { match: cacheMatch || (async () => cacheHit), put: (...args) => { writes++; return cachePut(...args); } } },
  };
  vm.runInNewContext(compiled, context);
  return { get: () => context.exports.GET(new Request('https://example.test/api/assets/a'), { params: Promise.resolve({ id: 'a' }) }),
    background, reads: () => reads, writes: () => writes };
}

test('image response streams before cache storage completes', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const app = setup({ cachePut: () => pending });
  const response = await app.get();
  assert.equal(await response.text(), 'image');
  assert.equal(app.background.length, 1);
  assert.equal(response.headers.get('Content-Type'), 'image/webp');
  finish();
  await Promise.all(app.background);
});

test('cache errors do not fail an otherwise valid image', async () => {
  const app = setup({ cacheMatch: async () => { throw new Error('unavailable'); }, cachePut: async () => { throw new Error('full'); } });
  assert.equal((await app.get()).status, 200);
  await Promise.all(app.background);
});

test('cache hits avoid reading object storage', async () => {
  const app = setup({ cacheHit: new Response('cached') });
  assert.equal(await (await app.get()).text(), 'cached');
  assert.equal(app.reads(), 0);
});

test('unapproved images reject anonymous viewers before reading storage', async () => {
  const app = setup({ status: 'draft' });
  assert.equal((await app.get()).status, 403);
  assert.equal(app.reads(), 0);
  assert.equal(app.writes(), 0);
});

test('owner previews remain private and are never cached', async () => {
  const app = setup({ status: 'draft', session: { user: { id: 'owner' } } });
  const response = await app.get();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(app.writes(), 0);
});
