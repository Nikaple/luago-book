import { SmartBuffer } from 'smart-buffer';
import { BinaryReader } from './reader';

export interface Header {
    signature: Buffer;
    version: number;
    format: number;
    luacData: Buffer;
    cintSize: number;
    sizetSize: number;
    instructionSize: number;
    luaIntegerSize: number;
    luaNumberSize: number;
    luacInt: bigint;
    luacNum: number;
}

export interface Upvalue {
    Instack: number;
    Idx: number;
}

export interface LocVar {
    VarName: string;
    StartPC: number;
    EndPC: number;
}

export interface Prototype {
    Source: string; // debug
    LineDefined: number;
    LastLineDefined: number;
    NumParams: number;
    IsVararg: number;
    MaxStackSize: number;
    Code: number[];
    Constants: any[];
    Upvalues: Upvalue[];
    Protos: Prototype[];
    LineInfo: number[]; // debug
    LocVars: LocVar[]; // debug
    UpvalueNames: string[]; // debug
}

export interface BinaryChunk {
    header: Header;
    sizeUpvalues: number;
    mainFunc: Prototype;
}

export function undump(buffer: Buffer) {
    const reader = new BinaryReader(SmartBuffer.fromBuffer(buffer));
    reader.checkHeader();
    reader.readByte();
    return reader.readProto('');
}
