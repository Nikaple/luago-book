import assert from 'assert';
import { ArithOp } from '../api/consts';
import { LuaValue } from './lua-value';

export class Arith {
    static [ArithOp.ADD](a: number, b: number) {
        return a + b;
    }
    static [ArithOp.SUB](a: number, b: number) {
        return a - b;
    }
    static [ArithOp.MUL](a: number, b: number) {
        return a * b;
    }
    static [ArithOp.MOD](a: number, b: number) {
        return a % b;
    }
    static [ArithOp.POW](a: number, b: number) {
        return Math.pow(a, b);
    }
    static [ArithOp.DIV](a: number, b: number) {
        return a / b;
    }
    static [ArithOp.IDIV](a: number, b: number) {
        return Math.floor(a / b);
    }
    static [ArithOp.BAND](a: number, b: number) {
        return a & b;
    }
    static [ArithOp.BOR](a: number, b: number) {
        return a | b;
    }
    static [ArithOp.BXOR](a: number, b: number) {
        return a ^ b;
    }
    static [ArithOp.SHL](a: number, b: number): number {
        if (b >= 0) {
            return a << b;
        }
        return this[ArithOp.SHR](a, -b);
    }
    static [ArithOp.SHR](a: number, b: number): number {
        if (b >= 0) {
            const val = this.uint2int(
                this.int2uint(BigInt(a)) >> this.int2uint(BigInt(b))
            );
            return Number(val);
        }
        return this[ArithOp.SHL](a, -b);
    }
    static [ArithOp.UNM](a: number) {
        return -a;
    }
    static [ArithOp.BNOT](a: number) {
        return ~a;
    }

    static arith(a: LuaValue, b: LuaValue, op: ArithOp) {
        type OperatorFn =
            | ((a: number, b: number) => number)
            | ((a: number) => number)
            | null;
        const operators: Record<
            ArithOp,
            [IntegerFunc: OperatorFn, FloatFunc: OperatorFn]
        > = {
            [ArithOp.ADD]: [this[ArithOp.ADD], this[ArithOp.ADD]],
            [ArithOp.SUB]: [this[ArithOp.SUB], this[ArithOp.SUB]],
            [ArithOp.MUL]: [this[ArithOp.MUL], this[ArithOp.MUL]],
            [ArithOp.MOD]: [this[ArithOp.MOD], this[ArithOp.MOD]],
            [ArithOp.POW]: [null, this[ArithOp.POW]],
            [ArithOp.DIV]: [null, this[ArithOp.DIV]],
            [ArithOp.IDIV]: [this[ArithOp.DIV], this[ArithOp.DIV]],
            [ArithOp.BAND]: [this[ArithOp.BAND], null],
            [ArithOp.BOR]: [this[ArithOp.BOR], null],
            [ArithOp.BXOR]: [this[ArithOp.BXOR], null],
            [ArithOp.SHL]: [this[ArithOp.SHL], null],
            [ArithOp.SHR]: [this[ArithOp.SHR], null],
            [ArithOp.UNM]: [this[ArithOp.UNM], this[ArithOp.UNM]],
            [ArithOp.BNOT]: [this[ArithOp.BNOT], null],
        };

        const [integerFunc, floatFunc] = operators[op];
        if (floatFunc === null) {
            const x = a.convertToInteger();
            if (x !== null) {
                const y = b.convertToInteger();
                if (y !== null) {
                    return integerFunc!(x, y);
                }
            }
        } else {
            if (integerFunc !== null) {
                const x = a.convertToInteger();
                if (x !== null) {
                    const y = b.convertToInteger();
                    if (y !== null) {
                        return integerFunc(x, y);
                    }
                }
            } else {
                const x = a.convertToFloat();
                if (x !== null) {
                    const y = b.convertToFloat();
                    if (y !== null) {
                        return floatFunc(x, y);
                    }
                }
            }
        }
        return null;
    }

    private static int2uint(int: bigint) {
        return new BigUint64Array([BigInt(int)])[0];
    }
    private static uint2int(uint: bigint) {
        return new BigInt64Array([BigInt(uint)])[0];
    }
}

assert(Arith[ArithOp.SHR](-1, 63) === 1);
assert(Arith[ArithOp.SHL](2, -1) === 1);
assert(Arith[ArithOp.SHL]('1' as any, 1.0) === 2);
