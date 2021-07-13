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
        this.setUserTakeOff(1);
    }

    public cancelUserTakeOff() {
        this.setUserTakeOff(0);
    }

    public circle(direction: string) {
        this.instance.sendCommand([1, 'Piloting', 'Circle', direction]);
    }

    private navigateToHome(status: number) {
        this.instance.sendCommand([1, 'Piloting', 'NavigateHome', status]);
    }

    public returnToHome() {
        this.navigateToHome(1);
    }

    public stopReturnToHome() {
        this.navigateToHome(0);
    }

    public moveTo(latitude: number, longitude: number, altitude: number) {
        this.instance.sendCommand([1, 'Piloting', 'moveTo', latitude, longitude, altitude, 'TO_TARGET', 0]);
    }

    public cancelMoveTo() {
        this.instance.sendCommand([1, 'Piloting', 'CancelMoveTo']);
    }
}
