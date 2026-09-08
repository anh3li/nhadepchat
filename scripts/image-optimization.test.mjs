import assert from 'node:assert/strict';
import test from 'node:test';
import { fitImageWithin,webpFilename } from '../lib/image-optimization.ts';

test('renames supported uploads to webp without losing the base name',()=>{
  assert.equal(webpFilename('mat-tien.NHA.PHO.JPG'),'mat-tien.NHA.PHO.webp');
  assert.equal(webpFilename('image'),'image.webp');
});

test('fits landscape and portrait images without upscaling',()=>{
  assert.deepEqual(fitImageWithin(4000,2000,2400),{width:2400,height:1200});
  assert.deepEqual(fitImageWithin(1200,3000,2400),{width:960,height:2400});
  assert.deepEqual(fitImageWithin(800,600,2400),{width:800,height:600});
});
