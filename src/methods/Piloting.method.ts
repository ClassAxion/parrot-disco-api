import ParrotDiscoApi from '../parrotDiscoApi';

export default class Piloting {
    constructor(private instance: ParrotDiscoApi) {}

    public takeOff() {
        this.instance.sendCommand([1, 'Piloting', 'TakeOff']);
    }
}
