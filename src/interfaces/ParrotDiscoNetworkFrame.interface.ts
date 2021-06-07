export default interface ParrotDiscoNetworkFrame {
    type: number;
    id: number;
    seq: number;
    size: number;
    data?: Buffer;
}
