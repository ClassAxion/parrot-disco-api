import ParrotDiscoApi from '../parrotDiscoApi';

export default class Test {
    constructor(private instance: ParrotDiscoApi) {}

    public startSound() {
        this.instance.sendCommand([1, 'Sound', 'StartAlertSound']);
    }

    public stopSound() {
        this.instance.sendCommand([1, 'Sound', 'StopAlertSound']);
    }
}
