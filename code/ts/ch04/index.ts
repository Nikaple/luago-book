import { LuaType } from './api/consts';
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
                print(`[${s.toString(i)}]`);
                break;
            default:
                print(`[${s.typeName(t)}]`);
        }
    }
    print('\n');
}

const s = new LuaState();
s.pushBoolean(true);
printStack(s);
s.pushInteger(10);
printStack(s);
s.pushNil();
printStack(s);
s.pushString('hello');
printStack(s);
s.pushValue(-4);
printStack(s);
s.replace(3);
printStack(s);
s.setTop(6);
printStack(s);
s.remove(-3);
printStack(s);
s.setTop(-5);
printStack(s);
