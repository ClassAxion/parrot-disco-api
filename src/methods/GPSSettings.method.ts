import ParrotDiscoApi from '../parrotDiscoApi';

export default class Camera {
    constructor(private instance: ParrotDiscoApi) {}

    public setHomeType(type: number) {
        this.instance.sendCommand([1, 'GPSSettings', 'HomeType', type]);
    }
}
