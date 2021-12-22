import { SmartBuffer } from 'smart-buffer';
import { Header, LocVar, Prototype, Upvalue } from './binary-chunk';

export class BinaryReader {
    buffer: SmartBuffer;

    // Header
    static LUA_SIGNATURE = Buffer.from('\x1b\x4c\x75\x61', 'ascii');
    static LUAC_VERSION = 0x53;
    static LUAC_FORMAT = 0;
    static LUAC_DATA = Buffer.from('\x19\x93\r\n\x1a\n', 'ascii');
    static CINT_SIZE = 4;
    static CSIZET_SIZE = 8;
    static INSTRUCTION_SIZE = 4;
    static LUA_INTEGER_SIZE = 8;
    static LUA_NUMBER_SIZE = 8;
    static LUAC_INT = 0x5678n;
    static LUAC_NUM = 370.5;

    // Tags
    static TAG_NIL = 0x00;
    static TAG_BOOLEAN = 0x01;
    static TAG_NUMBER = 0x03;
    static TAG_INTEGER = 0x13;
    static TAG_SHORT_STR = 0x04;
    static TAG_LONG_STR = 0x14;

    constructor(buffer: SmartBuffer) {
        this.buffer = buffer;
    }

    readHeader(): Header {
        return {
            signature: this.readBytes(4),
            version: this.readUint8(),
            format: this.readUint8(),
            luacData: this.readBytes(6),
            cintSize: this.readUint8(),
            sizetSize: this.readUint8(),
            instructionSize: this.readUint8(),
            luaIntegerSize: this.readUint8(),
            luaNumberSize: this.readUint8(),
            luacInt: this.readUint64(),
            luacNum: this.readDouble(),
        };
    }

    checkHeader() {
        const header = this.readHeader();
        if (!header.signature.equals(BinaryReader.LUA_SIGNATURE)) {
            throw new Error('not a precompiled chunk!');
        }
        if (header.version !== BinaryReader.LUAC_VERSION) {
            throw new Error('version mismatch!');
        }
        if (header.format !== BinaryReader.LUAC_FORMAT) {
            throw new Error('format mismatch!');
        }
        if (!header.luacData.equals(BinaryReader.LUAC_DATA)) {
            throw new Error('corrupted!');
        }
        if (header.cintSize !== BinaryReader.CINT_SIZE) {
            throw new Error('int size mismatch!');
        }
        if (header.sizetSize !== BinaryReader.CSIZET_SIZE) {
            throw new Error('size_t size mismatch!');
        }
        if (header.instructionSize !== BinaryReader.INSTRUCTION_SIZE) {
            throw new Error('instruction size mismatch!');
        }
        if (header.luaIntegerSize !== BinaryReader.LUA_INTEGER_SIZE) {
            throw new Error('lua_Integer size mismatch!');
        }
        if (header.luaNumberSize !== BinaryReader.LUA_NUMBER_SIZE) {
            throw new Error('lua_Number size mismatch!');
        }
        if (header.luacInt !== BinaryReader.LUAC_INT) {
            throw new Error('endianness mismatch!');
        }
        if (header.luacNum !== BinaryReader.LUAC_NUM) {
            throw new Error('float format mismatch!');
        }
    }

    readProto(parentSource: string): Prototype {
        let source = this.readString();
        if (source === '') {
            source = parentSource;
        }
        return {
            Source: source,
            LineDefined: this.readUint32(),
            LastLineDefined: this.readUint32(),
            NumParams: this.readByte(),
            IsVararg: this.readByte(),
            MaxStackSize: this.readByte(),
            Code: this.readCode(),
            Constants: this.readConstants(),
            Upvalues: this.readUpvalues(),
            Protos: this.readProtos(source),
            LineInfo: this.readLineInfo(),
            LocVars: this.readLocVars(),
            UpvalueNames: this.readUpvalueNames(),
        };
    }

    readCode() {
        const codeLength = this.readUint32();
        const code = [];
        for (let i = 0; i < codeLength; i++) {
            code[i] = this.readUint32();
        }
        return code;
    }

    readConstants() {
        const constantsLength = this.readUint32();
        const constants = [];
        for (let i = 0; i < constantsLength; i++) {
            constants[i] = this.readConstant();
        }
        return constants;
    }

    readConstant() {
        switch (this.readByte()) {
            case BinaryReader.TAG_NIL:
                return null;
            case BinaryReader.TAG_BOOLEAN:
                return this.readByte() !== 0;
            case BinaryReader.TAG_INTEGER:
                return this.readLuaInt();
            case BinaryReader.TAG_NUMBER:
                return this.readLuaNumber();
            case BinaryReader.TAG_SHORT_STR:
            case BinaryReader.TAG_LONG_STR:
                return this.readString();
            default:
                throw new Error('corrupted!');
        }
    }

    readUpvalues() {
        const upvaluesLength = this.readUint32();
        const upvalues: Upvalue[] = [];
        for (let i = 0; i < upvaluesLength; i++) {
            upvalues[i] = {
                Instack: this.readByte(),
                Idx: this.readByte(),
            };
        }
        return upvalues;
    }

    readProtos(parentSource: string) {
        const protosLength = this.readUint32();
        const protos: Prototype[] = [];
        for (let i = 0; i < protosLength; i++) {
            protos[i] = this.readProto(parentSource);
        }
        return protos;
    }

    readLineInfo() {
        const lineInfoLength = this.readUint32();
        const lineInfo: number[] = [];
        for (let i = 0; i < lineInfoLength; i++) {
            lineInfo[i] = this.readUint32();
        }
        return lineInfo;
    }

    readLocVars() {
        const locVarsLength = this.readUint32();
        const locVars: LocVar[] = [];
        for (let i = 0; i < locVarsLength; i++) {
            locVars[i] = {
                VarName: this.readString(),
                StartPC: this.readUint32(),
                EndPC: this.readUint32(),
            };
        }
        return locVars;
    }

    readUpvalueNames() {
        const namesLength = this.readUint32();
        const names: string[] = [];
        for (let i = 0; i < namesLength; i++) {
            names[i] = this.readString();
        }
        return names;
    }

    readBytes(byteNum: number) {
        const bytes = this.buffer.readBuffer(byteNum);

        return bytes;
    }

    readByte() {
        return this.buffer.readUInt8();
    }

    readUint8() {
        return this.buffer.readUInt8();
    }

    readUint16() {
        return this.buffer.readUInt16LE();
    }

    readUint32() {
        return this.buffer.readUInt32LE();
    }

    readUint64() {
        return this.buffer.readBigUInt64LE();
    }

    readFloat() {
        return this.buffer.readFloatLE();
    }

    readDouble() {
        return this.buffer.readDoubleLE();
    }

    readString() {
        let size = this.buffer.readUInt8();
        if (size === 0) {
            return '';
        }
        if (size === 0xff) {
            size = this.buffer.readUInt8();
        }

        const bs = this.readBytes(size - 1);
        return bs.toString('utf-8');
    }

    readLuaInt() {
        return Number(this.buffer.readBigInt64LE());
    }

    readLuaNumber() {
        return this.buffer.readDoubleLE();
    }
}
