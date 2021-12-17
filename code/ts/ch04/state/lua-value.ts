import { LuaType } from '../api/consts';

export class LuaValue {
    val: any;
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
