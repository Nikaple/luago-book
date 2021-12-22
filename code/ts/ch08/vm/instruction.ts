import { LuaState } from '../state/lua-state';
import { instructions } from './instructions';
import { Op, opcodes } from './opcodes';

export class Instruction {
    i: bigint;

    static MAXARG_Bx = (1 << 18) - 1; // 262143
    static MAXARG_sBx = this.MAXARG_Bx >> 1; // 131071

    constructor(i: number) {
        this.i = BigInt(i);
    }

    ABC() {
        const a = Number((this.i >> 6n) & 0xffn);
        const c = Number((this.i >> 14n) & 0x1ffn);
        const b = Number((this.i >> 23n) & 0x1ffn);
        return [a, b, c] as const;
    }
    ABx() {
        const a = Number((this.i >> 6n) & 0xffn);
        const bx = Number(this.i >> 14n);
        return [a, bx] as const;
    }
    AsBx() {
        const [a, bx] = this.ABx();
        return [a, bx - Instruction.MAXARG_sBx] as const;
    }
    Ax() {
        return Number(this.i >> 6n);
    }

    execute(vm: LuaState) {
        const action = instructions[this.Opcode as Op];
        if (!action) {
            throw new Error(`Not implemented: ${this.OpName}`);
        }
        action(this, vm);
    }

    get Opcode() {
        return Number(this.i & 0x3fn);
    }
    get OpName() {
        return opcodes[this.Opcode].name;
    }
    get OpMode() {
        return opcodes[this.Opcode].opMode;
    }
    get BMode() {
        return opcodes[this.Opcode].argBMode;
    }
    get CMode() {
        return opcodes[this.Opcode].argCMode;
    }
}
