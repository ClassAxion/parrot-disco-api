import dgram from 'dgram';
import net from 'net';

export default interface ParrotDiscoSockets {
    c2d: dgram.Socket;
    d2c: dgram.Socket;
    discovery: net.Socket;
}
