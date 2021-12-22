import { LuaClosure } from './lua-closure';
import { LuaValue } from './lua-value';

export class LuaStack {
    slots: LuaValue[];
    prev: LuaStack | null;
    closure!: LuaClosure;
    varargs?: LuaValue[];
    pc: number;

    constructor() {
        this.slots = [];
        this.prev = null;
        this.pc = 0;
    }

    get top() {
        return this.slots.length;
    }

    check(n: number) {
        // no-op
    }

    push(val: LuaValue) {
        this.slots.push(val);
    }
    pushN(vals: LuaValue[], n: number) {
        const nVals = vals.length;
        if (n < 0) {
            n = nVals;
        }
        for (let i = 0; i < n; i++) {
            if (i < nVals) {
                this.push(vals[i]);
            } else {
                this.push(new LuaValue(null));
            }
        }
    }

    pop() {
        if (this.slots.length === 0) {
            throw new Error('stack underflow!');
        }
        const val = this.slots.pop() || new LuaValue(null);
        return val;
    }
    popN(n: number): LuaValue[] {
        const vals = [];
        for (let i = n - 1; i >= 0; i--) {
            vals[i] = this.pop();
        }
        return vals;
    }

    absIndex(idx: number) {
        if (idx >= 0) {
            return idx;
        }
        return idx + this.top + 1;
    }

    isValid(idx: number) {
        const absIdx = this.absIndex(idx);
        return absIdx > 0 && absIdx <= this.top;
    }

    get(idx: number) {
        const absIdx = this.absIndex(idx);
        if (absIdx > 0 && absIdx <= this.top) {
            return this.slots[absIdx - 1];
        }
        return new LuaValue(null);
    }

    set(idx: number, val: LuaValue) {
        const absIdx = this.absIndex(idx);
        if (absIdx > 0 && absIdx <= this.top) {
            this.slots[absIdx - 1] = val;
            return;
        }
        throw new Error('invalid index!');
    }

    reverse(from: number, to: number) {
        const slots = this.slots;
        while (from < to) {
            [slots[from], slots[to]] = [slots[to], slots[from]];
            from++;
            to--;
        }
    }
}
