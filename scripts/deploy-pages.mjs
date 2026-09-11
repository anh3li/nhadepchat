import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const command=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
const cwd=fileURLToPath(new URL('../pages-site',import.meta.url));
// Isolate Wrangler's discovery from the parent Vinext build's deploy config.
await mkdir(path.join(cwd,'.wrangler/deploy'),{recursive:true});
await writeFile(path.join(cwd,'.wrangler/deploy/config.json'),JSON.stringify({configPath:'../../wrangler.jsonc'}));
const result=spawnSync(process.execPath,[command,'pages','deploy','out','--project-name','nhadepchat','--branch','main'],{cwd,stdio:'inherit',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:process.env.CLOUDFLARE_ACCOUNT_ID||'552871ebd2080e7e542c1d6623d461f7'}});
process.exit(result.status??1);
