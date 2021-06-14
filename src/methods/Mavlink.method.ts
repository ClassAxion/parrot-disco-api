import ParrotDiscoApi from '../parrotDiscoApi';

export default class Mavlink {
    constructor(private instance: ParrotDiscoApi) {}

    public start(fileName: string) {
        this.instance.sendCommand([0, 'Mavlink', 'Start', fileName + '\u0000', 0]);
    }
}
