import ParrotDiscoApi from '../parrotDiscoApi';

export default class Piloting {
    constructor(private instance: ParrotDiscoApi) {}

    public takeOff() {
        this.instance.sendCommand([1, 'Piloting', 'TakeOff']);
    }

    private setUserTakeOff(state: number) {
        this.instance.sendCommand([1, 'Piloting', 'UserTakeOff', state]);
    }

    public userTakeOff() {
        return this.setUserTakeOff(1);
    }

    public cancelUserTakeOff() {
        return this.setUserTakeOff(0);
    }
}
