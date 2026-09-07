import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authReturnPath } from '../lib/auth-return-path.ts';

test('auth callbacks only use internal paths', () => {
  for (const value of [null, '', 'https://example.test', '//example.test', '/\\example.test', '/\nevil']) {
    assert.equal(authReturnPath(value), '/tai-khoan');
  }
  assert.equal(authReturnPath('/dashboard/dang-ban?id=1'), '/dashboard/dang-ban?id=1');
});
