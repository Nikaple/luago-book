import fs from 'fs';
import { Prototype, undump } from './binchunk/binary-chunk';

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
        const hex = code.toString(16).padStart(8, '0');
        print(`\t${i + 1}\t[${line}]\t0x${hex}\n`);
    });
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
