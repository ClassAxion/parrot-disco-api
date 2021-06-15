import ParrotDiscoApi from '../parrotDiscoApi';

export default class Camera {
    constructor(private instance: ParrotDiscoApi) {}

    public moveTo(tilt: number, pan: number = 0) {
        this.instance.sendCommand([1, 'Camera', 'Orientation', tilt, pan]);
    }

    public move(tiltDeg: number, panDeg: number = 0) {
        this.instance.sendCommand([1, 'Camera', 'Velocity', tiltDeg, panDeg]);
    }
}
