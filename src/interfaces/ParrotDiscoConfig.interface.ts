export default interface ParrotDiscoConfig {
    ip?: string;
    c2dPort?: number;
    d2cPort?: number;
    discoveryPort?: number;
    discoveryTimeout?: number;
    streamVideoPort?: number;
    streamControlPort?: number;
    debug?: boolean;
}
