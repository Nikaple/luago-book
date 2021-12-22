import { LuaTable } from './lua-table';
import { LuaType } from '../api/consts';
import { LuaClosure } from './lua-closure';

export class LuaValue {
    val: null | boolean | bigint | number | string | LuaTable | LuaClosure;
    constructor(val: any) {
        this.val = val;
    }

    typeOf(): LuaType {
        if (this.val === null) {
            return LuaType.NIL;
        }
        if (this.val instanceof LuaTable) {
            return LuaType.TABLE;
        }
        if (this.val instanceof LuaClosure) {
            return LuaType.FUNCTION;
        }
        switch (typeof this.val) {
            case 'boolean':
                return LuaType.BOOLEAN;
            case 'number':
                return LuaType.NUMBER;
            case 'string':
                return LuaType.STRING;
            default:
                throw new Error('Unknown type');
        }
    }

    toBoolean(): boolean {
        switch (this.typeOf()) {
            case LuaType.NIL:
                return false;
            case LuaType.BOOLEAN:
                return this.val as boolean;
            default:
                return true;
        }
    }

    floatToInteger(): number | null {
        if (typeof this.val !== 'number') {
            throw new Error('val must be number');
        }
        if (this.val % 1 === 0) {
            return this.val;
        }
        return null;
    }

    parseInteger(): number | null {
        const converted = Number.parseInt(this.val as string, 10);
        if (Number.isNaN(converted)) {
            return null;
        }
        if (converted % 1 === 0) {
            return converted;
        }
        return null;
    }

    parseFloat(): number | null {
        const converted = Number.parseFloat(this.val as string);
        if (Number.isNaN(converted)) {
            return null;
        }
        return converted;
    }

    convertToFloat(): number | null {
        return this.parseFloat();
    }

    convertToInteger(): number | null {
        return this.parseInteger();
    }

    convertToString(): string | null {
        switch (typeof this.val) {
            case 'string':
                return this.val;
            case 'number': {
                const str = `${this.val}`;
                this.val = str;
                return str;
            }
            default:
                return null;
        }
    }
}
