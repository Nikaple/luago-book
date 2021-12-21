import { ArithOp, CompareOp, LFIELDS_PER_FLUSH } from '../api/consts';
import { LuaState } from '../state/lua-state';
import { Instruction } from './instruction';
import { Op } from './opcodes';

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

        let idx = c * LFIELDS_PER_FLUSH;
        for (let j = 1; j <= b; j++) {
            idx++;
            vm.pushValue(a + j);
            vm.setI(a, idx);
        }
    },
};
