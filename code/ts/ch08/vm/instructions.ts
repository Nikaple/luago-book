import { ArithOp, CompareOp, LFIELDS_PER_FLUSH } from '../api/consts';
import { LuaState } from '../state/lua-state';
import { Instruction } from './instruction';
import { Op } from './opcodes';

// TODO: remove `Partial`
export const instructions: Partial<
    Record<Op, (i: Instruction, vm: LuaState) => void>
> = {
    // misc
    [Op.MOVE](i: Instruction, vm: LuaState) {
        const [a, b] = i.ABC();
        vm.copy(b + 1, a + 1);
    },
    [Op.JMP](i: Instruction, vm: LuaState) {
        const [a, sBx] = i.AsBx();
        vm.addPC(sBx);
        if (a != 0) {
            throw new Error('todo!');
        }
    },

    // load
    [Op.LOADNIL](i: Instruction, vm: LuaState) {
        const [a, b] = i.ABC();
        vm.pushNil();
        for (let i = a + 1; i <= a + b + 1; i++) {
            vm.copy(-1, i);
        }
        vm.pop(1);
    },
    [Op.LOADBOOL](i: Instruction, vm: LuaState) {
        const [a, b, c] = i.ABC();
        vm.pushBoolean(b != 0);
        vm.replace(a + 1);
        if (c != 0) {
            vm.addPC(1);
        }
    },
    [Op.LOADK](i: Instruction, vm: LuaState) {
        const [a, bx] = i.ABx();
        vm.getConst(bx);
        vm.replace(a + 1);
    },
    [Op.LOADKX](i: Instruction, vm: LuaState) {
        const [a] = i.ABx();
        const ax = new Instruction(vm.fetch()).Ax();

        vm.getConst(ax);
        vm.replace(a + 1);
    },

    // arith operators
    [Op.ADD](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.ADD);
    },
    [Op.SUB](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.SUB);
    },
    [Op.MUL](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.MUL);
    },
    [Op.MOD](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.MOD);
    },
    [Op.POW](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.POW);
    },
    [Op.DIV](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.DIV);
    },
    [Op.IDIV](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.IDIV);
    },
    [Op.BAND](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.BAND);
    },
    [Op.BOR](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.BOR);
    },
    [Op.BXOR](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.BXOR);
    },
    [Op.SHL](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.SHL);
    },
    [Op.SHR](i: Instruction, vm: LuaState) {
        return binaryArith(i, vm, ArithOp.SHR);
    },
    [Op.UNM](i: Instruction, vm: LuaState) {
        return unaryArith(i, vm, ArithOp.UNM);
    },
    [Op.BNOT](i: Instruction, vm: LuaState) {
        return unaryArith(i, vm, ArithOp.BNOT);
    },

    // len & concat operators
    [Op.LEN](i: Instruction, vm: LuaState) {
        const [a, b] = i.ABC();
        vm.len(b + 1);
        vm.replace(a + 1);
    },
    [Op.CONCAT](i: Instruction, vm: LuaState) {
        const [a, b, c] = i.ABC();
        const n = c - b + 1;

        vm.checkStack();

        for (let i = b + 1; i <= c + 1; i++) {
            vm.pushValue(i);
        }

        vm.concat(n);
        vm.replace(a + 1);
    },

    // compare operators
    [Op.EQ](i: Instruction, vm: LuaState) {
        return compare(i, vm, CompareOp.EQ);
    },
    [Op.LT](i: Instruction, vm: LuaState) {
        return compare(i, vm, CompareOp.LT);
    },
    [Op.LE](i: Instruction, vm: LuaState) {
        return compare(i, vm, CompareOp.LE);
    },

    // logical operators
    [Op.NOT](i: Instruction, vm: LuaState) {
        const [a, b] = i.ABC();
        vm.pushBoolean(!vm.toBoolean(b + 1));
        vm.replace(a + 1);
    },
    [Op.TESTSET](i: Instruction, vm: LuaState) {
        const [a, b, c] = i.ABC();
        if (vm.toBoolean(b + 1) === Boolean(c)) {
            vm.copy(b + 1, a + 1);
        } else {
            vm.addPC(1);
        }
    },
    [Op.TEST](i: Instruction, vm: LuaState) {
        const [a, _, c] = i.ABC();
        if (vm.toBoolean(a + 1) !== Boolean(c)) {
            vm.addPC(1);
        }
    },

    // for operators
    [Op.FORPREP](i: Instruction, vm: LuaState) {
        let [a, sBx] = i.AsBx();
        a += 1;

        // R(A) -= R(A+2)
        vm.pushValue(a);
        vm.pushValue(a + 2);
        vm.arith(ArithOp.SUB);
        vm.replace(a);
        // pc += sBx
        vm.addPC(sBx);
    },
    [Op.FORLOOP](i: Instruction, vm: LuaState) {
        let [a, sBx] = i.AsBx();
        a += 1;

        // R(A) += R(A+2)
        vm.pushValue(a + 2);
        vm.pushValue(a);
        vm.arith(ArithOp.ADD);
        vm.replace(a);

        // R(A) <?= R(A+1)
        const isPositiveStep = (vm.toNumber(a + 2) || 0) >= 0;
        if (
            (isPositiveStep && vm.compare(a, a + 1, CompareOp.LE)) ||
            (!isPositiveStep && vm.compare(a + 1, a, CompareOp.LE))
        ) {
            // pc += sBx
            vm.addPC(sBx);
            // R(A+3) = R(A)
            vm.copy(a, a + 3);
        }
    },

    // tables
    [Op.NEWTABLE](i: Instruction, vm: LuaState) {
        const [a] = i.ABC();
        vm.createTable();
        vm.replace(a + 1);
    },
    [Op.GETTABLE](i: Instruction, vm: LuaState) {
        const [a, b, c] = i.ABC();
        vm.getRK(c);
        vm.getTable(b + 1);
        vm.replace(a + 1);
    },
    [Op.SETTABLE](i: Instruction, vm: LuaState) {
        const [a, b, c] = i.ABC();
        vm.getRK(b);
        vm.getRK(c);
        vm.setTable(a + 1);
    },
    [Op.SETLIST](i: Instruction, vm: LuaState) {
        let [a, b, c] = i.ABC();
        a += 1;

        if (c > 0) {
            c = c - 1;
        } else {
            c = new Instruction(vm.fetch()).Ax();
        }

        const bIsZero = b === 0;
        if (bIsZero) {
            b = vm.toInteger(-1)! - a - 1;
            vm.pop(1);
        }

        let idx = c * LFIELDS_PER_FLUSH;
        for (let j = 1; j <= b; j++) {
            idx++;
            vm.pushValue(a + j);
            vm.setI(a, idx);
        }

        if (bIsZero) {
            for (let j = vm.registerCount() + 1; j < vm.getTop() + 1; j++) {
                idx++;
                vm.pushValue(j);
                vm.setI(a, idx);
            }

            vm.setTop(vm.registerCount());
        }
    },

    // function calls
    [Op.CLOSURE](i: Instruction, vm: LuaState) {
        const [a, bx] = i.ABx();

        vm.loadProto(bx);
        vm.replace(a + 1);
    },

    [Op.CALL](i: Instruction, vm: LuaState) {
        let [a, b, c] = i.ABC();
        a += 1;

        const nArgs = pushFuncAndArgs(a, b, vm);
        vm.call(nArgs, c - 1);
        popResults(a, c, vm);
    },
    [Op.RETURN](i: Instruction, vm: LuaState) {
        let [a, b] = i.ABC();
        a += 1;

        if (b == 1) {
            // no return values
        } else if (b > 1) {
            for (let i = a; i <= a + b - 2; i++) {
                vm.pushValue(i);
            }
        } else {
            fixStack(a, vm);
        }
    },
    [Op.VARARG](i: Instruction, vm: LuaState) {
        let [a, b] = i.ABC();
        a += 1;

        if (b != 1) {
            vm.loadVararg(b - 1);
            popResults(a, b, vm);
        }
    },
    [Op.TAILCALL](i: Instruction, vm: LuaState) {
        let [a, b] = i.ABC();
        a += 1;

        const c = 0;
        const nArgs = pushFuncAndArgs(a, b, vm);
        vm.call(nArgs, c - 1);
        popResults(a, c, vm);
    },
    [Op.SELF](i: Instruction, vm: LuaState) {
        let [a, b, c] = i.ABC();
        a += 1;
        b += 1;

        vm.copy(b, a + 1);
        vm.getRK(c);
        vm.getTable(b);
        vm.replace(a);
    },
};

function binaryArith(i: Instruction, vm: LuaState, op: ArithOp) {
    const [a, b, c] = i.ABC();
    vm.getRK(b);
    vm.getRK(c);
    vm.arith(op);
    vm.replace(a + 1);
}
function unaryArith(i: Instruction, vm: LuaState, op: ArithOp) {
    const [a, b] = i.ABC();
    vm.pushValue(b + 1);
    vm.arith(op);
    vm.replace(a + 1);
}

function compare(i: Instruction, vm: LuaState, op: CompareOp) {
    const [a, b, c] = i.ABC();
    vm.getRK(b);
    vm.getRK(c);
    if (vm.compare(-2, -1, op) !== (a !== 0)) {
        vm.addPC(1);
    }
    vm.pop(2);
}

function pushFuncAndArgs(a: number, b: number, vm: LuaState) {
    if (b >= 1) {
        // b-1 args
        vm.checkStack();
        for (let i = a; i < a + b; i++) {
            vm.pushValue(i);
        }
        return b - 1;
    } else {
        fixStack(a, vm);
        return vm.getTop() - vm.registerCount() - 1;
    }
}

function fixStack(a: number, vm: LuaState) {
    const x = vm.toInteger(-1);
    if (x === null) {
        throw new Error('not an integer!');
    }
    vm.pop(1);

    vm.checkStack();
    for (let i = a; i < x; i++) {
        vm.pushValue(i);
    }
    vm.rotate(vm.registerCount() + 1, x - a);
}

function popResults(a: number, c: number, vm: LuaState) {
    if (c === 1) {
        // no results
    } else if (c > 1) {
        for (let i = a + c - 2; i >= a; i--) {
            vm.replace(i);
        }
    } else {
        vm.checkStack();
        vm.pushInteger(a);
    }
}
