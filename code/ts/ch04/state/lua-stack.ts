import { LuaValue } from './lua-value';

export class LuaStack {
    slots: LuaValue[];

    constructor() {
        this.slots = [];
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

    pop() {
        if (this.slots.length === 0) {
            throw new Error('stack underflow!');
        }
        const val = this.slots.pop() || new LuaValue(null);
        return val;
    }

    absIndex(idx: number) {
        if (idx >= 0) {
            return idx;
        }
        return idx + this.top + 1;
    }

    isValid(idx: number) {
        const absIdx = this.absIndex(idx);
        return absIdx > 0 && absIdx < this.top;
    }

    get(idx: number) {
        const absIdx = this.absIndex(idx);
        if (absIdx > 0 && absIdx < this.top) {
            return this.slots[absIdx - 1];
        }
        return new LuaValue(null);
    }

    set(idx: number, val: LuaValue) {
        const absIdx = this.absIndex(idx);
        if (absIdx > 0 && absIdx < this.top) {
            this.slots[absIdx - 1] = val;
            return;
        }
        throw new Error('invalid index!');
    }
}
