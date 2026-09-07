import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uploadProductFile } from '../lib/upload-product-file.ts';

test('upload transport and completion states', async t => {
  const originalFetch = globalThis.fetch, originalXHR = globalThis.XMLHttpRequest;
  t.after(() => { globalThis.fetch = originalFetch; globalThis.XMLHttpRequest = originalXHR; });
  const file = new File(['test'], 'drawing.pdf', { type: 'application/pdf' });
  let transport = 'success', body = '{"id":"asset-1"}', direct = false, complete = true;
  let calls = [];
  globalThis.XMLHttpRequest = class {
    upload = {};
    status = 200;
    responseText = body;
    open() {}
    setRequestHeader() {}
    send() {
      this.upload.onprogress({ lengthComputable: true, loaded: 4, total: 4 });
      queueMicrotask(() => {
        if (transport === 'network') this.onerror();
        else if (transport === 'timeout') this.ontimeout();
        else this.onload();
      });
    }
  };
  globalThis.fetch = async url => {
    calls.push(url);
    if (url.endsWith('/complete')) return Response.json(complete ? { ok: true } : { error: 'Chưa hoàn tất' }, { status: complete ? 200 : 500 });
    return Response.json({ direct, id: 'asset-1', uploadUrl: 'https://upload.example.test', headers: {}, objectKey: 'key', originalName: file.name, mime: file.type });
  };
  await t.test('fallback succeeds but progress never reports completion early', async () => {
    const progress = [];
    assert.equal((await uploadProductFile('product-1', file, 'file', p => progress.push(p))).id, 'asset-1');
    assert.deepEqual(progress, [99]);
  });
  await t.test('malformed transport response rejects', async () => {
    body = 'not json';
    await assert.rejects(uploadProductFile('product-1', file, 'file', () => {}), /không hợp lệ/);
    body = '{"id":"asset-1"}';
  });
  await t.test('network failure rejects', async () => {
    transport = 'network';
    await assert.rejects(uploadProductFile('product-1', file, 'file', () => {}), /Mất kết nối/);
  });
  await t.test('timeout rejects', async () => {
    transport = 'timeout';
    await assert.rejects(uploadProductFile('product-1', file, 'file', () => {}), /thời gian/);
    transport = 'success';
  });
  await t.test('direct upload waits for completion API', async () => {
    direct = true; calls = [];
    assert.equal((await uploadProductFile('product-1', file, 'preview', () => {})).url, '/api/assets/asset-1');
    assert.deepEqual(calls, ['/api/uploads/presign', '/api/uploads/complete']);
  });
  await t.test('failed completion does not count as success', async () => {
    complete = false;
    await assert.rejects(uploadProductFile('product-1', file, 'file', () => {}), /Chưa hoàn tất/);
  });
});
