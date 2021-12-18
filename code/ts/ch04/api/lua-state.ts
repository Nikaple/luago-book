import { LuaType } from './consts';

export interface ILuaState {
    /* basic stack manipulation */
    getTop(): number;
    absIndex(idx: number): number;
    checkStack(n: number): boolean;
    pop(n: number): void;
    copy(fromIdx: number, toIdx: number): void;
    pushValue(idx: number): void;
    replace(idx: number): void;
    insert(idx: number): void;
    remove(idx: number): void;
    rotate(idx: number, n: number): void;
    setTop(idx: number): void;
    /* access functions (stack -> TS): */
    typeName(tp: LuaType): string;
    type(idx: number): LuaType;
    isNone(idx: number): boolean;
    isNil(idx: number): boolean;
    isNoneOrNil(idx: number): boolean;
    isBoolean(idx: number): boolean;
    isInteger(idx: number): boolean;
    isNumber(idx: number): boolean;
    isString(idx: number): boolean;
    isTable(idx: number): boolean;
    isThread(idx: number): boolean;
    isFunction(idx: number): boolean;
    toBoolean(idx: number): boolean;
    toInteger(idx: number): number;
    toIntegerX(idx: number): readonly [number, true] | readonly [0, false];
    toNumber(idx: number): number;
    toNumberX(idx: number): readonly [number, true] | readonly [0, false];
    toString(idx: number): string;
    toStringX(idx: number): readonly [string, true] | readonly ['', false];
    /* push functions (TS -> stack): */
    pushNil(): void;
    pushBoolean(b: boolean): void;
    pushInteger(n: number): void;
    pushNumber(n: number): void;
    pushString(s: string): void;
}
