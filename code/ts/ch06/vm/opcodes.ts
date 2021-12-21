export enum OpMode {
    IABC, //  [  B:9  ][  C:9  ][ A:8  ][OP:6]
    IABx, //  [      Bx:18     ][ A:8  ][OP:6]
    IAsBx, // [     sBx:18     ][ A:8  ][OP:6]
    IAx, //   [           Ax:26        ][OP:6]
}

export enum OpArgMask {
    N, // argument is not used
    U, // argument is used
    R, // argument is a register or a jump offset
    K, // argument is a constant or register/constant
}

export enum Op {
    MOVE,
    LOADK,
    LOADKX,
    LOADBOOL,
    LOADNIL,
    GETUPVAL,
    GETTABUP,
    GETTABLE,
    SETTABUP,
    SETUPVAL,
    SETTABLE,
    NEWTABLE,
    SELF,
    ADD,
    SUB,
    MUL,
    MOD,
    POW,
    DIV,
    IDIV,
    BAND,
    BOR,
    BXOR,
    SHL,
    SHR,
    UNM,
    BNOT,
    NOT,
    LEN,
    CONCAT,
    JMP,
    EQ,
    LT,
    LE,
    TEST,
    TESTSET,
    CALL,
    TAILCALL,
    RETURN,
    FORLOOP,
    FORPREP,
    TFORCALL,
    TFORLOOP,
    SETLIST,
    CLOSURE,
    VARARG,
    EXTRAARG,
}

export interface OpCode {
    testFlag: number;
    setAFlag: number;
    argBMode: OpArgMask;
    argCMode: OpArgMask;
    opMode: OpMode;
    name: string;
}

const create = (
    testFlag: number,
    setAFlag: number,
    argBMode: OpArgMask,
    argCMode: OpArgMask,
    opMode: OpMode,
    name: string
): OpCode => {
    return { testFlag, setAFlag, argBMode, argCMode, opMode, name };
};

export const opcodes = [
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC /* */, 'MOVE    '), // R(A) := R(B)
    create(0, 1, OpArgMask.K, OpArgMask.N, OpMode.IABx /* */, 'LOADK   '), // R(A) := Kst(Bx)
    create(0, 1, OpArgMask.N, OpArgMask.N, OpMode.IABx /* */, 'LOADKX  '), // R(A) := Kst(extra arg)
    create(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC /* */, 'LOADBOOL'), // R(A) := (bool)B; if (C) pc++
    create(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC /* */, 'LOADNIL '), // R(A), R(A+1), ..., R(A+B) := nil
    create(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC /* */, 'GETUPVAL'), // R(A) := UpValue[B]
    create(0, 1, OpArgMask.U, OpArgMask.K, OpMode.IABC /* */, 'GETTABUP'), // R(A) := UpValue[B][RK(C)]
    create(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC /* */, 'GETTABLE'), // R(A) := R(B)[RK(C)]
    create(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'SETTABUP'), // UpValue[A][RK(B)] := RK(C)
    create(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC /* */, 'SETUPVAL'), // UpValue[B] := R(A)
    create(0, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'SETTABLE'), // R(A)[RK(B)] := RK(C)
    create(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC /* */, 'NEWTABLE'), // R(A) := {} (size = B,C)
    create(0, 1, OpArgMask.R, OpArgMask.K, OpMode.IABC /* */, 'SELF    '), // R(A+1) := R(B); R(A) := R(B)[RK(C)]
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'ADD     '), // R(A) := RK(B) + RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'SUB     '), // R(A) := RK(B) - RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'MUL     '), // R(A) := RK(B) * RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'MOD     '), // R(A) := RK(B) % RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'POW     '), // R(A) := RK(B) ^ RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'DIV     '), // R(A) := RK(B) / RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'IDIV    '), // R(A) := RK(B) // RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'BAND    '), // R(A) := RK(B) & RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'BOR     '), // R(A) := RK(B) | RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'BXOR    '), // R(A) := RK(B) ~ RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'SHL     '), // R(A) := RK(B) << RK(C)
    create(0, 1, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'SHR     '), // R(A) := RK(B) >> RK(C)
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC /* */, 'UNM     '), // R(A) := -R(B)
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC /* */, 'BNOT    '), // R(A) := ~R(B)
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC /* */, 'NOT     '), // R(A) := not R(B)
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IABC /* */, 'LEN     '), // R(A) := length of R(B)
    create(0, 1, OpArgMask.R, OpArgMask.R, OpMode.IABC /* */, 'CONCAT  '), // R(A) := R(B).. ... ..R(C)
    create(0, 0, OpArgMask.R, OpArgMask.N, OpMode.IAsBx /**/, 'JMP     '), // pc+=sBx; if (A) close all upvalues >= R(A - 1)
    create(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'EQ      '), // if ((RK(B) == RK(C)) ~= A) then pc++
    create(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'LT      '), // if ((RK(B) <  RK(C)) ~= A) then pc++
    create(1, 0, OpArgMask.K, OpArgMask.K, OpMode.IABC /* */, 'LE      '), // if ((RK(B) <= RK(C)) ~= A) then pc++
    create(1, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC /* */, 'TEST    '), // if not (R(A) <=> C) then pc++
    create(1, 1, OpArgMask.R, OpArgMask.U, OpMode.IABC /* */, 'TESTSET '), // if (R(B) <=> C) then R(A) := R(B) else pc++
    create(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC /* */, 'CALL    '), // R(A), ... ,R(A+C-2) := R(A)(R(A+1), ... ,R(A+B-1))
    create(0, 1, OpArgMask.U, OpArgMask.U, OpMode.IABC /* */, 'TAILCALL'), // return R(A)(R(A+1), ... ,R(A+B-1))
    create(0, 0, OpArgMask.U, OpArgMask.N, OpMode.IABC /* */, 'RETURN  '), // return R(A), ... ,R(A+B-2)
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx /**/, 'FORLOOP '), // R(A)+=R(A+2); if R(A) <?= R(A+1) then { pc+=sBx; R(A+3)=R(A) }
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx /**/, 'FORPREP '), // R(A)-=R(A+2); pc+=sBx
    create(0, 0, OpArgMask.N, OpArgMask.U, OpMode.IABC /* */, 'TFORCALL'), // R(A+3), ... ,R(A+2+C) := R(A)(R(A+1), R(A+2));
    create(0, 1, OpArgMask.R, OpArgMask.N, OpMode.IAsBx /**/, 'TFORLOOP'), // if R(A+1) ~= nil then { R(A)=R(A+1); pc += sBx }
    create(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IABC /* */, 'SETLIST '), // R(A)[(C-1)*FPF+i] := R(A+i), 1 <= i <= B
    create(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABx /* */, 'CLOSURE '), // R(A) := closure(KPROTO[Bx])
    create(0, 1, OpArgMask.U, OpArgMask.N, OpMode.IABC /* */, 'VARARG  '), // R(A), R(A+1), ..., R(A+B-2) = vararg
    create(0, 0, OpArgMask.U, OpArgMask.U, OpMode.IAx /*  */, 'EXTRAARG'), // extra (larger) argument for previous opcode
];
