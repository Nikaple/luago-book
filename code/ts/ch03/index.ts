import fs from 'fs';
import { Prototype, undump } from './binchunk/binary-chunk';
import { Instruction } from './vm/instruction';
import { OpArgMask, OpMode } from './vm/opcodes';

if (process.argv.length > 2) {
    const fileName = process.argv[2];
    const fileBuffer = fs.readFileSync(fileName);

    const proto = undump(fileBuffer);
    list(proto);
}

function list(proto: Prototype) {
    printHeader(proto);
    printCode(proto);
    printDetail(proto);
    proto.Protos.forEach(list);
}

function print(string: string) {
    process.stdout.write(string);
}

function printHeader(proto: Prototype) {
    const {
        LineDefined,
        LastLineDefined,
        IsVararg,
        Code,
        Source,
        NumParams,
        MaxStackSize,
        Upvalues,
        LocVars,
        Constants,
        Protos,
    } = proto;
    let funcType = 'main';
    if (LineDefined > 0) {
        funcType = 'function';
    }

    let varargFlag = '';
    if (IsVararg > 0) {
        varargFlag = '+';
    }

    print(
        `\n${funcType} <${Source}:${LineDefined},${LastLineDefined}> (${Code.length} instructions) \n`
    );
    print(
        `${NumParams}${varargFlag} params, ${MaxStackSize} slots, ${Upvalues.length} upvalues, `
    );
    print(
        `${LocVars.length} locals, ${Constants.length} constants, ${Protos.length} functions\n`
    );
}

function printCode(proto: Prototype) {
    proto.Code.forEach((code, i) => {
        let line = '-';
        if (proto.LineInfo.length > 0) {
            line = proto.LineInfo[i].toString();
        }
        const inst = new Instruction(code);
        print(`\t${i + 1}\t[${line}]\t${inst.OpName} \t`);
        printOperands(inst);
        print(`\n`);
    });
}

function printOperands(i: Instruction) {
    switch (i.OpMode) {
        case OpMode.IABC: {
            const [a, b, c] = i.ABC();
            print(`${a}`);
            if (i.BMode !== OpArgMask.N) {
                if (b > 0xff) {
                    print(` ${-1 - (b & 0xff)}`);
                } else {
                    print(` ${b}`);
                }
            }
            if (i.CMode !== OpArgMask.N) {
                if (c > 0xff) {
                    print(` ${-1 - (c & 0xff)}`);
                } else {
                    print(` ${c}`);
                }
            }
            break;
        }
        case OpMode.IABx: {
            const [a, bx] = i.ABx();
            print(`${a}`);
            if (i.BMode === OpArgMask.K) {
                print(` ${-1 - bx}`);
            } else if (i.BMode === OpArgMask.U) {
                print(` ${bx}`);
            }
            break;
        }
        case OpMode.IAsBx: {
            const [a, sbx] = i.AsBx();
            print(`${a} ${sbx}`);
            break;
        }
        case OpMode.IAx: {
            const ax = i.Ax();
            print(`${-1 - ax}`);
        }
    }
}

function printDetail(proto: Prototype) {
    const { Constants, LocVars, Upvalues } = proto;

    print(`constants (${Constants.length}):\n`);
    Constants.forEach((k, i) => {
        print(`\t${i + 1}\t${JSON.stringify(k)}\n`);
    });

    print(`locals (${LocVars.length}):\n`);
    LocVars.forEach((locVar, i) => {
        const { EndPC, StartPC, VarName } = locVar;
        print(`\t${i}\t${VarName}\t${StartPC + 1}\t${EndPC + 1}`);
    });

    print(`upvalues (${Upvalues.length}):\n`);
    Upvalues.forEach((upval, i) => {
        const { Idx, Instack } = upval;
        print(`\t${i}\t${upvalName(proto, i)}\t${Instack}\t${Idx}`);
    });
}

function upvalName(proto: Prototype, idx: number) {
    if (proto.UpvalueNames.length > 0) {
        return proto.UpvalueNames[idx];
    }
    return '-';
}
