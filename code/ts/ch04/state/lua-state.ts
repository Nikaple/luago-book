import { LuaType } from '../api/consts';
import { ILuaState } from '../api/lua-state';
import { LuaStack } from '../state/lua-stack';
import { convertToBoolean, LuaValue } from '../state/lua-value';

export class LuaState implements ILuaState {
    stack: LuaStack;

    constructor() {
        this.stack = new LuaStack();
    }

    getTop() {
        return this.stack.top;
    }
    absIndex(idx: number) {
        return this.stack.absIndex(idx);
    }
    checkStack() {
        return true;
    }
    pop(n: number) {
        this.setTop(-n - 1);
    }
    copy(fromIdx: number, toIdx: number) {
        this.stack.set(toIdx, this.stack.get(fromIdx));
    }
    pushValue(idx: number) {
        this.stack.push(this.stack.get(idx));
    }
    replace(idx: number) {
        this.stack.set(idx, this.stack.pop());
    }
    insert(idx: number) {
        this.rotate(idx, 1);
    }
    remove(idx: number) {
        this.rotate(idx, -1);
        this.pop(1);
    }
    rotate(idx: number, n: number) {
        const t = this.stack.top - 1;
        const p = this.stack.absIndex(idx) - 1;
        const m = n >= 0 ? t - n : p - n - 1;
        this.stack.reverse(p, m);
        this.stack.reverse(m + 1, t);
        this.stack.reverse(p, t);
    }
    setTop(idx: number) {
        const newTop = this.stack.absIndex(idx);
        if (newTop < 0) {
            throw new Error('stack underflow!');
        }

        const n = this.stack.top - newTop;
        if (n > 0) {
            for (let i = 0; i < n; i++) {
                this.stack.pop();
            }
        } else if (n < 0) {
            for (let i = 0; i > n; i--) {
                this.stack.push(new LuaValue(null));
            }
        }
    }

    pushNil() {
        this.stack.push(new LuaValue(null));
    }
    pushBoolean(b: boolean) {
        this.stack.push(new LuaValue(b));
    }
    pushInteger(i: number) {
        this.stack.push(new LuaValue(i));
    }
    pushNumber(i: number) {
        this.stack.push(new LuaValue(i));
    }
    pushString(s: string) {
        this.stack.push(new LuaValue(s));
    }

    typeName(type: LuaType) {
        switch (type) {
            case LuaType.NONE:
                return 'no value';
            case LuaType.NIL:
                return 'nil';
            case LuaType.BOOLEAN:
                return 'boolean';
            case LuaType.NUMBER:
                return 'number';
            case LuaType.STRING:
                return 'string';
            case LuaType.TABLE:
                return 'table';
            case LuaType.FUNCTION:
                return 'function';
            case LuaType.THREAD:
                return 'thread';
            default:
                return 'userdata';
        }
    }
    type(idx: number): LuaType {
        if (this.stack.isValid(idx)) {
            const val = this.stack.get(idx);
            return val.typeOf();
        }
        return LuaType.NONE;
    }
    isNone(idx: number) {
        return this.type(idx) === LuaType.NONE;
    }
    isNil(idx: number) {
        return this.type(idx) === LuaType.NIL;
    }
    isNoneOrNil(idx: number) {
        return this.type(idx) < LuaType.NIL;
    }
    isBoolean(idx: number) {
        return this.type(idx) === LuaType.BOOLEAN;
    }
    isString(idx: number) {
        const t = this.type(idx);
        return t === LuaType.STRING || t === LuaType.NUMBER;
    }
    isNumber(idx: number) {
        const [_, ok] = this.toNumberX(idx);
        return ok;
    }
    isInteger(idx: number) {
        const { val } = this.stack.get(idx);
        return typeof val === 'number' && val % 1 == 0;
    }
    isTable(idx: number) {
        // TODO
        return false;
    }
    isThread(idx: number) {
        // TODO
        return false;
    }
    isFunction(idx: number) {
        // TODO
        return false;
    }
    toBoolean(idx: number) {
        const val = this.stack.get(idx);
        return convertToBoolean(val);
    }
    toNumber(idx: number) {
        return this.toNumberX(idx)[0];
    }
    toNumberX(idx: number) {
        const { val } = this.stack.get(idx);
        if (typeof val === 'number') {
            return [val, true] as const;
        }
        return [0, false] as const;
    }
    toInteger(idx: number) {
        return this.toIntegerX(idx)[0];
    }
    toIntegerX(idx: number) {
        const { val } = this.stack.get(idx);
        if (typeof val === 'number') {
            return [val, true] as const;
        }
        return [0, false] as const;
    }
    toString(idx: number) {
        return this.toStringX(idx)[0];
    }
    toStringX(idx: number) {
        const { val } = this.stack.get(idx);
        switch (typeof val) {
            case 'string':
                return [val, true] as const;
            case 'number': {
                const str = `${val}`;
                this.stack.set(idx, new LuaValue(str));
                return [str, true] as const;
            }
            default:
                return ['', false] as const;
        }
    }
}
