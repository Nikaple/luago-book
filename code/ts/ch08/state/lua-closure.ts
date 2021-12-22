import { Prototype } from '../binchunk/binary-chunk';

export class LuaClosure {
    proto: Prototype;

    constructor(proto: Prototype) {
        this.proto = proto;
    }
}
