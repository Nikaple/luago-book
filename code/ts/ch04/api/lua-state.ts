import { LuaStack } from '../state/lua-stack';

export type LuaType = number;

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
    toIntegerX(idx: number): [number, boolean];
    toNumber(idx: number): number;
    toNumberX(idx: number): [number, boolean];
    toString(idx: number): string;
    toStringX(idx: number): [string, boolean];
    /* push functions (TS -> stack): */
    pushNil(): void;
    pushBoolean(b: boolean): void;
    pushInteger(n: number): void;
    pushNumber(n: number): void;
    pushString(s: string): void;
}

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
        for (let i = 0; i < n; i++) {
            this.stack.pop();
        }
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
    insert() {}
    remove() {}
    rotate() {}
}
