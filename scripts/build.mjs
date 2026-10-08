import {copyFile, mkdir} from 'node:fs/promises';

await copyFile(new URL('../metadata.json', import.meta.url),
    new URL('../build/metadata.json', import.meta.url));
await mkdir(new URL('../dist/', import.meta.url), {recursive: true});
