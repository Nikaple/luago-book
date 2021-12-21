import { ILuaState } from './lua-state';

export interface ILuaVM extends ILuaState {
    getPC(): number;
    addPC(n: number): void;
    fetch(): number;
    getConst(idx: number): void;
    getRK(rk: number): void;
}
