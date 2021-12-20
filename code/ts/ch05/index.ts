import { ArithOp, CompareOp, LuaType } from './api/consts';
import { LuaState } from './state/lua-state';

function print(s: string) {
    process.stdout.write(s);
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

const s = new LuaState();
s.pushInteger(1);
s.pushString('2.0');
s.pushString('3.0');
s.pushNumber(4);
printStack(s);

s.arith(ArithOp.ADD);
printStack(s);
s.arith(ArithOp.BNOT);
printStack(s);
s.len(2);
printStack(s);
s.concat(3);
printStack(s);
s.pushBoolean(s.compare(1, 2, CompareOp.EQ));
printStack(s);
