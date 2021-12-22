import { LuaType } from '../api/consts';
import { LuaValue } from '../state/lua-value';

export class LuaTable {
    private map = new Map<any, LuaValue>();
    private arr: LuaValue[] = [];

    get(key: LuaValue): LuaValue {
        const idx = key.convertToInteger();
        if (idx !== null && idx >= 1 && idx <= this.arr.length) {
            return this.arr[idx - 1];
        }
        return this.map.get(key.val) || new LuaValue(null);
    }

    put(key: LuaValue, val: LuaValue) {
        if (key.typeOf() === LuaType.NIL) {
            throw new Error('table index is nil!');
        }
        if (Number.isNaN(key.val)) {
            throw new Error('table index is NaN!');
        }
        const idx = key.convertToInteger();
        const arrLen = this.arr.length;
        const isValNil = val.typeOf() === LuaType.NIL;
        if (idx !== null && idx >= 1) {
            if (idx <= arrLen) {
                this.arr[idx - 1] = val;
                if (idx === arrLen && isValNil) {
                    this.shrinkArray();
                }
                return;
            }
        }
        if (idx === arrLen + 1) {
            this.map.delete(key.val);

            if (!isValNil) {
                this.arr.push(val);
                this.expandArray();
            }
            return;
        }
        if (!isValNil) {
            this.map.set(key.val, val);
        } else {
            this.map.delete(key.val);
        }
    }

    len() {
        return this.arr.length;
    }

    private shrinkArray() {
        for (let i = this.arr.length - 1; i >= 0; i--) {
            if (this.arr[i].typeOf() === LuaType.NIL) {
                this.arr.splice(i, 1);
            } else {
                break;
            }
        }
    }

    private expandArray() {
        for (let idx = this.arr.length + 1; true; idx++) {
            const isInMap = this.map.has(idx);
            if (isInMap) {
                this.arr.push(this.map.get(idx)!);
                this.map.delete(idx);
            } else {
                break;
            }
        }
    }
}
