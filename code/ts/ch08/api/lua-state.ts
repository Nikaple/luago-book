import { ArithOp, CompareOp, LuaType } from './consts';

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
    toInteger(idx: number): number | null;
    toNumber(idx: number): number | null;
    toString(idx: number): string | null;
    /* push functions (TS -> stack): */
    pushNil(): void;
    pushBoolean(b: boolean): void;
    pushInteger(n: number): void;
    pushNumber(n: number): void;
    pushString(s: string): void;
    /* arithmetic */
    arith(op: ArithOp): void;
    compare(idx1: number, idx2: number, op: CompareOp): boolean;
    len(idx: number): void;
    concat(n: number): void;
    /* table */
    newTable(): void;
    createTable(): void;
    getTable(idx: number): LuaType;
    getField(idx: number, k: string): LuaType;
    getI(idx: number, i: number): LuaType;
    setTable(idx: number): void;
    setField(idx: number, k: string): void;
    setI(idx: number, n: number): void;
    /* closure */
    load(chunk: Buffer, chunkName: string, mode: string): number;
    call(nArgs: number, nResults: number): void;
}
