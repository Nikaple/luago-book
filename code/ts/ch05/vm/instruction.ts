import { opcodes } from './opcodes';

export class Instruction {
    i: number;

    static MAXARG_Bx = (1 << 18) - 1; // 262143
    static MAXARG_sBx = this.MAXARG_Bx >> 1; // 131071

    constructor(i: number) {
        this.i = i;
    }

    ABC() {
        const a = (this.i >> 6) & 0xff;
        const c = (this.i >> 14) & 0x1ff;
        const b = (this.i >> 23) & 0x1ff;
        return [a, b, c] as const;
    }
    ABx() {
        const a = (this.i >> 6) & 0xff;
        const bx = this.i >> 14;
        return [a, bx] as const;
    }
    AsBx() {
        const [a, bx] = this.ABx();
        return [a, bx - Instruction.MAXARG_sBx] as const;
    }
    Ax() {
        return this.i >> 6;
    }

    get Opcode() {
        return this.i & 0x3f;
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
