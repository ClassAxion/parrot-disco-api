import ParrotDiscoApi from '../parrotDiscoApi';

export default class Camera {
    constructor(private instance: ParrotDiscoApi) {}

    public setHomeType(type: number) {
        this.instance.sendCommand([1, 'GPSSettings', 'HomeType', type]);
    }

    public setHomeLocation(lat: number, lng: number, alt: number = 0) {
        this.instance.sendCommand([1, 'GPSSettings', 'SetHome', lat, lng, alt]);
    }

    public sendControllerGPS(lat: number, lng: number) {
        this.instance.sendCommand([1, 'GPSSettings', 'SendControllerGPS', lat, lng, 0, 0, 0]);
    }

    public resetHome() {
        this.instance.sendCommand([1, 'GPSSettings', 'ResetHome']);
    }
}
