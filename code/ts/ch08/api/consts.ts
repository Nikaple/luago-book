export enum LuaType {
    NONE = -1,
    NIL,
    BOOLEAN,
    LIGHTUSERDATA,
    NUMBER,
    STRING,
    TABLE,
    FUNCTION,
    USERDATA,
    THREAD,
}

export enum ArithOp {
    /* +  */ ADD,
    /* -  */ SUB,
    /* *  */ MUL,
    /* %  */ MOD,
    /* ^  */ POW,
    /* /  */ DIV,
    /* // */ IDIV,
    /* &  */ BAND,
    /* |  */ BOR,
    /* ~  */ BXOR,
    /* << */ SHL,
    /* >> */ SHR,
    /* -  */ UNM,
    /* ~  */ BNOT,
}

export enum CompareOp {
    EQ, // ==
    LT, // <
    LE, // <=
}

export const LFIELDS_PER_FLUSH = 50;
