import { LuaType } from '../api/consts';

export class LuaValue {
    val: null | boolean | bigint | number | string;
    constructor(val: any) {
        this.val = val;
    }

    typeOf() {
        if (this.val === null) {
            return LuaType.NIL;
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
}

export function convertToBoolean(val: LuaValue): boolean {
    switch (val.typeOf()) {
        case LuaType.NIL:
            return false;
        case LuaType.BOOLEAN:
            return val.val as boolean;
        default:
            return true;
    }
}
