import ParrotDiscoApi from '../parrotDiscoApi';

export default class Mavlink {
    constructor(private instance: ParrotDiscoApi) {}

    public start(filePath: string) {
        this.instance.sendCommand([0, 'Mavlink', 'Start', filePath + '\u0000', 0]);
    }
}
