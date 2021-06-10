import { ParrotDiscoConstans } from '../enums/ParrotDiscoConstans.enum';

export default function networkFrameGenerator(): Function {
    const seq = [];

    return function (cmd, type, id) {
        const hlen = 7,
            buf = Buffer.alloc(hlen);

        type = type || ParrotDiscoConstans.ARNETWORKAL_FRAME_TYPE_DATA;
        id = id || ParrotDiscoConstans.BD_NET_CD_NONACK_ID;

        if (!seq[id]) {
            seq[id] = 0;
        }

        seq[id]++;

        if (seq[id] > 255) {
            seq[id] = 0;
        }

        buf.writeUInt8(type, 0);
        buf.writeUInt8(id, 1);
        buf.writeUInt8(seq[id], 2);
        buf.writeUInt32LE(cmd.length + hlen, 3);

        return Buffer.concat([buf, cmd]);
    };
}
