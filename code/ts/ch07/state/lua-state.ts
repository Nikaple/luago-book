import { ArithOp, CompareOp, LuaType } from '../api/consts';
import { ILuaVM } from '../api/lua-vm';
import { Prototype } from '../binchunk/binary-chunk';
import { LuaStack } from '../state/lua-stack';
import { LuaValue } from '../state/lua-value';
import { Arith } from './api-arith';
import { LuaTable } from './lua-table';

export class LuaState implements ILuaVM {
    stack: LuaStack;
    proto: Prototype;
    pc: number;

    constructor(proto: Prototype) {
        this.stack = new LuaStack();
        this.proto = proto;
        this.pc = 0;
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
        const val = this.stack.get(idx);
        return val.convertToFloat() !== null;
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
        return val.toBoolean();
    }
    toNumber(idx: number) {
        const val = this.stack.get(idx);
        return val.convertToFloat();
    }
    toInteger(idx: number) {
        const val = this.stack.get(idx);
        return val.convertToInteger();
    }
    toString(idx: number) {
        const val = this.stack.get(idx);
        return val.convertToString();
    }
    arith(op: ArithOp) {
        let a: LuaValue;
        let b = this.stack.pop();
        if (op !== ArithOp.UNM && op !== ArithOp.BNOT) {
            a = this.stack.pop();
        } else {
            a = b;
        }

        const result = Arith.arith(a, b, op);
        if (result === null) {
            throw new Error(`arithmetic error!`);
        }
        this.stack.push(new LuaValue(result));
    }
    compare(idx1: number, idx2: number, op: CompareOp): boolean {
        const a = this.stack.get(idx1);
        const b = this.stack.get(idx2);
        switch (op) {
            case CompareOp.EQ:
                return this.eq(a, b);
            case CompareOp.LT:
                return this.lt(a, b);
            case CompareOp.LE:
                return this.le(a, b);
            default:
                throw new Error('invalid compare op!');
        }
    }
    len(idx: number) {
        const val = this.stack.get(idx);
        if (val.typeOf() === LuaType.STRING) {
            this.stack.push(new LuaValue((val.val as string).length));
            return;
        }
        if (val.typeOf() === LuaType.TABLE) {
            this.stack.push(new LuaValue((val.val as LuaTable).len()));
            return;
        }
        throw new Error('length error!');
    }
    concat(n: number) {
        if (n === 0) {
            return this.stack.push(new LuaValue(''));
        }
        if (n === 1) {
            return;
        }
        for (let i = 1; i < n; i++) {
            if (this.isString(-1) && this.isString(-2)) {
                const s2 = this.toString(-1) as string;
                const s1 = this.toString(-2) as string;
                this.stack.pop();
                this.stack.pop();
                this.stack.push(new LuaValue(s1 + s2));
            }
        }
    }
    private eq(a: LuaValue, b: LuaValue) {
        const [typeA, typeB] = [a.typeOf(), b.typeOf()];
        const [valA, valB] = [a.val, b.val];
        if (typeA !== typeB) {
            return false;
        }
        return valA === valB;
    }
    private lt(a: LuaValue, b: LuaValue) {
        const [typeA, typeB] = [a.typeOf(), b.typeOf()];
        const [valA, valB] = [a.val, b.val];
        if (typeA !== typeB) {
            throw new Error('comparison error!');
        }
        if (typeA === LuaType.STRING || typeA === LuaType.NUMBER) {
            return (valA as string | number) < (valB as string | number);
        }
        throw new Error('comparison error: not number or string!');
    }
    private le(a: LuaValue, b: LuaValue) {
        const [typeA, typeB] = [a.typeOf(), b.typeOf()];
        const [valA, valB] = [a.val, b.val];
        if (typeA !== typeB) {
            throw new Error('comparison error!');
        }
        if (typeA === LuaType.STRING || typeA === LuaType.NUMBER) {
            return (valA as string | number) <= (valB as string | number);
        }
        throw new Error('comparison error: not number or string!');
    }

    // vm
    getPC() {
        return this.pc;
    }
    addPC(n: number) {
        this.pc += n;
    }
    fetch() {
        const i = this.proto.Code[this.pc];
        this.pc++;
        return i;
    }
    getConst(idx: number) {
        const c = this.proto.Constants[idx];
        this.stack.push(new LuaValue(c));
    }
    getRK(rk: number) {
        if (rk > 0xff) {
            this.getConst(rk & 0xff);
        } else {
            this.pushValue(rk + 1);
        }
    }

    // table
    createTable() {
        this.stack.push(new LuaValue(new LuaTable()));
    }
    newTable() {
        this.createTable();
    }
    getTable(idx: number) {
        const t = this.stack.get(idx);
        const k = this.stack.pop();
        return this.getTableValue(t, k);
    }
    getField(idx: number, k: string) {
        const t = this.stack.get(idx);
        return this.getTableValue(t, new LuaValue(k));
    }
    getI(idx: number, i: number) {
        const t = this.stack.get(idx);
        return this.getTableValue(t, new LuaValue(i));
    }
    setTable(idx: number) {
        const t = this.stack.get(idx);
        const v = this.stack.pop();
        const k = this.stack.pop();
        this.setTableValue(t, k, v);
    }
    setField(idx: number, k: string) {
        const t = this.stack.get(idx);
        const v = this.stack.pop();
        return this.setTableValue(t, new LuaValue(k), v);
    }
    setI(idx: number, i: number) {
        const t = this.stack.get(idx);
        const v = this.stack.pop();
        return this.setTableValue(t, new LuaValue(i), v);
    }

    private getTableValue(t: LuaValue, k: LuaValue) {
        if (t.typeOf() !== LuaType.TABLE) {
            throw new Error('not a table!');
        }
        const table = t.val as LuaTable;
        const v = table.get(k);
        this.stack.push(v);
        return v.typeOf();
    }
    private setTableValue(t: LuaValue, k: LuaValue, v: LuaValue) {
        if (t.typeOf() !== LuaType.TABLE) {
            throw new Error('not a table!');
        }
        const table = t.val as LuaTable;
        table.put(k, v);
    }
}
