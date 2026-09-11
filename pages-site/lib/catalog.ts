import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';

// Snapshot contains public page data only and is generated before next build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCatalog = cache(():any => JSON.parse(readFileSync(join(process.cwd(),'catalog.json'),'utf8')));
export const siteOrigin = process.env.PAGES_SITE_ORIGIN || 'https://nhadepchat.pages.dev';
