import ParrotDiscoNetworkFrame from 'interfaces/ParrotDiscoNetworkFrame.interface';

export default function (buffer): ParrotDiscoNetworkFrame {
    const frame: ParrotDiscoNetworkFrame = {
        type: buffer.readUInt8(0),
        id: buffer.readUInt8(1),
        seq: buffer.readUInt8(2),
        size: buffer.readUInt32LE(3),
    };

    if (frame.size > 7) {
        frame.data = Buffer.concat([buffer.slice(7, frame.size)]);
    }

    return frame;
}
