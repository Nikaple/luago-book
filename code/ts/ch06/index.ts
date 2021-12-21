import fs from 'fs';
import { Instruction } from './vm/instruction';
import { Prototype, undump } from './binchunk/binary-chunk';
import { LuaState } from './state/lua-state';
import { Op } from './vm/opcodes';
import { LuaType } from './api/consts';

if (process.argv.length > 2) {
    const fileName = process.argv[2];
    const fileBuffer = fs.readFileSync(fileName);

    const proto = undump(fileBuffer);
    luaMain(proto);
}

function luaMain(proto: Prototype) {
    const nRegs = proto.MaxStackSize;
    const s = new LuaState(proto);
    s.setTop(nRegs);

    let pc = s.getPC();
    let inst = new Instruction(s.fetch());

    while (inst.Opcode !== Op.RETURN) {
        inst.execute(s);

        print(`[${`${pc + 1}`.padStart(2, '0')}] ${inst.OpName}`);
        printStack(s);

        pc = s.getPC();
        inst = new Instruction(s.fetch());
    }
}

function print(string: string) {
    process.stdout.write(string);
}

function printStack(s: LuaState) {
    const top = s.getTop();
    for (let i = 1; i <= top; i++) {
        const t = s.type(i);
        switch (t) {
            case LuaType.BOOLEAN:
                print(`[${s.toBoolean(i)}]`);
                break;
            case LuaType.NUMBER:
                print(`[${s.toNumber(i)}]`);
                break;
            case LuaType.STRING:
                print(`["${s.toString(i)}"]`);
                break;
            default:
                print(`[${s.typeName(t)}]`);
        }
    }
    print('\n');
}
