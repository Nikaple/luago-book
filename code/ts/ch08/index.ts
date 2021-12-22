import fs from 'fs';
import { LuaState } from './state/lua-state';

if (process.argv.length > 2) {
    const fileName = process.argv[2];
    const fileBuffer = fs.readFileSync(fileName);

    const s = new LuaState();
    s.load(fileBuffer, fileName, 'b');
    s.call(0, 0);
}
