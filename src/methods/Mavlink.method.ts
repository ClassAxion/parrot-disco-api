import ParrotDiscoApi from '../parrotDiscoApi';

export default class Mavlink {
    constructor(private instance: ParrotDiscoApi) {}

    public start(filePath: string) {
        this.instance.sendCommand([1, 'Mavlink', 'Start', filePath, 0]);
    }
}
