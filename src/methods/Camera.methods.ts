import ParrotDiscoApi from '../parrotDiscoApi';

export default class Camera {
    constructor(private instance: ParrotDiscoApi) {}

    public move(tilt: number, pan: number = 0) {
        this.instance.sendCommand([1, 'Camera', 'Orientation', tilt, pan]);
    }
}
